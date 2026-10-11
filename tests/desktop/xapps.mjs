// Physical JWM/input gates for the accepted X applications advertised by
// desktop-apps. Observers read X geometry/pixels only; no synthetic X events.
import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {session} from '../compatibility/session.mjs';
import {poll} from './poll.mjs';
import {desktopSession} from './session.mjs';
import {clickMenuEntry} from './menu.mjs';
import {installObserver,observe} from './menu-xapps.mjs';
import {visibleCanvas,canvasPosition} from '../migration/canvas.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
async function bounded(p,ms){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('X app test deadline')),ms);})]);}finally{clearTimeout(timer);}}
assert(process.env.MACHINE_JOB_ID);const name=process.argv[2];assert(['xcalc','xedit','xclock','xeyes'].includes(name));
const reload=process.argv.includes('--reload');assert(!reload||name==='xedit','--reload is the editor persistence branch');
const run=process.env.COMPAT_RUN_DIR,attempt=process.env.MIGRATION_ATTEMPT||'first';assert(/^[a-zA-Z0-9_-]+$/.test(attempt));const stem=name+'-jwm-'+attempt+(reload?'-reload':'');
await assert.rejects(access(resolve(run,stem+'.json')),{code:'ENOENT'});
const report={status:'running',startedAt:new Date().toISOString(),name,scope:'Owned JWM menu launch, physical input/function, quit/relaunch; editor saves and reopens'};let s,d;
try{
 s=await session();report.runtime=s.runtime;await s.command('true');
 const config=JSON.parse(await readFile(resolve(run,'config.json'))),candidate=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')))['desktop-apps'];assert(candidate.binary);
 const bytes=await readFile(resolve(run,'desktop-closure.json')),closure=JSON.parse(bytes),sums=await readFile(resolve(run,'desktop-closure.sha256'));
 assert.equal(closure.root,'desktop-apps');assert.equal(closure.inputCommit,config.inputCommit);assert.deepEqual(closure.manifests['desktop-apps'],candidate);assert.equal(sha(sums),closure.checksumsSha256);assert(closure.manifests[name]);
 for(const [n,expected] of Object.entries(closure.manifests))assert.deepEqual(await s.page.evaluate(async n=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+n+'/current/manifest.json'))),n),expected);
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/xapps-closure.sha256',new TextEncoder().encode(text)),sums.toString());await s.command('sha256sum -c /tmp/xapps-closure.sha256');
 report.closureSha256=sha(bytes);report.harnessSha256=sha(await readFile(new URL(import.meta.url)));report.observer=await installObserver(s);d=await desktopSession(s);report.desktopHelpers=d.helper;
 const klass={xcalc:'XCalc',xedit:'Xedit',xclock:'XClock',xeyes:'XEyes'}[name],entry='gucos-desktop-'+name+'.desktop';const canvas=await visibleCanvas(s.page);
 const click=async(x,y)=>canvas.click({position:await canvasPosition(canvas,{x,y})});
 const snap=async label=>{await writeFile(resolve(run,stem+'-'+label+'.png'),await canvas.screenshot(),{flag:'wx'});};
 const pixels=async (height=undefined)=>observe(d,'pixels',klass,height);
 let w,pid;
 async function launch(){
  (report.menus??=[]).push(await clickMenuEntry(d,entry));w=await observe(d,'window',klass);
  const ids=(await d.command('for f in /proc/[0-9]*/comm; do IFS= read -r comm < "$f" || continue; if [ "$comm" = '+name+' ]; then p=${f#/proc/}; echo "${p%/comm}"; fi; done')).trim().split(/\s+/).map(Number);assert.equal(ids.length,1,'Isolated fixture must have one app process');assert(Number.isInteger(ids[0])&&ids[0]>0);pid=ids[0];
  (report.pids??=[]).push(pid);await click(w.x+w.width/2,w.y+w.height/2);await s.page.waitForTimeout(300);assert((await pixels()).different>10);
 }
 async function close(){
  // Accepted JWM uses a 24-pixel title bar; click its ordinary close button.
  const frame=await observe(d,'frame',klass);assert(w.y-frame.y>=24&&w.y-frame.y<=32);
  await click(frame.x+frame.width-16,frame.y+16);await observe(d,'absent',klass);
  await d.command(`n=0; while kill -0 ${pid} 2>/dev/null; do n=$((n+1)); [ "$n" -lt 100 ] || exit 1; sleep 0.1; done`);
 }
 async function editorLoad(){
  const field=await observe(d,'child',klass,'0.0.3');assert(field.width>100&&field.height<65,'Expected Xedit filename field geometry');
  await click(field.x+field.width/2,field.y+field.height/2);await s.page.keyboard.press('Control+a');await s.page.keyboard.press('Control+k');await s.page.keyboard.type('/home/user/jwm-xedit.txt');
  const load=await observe(d,'child',klass,'0.0.2');assert(load.width<120&&load.height<65);await click(load.x+load.width/2,load.y+load.height/2);await s.page.waitForTimeout(300);
  await click(w.x+w.width/2,w.y+w.height*0.75);
 }
 async function saveExpected(text){
  await s.page.keyboard.press('Control+x');await s.page.keyboard.press('Control+s');
  await poll(s.page,async text=>{const actual=await shell.busybox.read('/home/user/jwm-xedit.txt'),expected=new TextEncoder().encode(text);return actual?.length===expected.length&&expected.every((b,i)=>actual[i]===b);},text,15000);
 }
 await launch();await snap('launched');
 if(name==='xcalc'){
  await s.page.keyboard.press('Backspace');await s.page.keyboard.type('1+2=');await s.page.waitForTimeout(250);const sum=await pixels(65);await snap('sum-three');
  await s.page.keyboard.press('Backspace');await s.page.waitForTimeout(150);const zero=await pixels(65);await s.page.keyboard.type('3');await s.page.waitForTimeout(250);const three=await pixels(65);
  assert.notEqual(sum.hash,zero.hash);assert.equal(sum.hash,three.hash,'1+2 display must equal directly entered3');report.result={sum,zero,three};
 }else if(name==='xeyes'){
  const box=await canvas.boundingBox();const move=async p=>{const q=await canvasPosition(canvas,p);await s.page.mouse.move(box.x+q.x,box.y+q.y);await s.page.waitForTimeout(400);};
  await move({x:5,y:5});const left=await pixels();await snap('look-left');await move({x:790,y:560});const right=await pixels();await snap('look-right');assert.notEqual(left.hash,right.hash);report.result={left,right};
 }else if(name==='xclock'){
  const before=await pixels();let after=before;
  for(let i=0;i<70&&after.hash===before.hash;i++){await s.page.waitForTimeout(1000);after=await pixels();}
  assert.notEqual(after.hash,before.hash,'Default minute-update clock must advance');report.result={before,after};await snap('ticked');
 }else{
  await editorLoad();
  if(reload){
   const prior=JSON.parse(await readFile(resolve(run,'xedit-jwm-'+attempt+'.json')));assert.equal(prior.status,'passed');assert.equal(prior.closureSha256,report.closureSha256,'Reload must use the same accepted private/public closure');assert.equal(prior.runtime,s.runtime);
   const disk=await s.page.evaluate(async()=>Array.from(await shell.busybox.read('/home/user/jwm-xedit.txt')||[]));assert.deepEqual(disk,Array.from(new TextEncoder().encode(prior.saved)));
   await s.page.keyboard.press('Control+End');await s.page.keyboard.type('browser reload');await s.page.keyboard.press('Enter');report.saved=prior.saved+'browser reload\n';
  }else{await s.page.keyboard.type('hello JWM editor');await s.page.keyboard.press('Enter');report.saved='hello JWM editor\n';}
  await saveExpected(report.saved);await snap('saved');
 }
 await close();const firstPid=pid;await launch();assert.notEqual(pid,firstPid);await snap('relaunched');
 if(name==='xedit'){
  await editorLoad();await s.page.keyboard.press('Control+End');await s.page.keyboard.type('reopened');await s.page.keyboard.press('Enter');report.saved+='reopened\n';await saveExpected(report.saved);await snap('reopened-saved');
 }
 await close();await d.finish();await s.command('echo XAPP-JWM-TERMINAL-RESTORED');report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}
finally{
 report.finishedAt=new Date().toISOString();if(s){try{await bounded((async()=>{await writeFile(resolve(run,stem+'.log'),await s.page.evaluate(()=>shell.busybox.log),{flag:'wx'});})(),5000);}catch(e){report.logError=String(e);}try{await bounded(s.close(),30000);}catch(e){report.cleanupError=String(e);report.status='failed';}}
 await writeFile(resolve(run,stem+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});if(report.status!=='passed')process.exitCode=1;
}
