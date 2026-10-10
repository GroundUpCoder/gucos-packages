// Run only inside a machine-job browser reservation. One sequential browser.
import {session} from '../compatibility/session.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID,'machine-job browser reservation required');
const run=process.env.COMPAT_RUN_DIR,config=JSON.parse(await readFile(resolve(run,'config.json')));
const action=process.argv[2],names=process.argv.slice(3);
assert(['build','install','reload','dependencies'].includes(action));
assert(names.length && names.every(n=>(action==='dependencies'?Object.hasOwn(config.baselinePackages,n):config.candidates.includes(n))));
const s=await session();
const report={action,names,runtime:s.runtime,inputCommit:config.inputCommit,startedAt:new Date().toISOString(),status:'running'};
const label=action+'-'+names.join('-'),reportPath=resolve(run,label+'.json');
try{
 await s.command('set -eu\ngucman repo remove groundupcoder || true\ngucman repo remove migration || true\ngucman repo add migration '+config.catalogUrl);
 if(action==='dependencies'){
  for(const name of names)await s.command('gucman install migration:'+name);
 }else if(action==='reload'){
  await s.page.reload();await s.page.waitForFunction(()=>window.shell?.ready);
  assert.equal(await s.page.evaluate(()=>shell.toolchain.systemBuild),s.runtime);
 }else{
  for(const name of names)await s.command('gucman '+action+' migration:'+name);
 }
 for(const name of action==='dependencies'?[]:names){
  await s.command('rm -f /home/user/migration-export.tar\ngucman pack '+name+' /home/user/migration-export.tar');
  const result=await s.page.evaluate(async name=>{
   const manifest=JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json')));
   const bytes=await shell.busybox.read('/home/user/migration-export.tar');let encoded='';
   for(let i=0;i<bytes.length;i+=16383)encoded+=btoa(String.fromCharCode(...bytes.subarray(i,i+16383)));
   return {manifest,encoded};
  },name);
  const bytes=Buffer.from(result.encoded,'base64'),hash=createHash('sha256').update(bytes).digest('hex');
  const dir=resolve(run,'exports',name);await mkdir(dir,{recursive:true});
  await writeFile(resolve(dir,hash+'.tar'),bytes);
  await writeFile(resolve(dir,action+'-receipt.json'),JSON.stringify({runtime:s.runtime,sha256:hash,size:bytes.length,guestManifest:result.manifest,method:'Actual guest gucman pack; source build and test scripts run by gucman for build stage'},null,2)+'\n');
 }
 report.status='passed';
}catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally{report.finishedAt=new Date().toISOString();await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');await s.close();}
