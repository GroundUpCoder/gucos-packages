// Run only inside a machine-job browser reservation. One sequential browser.
import {session} from '../compatibility/session.mjs';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID,'machine-job browser reservation required');
const run=process.env.COMPAT_RUN_DIR,config=JSON.parse(await readFile(resolve(run,'config.json')));
const candidates=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
const action=process.argv[2],names=process.argv.slice(3);
assert(['build','install','reload','dependencies','consumers'].includes(action));
assert(names.length && names.every(n=>(action==='dependencies'?Object.hasOwn(config.baselinePackages,n):config.candidates.includes(n))));
const attempt=process.env.MIGRATION_ATTEMPT||'';assert(!attempt||/^[a-zA-Z0-9_-]+$/.test(attempt));
const receiptLabel=action+(attempt?'-'+attempt:'');
const label=receiptLabel+'-'+names.join('-'),reportPath=resolve(run,label+'.json');
async function absent(path){try{await access(path);}catch(error){if(error.code==='ENOENT')return;throw error;}throw Error('Refusing repeated stage output: '+path);}
await absent(reportPath);
for(const name of names)await absent(resolve(run,'exports',name,receiptLabel+'-receipt.json'));
const s=await session();
const report={action,names,runtime:s.runtime,inputCommit:config.inputCommit,startedAt:new Date().toISOString(),status:'running'};
try{
 await s.command('set -eu\ngucman repo remove groundupcoder || true\ngucman repo remove migration || true\ngucman repo add migration '+config.catalogUrl);
 if(action==='consumers'){
  // Re-run the committed consumer scripts against installed headers and libraries.
  for(const name of names){
   const manifest=JSON.parse(await readFile(resolve(config.inputDist||config.dist,'migration',name,'package.json')));
   const tuples=files=>files.map(({path,sha256,size})=>({path,sha256,size}));
   assert.deepEqual(tuples(manifest.files),tuples(candidates[name].files),'Consumer inputs differ from frozen candidate: '+name);
   const verified=[];
   const directory='/tmp/migration-consumers/'+receiptLabel+'/'+name;
   await s.command('mkdir -p '+directory);
   for(const file of manifest.files){
    const bytes=await readFile(resolve(config.inputDist||config.dist,'migration',name,file.path));
    assert.equal(bytes.length,file.size,'Consumer input size: '+name+'/'+file.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,'Consumer input hash: '+name+'/'+file.path);
    verified.push({path:file.path,sha256:file.sha256,size:file.size});
    await s.page.evaluate(async ({path,encoded})=>shell.busybox.write(path,Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))),{path:directory+'/'+file.path,encoded:bytes.toString('base64')});
   }
   (report.consumerInputs??=[]).push({name,verified});
   await s.command('set -eu\ncd '+directory+'\ntar -xf source.tar\nDESTDIR=/usr/local sh test.sh');
  }
 }else if(action==='dependencies'){
  for(const name of names)await s.command('gucman install migration:'+name);
 }else if(action==='reload'){
  await s.page.reload();await s.page.waitForFunction(()=>window.shell?.ready);
  assert.equal(await s.page.evaluate(()=>shell.toolchain.systemBuild),s.runtime);
  await s.command('true'); // Initialize the lazy guest shell after navigation.
 }else{
  for(const name of names)await s.command('gucman '+action+' migration:'+name);
 }
 for(const name of action==='dependencies'?[]:names){
  if(config.candidates.includes(name) && action!=='build'){
   const sums=await readFile(resolve(run,name+'.sha256'),'utf8');
   await s.page.evaluate(async text=>shell.busybox.write('/tmp/migration.sha256',new TextEncoder().encode(text)),sums);await s.command('sha256sum -c /tmp/migration.sha256');
  }
  await s.command('rm -f /home/user/migration-export.tar\ngucman pack '+name+' /home/user/migration-export.tar');
  const result=await s.page.evaluate(async name=>{
   const manifest=JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json')));
   const bytes=await shell.busybox.read('/home/user/migration-export.tar');let encoded='';
   for(let i=0;i<bytes.length;i+=16383)encoded+=btoa(String.fromCharCode(...bytes.subarray(i,i+16383)));
   return {manifest,encoded};
  },name);
  const expected=candidates[name];
  assert.deepEqual(result.manifest,expected,'Installed manifest differs from frozen candidate: '+name);
  const bytes=Buffer.from(result.encoded,'base64'),hash=createHash('sha256').update(bytes).digest('hex');
  const dir=resolve(run,'exports',name);await mkdir(dir,{recursive:true});
  await writeFile(resolve(dir,hash+'.tar'),bytes);
  await writeFile(resolve(dir,receiptLabel+'-receipt.json'),JSON.stringify({runtime:s.runtime,sha256:hash,size:bytes.length,guestManifest:result.manifest,method:'Actual guest gucman pack; source build and test scripts run by gucman for build stage'},null,2)+'\n',{flag:'wx'});
 }
 report.status='passed';
}catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally{
 report.finishedAt=new Date().toISOString();
 try{await writeFile(reportPath,JSON.stringify(report,null,2)+'\n',{flag:'wx'});}finally{await s.close();}
}
