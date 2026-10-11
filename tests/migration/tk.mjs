// Frozen installed Tk/X11 closure and retained functional consumers.
import {session} from '../compatibility/session.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {visibleCanvas,canvasPosition,canvasHelperSha256} from './canvas.mjs';
const require=createRequire(new URL('./package.json',import.meta.url));
const {PNG}=require('pngjs');
const sha=b=>createHash('sha256').update(b).digest('hex');
assert(process.env.MACHINE_JOB_ID,'machine-job browser reservation required');
const run=process.env.COMPAT_RUN_DIR,attempt=process.env.MIGRATION_ATTEMPT||'';
assert(!attempt||/^[a-zA-Z0-9_-]+$/.test(attempt));
const label='tk-functional'+(attempt?'-'+attempt:'');
await assert.rejects(access(resolve(run,label+'.json')),{code:'ENOENT'});
const report={status:'running',startedAt:new Date().toISOString()};let s,pending;
async function bounded(p,ms,message){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(message)),ms);})]);}finally{clearTimeout(timer);}}
try{
 const config=JSON.parse(await readFile(resolve(run,'config.json')));
 const manifests=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
 assert(manifests.tk.binary,'Exact-binary Tk acceptance required');
 const closureBytes=await readFile(resolve(run,'tk-closure.json'));
 const closure=JSON.parse(closureBytes),checksums=await readFile(resolve(run,'tk-closure.sha256'));
 assert.equal(closure.root,'tk');assert.equal(closure.inputCommit,config.inputCommit);
 assert.deepEqual(closure.manifests['tk'],manifests['tk'],'Root closure must match tested candidate');
 for(const [name,candidate] of Object.entries(manifests))if(Object.hasOwn(closure.manifests,name))assert.deepEqual(closure.manifests[name],candidate,'Closure candidate: '+name);
 assert.equal(sha(checksums),closure.checksumsSha256);
 const input=manifests.tk.files.find(f=>f.path==='source.tar');
 const source=await readFile(resolve(config.inputDist||config.dist,'migration/tk/source.tar'));
 assert.equal(source.length,input.size);assert.equal(sha(source),input.sha256);
 Object.assign(report,{inputCommit:config.inputCommit,source:input,closureSha256:sha(closureBytes),fileCount:closure.fileCount,harnessSha256:sha(await readFile(new URL(import.meta.url)))});
 s=await session();report.runtime=s.runtime;await s.command('true');
 for(const [name,expected] of Object.entries(closure.manifests)){
  const installed=await s.page.evaluate(async name=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'))),name);
  assert.deepEqual(installed,expected,'Installed closure: '+name);
 }
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/tk-closure.sha256',new TextEncoder().encode(text)),checksums.toString());
 await s.command('sha256sum -c /tmp/tk-closure.sha256');
 await s.page.evaluate(async encoded=>shell.busybox.write('/tmp/migration-tk.tar',Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))),source.toString('base64'));
 pending=s.command(`set -eu
mkdir -p /tmp/migration-tk
cd /tmp/migration-tk
tar -xf /tmp/migration-tk.tar
# This isolated browser profile boots a new guest on each session. Lock files
# can survive a failed prior session even though its processes cannot.
rm -f /tmp/.X1-lock /tmp/.X11-unix/X1
export DISPLAY=:1
Xvfb :1 -screen 0 800x600x24 -fp built-ins -ac -noreset &
server=$!
echo "$server" > /tmp/migration-tk-server.pid
active=
cleanup() {
 if [ -n "$active" ]; then kill "$active" 2>/dev/null || true; wait "$active" 2>/dev/null || true; fi
 kill "$server" 2>/dev/null || true
 wait "$server" 2>/dev/null || true
 rm -f /tmp/migration-tk-active.pid /tmp/migration-tk-server.pid
}
trap cleanup EXIT
sleep 2
cc --enable-fork -I/usr/local/include/tcl8.6 -I/usr/local/include/tk8.6 -I/usr/local/include source/port/consumer.c -L/usr/local/lib -ltk8.6 -ltcl8.6 -lX11 -lxcb -lXau -o /tmp/tk-consumer
/tmp/tk-consumer &
active=$!; echo "$active" > /tmp/migration-tk-active.pid; wait "$active"; active=
wish source/port/smoke.tcl &
active=$!; echo "$active" > /tmp/migration-tk-active.pid; wait "$active"; active=
ERROR_ON_FAILURES=1 wish source/tests/all.tcl -file 'pack.test grid.test' -skip 'pack-18.1.1 pack-18.2' > /tmp/tk-upstream.log 2>&1 &
active=$!; echo "$active" > /tmp/migration-tk-active.pid
if ! wait "$active"; then cat /tmp/tk-upstream.log; exit 1; fi
active=
cat /tmp/tk-upstream.log
cleanup
trap - EXIT
echo TK-PACKAGE-PASS`);
 pending.catch(()=>{});
 await Promise.race([s.page.waitForFunction(()=>shell.busybox.log.includes('TK-INPUT-READY'),null,{timeout:180000}),pending.then(()=>{throw Error('Tk exited before keyboard readiness');})]);
 report.canvasHelperSha256=canvasHelperSha256;
 const canvas=await visibleCanvas(s.page);
 const screenshot=await canvas.screenshot({timeout:10000}),screen=PNG.sync.read(screenshot);let red=0;
 for(let i=0;i<screen.data.length;i+=4)if(screen.data[i]>200&&screen.data[i+1]<60&&screen.data[i+2]<60)red++;
 assert(red>1000,'Missing presented red Tk rectangle');
 await writeFile(resolve(run,label+'.png'),screenshot,{flag:'wx'});
 const pngBytes=Buffer.from(await s.page.evaluate(async()=>Array.from(await shell.busybox.read('/tmp/tk-image.png'))));
 const png=PNG.sync.read(pngBytes);assert.equal(png.width,2);assert.equal(png.height,2);
 assert.deepEqual([...png.data],[255,0,0,255,0,0,255,255,0,128,0,255,255,255,255,255]);
 report.pixels={presentedRedPixels:red,screenshotSha256:sha(screenshot),roundtripSha256:sha(pngBytes),roundtripPixels:4};
 await writeFile(resolve(run,label+'-roundtrip.png'),pngBytes,{flag:'wx'});
 await canvas.click({position:await canvasPosition(canvas,{x:55,y:30}),timeout:10000});
 await s.page.keyboard.type('hello 123/');await s.page.keyboard.press('Shift+KeyA');await s.page.keyboard.press('Shift+Minus');await s.page.keyboard.press('Shift+Digit1');await s.page.keyboard.press('Enter');
 const log=await bounded(pending,300000,'Tk upstream consumers exceeded300 seconds');pending=undefined;
 for(const marker of ['TK-CONSUMER-PASS','TK-INPUT-PASS','TK-PACKAGE-PASS'])assert(log.includes(marker),marker);
 assert.match(log,/Total\s+\d+\s+Passed\s+\d+\s+Skipped\s+\d+\s+Failed\s+0/);
 assert.doesNotMatch(log,/Failed\s+[1-9]/);
 report.status='passed';
}catch(error){
 report.status='failed';report.error=String(error.stack||error);
 if(s&&pending)try{
  await bounded((async()=>{
   await s.page.evaluate(async()=>{for(const file of ['/tmp/migration-tk-active.pid','/tmp/migration-tk-server.pid']){const bytes=await shell.busybox.read(file);if(bytes){const pid=Number(new TextDecoder().decode(bytes));if(Number.isInteger(pid)&&pid>0)shell.busybox.worker.postMessage({type:'kill',pid});}}});
   await pending.catch(()=>{});
  })(),15000,'Tk cleanup exceeded15 seconds');report.cleanup='children terminated and command settled';
 }catch(e){report.cleanup=String(e);}
 throw error;
}finally{
 report.finishedAt=new Date().toISOString();
 try{
  if(s)try{await writeFile(resolve(run,label+'.log'),await s.page.evaluate(()=>shell.busybox.log),{flag:'wx'});}catch(e){report.logError=String(e);}
  await writeFile(resolve(run,label+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 }finally{if(s)await s.close();}
}
