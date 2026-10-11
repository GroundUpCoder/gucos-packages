import {installObserver as installPixels,observe as observePixels} from './menu-xapps.mjs';
// Same Game: physical selection/removal of a visible multi-tile color group,
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
const reload=process.argv.includes('--reload');
const run=process.env.COMPAT_RUN_DIR,attempt=process.env.MIGRATION_ATTEMPT||'first';
assert(/^[a-zA-Z0-9_-]+$/.test(attempt));const stem='puzzles-samegame-jwm-'+attempt+(reload?'-reload':'');
await assert.rejects(access(resolve(run,stem+'.json')),{code:'ENOENT'});
const savePath='/home/user/jwm-samegame-'+attempt+'.sav';
const report={savePath,status:'running',startedAt:new Date().toISOString(),scope:reload?'Same Game browser reload: persisted bytes, JWM launch, GTK load, prior board pixels, quit':'Same Game only: real JWM menu, move/undo, GTK save/load, quit/relaunch'};
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
 report.pixelObserver=await installPixels(s);
 d=await desktopSession(s);report.helpers=d.helper;const canvas=await visibleCanvas(s.page);
 const click=async(x,y)=>canvas.click({position:await canvasPosition(canvas,{x,y})});
 const entry='gucos-puzzles-samegame.desktop';report.menu=await clickMenuEntry(d,entry);
 let w=await observe(d,'window','Same Game');assert(w.pid>0,'GTK client PID required for lifecycle proof');report.firstWindow=w;
 assert(w.y>=24);await click(w.x+w.width/2,w.y-12);
 // Compare only the board interior, excluding menu/status/WM/cursor changes.
 async function board(label,{equal,different}={}){
  const screen=await canvas.boundingBox(),outside=await canvasPosition(canvas,{x:799,y:599});await s.page.mouse.move(screen.x+outside.x,screen.y+outside.y);
  let last,stable=0;const deadline=Date.now()+30000;
  while(Date.now()<deadline){
  await s.page.waitForTimeout(250);const bytes=await canvas.screenshot();
  const pixels=await observePixels(d,'puzzle-board','Same Game');const hash=`${pixels.width}x${pixels.height}:${pixels.hash}`;
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
  await s.page.waitForTimeout(500);await s.page.keyboard.press('Control+l');await s.page.waitForTimeout(100);await s.page.keyboard.type(savePath);
  await s.page.waitForTimeout(5000); // Diagnostic: allow filename metadata validation to settle.
  assert(dialog.width>=400&&dialog.height>=250,'Expected GTK chooser dimensions');await click(dialog.x+dialog.width-52,dialog.y+dialog.height-24);
  await observe(d,'absent',save?'Enter name of game file to save':'Enter name of saved game file to load');
 }
 async function quit(){
  await s.page.keyboard.press('q');await observe(d,'absent','Same Game');
  await d.command(`n=0; while kill -0 ${w.pid} 2>/dev/null; do n=$((n+1)); [ "$n" -lt 100 ] || exit 1; sleep 0.1; done`);
 }
 if(reload){
  const previous=JSON.parse(await readFile(resolve(run,'puzzles-samegame-jwm-'+attempt+'.json')));assert.equal(previous.status,'passed');assert.equal(previous.savePath,savePath);assert.deepEqual(previous.binary,expected.binary,'Reload must retain the exact candidate binary');assert.equal(previous.runtime,s.runtime,'Reload must retain the tested runtime');
  const saved=await s.page.evaluate(async path=>Array.from(await shell.busybox.read(path)||[]),savePath);assert.equal(sha(Buffer.from(saved)),previous.savedSha256,'Browser reload retained exact saved bytes');
  await fileDialog(false);assert.equal(await board('browser-reloaded',{equal:previous.movedBoardPixelHash}),previous.movedBoardPixelHash);
  report.savedSha256=previous.savedSha256;report.movedBoardPixelHash=previous.movedBoardPixelHash;
 }else{
 const initial=await board('initial');
 // Default Same Game is 5x5 with32-pixel tiles. Equal-color neighbours
 // fill their intervening gaps, so a sufficiently large connected region
 // identifies a removable group from rendered pixels alone.
 assert(w.width>=180&&w.width<=300&&w.height>=220&&w.height<=360,'Expected default 5x5 board');
 const raw=PNG.sync.read(await canvas.screenshot()),box=await canvas.boundingBox();
 const tl=await canvasPosition(canvas,{x:w.x+6,y:w.y+35}),br=await canvasPosition(canvas,{x:w.x+w.width-6,y:w.y+w.height-30});
 const x0=Math.ceil(tl.x*raw.width/box.width),y0=Math.ceil(tl.y*raw.height/box.height),x1=Math.floor(br.x*raw.width/box.width),y1=Math.floor(br.y*raw.height/box.height);
 const sx=(br.x-tl.x)*raw.width/box.width/(w.width-12),sy=(br.y-tl.y)*raw.height/box.height/(w.height-65);assert(sx>0&&sy>0);
 const seen=new Uint8Array(raw.width*raw.height),groups=[];
 const color=(x,y)=>{const p=(y*raw.width+x)*4,[r,g,b]=raw.data.subarray(p,p+3);return r>220&&g<25&&b<25?1:b>220&&r<25&&g<25?2:g>=110&&g<=145&&r<25&&b<25?3:0;};
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  const c=color(x,y);if(!c||seen[y*raw.width+x])continue;
  const todo=[[x,y]],points=[];seen[y*raw.width+x]=1;
  while(todo.length){const [a,b]=todo.pop();points.push([a,b]);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const cX=a+dx,cY=b+dy;if(cX<x0||cX>=x1||cY<y0||cY>=y1||seen[cY*raw.width+cX]||color(cX,cY)!==c)continue;seen[cY*raw.width+cX]=1;todo.push([cX,cY]);}}
  const nativeArea=points.length/(sx*sy);if(nativeArea>1200)groups.push({points,nativeArea,color:c});
 }
 assert(groups.length,'Expected a connected multi-tile primary-color group');
 const group=groups[0],cx=group.points.reduce((n,p)=>n+p[0],0)/group.points.length,cy=group.points.reduce((n,p)=>n+p[1],0)/group.points.length;
 const point=group.points.reduce((best,p)=>Math.hypot(p[0]-cx,p[1]-cy)<Math.hypot(best[0]-cx,best[1]-cy)?p:best);
 const position={x:point[0]*box.width/raw.width,y:point[1]*box.height/raw.height};report.selectedGroup={nativeArea:group.nativeArea,color:group.color,position};
 async function remove(){await canvas.click({position});await s.page.waitForTimeout(200);await canvas.click({position});}
 await remove();const moved=await board('removed',{different:initial});
 await s.page.keyboard.press('u');assert.equal(await board('undo',{equal:initial}),initial,'Undo restores removed group');
 await remove();assert.equal(await board('repeat-removal',{equal:moved}),moved);
 await fileDialog(true);
 const saved=await s.page.evaluate(async path=>Array.from(await shell.busybox.read(path)||[]),savePath);assert(saved.length>100);report.savedSha256=sha(Buffer.from(saved));
 await quit();report.relaunchMenu=await clickMenuEntry(d,entry);w=await observe(d,'window','Same Game');assert(w.pid>0);assert.notEqual(w.pid,report.firstWindow.pid);
 await fileDialog(false);assert.equal(await board('loaded',{equal:moved}),moved,'Saved game restores exact board after clean relaunch');
 report.movedBoardPixelHash=moved;
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
