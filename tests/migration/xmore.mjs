// Fresh exact-binary GUI acceptance for xmag/bitmap; one reserved browser.
import {session} from '../compatibility/session.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {visibleCanvas,canvasPosition,canvasHelperSha256} from './canvas.mjs';
assert(process.env.MACHINE_JOB_ID,'machine-job browser reservation required');
const run=process.env.COMPAT_RUN_DIR,attempt=process.env.MIGRATION_ATTEMPT||'';
assert(!attempt||/^[a-zA-Z0-9_-]+$/.test(attempt));
const label='xmore-functional'+(attempt?'-'+attempt:'');
await assert.rejects(access(resolve(run,label+'.json')),{code:'ENOENT'});
const report={status:'running',startedAt:new Date().toISOString(),packages:[]};let s,pending;
try{
 const config=JSON.parse(await readFile(resolve(run,'config.json')));
 const manifests=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
 report.inputCommit=config.inputCommit;report.harnessSha256=createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
 s=await session();report.runtime=s.runtime;await s.command('true');
 for(const name of ['xmag','bitmap']){
  assert(manifests[name].binary,'Exact binary manifest required: '+name);
  const closureBytes=await readFile(resolve(run,name+'-closure.json')),closure=JSON.parse(closureBytes);
  assert.equal(closure.root,name);assert.equal(closure.inputCommit,config.inputCommit);
  for(const [dep,manifest] of Object.entries(closure.manifests)){
   const installed=await s.page.evaluate(async n=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+n+'/current/manifest.json'))),dep);
   assert.deepEqual(installed,manifest,'Installed manifest: '+dep);
  }
  assert.deepEqual(closure.manifests[name],manifests[name]);
  const sums=await readFile(resolve(run,name+'-closure.sha256'));assert.equal(createHash('sha256').update(sums).digest('hex'),closure.checksumsSha256);
  await s.page.evaluate(async text=>shell.busybox.write('/tmp/xmore.sha256',new TextEncoder().encode(text)),sums.toString());await s.command('sha256sum -c /tmp/xmore.sha256');
  const input=manifests[name].files.find(f=>f.path==='source.tar');
  const archive=await readFile(resolve(config.inputDist||config.dist,'migration',name,'source.tar'));
  assert.equal(archive.length,input.size);assert.equal(createHash('sha256').update(archive).digest('hex'),input.sha256);
  const result={name,input,closureSha256:createHash('sha256').update(closureBytes).digest('hex'),fileCount:closure.fileCount};report.packages.push(result);
  await s.page.evaluate(async encoded=>shell.busybox.write('/tmp/xmore.tar',Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))),archive.toString('base64'));
  await s.command('mkdir -p /tmp/migration-'+name+'\ncd /tmp/migration-'+name+'\ntar -xf /tmp/xmore.tar');
  if(name==='xmag'){
   const control=await readFile(new URL('xmag-control.c',import.meta.url));
   result.controlSha256=createHash('sha256').update(control).digest('hex');
   await s.page.evaluate(async text=>shell.busybox.write('/tmp/migration-xmag-control.c',new TextEncoder().encode(text)),control.toString());
  }
  const setup=name==='bitmap'?`printf '........\n........\n........\n........\n........\n........\n........\n........\n' > /tmp/original.txt
atobm -chars '.#' -name sample /tmp/original.txt > /tmp/sample.xbm
bmtoa -chars '.#' /tmp/sample.xbm > /tmp/roundtrip.txt
cmp /tmp/original.txt /tmp/roundtrip.txt
rm -f /tmp/bitmap-done`:'';
  const launch=name==='xmag'?`./control paint
xmag -source 40x40+0+0 -mag 6 -geometry +100+100 &`:`bitmap -fn fixed -geometry 550x450+30+30 /tmp/sample.xbm &`;
  const check=name==='xmag'?`./control
echo XMAG-READY`:`./control > /tmp/bitmap-coordinates
echo BITMAP-READY
while [ ! -f /tmp/bitmap-done ]; do sleep 1; done
bmtoa -chars '.#' /tmp/sample.xbm > /tmp/edited.txt
printf '########\n########\n########\n########\n########\n########\n########\n########\n' > /tmp/expected.txt
cmp /tmp/expected.txt /tmp/edited.txt`;
  pending=s.command(`set -eu
cd /tmp/migration-${name}
cc -I/usr/local/include ${name==='xmag'?'/tmp/migration-xmag-control.c':'source/tests/control.c'} -L/usr/local/lib -lX11 -lxcb -lXau -o control
${setup}
export DISPLAY=:1
Xvfb :1 -screen 0 800x600x24 -fp built-ins -noreset -ac &
server=$!
echo "$server" > /tmp/xmore-server.pid
app=
cleanup() { if [ -n "$app" ]; then kill "$app" 2>/dev/null || true; wait "$app" 2>/dev/null || true; fi; kill "$server" 2>/dev/null || true; wait "$server" 2>/dev/null || true; rm -f /tmp/xmore-server.pid /tmp/xmore-app.pid; }
trap cleanup EXIT
sleep 2
${launch}
app=$!
echo "$app" > /tmp/xmore-app.pid
${check}
wait "$app"
app=
echo ${name.toUpperCase()}-PASS`);pending.catch(()=>{});
  await Promise.race([s.page.waitForFunction(t=>shell.busybox?.log.includes(t),name.toUpperCase()+'-READY',{timeout:180000}),pending.then(()=>{throw Error(name+' ended before GUI readiness');})]);
  report.canvasHelperSha256=canvasHelperSha256;
  const canvas=await visibleCanvas(s.page);
  if(name==='xmag'){
   await canvas.click({position:await canvasPosition(canvas,{x:220,y:220}),timeout:10000});await s.page.keyboard.press('q');
  }else{
   const text=await s.page.evaluate(async()=>new TextDecoder().decode(await shell.busybox.read('/tmp/bitmap-coordinates')));
   const [x,y]=text.trim().split(' ').map(Number);assert(Number.isFinite(x)&&Number.isFinite(y));
   const point=await canvasPosition(canvas,{x,y});
   const box=await canvas.boundingBox();assert(box);await canvas.focus({timeout:10000});await s.page.mouse.move(box.x+point.x,box.y+point.y);
   await s.page.keyboard.press('i');await s.page.keyboard.press('Control+s');
   await s.page.waitForFunction(async()=>{const b=await shell.busybox.read('/tmp/sample.xbm');return b&&new TextDecoder().decode(b).includes('0xff');},null,{timeout:15000});
   await s.page.keyboard.press('q');await s.page.evaluate(()=>shell.busybox.write('/tmp/bitmap-done',new TextEncoder().encode('yes')));
  }
  let timer;
  try{const log=await Promise.race([pending,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(name+' did not exit')),30000);})]);assert(log.includes(name.toUpperCase()+'-PASS'));if(name==='xmag')assert(log.includes('XMAG-6X-PIXELS 57600 240 240'));}finally{clearTimeout(timer);}
  pending=undefined;result.status='passed';
 }
 report.status='passed';
}catch(error){report.status='failed';report.error=String(error.stack||error);
 if(s&&pending){let timer;try{await Promise.race([(async()=>{
  await s.page.evaluate(async()=>{for(const path of ['/tmp/xmore-app.pid','/tmp/xmore-server.pid']){try{const b=await shell.busybox.read(path);if(!b)continue;const pid=Number(new TextDecoder().decode(b));if(Number.isInteger(pid)&&pid>0)shell.busybox.worker.postMessage({type:'kill',pid});}catch{}}});
  await pending.catch(()=>{});
 })(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('X client cleanup exceeded15 seconds')),15000);})]);report.cleanup='children terminated and command settled';}catch(e){report.cleanup=String(e);}finally{clearTimeout(timer);}}
 throw error;
}finally{report.finishedAt=new Date().toISOString();try{
 if(s)try{await writeFile(resolve(run,label+'.log'),await s.page.evaluate(()=>shell.busybox?.log||''),{flag:'wx'});}catch(e){report.logError=String(e);}
 await writeFile(resolve(run,label+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}finally{if(s)await s.close();}}
