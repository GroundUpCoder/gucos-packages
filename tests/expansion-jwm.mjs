import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {session} from './expansion-session.mjs';
const s=await session();
try{
 const source=(await readFile(new URL('../apps/twm/tests/vt-clients.c',import.meta.url),'utf8')).replaceAll('TWM-','JWM-').replaceAll('/tmp/twm-geometry','/tmp/jwm-geometry');
 await s.command('true');
 await s.page.evaluate(async source=>shell.busybox.write('/tmp/jwm-clients.c',new TextEncoder().encode(source)),source);
 const pending=s.command(`set -eu
cc -I/usr/local/include /tmp/jwm-clients.c -L/usr/local/lib -lX11 -lxcb -lXau -o /tmp/jwm-clients
rm -f /tmp/.X1-lock /tmp/.X11-unix/X1
export DISPLAY=:1
Xvfb :1 -screen 0 1100x800x24 -fp built-ins -noreset -ac &
xpid=$!
trap 'kill "$xpid" 2>/dev/null' EXIT
sleep 2
jwm -f /usr/local/share/jwm/wasm.jwmrc &
wmpid=$!
sleep 2
/tmp/jwm-clients
kill "$wmpid" "$xpid"
wait "$xpid"
trap - EXIT
echo JWM-RUNTIME-PASS`);
 await Promise.race([s.page.waitForFunction(()=>shell.busybox.log.includes('JWM-DECORATED')),pending.then(()=>{throw Error('clients ended before decoration');})]);
 const geometry=await s.page.evaluate(async()=>new TextDecoder().decode(await shell.busybox.read('/tmp/jwm-geometry')));
 const [x,y,w,h,title]=geometry.split(' ').map(Number);const canvas=s.page.locator('.vt:visible canvas'),box=await canvas.boundingBox();
 const scale=Math.min(box.width/1100,box.height/800),left=box.x+(box.width-1100*scale)/2,top=box.y+(box.height-800*scale)/2;
 await s.page.mouse.move(left+(x+80)*scale,top+(y+title/2)*scale);await s.page.mouse.down();await s.page.mouse.move(left+(x+145)*scale,top+(y+title/2+40)*scale,{steps:12});await s.page.mouse.up();
 await s.page.waitForFunction(()=>shell.busybox.log.includes('JWM-MOVED'));
 await writeFile(s.root+'test-results/jwm-acceptance-v1.png',await canvas.screenshot());
 await s.page.locator('#terminal-focus').click();assert.match(await pending,/JWM-HIDDEN-PROGRESS-PASS/);
 console.log('PASS real JWM two clients, decorations, browser drag, hidden progress and cleanup');
}finally{await s.close();}
