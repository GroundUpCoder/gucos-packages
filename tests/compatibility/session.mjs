import {createRequire} from 'node:module';
import {readFile,writeFile,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,sep} from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const sha=b=>createHash('sha256').update(b).digest('hex');
export async function session(){
 const run=process.env.COMPAT_RUN_DIR;
 assert(run,'COMPAT_RUN_DIR required; use tools/accept-core-compat.mjs');
 const config=JSON.parse(await readFile(resolve(run,'config.json')));
 let server,browser,progress;
 try{
  let origin=config.url;
  if(config.dist){
   const files=JSON.parse(await readFile(resolve(run,'dist-files.json')));
   async function content(path){
    assert(Object.hasOwn(files,path),'Unlisted distribution path: '+path);
    const local=await realpath(resolve(config.dist,path));assert(local.startsWith(config.dist+sep));
    const b=await readFile(local);assert.equal(sha(b),files[path].sha256,'Candidate distribution changed: '+path);assert.equal(b.length,files[path].size);return b;
   }
   // Fail before boot if any file changed since this run was frozen.
   for(const path of Object.keys(files))await content(path);
   server=http.createServer(async(req,res)=>{try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const path=pathname==='/'?'index.html':pathname.slice(1),b=await content(path);
    const type=path.endsWith('.html')?'text/html':/\.m?js$/.test(path)?'text/javascript':path.endsWith('.json')?'application/json':path.endsWith('.wasm')?'application/wasm':'application/octet-stream';
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Embedder-Policy':'require-corp','Cross-Origin-Resource-Policy':'same-origin'});res.end(b);
   }catch(e){res.writeHead(404);res.end(String(e));}});
   let port=0;try{port=Number(await readFile(resolve(run,'port'),'utf8'));}catch{}
   await new Promise((ok,no)=>{server.once('error',no);server.listen(port,'127.0.0.1',ok);});
   port=server.address().port;await writeFile(resolve(run,'port'),String(port));origin='http://127.0.0.1:'+port+'/';
  }
  browser=await chromium.launchPersistentContext(resolve(run,'profile'),{channel:'chromium',headless:true,args:['--enable-unsafe-webgpu']});
  const page=browser.pages()[0]||await browser.newPage();page.setDefaultTimeout(250000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=new URL(origin);url.searchParams.set('shell','bootstrap');
  await page.goto(url.href);await page.waitForFunction(()=>window.shell?.ready);
  assert.equal(await page.evaluate(()=>crossOriginIsolated),true,'Candidate must provide cross-origin isolation');
  const runtime=await page.evaluate(()=>shell.toolchain.systemBuild);
  assert.equal(runtime,config.expectedRuntime,'Wrong candidate core identity (not a package compatibility check)');
  await writeFile(resolve(run,'observed-runtime.json'),JSON.stringify({origin,runtime},null,2)+'\n');
  async function command(script){
   const before=await page.evaluate(()=>(shell.busybox?.log||'').length);
   const result=await page.evaluate(script=>shell.command("sh -c '"+script.replaceAll("'","'\\''")+"'"),script);
   const log=await page.evaluate(n=>shell.busybox.log.slice(n),before);console.log(log);assert.equal(result.code,0,log);assert.deepEqual(errors,[]);return log;
  }
  progress=setInterval(async()=>{try{console.log(await page.evaluate(()=>({tail:(shell.busybox?.log||'').slice(-250)})));}catch{}},30000);
  return {page,command,runtime,root:new URL('../../',import.meta.url).pathname,close:async()=>{clearInterval(progress);await browser.close();if(server)await new Promise(ok=>server.close(ok));}};
 }catch(e){clearInterval(progress);if(browser)await browser.close();if(server?.listening)await new Promise(ok=>server.close(ok));throw e;}
}
