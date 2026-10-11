// Installed GTK composition/GUI acceptance; only under a serial browser reservation.
import {session} from '../compatibility/session.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {visibleCanvas,canvasPosition,canvasHelperSha256} from './canvas.mjs';
const require=createRequire(new URL('./package.json',import.meta.url));
const {PNG}=require('pngjs');
assert(process.env.MACHINE_JOB_ID,'machine-job browser reservation required');
const run=process.env.COMPAT_RUN_DIR,attempt=process.env.MIGRATION_ATTEMPT||'';
assert(!attempt||/^[a-zA-Z0-9_-]+$/.test(attempt));
const label='gtk-functional'+(attempt?'-'+attempt:'');
await assert.rejects(access(resolve(run,label+'.json')),{code:'ENOENT'});
const report={status:'running',startedAt:new Date().toISOString(),canvasHelperSha256};
let s,pending;
try {
 const config=JSON.parse(await readFile(resolve(run,'config.json')));
 const manifests=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
 const input=manifests['gtk3-x11'].files.find(f=>f.path==='source.tar');
 const archive=await readFile(resolve(config.inputDist||config.dist,'migration/gtk3-x11/source.tar'));
 assert.equal(archive.length,input.size);
 assert.equal(createHash('sha256').update(archive).digest('hex'),input.sha256);
 const closureBytes=await readFile(resolve(run,'gtk-closure.json'));
 const closure=JSON.parse(closureBytes);
 const checksums=await readFile(resolve(run,'gtk-closure.sha256'));
 assert.equal(createHash('sha256').update(checksums).digest('hex'),closure.checksumsSha256);
 assert.equal(closure.root,'gtk3-x11');assert.equal(closure.inputCommit,config.inputCommit);
 assert.deepEqual(closure.manifests['gtk3-x11'],manifests['gtk3-x11'],'Root closure must match tested candidate');
 for(const [name,candidate] of Object.entries(manifests))if(Object.hasOwn(closure.manifests,name))assert.deepEqual(closure.manifests[name],candidate,'Closure candidate: '+name);
 Object.assign(report,{inputCommit:config.inputCommit,source:input,closureSha256:createHash('sha256').update(closureBytes).digest('hex'),fileCount:closure.fileCount,harnessSha256:createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex')});
 s=await session();report.runtime=s.runtime;
 await s.command('true');
 for(const [name,expected] of Object.entries(closure.manifests)){
  const installed=await s.page.evaluate(async name=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'))),name);
  assert.deepEqual(installed,expected,'Installed closure manifest: '+name);
 }
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/gtk-closure.sha256',new TextEncoder().encode(text)),checksums.toString());
 await s.command('sha256sum -c /tmp/gtk-closure.sha256');
 const libraries=['libcairo.so','libXau.so','libxcb.so','libX11.so','libXext.so','libXrender.so','libXfixes.so','libXi.so','libXtst.so'];
 const found=await s.command(`set -eu
for library in ${libraries.join(' ')}; do find /usr/local -name "$library"; done`);
 const paths=found.trim().split('\n');assert.equal(new Set(paths).size,paths.length);
 const expectedHashes=new Map(checksums.toString().trim().split('\n').map(line=>[line.slice(66),line.slice(0,64)]));
 report.providerCopies=[];
 for(const library of libraries){
  const publicPath='/usr/local/lib/'+library,owner=library==='libcairo.so'?'cairo':'x11-shared';
  const matches=paths.filter(path=>path.endsWith('/'+library));
  assert.equal(matches.filter(path=>path===publicPath).length,1,'One public provider: '+library);
  for(const path of matches){
   if(path!==publicPath){
    const prefix='/usr/local/lib/gucman/packages/'+owner+'/';
    assert(path.startsWith(prefix),'Unexpected private provider: '+path);
    const parts=path.slice(prefix.length).split('/');
    assert(parts.length===3&&/^release\.[a-zA-Z0-9]+$/.test(parts[0])&&parts[1]==='lib'&&parts[2]===library,'Unexpected managed provider: '+path);
   }
   const hash=await s.page.evaluate(async path=>{
    const bytes=await shell.busybox.read(path);
    return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
   },path);
   assert.equal(hash,expectedHashes.get(publicPath),'Managed/public provider payload: '+path);
   report.providerCopies.push({path,sha256:hash,kind:path===publicPath?'public':'managed-release'});
  }
 }
 await s.page.evaluate(async encoded=>shell.busybox.write('/tmp/migration-gtk.tar',Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))),archive.toString('base64'));
 pending=s.command(`set -eu
mkdir -p /tmp/migration-gtk
cd /tmp/migration-gtk
tar -xf /tmp/migration-gtk.tar
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
export LD_LIBRARY_PATH=/usr/local/lib/gtk3-x11:/usr/local/lib
cc source/test/consumer.c $(pkg-config --cflags --libs gtk+-3.0) -o /tmp/gtk-x11-consumer
cc -I/usr/local/include source/test/x11-shared.c -L/usr/local/lib -lXtst -lXi -lXrender -lXfixes -lXext -lX11 -lxcb -lXau -o /tmp/x11-shared-consumer
export DISPLAY=:1
Xvfb :1 -screen 0 800x600x24 -fp built-ins -ac -noreset &
server=$!
echo "$server" > /tmp/migration-gtk-server.pid
demo=
cleanup() {
 if [ -n "$demo" ]; then kill "$demo" 2>/dev/null || true; wait "$demo" 2>/dev/null || true; fi
 kill "$server" 2>/dev/null || true
 wait "$server" 2>/dev/null || true
 rm -f /tmp/migration-gtk-server.pid /tmp/migration-gtk-demo.pid
}
trap cleanup EXIT
sleep 2
gtk3-x11-run /tmp/x11-shared-consumer
gtk3-x11-demo --test &
demo=$!
echo "$demo" > /tmp/migration-gtk-demo.pid
sleep 3
gtk3-x11-run /tmp/gtk-x11-consumer
wait "$demo"
demo=
cleanup
trap - EXIT
test ! -e /tmp/.X1-lock
echo GTK-X11-PACKAGE-PASS`);
 pending.catch(()=>{});
 const marker=async text=>Promise.race([
  s.page.waitForFunction(t=>shell.busybox?.log.includes(t),text,{timeout:180000}),
  pending.then(()=>{throw Error('GTK ended before '+text);})
 ]);
 await marker('GTK-X11-READY');await marker('GTK-X11-CLIPBOARD-PASS');
 const canvas=await visibleCanvas(s.page);
 async function point(name){
  const log=await s.page.evaluate(()=>shell.busybox.log);
  const m=log.match(new RegExp('GTK-X11-'+name+' (-?\\d+) (-?\\d+) (\\d+) (\\d+)'));
  assert.ok(m,log);return {x:+m[1]+ +m[3]/2,y:+m[2]+ +m[4]/2};
 }
 await canvas.click({position:await canvasPosition(canvas,await point('BUTTON')),timeout:10000});
 await marker('GTK-X11-CLICK 1');await marker('GTK-X11-SIZE 640 480');
 await canvas.click({position:await canvasPosition(canvas,await point('ENTRY')),timeout:10000});
 await s.page.keyboard.press('Control+a');await s.page.keyboard.type('hello 123/');
 await s.page.keyboard.press('Shift+KeyA');await s.page.keyboard.press('Shift+Minus');await s.page.keyboard.press('Shift+Digit1');
 await marker('GTK-X11-TEXT hello 123/A_!');
 const frame=await canvas.screenshot({timeout:10000});await writeFile(resolve(run,label+'.png'),frame,{flag:'wx'});
 const png=PNG.sync.read(frame);let red=0,blue=0;
 for(let i=0;i<png.data.length;i+=4){const [r,g,b]=png.data.subarray(i,i+3);if(r>180&&g<100&&b<100)red++;if(b>100&&b>r*2&&b>g*1.5)blue++;}
 report.pixels={red,blue};assert.ok(red>500&&blue>500,JSON.stringify(report.pixels));
 await s.page.keyboard.press('Escape');const log=await pending;
 for(const token of ['X11-SHARED-SDK-PASS','GTK-X11-BLANK-CURSOR-PASS','GTK-X11-CLOSED','GTK-X11-PACKAGE-PASS'])assert.ok(log.includes(token),token);
 assert.doesNotMatch(log,/CRITICAL/);report.status='passed';
}catch(error){
 report.status='failed';report.error=String(error.stack||error);
 if(s&&pending){
  let timeout;
  try{
   await Promise.race([(async()=>{
    report.termination=await s.page.evaluate(async()=>{
     const results=[];
     // Same out-of-band kill channel used by the runtime VT close button.
     for(const path of ['/tmp/migration-gtk-demo.pid','/tmp/migration-gtk-server.pid']){
      try{
       const bytes=await shell.busybox.read(path);
       if(!bytes){results.push({path,missing:true});continue;}
       const pid=Number(new TextDecoder().decode(bytes));
       if(Number.isInteger(pid)&&pid>0){shell.busybox.worker.postMessage({type:'kill',pid});results.push({path,pid});}
       else results.push({path,error:'Invalid PID'});
      }catch(error){results.push({path,error:String(error)});}
     }
     return results;
    });
    await pending.catch(()=>{});
   })(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('GTK cleanup exceeded 15 seconds')),15000);})]);
   report.failureCleanup='guest children stopped and parent command settled';
  }catch(cleanupError){report.failureCleanup=String(cleanupError);}
  finally{clearTimeout(timeout);}
 }
 throw error;
}finally{
 report.finishedAt=new Date().toISOString();
 try{
  if(s)try{await writeFile(resolve(run,label+'.log'),await s.page.evaluate(()=>shell.busybox?.log||''),{flag:'wx'});}catch(logError){report.logError=String(logError);}
  await writeFile(resolve(run,label+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 }finally{if(s)await s.close();}
}
