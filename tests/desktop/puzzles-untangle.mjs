// Untangle interactive gate: owned JWM entry, point drag/undo, GTK save/load,
// clean quit/relaunch and persisted-board browser reload. No solved-board claim.
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
const reload=process.argv.includes('--reload');
const run=process.env.COMPAT_RUN_DIR,attempt=process.env.MIGRATION_ATTEMPT||'first';
assert(/^[a-zA-Z0-9_-]+$/.test(attempt));const stem='puzzles-untangle-jwm-'+attempt+(reload?'-reload':'');
await assert.rejects(access(resolve(run,stem+'.json')),{code:'ENOENT'});
const savePath='/home/user/jwm-untangle-'+attempt+'.sav';
const report={savePath,status:'running',startedAt:new Date().toISOString(),scope:reload?'Untangle browser reload: persisted bytes, JWM launch, GTK load, prior board pixels, quit':'Untangle only: real JWM menu, move/undo, GTK save/load, quit/relaunch'};
async function bounded(p,ms,label){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label)),ms);})]);}finally{clearTimeout(timer);}}
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
 const entry='gucos-puzzles-untangle.desktop';report.menu=await clickMenuEntry(d,entry);
 let w=await observe(d,'window','Untangle');assert(w.pid>0,'GTK client PID required for lifecycle proof');report.firstWindow=w;
 assert(w.y>=24);await click(w.x+w.width/2,w.y-12);
 // Compare only the board interior, excluding menu/status/WM/cursor changes.
 async function board(label,{equal,different}={}){
  const screen=await canvas.boundingBox(),outside=await canvasPosition(canvas,{x:799,y:599});await s.page.mouse.move(screen.x+outside.x,screen.y+outside.y);
  let last,stable=0;const deadline=Date.now()+30000;
  while(Date.now()<deadline){
  await s.page.waitForTimeout(250);const bytes=await canvas.screenshot();
  const png=PNG.sync.read(bytes),box=await canvas.boundingBox();
  const a=await canvasPosition(canvas,{x:w.x+6,y:w.y+35}),b=await canvasPosition(canvas,{x:w.x+w.width-6,y:w.y+w.height-30});
  const left=Math.round(a.x*png.width/box.width),top=Math.round(a.y*png.height/box.height),right=Math.round(b.x*png.width/box.width),bottom=Math.round(b.y*png.height/box.height);
  assert(right>left&&bottom>top&&left>=0&&top>=0&&right<=png.width&&bottom<=png.height);
  const rows=[];for(let y=top;y<bottom;y++)rows.push(png.data.subarray((y*png.width+left)*4,(y*png.width+right)*4));const hash=sha(Buffer.concat(rows));
  stable=hash===last?stable+1:0;last=hash;
  if(stable>=5&&(equal===undefined||hash===equal)&&(different===undefined||hash!==different)){await writeFile(resolve(run,stem+'-'+label+'.png'),bytes,{flag:'wx'});return hash;}
  }throw Error('Board failed to reach expected settled pixels: '+label);
 }
 async function fileDialog(save){
  await s.page.keyboard.press('Alt+g');await s.page.keyboard.press('Home');
  // New, Restart, Specific, Random Seed, Load, Save; GTK skips separators.
  for(let i=0;i<(save?5:4);i++)await s.page.keyboard.press('ArrowDown');
  await s.page.keyboard.press('Enter');
  const dialog=await observe(d,'window',save?'Enter name of game file to save':'Enter name of saved game file to load');
  await s.page.keyboard.press('Control+l');await s.page.keyboard.type(savePath);
  assert(dialog.width>=400&&dialog.height>=250,'Expected GTK chooser dimensions');await click(dialog.x+dialog.width-52,dialog.y+dialog.height-24);
  await observe(d,'absent',save?'Enter name of game file to save':'Enter name of saved game file to load');
 }
 async function quit(){
  await s.page.keyboard.press('q');await observe(d,'absent','Untangle');
  await d.command(`n=0; while kill -0 ${w.pid} 2>/dev/null; do n=$((n+1)); [ "$n" -lt 100 ] || exit 1; sleep 0.1; done`);
 }
 if(reload){
  const previous=JSON.parse(await readFile(resolve(run,'puzzles-untangle-jwm-'+attempt+'.json')));assert.equal(previous.status,'passed');assert.equal(previous.savePath,savePath);assert.deepEqual(previous.binary,expected.binary,'Reload must retain the exact candidate binary');assert.equal(previous.runtime,s.runtime,'Reload must retain the tested runtime');
  const saved=await s.page.evaluate(async path=>Array.from(await shell.busybox.read(path)||[]),savePath);assert.equal(sha(Buffer.from(saved)),previous.savedSha256,'Browser reload retained exact saved bytes');
  await fileDialog(false);assert.equal(await board('browser-reloaded',{equal:previous.movedBoardSha256}),previous.movedBoardSha256);
  report.savedSha256=previous.savedSha256;report.movedBoardSha256=previous.movedBoardSha256;
 }else{
 const initial=await board('initial');
 // Untangle draws movable points as filled blue circles. Locate one from
 // rendered pixels, not guest memory; then drag it through real mouse input.
 const raw=PNG.sync.read(await canvas.screenshot()),box=await canvas.boundingBox();
 const tl=await canvasPosition(canvas,{x:w.x+6,y:w.y+35}),br=await canvasPosition(canvas,{x:w.x+w.width-6,y:w.y+w.height-30});
 const x0=Math.ceil(tl.x*raw.width/box.width),y0=Math.ceil(tl.y*raw.height/box.height),x1=Math.floor(br.x*raw.width/box.width),y1=Math.floor(br.y*raw.height/box.height);
 const seen=new Uint8Array(raw.width*raw.height),groups=[];
 const blue=(x,y)=>{const p=(y*raw.width+x)*4;return raw.data[p]<30&&raw.data[p+1]<30&&raw.data[p+2]>220;};
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  if(seen[y*raw.width+x]||!blue(x,y))continue;
  const todo=[[x,y]],points=[];seen[y*raw.width+x]=1;
  while(todo.length){const [a,b]=todo.pop();points.push([a,b]);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const c=a+dx,d=b+dy;if(c<x0||c>=x1||d<y0||d>=y1||seen[d*raw.width+c]||!blue(c,d))continue;seen[d*raw.width+c]=1;todo.push([c,d]);}}
  if(points.length>=5&&points.length<=400)groups.push(points);
 }
 assert(groups.length>=3,'Expected multiple rendered blue graph points');
 const points=groups[0],from={x:points.reduce((n,p)=>n+p[0],0)/points.length*box.width/raw.width,y:points.reduce((n,p)=>n+p[1],0)/points.length*box.height/raw.height};
 const center=await canvasPosition(canvas,{x:w.x+w.width/2,y:w.y+w.height/2});
 const to={x:from.x+(center.x-from.x)*0.25,y:from.y+(center.y-from.y)*0.25};assert(Math.hypot(to.x-from.x,to.y-from.y)>10);
 async function drag(){await s.page.mouse.move(box.x+from.x,box.y+from.y);await s.page.mouse.down();await s.page.mouse.move(box.x+to.x,box.y+to.y,{steps:8});await s.page.mouse.up();}
 await drag();const moved=await board('dragged',{different:initial});report.drag={from,to,blueComponents:groups.length};
 await s.page.keyboard.press('u');assert.equal(await board('undo',{equal:initial}),initial,'Undo must restore the initial graph');
 await drag();assert.equal(await board('repeat-drag',{equal:moved}),moved);
 await fileDialog(true);
 const saved=await s.page.evaluate(async path=>Array.from(await shell.busybox.read(path)||[]),savePath);assert(saved.length>100);report.savedSha256=sha(Buffer.from(saved));
 await quit();report.relaunchMenu=await clickMenuEntry(d,entry);w=await observe(d,'window','Untangle');assert(w.pid>0);assert.notEqual(w.pid,report.firstWindow.pid);
 await fileDialog(false);assert.equal(await board('loaded',{equal:moved}),moved,'Saved game restores exact board after clean relaunch');
 report.movedBoardSha256=moved;
 }
 await quit();await d.finish();
 await s.command('test -s '+savePath+'; echo PUZZLES-JWM-TERMINAL-RESTORED');
 report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}
finally{
 report.finishedAt=new Date().toISOString();
 if(s){
  if(report.status==='failed')try{await bounded((async()=>{const c=await visibleCanvas(s.page);await writeFile(resolve(run,stem+'-failure.png'),await c.screenshot(),{flag:'wx'});})(),5000,'Failure screenshot timeout');}catch(e){report.screenshotError=String(e);}
  try{await bounded((async()=>{const log=await s.page.evaluate(()=>shell.busybox.log);await writeFile(resolve(run,stem+'.log'),log,{flag:'wx'});})(),5000,'Log retention exceeded 5 seconds');}catch(e){report.logError=String(e);}
  try{await bounded(s.close(),30000,'Session closure exceeded 30 seconds');}catch(e){report.cleanupError=String(e);report.status='failed';}
 }
 await writeFile(resolve(run,stem+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 if(report.status!=='passed')process.exitCode=1;
}
