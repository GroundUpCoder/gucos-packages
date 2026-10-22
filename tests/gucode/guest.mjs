// Run under machine-job --kind browser; credentials never enter persisted evidence.
import {browserSession} from '../../tools/browser.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import http from 'node:http';
assert(process.env.MACHINE_JOB_ID,'browser reservation required');
const directory=process.env.GUCOS_CORE_DIST,expected=process.env.GUCOS_EXPECTED_RUNTIME;
assert(process.env.DEEPSEEK_KEY_FILE,'explicit DEEPSEEK_KEY_FILE required');
assert(directory&&expected,'explicit GUCOS_CORE_DIST and GUCOS_EXPECTED_RUNTIME required');
const sha=b=>createHash('sha256').update(b).digest('hex');
const fixture=http.createServer((req,res)=>{
 const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Content-Type':'application/octet-stream'};
 if(req.method==='OPTIONS'){res.writeHead(204,headers);res.end();return;}
 res.writeHead(req.url==='/error'?429:200,headers);
 if(req.url==='/echo'){req.pipe(res);return;}
 if(req.url==='/stall'){res.write('waiting');return;}
 if(req.url==='/stream'){res.write('one-');const a=setTimeout(()=>res.write('two-'),20),b=setTimeout(()=>res.end('three'),40);res.on('close',()=>{clearTimeout(a);clearTimeout(b);});return;}
 res.end('error');
});
await new Promise(ok=>fixture.listen(0,'127.0.0.1',ok));const fixtureURL='http://127.0.0.1:'+fixture.address().port;
const extra=new Map();const s=await browserSession({directory,extra,allowedOrigins:['https://api.deepseek.com',fixtureURL],timeout:1200000});
const out=resolve('docs/research/gucode');await mkdir(out,{recursive:true});
const report={startedAt:new Date().toISOString(),expectedRuntime:expected,status:'running'};
const quote=s=>"'"+s.replaceAll("'","'\\''")+"'";
async function write(path,bytes){await s.page.evaluate(async({path,encoded})=>shell.busybox.write(path,Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))),{path,encoded:Buffer.from(bytes).toString('base64')});}
async function read(path){return Buffer.from(await s.page.evaluate(async path=>Array.from(await shell.busybox.read(path)),path));}
try{
 report.runtime=await s.page.evaluate(()=>shell.toolchain.systemBuild);assert.equal(report.runtime,expected);
 const manifests={};const catalog={format:1,packages:{}};
 for(const name of ['libcurl','gucode']){
  const base='apps/'+name;const {inputs,...recipe}=JSON.parse(await readFile(base+'/recipe.json'));
  const outputs=JSON.parse(await readFile(base+'/outputs.json'));const files=[];
  for(const path of inputs){const b=await readFile(base+'/'+path);extra.set('/candidate/'+name+'/'+path,b);files.push({path,url:s.url+'/candidate/'+name+'/'+path,sha256:sha(b),size:b.length});}
  const manifest={format:1,...recipe,files,build:'build.sh',test:'test.sh',outputs,licenses:outputs.filter(o=>o.path.startsWith('share/licenses/')).map(o=>o.path)};
  manifests[name]=manifest;const bytes=Buffer.from(JSON.stringify(manifest));extra.set('/candidate/'+name+'/package.json',bytes);catalog.packages[name]={url:s.url+'/candidate/'+name+'/package.json',sha256:sha(bytes),size:bytes.length};
 }
 extra.set('/candidate/catalog.json',Buffer.from(JSON.stringify(catalog)));
 console.log(await s.command('set -eu\ngucman repo remove groundupcoder\ngucman repo add candidate '+s.url+'/candidate/catalog.json\ngucman build candidate:libcurl\ngucman build candidate:gucode'));
 report.sourceBuild=true;
 await write('/tmp/curl-network-test.c',await readFile('apps/libcurl/network-test.c'));
 console.log(await s.command('cc -I/usr/local/include /tmp/curl-network-test.c /usr/local/lib/libcurl.a -o /tmp/curl-network-test\n/tmp/curl-network-test '+fixtureURL));
 report.installedArchiveRelinkAndNetwork=true;
 for(const name of ['libcurl','gucode']){
  console.log(await s.command('gucman pack '+name+' /tmp/'+name+'.tar'));
  const bytes=await read('/tmp/'+name+'.tar');const hash=sha(bytes);await mkdir('apps/'+name+'/binaries',{recursive:true});
  await writeFile('apps/'+name+'/binaries/'+hash+'.tar',bytes);
  const manifest=JSON.parse(await read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'));
  assert.deepEqual(manifest,manifests[name]);
  await writeFile('apps/'+name+'/binaries/receipt.json',JSON.stringify({runtime:report.runtime,sha256:hash,size:bytes.length,guestManifest:manifest,method:'Actual guest gucman build/test and pack on platform 1.0.1'},null,2)+'\n');
 }
 // Live API key lives only in an ephemeral browser context and is deleted below.
 await s.command('mkdir -p /tmp/gucode-task');
 await write('/tmp/gucode-key',await readFile(process.env.DEEPSEEK_KEY_FILE));
 await write('/tmp/gucode-task/calc.c','#include <stdio.h>\nint main(void){printf("%d\\n",7-5);return 0;}\n');
 const prompt='Fix calc.c to print the sum of 7 and 5, compile it with cc -o calc calc.c, run it and confirm the answer is 12. Create test.sh to compile and check the answer and run that regression test. Use tools to make and verify the changes.';
 console.log(await s.command('gucode --key-file /tmp/gucode-key --yes --no-color -C /tmp/gucode-task --session session.json --max-turns 16 -p '+quote(prompt)));
 console.log(await s.command('cd /tmp/gucode-task\nsh test.sh\ntest "$(./calc)" = 12'));
 report.deepseekBugfix=true;report.model='deepseek-flash';report.provider='DeepSeek';
 await s.page.reload();await s.page.waitForFunction(()=>window.shell?.ready);
 console.log(await s.command('gucode --key-file /tmp/gucode-key --yes --no-color -C /tmp/gucode-task --session session.json -p '+quote('Run our existing regression test again and report the result.')));
 report.reloadResume=true;
 await s.command('rm -f /tmp/gucode-key');report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}
finally{report.finishedAt=new Date().toISOString();await writeFile(resolve(out,'guest.json'),JSON.stringify(report,null,2)+'\n');await s.close();fixture.closeAllConnections();await new Promise(ok=>fixture.close(ok));}
