// First layout-discovery pass through real JWM/menu/chooser input.
// No archive creation, format selection, extraction or functional acceptance.
import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {session} from '../compatibility/session.mjs';
import {desktopSession} from './session.mjs';
import {installObserver,observe,clickMenuEntry} from './menu-xapps.mjs';
import {visibleCanvas,canvasPosition} from '../migration/canvas.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
assert(process.env.MACHINE_JOB_ID,'machine-job required');
const run=process.env.COMPAT_RUN_DIR,stem='xarchiver-layout';
await assert.rejects(access(resolve(run,stem+'.json')),{code:'ENOENT'});
const report={status:'running',scope:'Layout discovery only: real menu launch, main/menu/chooser screenshots and clean quit. No compression, extraction or persistence acceptance.',startedAt:new Date().toISOString()};
let s,d;
async function bounded(p,ms){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Layout operation deadline')),ms);})]);}finally{clearTimeout(timer);}}
try{
 s=await session();report.runtime=s.runtime;await s.command('true');
 const expected=JSON.parse(await readFile(resolve(run,'candidate-manifests.json'))).xarchiver;
 assert(expected.binary,'Requires reviewed fresh binary fixture');
 const installed=await s.page.evaluate(async()=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/xarchiver/current/manifest.json'))));
 assert.deepEqual(installed,expected);report.binary=expected.binary;
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/xarchiver.sha256',new TextEncoder().encode(text)),await readFile(resolve(run,'xarchiver.sha256'),'utf8'));
 await s.command('sha256sum -c /tmp/xarchiver.sha256');
 report.harnessSha256=sha(await readFile(new URL(import.meta.url)));
 report.observer=await installObserver(s);d=await desktopSession(s);report.helpers=d.helper;
 const canvas=await visibleCanvas(s.page);
 report.menu=await clickMenuEntry(d,'xarchiver.desktop');
 const title='xarchiver 0.5.4.22';
 report.main=await observe(d,'window',title);assert(report.main.pid>0);
 await canvas.click({position:await canvasPosition(canvas,{x:report.main.x+report.main.width/2,y:report.main.y-12})});
 async function capture(label){
  await s.page.waitForTimeout(500);
  await writeFile(resolve(run,stem+'-'+label+'.png'),await canvas.screenshot(),{flag:'wx'});
 }
 async function stableWindow(title){
  let previous,stable=0;
  for(let i=0;i<12;i++){
   const value=await observe(d,'window',title),key=JSON.stringify(value);
   stable=key===previous?stable+1:0;previous=key;
   if(stable>=2)return value;
   await s.page.waitForTimeout(250);
  }
  throw Error('Dialog geometry did not settle: '+title);
 }
 await capture('main');
 for(const [key,label] of [['Alt+a','archive-menu'],['Alt+c','action-menu']]){
  await s.page.keyboard.press(key);await capture(label);await s.page.keyboard.press('Escape');
 }
 // First discovery pass stops before selecting unknown GTK control geometry.
 for(const [key,title,label] of [['Control+n','Create a new archive','new'],['Control+o','Open an archive','open']]){
  await s.page.keyboard.press(key);report[label]=await stableWindow(title);
  await capture(label);await s.page.keyboard.press('Escape');await observe(d,'absent',title);
 }
 await s.page.keyboard.press('Control+q');await observe(d,'absent',title);
 await d.command(`n=0; while kill -0 ${report.main.pid} 2>/dev/null; do n=$((n+1)); [ "$n" -lt 100 ] || exit 1; sleep 0.1; done`);
 const config=await s.page.evaluate(async()=>Array.from(await shell.busybox.read('/home/user/.config/xarchiver/xarchiverrc')||[]));
 report.config={bytes:config.length,sha256:sha(Buffer.from(config)),text:Buffer.from(config).toString()};
 await d.finish();await s.command('echo XARCHIVER-LAYOUT-TERMINAL-RESTORED');report.status='completed-layout-discovery';
}catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}
finally{
 report.finishedAt=new Date().toISOString();
 if(s){
  try{await bounded((async()=>{await writeFile(resolve(run,stem+'.log'),await s.page.evaluate(()=>shell.busybox.log),{flag:'wx'});})(),5000);}catch(e){report.logError=String(e);}
  try{await bounded(s.close(),30000);}catch(e){report.cleanupError=String(e);report.status='failed';}
 }
 await writeFile(resolve(run,stem+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 if(report.status==='failed')process.exitCode=1;
}
