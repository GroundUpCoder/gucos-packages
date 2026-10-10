// Exact-binary terminal gameplay acceptance; one scheduler-owned browser.
import {session} from '../compatibility/session.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID,'machine-job browser reservation required');
const run=process.env.COMPAT_RUN_DIR,attempt=process.env.MIGRATION_ATTEMPT||'';
assert(!attempt||/^[a-zA-Z0-9_-]+$/.test(attempt));
const label='2048-functional'+(attempt?'-'+attempt:'');
await assert.rejects(access(resolve(run,label+'.json')),{code:'ENOENT'});
const report={status:'running',startedAt:new Date().toISOString()};let s,pending;
async function bounded(promise,ms,label){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label)),ms);})]);}finally{clearTimeout(timer);}}
try{
 const config=JSON.parse(await readFile(resolve(run,'config.json')));
 const manifests=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
 report.inputCommit=config.inputCommit;
 report.harnessSha256=createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
 s=await session();report.runtime=s.runtime;await s.command('true');
 const name='2048';
  const m=manifests[name];assert.deepEqual(m.dependencies,[]);
  assert(m.binary,'Fresh exact-binary acceptance required');
  const installed=await s.page.evaluate(async name=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'))),name);
  assert.deepEqual(installed,m);
  const binary=await readFile(resolve(config.inputDist||config.dist,'migration',name,'binary.tar'));
  assert.equal(binary.length,m.binary.size);assert.equal(createHash('sha256').update(binary).digest('hex'),m.binary.sha256);
  const inventory=JSON.parse(execFileSync('python3',['-c',`import hashlib,io,json,sys,tarfile
with tarfile.open(fileobj=io.BytesIO(sys.stdin.buffer.read())) as archive:
 members=archive.getmembers()
 assert all(m.isfile() and not m.name.startswith('/') and '..' not in m.name.split('/') for m in members)
 assert len({m.name for m in members})==len(members)
 print(json.dumps([dict(path=m.name,mode=m.mode,sha256=hashlib.sha256(archive.extractfile(m).read()).hexdigest()) for m in members]))
`],{input:binary,maxBuffer:1024*1024}).toString());
  assert.deepEqual(inventory.map(({path,mode})=>({path,mode})).sort((a,b)=>a.path.localeCompare(b.path)),[...m.outputs].sort((a,b)=>a.path.localeCompare(b.path)));
  const sums=inventory.map(f=>f.sha256+'  /usr/local/'+f.path).join('\n')+'\n';
  await s.page.evaluate(async text=>shell.busybox.write('/tmp/2048-binary.sha256',new TextEncoder().encode(text)),sums);
  await s.command('sha256sum -c /tmp/2048-binary.sha256');

 report.binary=m.binary;
 const start=await s.page.evaluate(()=>shell.busybox.log.length);
 pending=s.command('echo $$ > /tmp/migration-2048.pid\nexec /usr/local/bin/2048');pending.catch(()=>{});
 const marker=async text=>Promise.race([
  s.page.waitForFunction(({start,text})=>shell.busybox.log.slice(start).includes(text),{start,text},{timeout:30000}),
  pending.then(()=>{throw Error('Game ended before '+text);})
 ]);
 await marker('2048');
 await s.page.evaluate(()=>shell.terminal.focus());
 const beforeMoves=await s.page.evaluate(()=>shell.busybox.log.length);
 for(const key of ['a','d','w','s']){await s.page.keyboard.type(key);await s.page.waitForTimeout(200);}
 await s.page.waitForFunction(n=>shell.busybox.log.length>n,beforeMoves,{timeout:10000});
 await s.page.keyboard.type('r');await marker('RESTART? (y/n)');
 const restart=await s.page.evaluate(()=>shell.busybox.log.length);
 await s.page.keyboard.type('y');
 await s.page.waitForFunction(n=>shell.busybox.log.slice(n).includes('2048'),restart,{timeout:10000});
 await s.page.keyboard.type('q');await marker('QUIT? (y/n)');await s.page.keyboard.type('y');
 await bounded(pending,30000,'2048 did not exit after confirmation');pending=undefined;
 const log=await s.page.evaluate(n=>shell.busybox.log.slice(n),start);
 assert(log.includes('\x1b[?25h'),'Cursor restoration missing');
 await s.command('echo TERMINAL-AFTER-2048-PASS');
 report.checks=['movement-redraw','restart-confirmation-redraw','quit-confirmation-normal-exit','cursor-restored','subsequent-terminal-command'];
 report.status='passed';
}catch(error){
 report.status='failed';report.error=String(error.stack||error);
 if(s&&pending)try{
  await bounded((async()=>{
   await s.page.evaluate(async()=>{const bytes=await shell.busybox.read('/tmp/migration-2048.pid');if(bytes){const pid=Number(new TextDecoder().decode(bytes));if(Number.isInteger(pid)&&pid>0)shell.busybox.worker.postMessage({type:'kill',pid});}});
   await pending.catch(()=>{});
  })(),15000,'2048 cleanup timed out');report.cleanup='command killed and settled';
 }catch(e){report.cleanup=String(e);}
 throw error;
}finally{
 report.finishedAt=new Date().toISOString();
 try{
  if(s)try{await writeFile(resolve(run,label+'.log'),await s.page.evaluate(()=>shell.busybox.log),{flag:'wx'});}catch(e){report.logError=String(e);}
  await writeFile(resolve(run,label+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 }finally{if(s)await s.close();}
}
