import {installObserver as installPixels,observe as observePixels} from './menu-xapps.mjs';
// Solo: rendered blank selection, real pencil-mark input and undo;
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
assert(/^[a-zA-Z0-9_-]+$/.test(attempt));const stem='puzzles-solo-jwm-'+attempt+(reload?'-reload':'');
await assert.rejects(access(resolve(run,stem+'.json')),{code:'ENOENT'});
const savePath='/home/user/jwm-solo-'+attempt+'.sav';
const report={savePath,status:'running',startedAt:new Date().toISOString(),scope:reload?'Solo browser reload: persisted bytes, JWM launch, GTK load, prior board pixels, quit':'Solo only: real JWM menu, move/undo, GTK save/load, quit/relaunch'};
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
 const entry='gucos-puzzles-solo.desktop';report.menu=await clickMenuEntry(d,entry);
 let w=await observe(d,'window','Solo');assert(w.pid>0,'GTK client PID required for lifecycle proof');report.firstWindow=w;
 assert(w.y>=24);await click(w.x+w.width/2,w.y-12);
 let border;
 // Compare only the board interior, excluding menu/status/WM/cursor changes.
 async function board(label,{equal,different}={}){
  if(border)await click(w.x+border.x,w.y+border.y);
  const screen=await canvas.boundingBox(),outside=await canvasPosition(canvas,{x:799,y:599});await s.page.mouse.move(screen.x+outside.x,screen.y+outside.y);
  let last,stable=0;const deadline=Date.now()+30000;
  while(Date.now()<deadline){
  await s.page.waitForTimeout(250);const bytes=await canvas.screenshot();
  const pixels=await observePixels(d,'solo-board','Solo');const hash=`${pixels.width}x${pixels.height}:${pixels.hash}`;
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
  await s.page.keyboard.press('q');await observe(d,'absent','Solo');
  await d.command(`n=0; while kill -0 ${w.pid} 2>/dev/null; do n=$((n+1)); [ "$n" -lt 100 ] || exit 1; sleep 0.1; done`);
 }
 // Detect the ten grid boundaries from rendered black strokes. Require
 // regular spacing and thicker 3x3 block boundaries, then inspect interiors.
 await board('layout');
 const raw=PNG.sync.read(await canvas.screenshot()),box=await canvas.boundingBox();
 const tl=await canvasPosition(canvas,{x:w.x+6,y:w.y+35}),br=await canvasPosition(canvas,{x:w.x+w.width-6,y:w.y+w.height-6});
 const x0=Math.ceil(tl.x*raw.width/box.width),y0=Math.ceil(tl.y*raw.height/box.height),x1=Math.floor(br.x*raw.width/box.width),y1=Math.floor(br.y*raw.height/box.height);
 const dark=(x,y)=>{const p=(y*raw.width+x)*4;return raw.data[p]<45&&raw.data[p+1]<45&&raw.data[p+2]<45;};
 function lines(vertical){const values=[];for(let a=vertical?x0:y0;a<(vertical?x1:y1);a++){let count=0;for(let b=vertical?y0:x0;b<(vertical?y1:x1);b++)count+=vertical?dark(a,b):dark(b,a);if(count>0.65*Math.min(x1-x0,y1-y0))values.push(a);}const groups=[];for(const a of values){const last=groups.at(-1);if(last&&a===last.at(-1)+1)last.push(a);else groups.push([a]);}assert.equal(groups.length,10,'Expected ten unambiguous grid strokes');const centers=groups.map(g=>(g[0]+g.at(-1))/2),step=(centers[9]-centers[0])/9;assert(step>20&&step<90);for(let i=1;i<10;i++)assert(Math.abs(centers[i]-centers[i-1]-step)<3,'Uniform grid spacing');const thin=Math.min(...groups.filter((_,i)=>i%3).map(g=>g.length));for(const i of [0,3,6,9])assert(groups[i].length>thin,'Thicker block boundaries required');return centers;}
 const xs=lines(true),ys=lines(false),sx=(br.x-tl.x)*raw.width/box.width/(w.width-12),sy=(br.y-tl.y)*raw.height/box.height/(w.height-41);
 assert(Math.abs((xs[9]-xs[0])/sx-432)<5&&Math.abs((ys[9]-ys[0])/sy-432)<5,'Expected default48-pixel Solo cells');
 const local=(x,y)=>({x:6+(x-tl.x*raw.width/box.width)/sx,y:35+(y-tl.y*raw.height/box.height)/sy});
 border=local(xs[0]-10*sx,ys[0]-10*sy);assert(border.x>0&&border.y>25);
 const blanks=[];let occupied=0;
 for(let row=0;row<9;row++)for(let col=0;col<9;col++){
  const left=Math.ceil(xs[col]+6*sx),right=Math.floor(xs[col+1]-6*sx),top=Math.ceil(ys[row]+6*sy),bottom=Math.floor(ys[row+1]-6*sy);
  const p=(top*raw.width+left)*4,bg=Array.from(raw.data.subarray(p,p+3));let blank=bg.every(c=>c>190)&&Math.max(...bg)-Math.min(...bg)<5;
  for(let y=top;y<bottom&&blank;y++)for(let x=left;x<right;x++){const q=(y*raw.width+x)*4;if(bg.some((c,i)=>Math.abs(raw.data[q+i]-c)>8)){blank=false;break;}}
  if(blank)blanks.push({row,col,point:local((xs[col]+xs[col+1])/2,(ys[row]+ys[row+1])/2)});else occupied++;
 }
 assert(blanks.length>5&&occupied>5,'Both blank cells and printed clues required');
 report.grid={xs,ys,blankCount:blanks.length,occupied,border};
 if(reload){
  const previous=JSON.parse(await readFile(resolve(run,'puzzles-solo-jwm-'+attempt+'.json')));assert.equal(previous.status,'passed');assert.equal(previous.savePath,savePath);assert.deepEqual(previous.binary,expected.binary,'Reload must retain the exact candidate binary');assert.equal(previous.runtime,s.runtime,'Reload must retain the tested runtime');
  const saved=await s.page.evaluate(async path=>Array.from(await shell.busybox.read(path)||[]),savePath);assert.equal(sha(Buffer.from(saved)),previous.savedSha256,'Browser reload retained exact saved bytes');
  await fileDialog(false);assert.equal(await board('browser-reloaded',{equal:previous.movedBoardPixelHash}),previous.movedBoardPixelHash);
  report.savedSha256=previous.savedSha256;report.movedBoardPixelHash=previous.movedBoardPixelHash;
 }else{
 const initial=await board('initial'),cell=blanks[0];report.selectedCell=cell;
 async function mark(){await canvas.click({position:await canvasPosition(canvas,{x:w.x+cell.point.x,y:w.y+cell.point.y}),button:'right'});await s.page.waitForTimeout(200);await s.page.keyboard.press('1');}
 await mark();const moved=await board('pencil-mark',{different:initial});
 const marked=PNG.sync.read(await canvas.screenshot());let pencilPixels=0;
 for(let y=Math.ceil(ys[cell.row]+6*sy);y<ys[cell.row+1]-6*sy;y++)for(let x=Math.ceil(xs[cell.col]+6*sx);x<xs[cell.col+1]-6*sx;x++){const p=(y*marked.width+x)*4,[r,g,b]=marked.data.subarray(p,p+3);if(r>50&&g>50&&b>r+30&&b>g+30)pencilPixels++;}
 assert(pencilPixels>2,'Selected blank must contain a pencil-colored glyph');report.pencilPixels=pencilPixels;
 await s.page.keyboard.press('u');assert.equal(await board('undo',{equal:initial}),initial,'Undo restores the blank');
 await mark();assert.equal(await board('repeat-mark',{equal:moved}),moved);
 await fileDialog(true);
 const saved=await s.page.evaluate(async path=>Array.from(await shell.busybox.read(path)||[]),savePath);assert(saved.length>100);report.savedSha256=sha(Buffer.from(saved));
 await quit();report.relaunchMenu=await clickMenuEntry(d,entry);w=await observe(d,'window','Solo');assert(w.pid>0);assert.notEqual(w.pid,report.firstWindow.pid);
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
