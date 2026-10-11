// Deterministic credential/action checks in a real guest; no real API credentials.
import {browserSession,quote} from '../../tools/browser.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
const mode=process.argv[2]||'build',live=mode==='public';
const expected=process.env.GUCOS_EXPECTED_RUNTIME;assert(expected);
const extra=new Map(),sha=b=>createHash('sha256').update(b).digest('hex');
const s=await browserSession({...live?{url:'https://os.groundupcoder.com'}:{directory:process.env.GUCOS_CORE_DIST,extra},allowedOrigins:['https://raw.githubusercontent.com','https://api.deepseek.com'],timeout:900000});
const out='docs/research/gucode-0.1.1';await mkdir(out,{recursive:true});
const report={mode,startedAt:new Date().toISOString(),status:'running',checks:[],fixture:'Mock DeepSeek SSE; no live provider request'};
async function write(path,data){await s.page.evaluate(async({path,b})=>shell.busybox.write(path,Uint8Array.from(b)),{path,b:Array.from(Buffer.from(data))});}
async function read(path){return Buffer.from(await s.page.evaluate(async path=>Array.from(await shell.busybox.read(path)),path));}
let wanted='default-test',requests=0,binaryOutput=false;
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,content-type','Access-Control-Allow-Methods':'POST,GET,OPTIONS'};
await s.page.route('https://api.deepseek.com/chat/completions',async route=>{
 try {
  if(route.request().method()==='OPTIONS'){await route.fulfill({status:204,headers:cors,body:''});return;}
  assert.equal(route.request().headers()['authorization'],'Bearer '+wanted);requests++;
  const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(route.request().postDataBuffer())),last=body.messages.at(-1);
  const previous=body.messages.filter(m=>m.role==='tool').length;
  let delta,finish;
  if(previous===0){delta={tool_calls:[{index:0,id:'edit',type:'function',function:{name:'write_file',arguments:JSON.stringify({path:'result.txt',content:'updated\n'})}}]};finish='tool_calls';}
  else if(previous===1){assert.equal(JSON.parse(last.content).ok,true);delta={tool_calls:[{index:0,id:'shell',type:'function',function:{name:'shell',arguments:JSON.stringify({command:binaryOutput?'head -c 2000 /bin/cc; cat invalid.dat':'test -z "${DEEPSEEK_API_KEY:-}" && cat result.txt'})}}]};finish='tool_calls';}
  else {assert.equal(JSON.parse(last.content).ok,true);if(binaryOutput){assert(JSON.parse(last.content).output.includes('�'));assert(JSON.parse(last.content).output.endsWith('tail'));}else assert.equal(JSON.parse(last.content).output,'updated\n');delta={content:'Verified'};finish='stop';}
  await route.fulfill({status:200,headers:cors,contentType:'text/event-stream',body:'data: '+JSON.stringify({choices:[{delta,finish_reason:finish}]})+'\n\ndata: [DONE]\n\n'});
 }catch(e){report.fixtureError=String(e);await route.abort();}
});
try{
 report.runtime=await s.page.evaluate(()=>shell.toolchain.systemBuild);assert.equal(report.runtime,expected);console.log(mode+': core ready');
 if(live){
  // Pin the old published manifest first, then upgrade through the public catalog.
  const plan=JSON.parse(await readFile(out+'/upgrade-plan.json'));
  const catalogURL='https://raw.githubusercontent.com/GroundUpCoder/gucos-packages/main/catalog.json';
  const oldCatalog={format:1,packages:{gucode:plan.upgrades.gucode.oldCatalogEntry,libcurl:JSON.parse(await readFile('catalog.json')).packages.libcurl}};
  await s.page.route(catalogURL,route=>route.fulfill({status:200,headers:cors,contentType:'application/json',body:JSON.stringify(oldCatalog)}));
  await s.command('gucman install groundupcoder:gucode');
  assert.match(await s.command('gucode --version'),/0\.1\.0/);
  await s.page.unroute(catalogURL);
  await s.command('gucman install groundupcoder:gucode');
  report.checks.push('public upgrade 0.1.0 to 0.1.1');
 }else{
  const {inputs,...recipe}=JSON.parse(await readFile('apps/gucode/recipe.json'));
  const outputs=JSON.parse(await readFile('apps/gucode/outputs.json')),files=[];
  for(const path of inputs){const b=await readFile('apps/gucode/'+path);extra.set('/candidate/'+path,b);files.push({path,url:s.url+'/candidate/'+path,sha256:sha(b),size:b.length});}
  const manifest={format:1,...recipe,files,build:'build.sh',test:'test.sh',outputs,licenses:outputs.filter(o=>o.path.startsWith('share/licenses/')).map(o=>o.path)};
  if(mode==='binary'){
   const receipt=JSON.parse(await readFile('apps/gucode/binaries/receipt.json')),b=await readFile('apps/gucode/binaries/'+receipt.sha256+'.tar');
   extra.set('/candidate/binary.tar',b);Object.assign(manifest,{runtime:receipt.runtime,binary:{url:s.url+'/candidate/binary.tar',sha256:sha(b),size:b.length}});
  }
  const bytes=Buffer.from(JSON.stringify(manifest));extra.set('/candidate/package.json',bytes);
  const catalog=JSON.parse(await readFile('catalog.json'));catalog.packages.gucode={url:s.url+'/candidate/package.json',sha256:sha(bytes),size:bytes.length};extra.set('/candidate/catalog.json',Buffer.from(JSON.stringify(catalog)));
  await s.command('gucman repo remove groundupcoder\ngucman repo add candidate '+s.url+'/candidate/catalog.json\ngucman '+(mode==='build'?'build':'install')+' candidate:gucode');
  report.checks.push(mode==='build'?'real guest source build':'fresh binary install');console.log(mode+': package installed');
  if(mode==='build'){
   await s.command('gucman pack gucode /tmp/gucode.tar');const b=await read('/tmp/gucode.tar'),hash=sha(b);
   await writeFile('apps/gucode/binaries/'+hash+'.tar',b);
   const guestManifest=JSON.parse(await read('/usr/local/lib/gucman/packages/gucode/current/manifest.json'));assert.deepEqual(guestManifest,manifest);
   await writeFile('apps/gucode/binaries/receipt.json',JSON.stringify({runtime:report.runtime,sha256:hash,size:b.length,guestManifest,method:'Actual guest gucman build/test and pack on platform 1.0.1'},null,2)+'\n');
  }
 }
 assert.match(await s.command('gucode --version'),/0\.1\.1/);
 const receipt=JSON.parse(await readFile('apps/gucode/binaries/receipt.json'));
 const {execFileSync}=await import('node:child_process');
 async function verify(){for(const o of JSON.parse(await readFile('apps/gucode/outputs.json'))){const b=await read('/usr/local/'+o.path);assert.equal(sha(b),sha(execFileSync('tar',['-xOf','apps/gucode/binaries/'+receipt.sha256+'.tar',o.path])));}}
 await verify();
 await s.command('mkdir -p /tmp/key-home/.guc/creds /tmp/key-task');
 await write('/tmp/key-home/.guc/creds/deepseek-api-key','default-test\r\n');await write('/tmp/explicit-key','explicit-test');
 async function run(key,args=''){wanted=key;const before=requests;const log=await s.command('HOME=/tmp/key-home DEEPSEEK_API_KEY=env-test gucode --yolo --no-color -C /tmp/key-task '+args+' -p '+quote('Write result.txt then check it using shell'));assert.equal(requests-before,3);assert(!log.includes('Allow this action?'));assert.equal((await read('/tmp/key-task/result.txt')).toString(),'updated\n');}
 await run('default-test','--key-file /tmp/explicit-key');report.checks.push('default key overrides explicit and environment; yolo permits edit and shell');
 await s.page.reload();await s.page.waitForFunction(()=>window.shell?.ready);await s.command('gucode --version');await verify();await run('default-test');report.checks.push('reload payloads and default key');
 await s.command('rm /tmp/key-home/.guc/creds/deepseek-api-key');await run('explicit-test','--key-file /tmp/explicit-key');await run('env-test');report.checks.push('explicit and environment fallbacks');
 await write('/tmp/key-task/invalid.dat',Buffer.from([0xff,0xed,0xa0,0x80,0x74,0x61,0x69,0x6c]));
 binaryOutput=true;await run('env-test','--session binary-session.json');
 JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await read('/tmp/key-task/binary-session.json')));
 report.checks.push('raw /bin/cc output and malformed UTF-8 produce valid API requests and saved JSON');
 await write('/tmp/key-task/damaged.json',Buffer.concat([Buffer.from('[{"role":"user","content":"old"},{"role":"assistant","content":"bad '),Buffer.from([0xff,0xed,0xa0,0x80]),Buffer.from(' tail"}]')]));
 await run('env-test','--session damaged.json');
 const repaired=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await read('/tmp/key-task/damaged.json')));assert(repaired[1].content.includes('�'));
 report.checks.push('damaged saved conversation repaired on resume');
 assert(!report.fixtureError);report.status='passed';console.log(mode+': all acceptance checks passed');
}catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}
finally{report.finishedAt=new Date().toISOString();await writeFile(out+'/'+mode+'.json',JSON.stringify(report,null,2)+'\n');await s.close();}
// Keep source and fresh-binary acceptance in the same browser reservation,
// with each browser closed before the next one starts.
if(mode==='build'){
 const {execFileSync}=await import('node:child_process');
 execFileSync(process.execPath,[process.argv[1],'binary'],{stdio:'inherit',env:process.env});
}
