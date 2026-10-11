// First interactive scope: Fifteen via its owned JWM entry, keyboard move/undo,
// GTK save/load, clean quit/relaunch. Other games need their own evidence.
import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {session} from '../compatibility/session.mjs';
import {desktopSession} from './session.mjs';
import {observe,clickMenuEntry} from './menu.mjs';
import {visibleCanvas,canvasPosition} from '../migration/canvas.mjs';
const require=createRequire(new URL('../migration/package.json',import.meta.url));
const {PNG}=require('pngjs');
const sha=b=>createHash('sha256').update(b).digest('hex');
assert(process.env.MACHINE_JOB_ID,'machine-job required');
const run=process.env.COMPAT_RUN_DIR,attempt=process.env.MIGRATION_ATTEMPT||'first';
assert(/^[a-zA-Z0-9_-]+$/.test(attempt));const stem='puzzles-jwm-'+attempt;
await assert.rejects(access(resolve(run,stem+'.json')),{code:'ENOENT'});
const report={status:'running',startedAt:new Date().toISOString(),scope:'Fifteen only: real JWM menu, move/undo, GTK save/load, quit/relaunch'};
let s,d;
try{
 s=await session();report.runtime=s.runtime;await s.command('true');
 const expected=JSON.parse(await readFile(resolve(run,'candidate-manifests.json'))).puzzles;
 assert(expected.binary,'Fresh binary fixture required');
 const installed=await s.page.evaluate(async()=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/puzzles/current/manifest.json'))));
 assert.deepEqual(installed,expected);report.binary=expected.binary;
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/puzzles.sha256',new TextEncoder().encode(text)),await readFile(resolve(run,'puzzles.sha256'),'utf8'));
 await s.command('sha256sum -c /tmp/puzzles.sha256');
 report.harnessSha256=sha(await readFile(new URL(import.meta.url)));
 d=await desktopSession(s);report.helpers=d.helper;const canvas=await visibleCanvas(s.page);
 const click=async(x,y)=>canvas.click({position:await canvasPosition(canvas,{x,y})});
 const entry='gucos-puzzles-fifteen.desktop';report.menu=await clickMenuEntry(d,entry);
 let w=await observe(d,'window','Fifteen');assert(w.pid>0,'GTK client PID required for lifecycle proof');report.firstWindow=w;
 await click(w.x+w.width/2,w.y+w.height/2);
 // Compare only the board interior, excluding menu/status/WM/cursor changes.
 async function board(label){
  await s.page.waitForTimeout(400);
  const bytes=await canvas.screenshot();await writeFile(resolve(run,stem+'-'+label+'.png'),bytes,{flag:'wx'});
  const png=PNG.sync.read(bytes),box=await canvas.boundingBox();
  const a=await canvasPosition(canvas,{x:w.x+6,y:w.y+35}),b=await canvasPosition(canvas,{x:w.x+w.width-6,y:w.y+w.height-30});
  const left=Math.round(a.x*png.width/box.width),top=Math.round(a.y*png.height/box.height),right=Math.round(b.x*png.width/box.width),bottom=Math.round(b.y*png.height/box.height);
  assert(right>left&&bottom>top&&left>=0&&top>=0&&right<=png.width&&bottom<=png.height);
  const rows=[];for(let y=top;y<bottom;y++)rows.push(png.data.subarray((y*png.width+left)*4,(y*png.width+right)*4));return sha(Buffer.concat(rows));
 }
 const initial=await board('initial');let moved;
 for(const key of ['ArrowLeft','ArrowUp','ArrowRight','ArrowDown']){
  await s.page.keyboard.press(key);const current=await board(key);
  if(current!==initial){moved=current;report.moveKey=key;break;}
 }
 assert(moved,'At least one legal arrow-key move must change the board');
 await s.page.keyboard.press('u');assert.equal(await board('undo'),initial,'Undo must restore exact board pixels');
 await s.page.keyboard.press(report.moveKey);assert.equal(await board('redo-move'),moved);
 async function fileDialog(save){
  await s.page.keyboard.press('Alt+g');await s.page.keyboard.press('Home');
  // New, Restart, Specific, Random Seed, Load, Save; GTK skips separators.
  for(let i=0;i<(save?5:4);i++)await s.page.keyboard.press('ArrowDown');
  await s.page.keyboard.press('Enter');
  await observe(d,'window',save?'Enter name of game file to save':'Enter name of saved game file to load');
  await s.page.keyboard.press('Control+l');await s.page.keyboard.type('/home/user/jwm-fifteen.sav');await s.page.keyboard.press('Enter');
  await observe(d,'absent',save?'Enter name of game file to save':'Enter name of saved game file to load');
 }
 await fileDialog(true);
 const saved=await s.page.evaluate(async()=>Array.from(await shell.busybox.read('/home/user/jwm-fifteen.sav')||[]));assert(saved.length>100);report.savedSha256=sha(Buffer.from(saved));
 async function quit(){
  await s.page.keyboard.press('q');await observe(d,'absent','Fifteen');
  await d.command(`n=0; while kill -0 ${w.pid} 2>/dev/null; do n=$((n+1)); [ "$n" -lt 100 ] || exit 1; sleep 0.1; done`);
 }
 await quit();report.relaunchMenu=await clickMenuEntry(d,entry);w=await observe(d,'window','Fifteen');assert(w.pid>0);assert.notEqual(w.pid,report.firstWindow.pid);
 await fileDialog(false);assert.equal(await board('loaded'),moved,'Saved game restores exact board after clean relaunch');
 await quit();await d.finish();
 await s.command('test -s /home/user/jwm-fifteen.sav; echo PUZZLES-JWM-TERMINAL-RESTORED');
 report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}
finally{
 report.finishedAt=new Date().toISOString();
 if(s){try{await writeFile(resolve(run,stem+'.log'),await s.page.evaluate(()=>shell.busybox.log),{flag:'wx'});}finally{await s.close();}}
 await writeFile(resolve(run,stem+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}
