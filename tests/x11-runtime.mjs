// Package acceptance explicitly serves package inputs to the running browser.
// Core build/deployment never loads this file or the packages checkout.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {browserSession} from '../../wasm-posix/tools/browser.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const extra=new Map();
for(const name of ['x11-server','x11-toolkit','twm'])for(const file of ['source.tar','build.sh','test.sh'])
 extra.set('/package/'+name+'/'+file,await readFile(new URL('../apps/'+name+'/'+file,import.meta.url)));
const s=await browserSession({extra,gpu:true,timeout:2400000});
s.page.setDefaultTimeout(2400000);
try {
 const packages={};
 for(const name of ['x11-server','x11-toolkit','twm']){
  const outputs=JSON.parse(await readFile(new URL('../apps/'+name+'/outputs.json',import.meta.url)));
  const manifest={format:1,name,version:'1.0-1',dependencies:name==='x11-server'?[]:name==='x11-toolkit'?['x11-server']:['x11-toolkit'],files:[...extra].filter(([path])=>path.startsWith('/package/'+name+'/')).map(([path,b])=>({path:path.split('/').pop(),url:s.url+path,sha256:sha(b),size:b.length})),build:'build.sh',test:'test.sh',outputs,licenses:outputs.filter(o=>o.path.startsWith('share/licenses/')).map(o=>o.path)};
  const bytes=Buffer.from(JSON.stringify(manifest));const path='/package/'+name+'/manifest.json';extra.set(path,bytes);
  packages[name]={url:s.url+path,sha256:sha(bytes),size:bytes.length};
 }
 extra.set('/package/catalog.json',Buffer.from(JSON.stringify({format:1,packages})));
 const timer=setInterval(async()=>{try {console.log(await s.page.evaluate(()=>({tail:(shell.busybox?.log||'').slice(-450),processes:[...shell.busybox?.windows?.values()||[]].map(v=>v.title.textContent),compiling:[...shell.busybox?.compilations?.values()||[]]})));}catch(e){console.error(e.message);}},30000);
 try {
 console.log(await s.command(`set -eu
gucman repo remove groundupcoder
gucman repo add fixture ${s.url}/package/catalog.json
gucman build fixture:twm
gucman pack x11-server /home/user/x11-server.tar
echo X11-BUILD-PASS`));
 await mkdir(new URL('../test-results/',import.meta.url),{recursive:true});
 const binary=Buffer.from(await s.page.evaluate(async()=>Array.from(await shell.busybox.read('/home/user/x11-server.tar'))));
 await writeFile(new URL('../test-results/x11-server.tar',import.meta.url),binary);
 const client=await readFile(new URL('../apps/twm/tests/vt-clients.c',import.meta.url));
 await s.page.evaluate(async bytes=>shell.busybox.write('/tmp/vt-clients.c',new Uint8Array(bytes)),[...client]);
 const pending=s.command(`set -eu
cc -I/usr/local/include /tmp/vt-clients.c -L/usr/local/lib -lX11 -lxcb -lXau -o /tmp/vt-clients
export DISPLAY=:1
Xvfb :1 -screen 0 1100x800x24 -fp built-ins -noreset -ac &
xpid=$!
trap 'kill -TERM "$xpid" 2>/dev/null' EXIT
sleep 2
twm -f /usr/local/share/X11/twm/wasm.twmrc &
wmpid=$!
sleep 2
/tmp/vt-clients
kill -TERM "$wmpid" "$xpid"
wait "$xpid"
trap - EXIT
echo X11-TWM-RUNTIME-PASS`);
 await Promise.race([s.page.waitForFunction(()=>shell.busybox.log.includes('TWM-DECORATED')),pending.then(log=>{throw Error('ended before decorated: '+log);})]);
 const geometry=await s.page.evaluate(async()=>new TextDecoder().decode(await shell.busybox.read('/tmp/twm-geometry')));
 const [x,y,w,h,title]=geometry.split(' ').map(Number);
 const canvas=s.page.locator('.vt:visible canvas');const box=await canvas.boundingBox();
 const scale=Math.min(box.width/1100,box.height/800),left=box.x+(box.width-1100*scale)/2,top=box.y+(box.height-800*scale)/2;
 await s.page.mouse.move(left+(x+80)*scale,top+(y+title/2)*scale);await s.page.mouse.down();
 await s.page.mouse.move(left+(x+145)*scale,top+(y+title/2+40)*scale,{steps:12});await s.page.mouse.up();
 await s.page.waitForFunction(()=>shell.busybox.log.includes('TWM-MOVED'));
 await s.page.locator('#terminal-focus').click();
 const log=await pending;assert.match(log,/TWM-HIDDEN-PROGRESS-PASS/);assert.match(log,/X11-TWM-RUNTIME-PASS/);console.log(log);
 }finally{clearInterval(timer);}
}finally{await s.close();}
