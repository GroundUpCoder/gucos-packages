import {browserSession} from '../../tools/browser.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
const directory=process.env.GUCOS_CORE_DIST,expected=process.env.GUCOS_EXPECTED_RUNTIME;
assert(directory&&expected);
const sha=b=>createHash('sha256').update(b).digest('hex'),extra=new Map();
const s=await browserSession({directory,extra,timeout:600000});
const report={runtime:await s.page.evaluate(()=>shell.toolchain.systemBuild),status:'running',startedAt:new Date().toISOString()};assert.equal(report.runtime,expected);
try{
 const catalog={format:1,packages:{}},receipts={};
 for(const name of ['libcurl','gucode']){
  const {inputs,...recipe}=JSON.parse(await readFile('apps/'+name+'/recipe.json'));const outputs=JSON.parse(await readFile('apps/'+name+'/outputs.json'));const files=[];
  for(const path of inputs){const b=await readFile('apps/'+name+'/'+path);extra.set('/candidate/'+name+'/'+path,b);files.push({path,url:s.url+'/candidate/'+name+'/'+path,sha256:sha(b),size:b.length});}
  const receipt=JSON.parse(await readFile('apps/'+name+'/binaries/receipt.json'));receipts[name]=receipt;
  const binary=await readFile('apps/'+name+'/binaries/'+receipt.sha256+'.tar');assert.equal(sha(binary),receipt.sha256);extra.set('/candidate/'+name+'/binary.tar',binary);
  const manifest={format:1,...recipe,files,build:'build.sh',test:'test.sh',outputs,licenses:outputs.filter(o=>o.path.startsWith('share/licenses/')).map(o=>o.path),runtime:receipt.runtime,binary:{url:s.url+'/candidate/'+name+'/binary.tar',sha256:sha(binary),size:binary.length}};
  const bytes=Buffer.from(JSON.stringify(manifest));extra.set('/candidate/'+name+'/package.json',bytes);catalog.packages[name]={url:s.url+'/candidate/'+name+'/package.json',sha256:sha(bytes),size:bytes.length};
 }
 extra.set('/candidate/catalog.json',Buffer.from(JSON.stringify(catalog)));
 console.log(await s.command('set -eu\ngucman repo remove groundupcoder\ngucman repo add candidate '+s.url+'/candidate/catalog.json\ngucman install candidate:gucode\ngucode --version'));
 async function verify(){for(const name of ['libcurl','gucode']){
  await s.command('rm -f /tmp/installed-'+name+'.tar\ngucman pack '+name+' /tmp/installed-'+name+'.tar');
  const bytes=Buffer.from(await s.page.evaluate(async p=>Array.from(await shell.busybox.read(p)),'/tmp/installed-'+name+'.tar'));
  // Tar metadata may vary; compare each installed payload to the reviewed export.
  const installed=await s.page.evaluate(async name=>{
   const m=JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json')));
   const data={};for(const o of m.outputs)data[o.path]=Array.from(await shell.busybox.read('/usr/local/'+o.path));return data;
  },name);
  report[name]={archiveSha256:receipts[name].sha256,installedPayloads:Object.fromEntries(Object.entries(installed).map(([p,b])=>[p,sha(Buffer.from(b))]))};
  const {execFileSync}=await import('node:child_process');
  for(const [path,hash] of Object.entries(report[name].installedPayloads))assert.equal(sha(execFileSync('tar',['-xOf','apps/'+name+'/binaries/'+receipts[name].sha256+'.tar',path])),hash);
 }}
 await verify();report.freshBinaryInstall=true;
 await s.page.reload();await s.page.waitForFunction(()=>window.shell?.ready);await s.command('gucode --version');await verify();report.reloadPayloads=true;report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}
finally{report.finishedAt=new Date().toISOString();await writeFile('docs/research/gucode/binary.json',JSON.stringify(report,null,2)+'\n');await s.close();}
