import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import http from 'node:http';
const require=createRequire(new URL('../../wasm-posix/package.json',import.meta.url));
const {chromium}=require('playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const sha=b=>createHash('sha256').update(b).digest('hex');
export async function session(){
 if(process.env.COMPAT_RUN_DIR)return (await import("./compatibility/session.mjs")).session();
 const publicMode=process.env.EXPANSION_PUBLIC==='1';
 if(!publicMode){const release=await readFile(root+'test-results/core-site/release.json');assert.equal(sha(release),'b93d001b36a4624c1f093da6021f989dbf63e7ce05923d5f8ba6b26d9e49f7c5');for(const [path,entry] of Object.entries(JSON.parse(release).files)){const b=await readFile(root+'test-results/core-site/'+path);assert.equal(sha(b),entry.sha256);assert.equal(b.length,entry.size);}}
 const objects=new Map(),packages={};
 let port=0;try{port=Number(await readFile(root+'test-results/expansion-port','utf8'));}catch{}
 const server=http.createServer(async(req,res)=>{try{
  const path=new URL(req.url,'http://localhost').pathname;
  let b=objects.get(path),type='application/octet-stream';
  if(!b){const local=path==='/'?'index.html':path.slice(1);assert.match(local,/^(index\.html|assets\/[a-f0-9]+\.(js|bin|tar|txt|html))$/);b=await readFile(root+'test-results/core-site/'+local);type=local.endsWith('.html')?'text/html':local.endsWith('.js')?'text/javascript':'application/octet-stream';}
  res.writeHead(200,{'Content-Type':type,'Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Embedder-Policy':'require-corp','Cross-Origin-Resource-Policy':'same-origin'});res.end(b);
 }catch(e){res.writeHead(404);res.end(String(e));}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});port=server.address().port;await writeFile(root+'test-results/expansion-port',String(port));const origin='http://127.0.0.1:'+port;

 for(const name of (publicMode?[]:await readdir(root+'apps'))){
  let m;
  try{m=JSON.parse(await readFile(root+'apps/'+name+'/recipe.json'));m={format:1,...m,files:[],build:'build.sh',test:'test.sh',outputs:JSON.parse(await readFile(root+'apps/'+name+'/outputs.json'))};m.licenses=m.outputs.map(o=>o.path).filter(p=>p.startsWith('share/licenses/'));}
  catch{m=JSON.parse(await readFile(root+'apps/'+name+'/package.json'));}
  for(const path of (m.inputs||['source.tar','build.sh','test.sh'])){
   let b;try{b=await readFile(root+'apps/'+name+'/'+path);}catch{continue;}
   const url=origin+'/'+name+'/'+path;objects.set(new URL(url).pathname,b);
   const entry={path,url,sha256:sha(b),size:b.length};const index=m.files.findIndex(f=>f.path===path);if(index<0)m.files.push(entry);else m.files[index]=entry;
  }
  if(['x11-toolkit','x11-widgets'].includes(name)){
   let receipt;try{receipt=JSON.parse(await readFile(root+'apps/'+name+'/binaries/receipt.json'));}catch{}
   if(receipt){const b=await readFile(root+'apps/'+name+'/binaries/'+receipt.sha256+'.tar');assert.equal(sha(b),receipt.sha256);assert.equal(b.length,receipt.size);const url=origin+'/'+name+'/binary.tar';objects.set(new URL(url).pathname,b);m.runtime=receipt.runtime;m.binary={url,sha256:sha(b),size:b.length};}
  }
  if(name==='x11-server'){
   const b=await readFile(root+'test-results/x11-server.tar'),url=origin+'/x11-server/binary.tar';assert.equal(sha(b),'9cc9c7c53dd4996540f3871b561716a268289ed6ff8eca7611d10aa456b58558','X11 archive must match recorded public guest export');objects.set(new URL(url).pathname,b);
   m.runtime='2a9cca447a35af0d0d8894ea4b50cb254ce20821753af8ae70a1ad5060da2a0f';m.binary={url,sha256:sha(b),size:b.length};
  }
  const b=Buffer.from(JSON.stringify(m)),url=origin+'/'+name+'/manifest.json';objects.set(new URL(url).pathname,b);packages[name]={url,sha256:sha(b),size:b.length};
 }
 objects.set('/catalog.json',Buffer.from(JSON.stringify({format:1,packages})));
 await mkdir(root+'test-results/'+(process.env.EXPANSION_PROFILE||'expansion-profile'),{recursive:true});
 const browser=await chromium.launchPersistentContext(root+'test-results/'+(process.env.EXPANSION_PROFILE||'expansion-profile'),{channel:'chromium',headless:true,args:['--enable-unsafe-webgpu']});

 const page=browser.pages()[0]||await browser.newPage();page.setDefaultTimeout(270000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((publicMode?'https://os.groundupcoder.net':origin)+'/?shell=bootstrap');await page.waitForFunction(()=>window.shell?.ready);
 assert.equal(await page.evaluate(()=>crossOriginIsolated),true);
 const runtime=await page.evaluate(()=>shell.toolchain.systemBuild);assert.equal(runtime,'2a9cca447a35af0d0d8894ea4b50cb254ce20821753af8ae70a1ad5060da2a0f');
 async function command(script){const before=await page.evaluate(()=>(shell.busybox?.log||'').length);const result=await page.evaluate(script=>shell.command("sh -c '"+script.replaceAll("'","'\\''")+"'"),script.replaceAll('https://packages.test',origin));const log=await page.evaluate(n=>shell.busybox.log.slice(n),before);console.log(log);assert.equal(result.code,0,log);assert.deepEqual(errors,[]);return log;}
 const progress=setInterval(async()=>{try{console.log(await page.evaluate(()=>({tail:(shell.busybox?.log||'').slice(-300),compiling:[...(shell.busybox?.compilations?.values()||[])]})));}catch(e){console.error(e.message);}},30000);
 return {page,command,close:async()=>{clearInterval(progress);await browser.close();await new Promise(resolve=>server.close(resolve));},root,runtime};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const s=await session();try{await s.command(await readFile(process.argv[2],'utf8'));}finally{await s.close();}
}
