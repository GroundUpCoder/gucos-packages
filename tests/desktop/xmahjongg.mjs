// h+Space selects a hinted tile/pair; Return removes it, including 3-hint boards.
import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {session} from '../compatibility/session.mjs';
import {desktopSession} from './session.mjs';
import {clickMenuEntry} from './menu.mjs';
import {installObserver,observe} from './menu-xapps.mjs';
import {visibleCanvas,canvasPosition} from '../migration/canvas.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
assert(process.env.MACHINE_JOB_ID);const run=process.env.COMPAT_RUN_DIR,attempt=process.env.MIGRATION_ATTEMPT||'first';assert(/^[a-zA-Z0-9_-]+$/.test(attempt));
const stem='xmahjongg-jwm-'+attempt;await assert.rejects(access(resolve(run,stem+'.json')),{code:'ENOENT'});
const report={status:'running',startedAt:new Date().toISOString(),scope:'Owned menu, documented hint-assisted pair removal, undo/redo, new board, quit/relaunch. Screenshots require independent review; no saved-game restoration.'};let s,d;
async function bounded(p,ms){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('XMahjongg operation timeout')),ms);})]);}finally{clearTimeout(timer);}}
try{
 s=await session();report.runtime=s.runtime;await s.command('true');
 const config=JSON.parse(await readFile(resolve(run,'config.json'))),candidate=JSON.parse(await readFile(resolve(run,'candidate-manifests.json'))).xmahjongg;assert(candidate.binary);
 const bytes=await readFile(resolve(run,'xmahjongg-closure.json')),closure=JSON.parse(bytes),sums=await readFile(resolve(run,'xmahjongg-closure.sha256'));
 assert.equal(closure.root,'xmahjongg');assert.equal(closure.inputCommit,config.inputCommit);assert.deepEqual(closure.manifests.xmahjongg,candidate);assert.equal(sha(sums),closure.checksumsSha256);
 for(const [name,expected] of Object.entries(closure.manifests))assert.deepEqual(await s.page.evaluate(async name=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'))),name),expected);
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/xmahjongg-closure.sha256',new TextEncoder().encode(text)),sums.toString());await s.command('sha256sum -c /tmp/xmahjongg-closure.sha256');
 report.pixelScope={excludedCounter:{x:10,y:12,width:108,height:38},reason:'Source-defined counter clear overlaps top tile edges; count screenshots require separate review'};report.closureSha256=sha(bytes);report.harnessSha256=sha(await readFile(new URL(import.meta.url)));report.observer=await installObserver(s);d=await desktopSession(s);report.helpers=d.helper;
 const canvas=await visibleCanvas(s.page);let w,pid;
 async function launch(){
  (report.menus??=[]).push(await clickMenuEntry(d,'xmahjongg.desktop'));w=await observe(d,'window','XMahjongg');
  const ids=(await d.command('for f in /proc/[0-9]*/comm; do IFS= read -r comm < "$f" || continue; if [ "$comm" = xmahjongg ]; then p=${f#/proc/}; echo "${p%/comm}"; fi; done')).trim().split(/\s+/).map(Number);assert.equal(ids.length,1);assert(Number.isInteger(ids[0])&&ids[0]>0);pid=ids[0];(report.pids??=[]).push(pid);
  assert(w.y>=24);await canvas.click({position:await canvasPosition(canvas,{x:w.x+w.width/2,y:w.y-12})});
  const box=await canvas.boundingBox(),p=await canvasPosition(canvas,{x:799,y:599});await s.page.mouse.move(box.x+p.x,box.y+p.y);
 }
 async function board(label,{equal,different}={}){return bounded((async()=>{
  await writeFile(resolve(run,stem+'-'+label+'-before-expose.png'),await canvas.screenshot(),{flag:'wx'});
  const frame=await observe(d,'frame','XMahjongg');assert(w.y-frame.y>=24&&w.y-frame.y<=32);
  await canvas.click({position:await canvasPosition(canvas,{x:frame.x+frame.width-64,y:frame.y+16})});
  await observe(d,'absent','XMahjongg');
  await canvas.click({position:await canvasPosition(canvas,{x:200,y:585})});
  assert.deepEqual(await observe(d,'window','XMahjongg'),w,'Normal expose must preserve client geometry');
  const box=await canvas.boundingBox(),outside=await canvasPosition(canvas,{x:799,y:599});await s.page.mouse.move(box.x+outside.x,box.y+outside.y);
  let last,stable=0;
  for(;;){await s.page.waitForTimeout(250);const pixels=await observe(d,'mahjongg-tiles','XMahjongg');assert(pixels.different>100,'Rendered tile board required');stable=pixels.hash===last?stable+1:0;last=pixels.hash;
   if(stable>=5&&(equal===undefined||pixels.hash===equal)&&(different===undefined||pixels.hash!==different)){await writeFile(resolve(run,stem+'-'+label+'.png'),await canvas.screenshot(),{flag:'wx'});return pixels.hash;}
  }
 })(),30000);}
 async function quit(){await s.page.keyboard.press('q');await observe(d,'absent','XMahjongg');await d.command(`n=0; while kill -0 ${pid} 2>/dev/null; do n=$((n+1)); [ "$n" -lt 100 ] || exit 1; sleep 0.1; done`);}
 await launch();const initial=await board('initial');
 await s.page.keyboard.press('h');await s.page.keyboard.press('Space');await s.page.waitForTimeout(150);await writeFile(resolve(run,stem+'-hint-selected.png'),await canvas.screenshot(),{flag:'wx'});await s.page.keyboard.press('Enter');await s.page.keyboard.press('Escape');const removed=await board('pair-removed',{different:initial});
 await s.page.keyboard.press('u');await s.page.keyboard.press('Escape');assert.equal(await board('undo',{equal:initial}),initial);
 await s.page.keyboard.press('r');await s.page.keyboard.press('Escape');assert.equal(await board('redo',{equal:removed}),removed);
 await s.page.keyboard.press('n');await s.page.keyboard.press('Escape');const fresh=await board('new-board',{different:removed});
 await quit();const first=pid;await launch();assert.notEqual(pid,first);await board('relaunched');await quit();report.boards={initial,removed,fresh};
 await d.finish();await s.command('echo XMAHJONGG-JWM-TERMINAL-RESTORED');report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}
finally{
 report.finishedAt=new Date().toISOString();if(s){
  if(report.status==='failed')try{await bounded((async()=>{await writeFile(resolve(run,stem+'-failure.png'),await (await visibleCanvas(s.page)).screenshot(),{flag:'wx'});})(),5000);}catch(e){report.screenshotError=String(e);}
  try{await bounded((async()=>{await writeFile(resolve(run,stem+'.log'),await s.page.evaluate(()=>shell.busybox.log),{flag:'wx'});})(),5000);}catch(e){report.logError=String(e);}try{await bounded(s.close(),30000);}catch(e){report.cleanupError=String(e);report.status='failed';}
 }
 await writeFile(resolve(run,stem+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});if(report.status!=='passed')process.exitCode=1;
}
