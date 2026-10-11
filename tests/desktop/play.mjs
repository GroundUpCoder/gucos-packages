import {session} from '../compatibility/session.mjs';
import {visibleCanvas,canvasPosition} from '../migration/canvas.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
const run=process.env.COMPAT_RUN_DIR,attempt=process.env.MIGRATION_ATTEMPT||'';
assert(!attempt||/^[a-zA-Z0-9_-]+$/.test(attempt));
const output=file=>resolve(run,file.replace(/(\.[^.]+)$/,attempt?'-'+attempt+'$1':'$1'));
for(const file of ['desktop-functional.json','desktop-functional.log','desktop-snake.png','desktop-menu.png'])await assert.rejects(access(output(file)),{code:'ENOENT'});
const report={startedAt:new Date().toISOString(),status:'running',checks:[]};
let s,pending;
try{
 s=await session();report.runtime=s.runtime;
 await s.command('true');
 const manifests=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
 for(const name of ['desktop-entries','jwm']){
  const installed=await s.page.evaluate(async name=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'))),name);
  assert.deepEqual(installed,manifests[name]);
  await s.page.evaluate(async text=>shell.busybox.write('/tmp/desktop-expected.sha256',new TextEncoder().encode(text)),await readFile(resolve(run,name+'.sha256'),'utf8'));
  await s.command('sha256sum -c /tmp/desktop-expected.sha256');
 }
 report.checks.push('frozen-candidate-manifests-and-payloads');
 const menu=await s.command('sh /usr/local/share/jwm/app-menu.sh');
 assert(!menu.includes('<Menu '),'fixture assumes a flat installed menu');
 const programs=menu.split('\n').filter(line=>line.includes('<Program '));
 const index=programs.findIndex(line=>line.includes('label="Snake"'));
 assert(index>=0);report.menu=menu;report.snakeIndex=index;
 const observer=await readFile(new URL('observe.c',import.meta.url),'utf8');
 report.observerSha256=createHash('sha256').update(observer).digest('hex');
 report.harnessSha256=createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
 await s.page.evaluate(async source=>shell.busybox.write('/tmp/desktop-observe.c',new TextEncoder().encode(source)),observer);
 pending=s.command(`set -eu
cc /tmp/desktop-observe.c -I/usr/local/include -L/usr/local/lib -lX11 -lxcb -lXau -o /tmp/desktop-observe
export DISPLAY=:1
Xvfb :1 -screen 0 800x600x24 -fp built-ins -noreset -ac &
server=$!
wm=
cleanup() { [ -z "$wm" ] || kill "$wm" 2>/dev/null || true; kill "$server" 2>/dev/null || true; wait "$server" 2>/dev/null || true; }
trap cleanup EXIT
/usr/local/libexec/jwm/wait-display
jwm -f /usr/local/share/jwm/wasm.jwmrc &
wm=$!
/tmp/desktop-observe wm
/tmp/desktop-observe menu
/tmp/desktop-observe snake
/tmp/desktop-observe closed
kill -0 "$wm"
jwm -exit
wait "$wm"
wm=
cleanup
trap - EXIT
echo DESKTOP-GAME-PASS`);
 pending.catch(()=>{});
 async function marker(text){await Promise.race([s.page.waitForFunction(text=>shell.busybox?.log.includes(text),text,{timeout:35000}),pending.then(()=>{throw Error('Desktop ended before '+text);})]);}
 await marker('DESKTOP-WM-READY');
 const canvas=await visibleCanvas(s.page);
 await canvas.click({position:await canvasPosition(canvas,{x:10,y:585})});
 await marker('DESKTOP-MENU ');
 await writeFile(output('desktop-menu.png'),await canvas.screenshot(),{flag:'wx'});
 const log=await s.page.evaluate(()=>shell.busybox.log);
 const geometry=log.match(/DESKTOP-MENU (\d+) (\d+) (\d+) (\d+)/);assert(geometry);
 const [x,y,width,height]=geometry.slice(1).map(Number);
 await canvas.click({position:await canvasPosition(canvas,{x:x+width/2,y:y+1+(index+0.5)*(height-2)/(programs.length+2)})});
 await marker('DESKTOP-SNAKE-BOARD');report.checks.push('actual-jwm-menu-selection','xterm-pty-game-board-pixels');
 await s.page.keyboard.press('ArrowUp');
 await writeFile(output('desktop-snake.png'),await canvas.screenshot(),{flag:'wx'});
 await s.page.keyboard.press('q');
 await marker('DESKTOP-SNAKE-CLOSED');
 assert.match(await pending,/DESKTOP-GAME-PASS/);pending=undefined;
 report.checks.push('keyboard-input-and-single-q-close','jwm-survives-game-exit');report.status='passed';
}catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally{
 if(s){await writeFile(output('desktop-functional.log'),await s.page.evaluate(()=>shell.busybox?.log||'').catch(()=>''),{flag:'wx'});await s.close();}
 report.finishedAt=new Date().toISOString();await writeFile(output('desktop-functional.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}
