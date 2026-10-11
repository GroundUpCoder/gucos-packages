// Private A proposal; independent B review required before copy or execution.
// No app launch/install/build. Future use still needs a real browser reservation.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,realpath,lstat,access} from 'node:fs/promises';
import {resolve,dirname,basename} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';
import {frozenClosure,verifyInstalledClosure} from './migration-installed-closure-lib.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const [app,phase,edge]=process.argv.slice(2);
assert(['xarchiver','galculator'].includes(app));assert(['normal','reload'].includes(phase));assert(['before','after'].includes(edge));
assert(app!=='xarchiver'||phase==='normal','No Xarchiver reload driver is reviewed');
const env=process.env,attempt=env.MIGRATION_ATTEMPT;
assert(env.MACHINE_JOB_ID&&env.MIGRATION_REPO_ROOT&&env.COMPAT_RUN_DIR,'Real browser job required');
assert(/^[A-Za-z0-9_-]{1,40}$/.test(attempt||''));
const reviewedBinary=env[app.toUpperCase()+'_REVIEWED_BINARY_SHA256'];
assert(/^[a-f0-9]{64}$/.test(reviewedBinary||''));
assert(env.MIGRATION_CLOSURE_DRIVER_PATH&&/^[a-f0-9]{64}$/.test(env.MIGRATION_CLOSURE_DRIVER_SHA256||''));
const run=await realpath(env.COMPAT_RUN_DIR),repo=await realpath(env.MIGRATION_REPO_ROOT),profile=await realpath(resolve(run,'profile'));
assert.equal(profile,resolve(run,'profile'),'No external/symlink profile');
const oldPath=env[app.toUpperCase()+'_OLD_RUN_DIR'];assert(oldPath);
const old=await realpath(oldPath);assert(run!==old&&!run.startsWith(old+'/'));assert.notEqual(profile,await realpath(resolve(old,'profile')));
const driver=await realpath(env.MIGRATION_CLOSURE_DRIVER_PATH);
const driverName=app==='xarchiver'?'xarchiver-layout-v2':'galculator-functional';
assert.equal(basename(driver),driverName+'.mjs');
const stem='migration-closure-'+app+'-'+attempt,guest='/home/user/'+stem;
const output=resolve(run,stem+'-'+phase+'-'+edge);await mkdir(output);
const host=(name,bytes)=>writeFile(resolve(output,name),bytes,{flag:'wx'});
const receipt=(p,e)=>resolve(run,stem+'-'+p+'-'+e,'report.json');
const driverReport=resolve(run,app==='xarchiver'?'xarchiver-layout-v2-'+attempt:'galculator-functional-'+attempt+'-'+phase,'report.json');
let s,previousLog='',identity;
const errors=[],report={status:'running',scope:'Installed immutable closure identity only; no GUI or package functionality acceptance',app,phase,edge,attempt,machineJobId:env.MACHINE_JOB_ID,startedAt:new Date().toISOString()};
const fatal=/fatal:\s*wasm trap|\bpid \d+(?: thread \d+)? (?:crashed:|could not start:)|RuntimeError:|uncaught|unhandled.*rejection/i;
async function bounded(p,ms,label){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label)),ms);})]);}finally{clearTimeout(timer);}}
async function readGuest(path){return Buffer.from(await bounded(s.page.evaluate(async path=>{const b=await shell.busybox.read(path);if(!ArrayBuffer.isView(b))throw Error('Missing guest evidence '+path);return Array.from(b);},path),15000,'Guest read deadline'));}
async function put(path,bytes){await bounded(s.page.evaluate(async({path,bytes})=>shell.busybox.write(path,Uint8Array.from(bytes)),{path,bytes:Array.from(Buffer.from(bytes))}),15000,'Guest write deadline');}
async function command(script){return bounded(s.command(script),90000,'Closure shell deadline');}
async function noCrash(){const raw=await bounded(s.page.evaluate(()=>shell.busybox.log),5000,'Log deadline');assert.equal(typeof raw,'string');assert(raw.length<=16*1024*1024,'Log cap');assert(raw.startsWith(previousLog),'Log truncated/replaced');previousLog=raw;assert(!fatal.test(raw));assert.deepEqual(errors,[]);return raw;}
async function passedReceipt(path){const bytes=await readFile(path),r=JSON.parse(bytes);assert.equal(r.status,'passed-closure');assert.equal(r.app,app);assert.equal(r.attempt,attempt);return {bytes,r,sha256:sha(bytes)};}
try{
 const configBytes=await readFile(resolve(run,'config.json')),config=JSON.parse(configBytes);
 const candidateBytes=await readFile(resolve(run,'candidate-manifests.json')),candidates=JSON.parse(candidateBytes);
 assert.equal(config.expectedRuntime,'19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441');
 assert(config.dist&&config.inputCommit);assert.equal(candidates[app]?.runtime,config.expectedRuntime);assert.equal(candidates[app]?.binary?.sha256,reviewedBinary);
 const snapshotBytes=await readFile(resolve(run,'dist-files.json'));assert.equal(sha(snapshotBytes),config.distributionSnapshotSha256);
 const port=Number(await readFile(resolve(run,'port'),'utf8'));assert(Number.isInteger(port)&&port>0&&port<=65535,'Existing frozen profile origin required');
 const profileStat=await lstat(profile);assert(profileStat.isDirectory()&&!profileStat.isSymbolicLink());
 const sources={};
 for(const name of ['migration-installed-closure.mjs','migration-installed-closure-lib.mjs']){const b=await readFile(new URL(name,import.meta.url));sources[name]=sha(b);await host(name,b);}
 for(const path of ['tests/compatibility/session.mjs','tests/desktop/poll.mjs'])sources[path]=sha(await readFile(resolve(repo,path)));
 const driverSources={};
 for(const suffix of ['.mjs','-session.mjs','-supervisor.c']){const name=driverName+suffix;driverSources[name]=sha(await readFile(resolve(dirname(driver),name)));}
 assert.equal(driverSources[driverName+'.mjs'],env.MIGRATION_CLOSURE_DRIVER_SHA256);
 const closure=await frozenClosure(repo,config,candidates,app);
 const binding={app,attempt,run,profile,profileDevice:String(profileStat.dev),profileInode:String(profileStat.ino),port,runtime:config.expectedRuntime,inputCommit:config.inputCommit,configSha256:sha(configBytes),candidateSha256:sha(candidateBytes),distributionSnapshotSha256:sha(snapshotBytes),binary:candidates[app].binary,closureSha256:closure.sha256,sources,driver,driverSources};
 report.binding=binding;await host('closure.json',JSON.stringify(closure.binding,null,2)+'\n');
 let before;
 if(edge==='after'){
  before=await passedReceipt(receipt(phase,'before'));assert.equal(before.r.phase,phase);assert.equal(before.r.edge,'before');assert.equal(before.r.machineJobId,env.MACHINE_JOB_ID,'Before/driver/after must share one job');assert.deepEqual(before.r.binding,binding);report.beforeReceiptSha256=before.sha256;
 }
 if(phase==='normal'&&edge==='before')identity={nonce:randomUUID(),binding};
 else{
  const normalBefore=await passedReceipt(receipt('normal','before'));assert.equal(normalBefore.r.phase,'normal');assert.equal(normalBefore.r.edge,'before');assert.deepEqual(normalBefore.r.binding,binding);identity=normalBefore.r.identity;assert.deepEqual(identity.binding,binding);report.normalBeforeSha256=normalBefore.sha256;
 }
 report.identity=identity;
 if(phase==='reload'){
  const normalAfter=await passedReceipt(receipt('normal','after'));assert.equal(normalAfter.r.phase,'normal');assert.equal(normalAfter.r.edge,'after');assert.deepEqual(normalAfter.r.binding,binding);assert.deepEqual(normalAfter.r.identity,identity);report.normalAfterSha256=normalAfter.sha256;
 }
 if(edge==='before')await assert.rejects(access(driverReport),{code:'ENOENT'});
 else{
  const bytes=await readFile(driverReport),r=JSON.parse(bytes);
  assert.equal(r.status,app==='xarchiver'?'passed-layout-and-two-normal-exits':'passed-'+phase);
  assert.equal(r.guest,app==='xarchiver'?'/home/user/xarchiver-layout-v2-'+attempt:'/home/user/galculator-functional-'+attempt+'-'+phase);
  for(const key of ['runtime','inputCommit','configSha256','candidateSha256','distributionSnapshotSha256'])assert.deepEqual(r.binding[key],binding[key],'Driver frozen identity '+key);
  assert.deepEqual(r.binding.binary,binding.binary);
  for(const [name,hash] of Object.entries(driverSources))assert.equal(r.sourceHashes[name],hash,'Driver source '+name);
  assert(Number.isFinite(Date.parse(r.startedAt))&&Date.parse(r.startedAt)>=Date.parse(before.r.finishedAt));assert(Number.isFinite(Date.parse(r.finishedAt))&&Date.parse(r.finishedAt)<=Date.now());
  report.driverReportSha256=sha(bytes);await host('driver-report.json',bytes);
 }
 const {session}=await import(pathToFileURL(resolve(repo,'tests/compatibility/session.mjs')));
 s=await session();s.page.on('pageerror',e=>errors.push(String(e)));assert.equal(s.runtime,binding.runtime);await command('true');
 assert.equal(await s.page.evaluate(()=>[...shell.busybox.windows.values()].filter(w=>w.shown).length),0,'Gate requires stopped desktop');
 assert.equal(Number(await readFile(resolve(run,'port'),'utf8')),port,'Profile origin changed');
 await noCrash();
 if(phase==='normal'&&edge==='before'){
  await command('set -eu\ntest ! -e '+guest+'\ntest ! -L '+guest+'\nmkdir '+guest);
  await put(guest+'/identity.json',JSON.stringify(identity)+'\n');
 }
 assert.deepEqual(JSON.parse((await readGuest(guest+'/identity.json')).toString()),identity,'Retained guest profile binding');
 const dir=guest+'/'+phase+'-'+edge;
 await command('set -eu\nmkdir '+dir);await put(dir+'/closure.sha256',closure.checksums);
 report.installed=await verifyInstalledClosure(closure,readGuest,command,dir+'/closure.sha256',edge);
 await host('installed-checksums.txt',report.installed.checksums);await host('installed-modes.txt',report.installed.modes);
 await noCrash();report.status='passed-closure';
}catch(e){report.status='failed';report.error=String(e.stack||e);}
finally{
 if(s){
  try{await host('session.log',await noCrash());}catch(e){report.status='failed';report.logError=String(e);try{await host('failure-log.txt',await bounded(s.page.evaluate(()=>String(shell.busybox?.log)),5000,'Failure log deadline'));}catch(x){report.failureLogError=String(x);}}
  try{await bounded(s.close(),30000,'Session close deadline');}catch(e){report.status='failed';report.closeError=String(e);}
 }
 report.finishedAt=new Date().toISOString();await host('report.json',JSON.stringify(report,null,2)+'\n');if(report.status!=='passed-closure')process.exitCode=1;
}
