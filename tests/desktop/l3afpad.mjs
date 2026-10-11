// Physical menu/editor acceptance; exact disk bytes prove save/open/undo behavior.
import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {session} from '../compatibility/session.mjs';
import {poll} from './poll.mjs';
import {desktopSession} from './session.mjs';
import {observe,clickMenuEntry} from './menu.mjs';
import {visibleCanvas,canvasPosition} from '../migration/canvas.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const run=process.env.COMPAT_RUN_DIR,attempt=process.env.MIGRATION_ATTEMPT||'first',reload=process.argv.includes('--reload');
assert(process.env.MACHINE_JOB_ID);assert(/^[a-zA-Z0-9_-]+$/.test(attempt));
const stem='l3afpad-jwm-'+attempt+(reload?'-reload':'');
await assert.rejects(access(resolve(run,stem+'.json')),{code:'ENOENT'});
const path='/home/user/jwm-l3afpad.txt';
const report={status:'running',startedAt:new Date().toISOString(),scope:'Owned JWM menu, text input, exact save, undo/redo, quit/reopen, browser persistence'};
async function bounded(p,ms){let t;try{return await Promise.race([p,new Promise((_,reject)=>{t=setTimeout(()=>reject(Error('Editor finalization timeout')),ms);})]);}finally{clearTimeout(t);}}
let s,d;
try{
 s=await session();report.runtime=s.runtime;await s.command('true');
 const expected=JSON.parse(await readFile(resolve(run,'candidate-manifests.json'))).l3afpad;assert(expected.binary);
 assert.deepEqual(await s.page.evaluate(async()=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/l3afpad/current/manifest.json')))),expected);
 report.binary=expected.binary;report.harnessSha256=sha(await readFile(new URL(import.meta.url)));
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/l3afpad.sha256',new TextEncoder().encode(text)),await readFile(resolve(run,'l3afpad.sha256'),'utf8'));await s.command('sha256sum -c /tmp/l3afpad.sha256');
 d=await desktopSession(s);report.helpers=d.helper;const canvas=await visibleCanvas(s.page);let w;
 const snap=async label=>writeFile(resolve(run,stem+'-'+label+'.png'),await canvas.screenshot(),{flag:'wx'});
 async function launch(){
  (report.menus??=[]).push(await clickMenuEntry(d,'l3afpad.desktop'));w=await observe(d,'window','L3afpad');assert(w.pid>0);(report.pids??=[]).push(w.pid);
  await canvas.click({position:await canvasPosition(canvas,{x:w.x+w.width/2,y:w.y+w.height/2})});
 }
 async function quit(){
  await s.page.keyboard.press('Control+q');await observe(d,'absent','L3afpad');
  await d.command(`n=0; while kill -0 ${w.pid} 2>/dev/null; do n=$((n+1)); [ "$n" -lt 100 ] || exit 1; sleep 0.1; done`);
 }
 async function chooser(save){
  await s.page.keyboard.press(save?'Control+Shift+s':'Control+o');const dialog=await observe(d,'window',save?'Save As':'Open');
  await s.page.keyboard.press('Control+l');await s.page.keyboard.type(path);assert(dialog.width>=400&&dialog.height>=250);await canvas.click({position:await canvasPosition(canvas,{x:dialog.x+dialog.width-52,y:dialog.y+dialog.height-24})});await observe(d,'absent',save?'Save As':'Open');
 }
 async function disk(text){await poll(s.page,async({path,text})=>{const actual=await shell.busybox.read(path),expected=new TextEncoder().encode(text);return actual?.length===expected.length&&expected.every((b,i)=>actual[i]===b);},{path,text},15000);}
 async function save(text){await s.page.keyboard.press('Control+s');await disk(text);}
 await launch();await snap('launched');
 let text;
 if(reload){
  const previous=JSON.parse(await readFile(resolve(run,'l3afpad-jwm-'+attempt+'.json')));assert.equal(previous.status,'passed');assert.deepEqual(previous.binary,expected.binary);assert.equal(previous.runtime,s.runtime);text=previous.saved;await disk(text);await chooser(false);
 }else{
  text='hello JWM editor\n';await s.page.keyboard.type('hello JWM editor');await s.page.keyboard.press('Enter');await chooser(true);await disk(text);
 }
 await s.page.keyboard.press('Control+End');await s.page.keyboard.type('Z');await save(text+'Z');
 await s.page.keyboard.press('Control+z');await save(text);await snap('undo-saved');
 await s.page.keyboard.press('Control+Shift+z');await save(text+'Z');await snap('redo-saved');text+='Z';
 await quit();const first=w.pid;await launch();assert.notEqual(w.pid,first);await chooser(false);await s.page.keyboard.press('Control+End');await s.page.keyboard.type(' reopened');text+=' reopened';await save(text);await snap('reopened-saved');report.saved=text;
 await quit();await d.finish();await s.command('echo L3AFPAD-JWM-TERMINAL-RESTORED');report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}
finally{
 report.finishedAt=new Date().toISOString();if(s){try{await bounded((async()=>{await writeFile(resolve(run,stem+'.log'),await s.page.evaluate(()=>shell.busybox.log),{flag:'wx'});})(),5000);}catch(e){report.logError=String(e);}try{await bounded(s.close(),30000);}catch(e){report.cleanupError=String(e);report.status='failed';}}
 await writeFile(resolve(run,stem+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});if(report.status!=='passed')process.exitCode=1;
}
