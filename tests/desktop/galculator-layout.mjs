// Read-only layout discovery after real JWM launch. Not functional acceptance.
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
const run=process.env.COMPAT_RUN_DIR,stem='galculator-layout';
await assert.rejects(access(resolve(run,stem+'.json')),{code:'ENOENT'});
const report={status:'running',scope:'Layout discovery only: real menu launch, Basic/Scientific screenshots and clean quit. No numeric or persistence acceptance.',startedAt:new Date().toISOString()};
let s,d;
async function bounded(p,ms){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Layout operation deadline')),ms);})]);}finally{clearTimeout(timer);}}
try{
 s=await session();report.runtime=s.runtime;await s.command('true');
 const expected=JSON.parse(await readFile(resolve(run,'candidate-manifests.json'))).galculator;
 assert(expected.binary,'Requires reviewed fresh binary fixture');
 const installed=await s.page.evaluate(async()=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/galculator/current/manifest.json'))));
 assert.deepEqual(installed,expected);report.binary=expected.binary;
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/galculator.sha256',new TextEncoder().encode(text)),await readFile(resolve(run,'galculator.sha256'),'utf8'));
 await s.command('sha256sum -c /tmp/galculator.sha256');
 report.harnessSha256=sha(await readFile(new URL(import.meta.url)));
 report.observer=await installObserver(s);d=await desktopSession(s);report.helpers=d.helper;
 const canvas=await visibleCanvas(s.page);
 report.menu=await clickMenuEntry(d,'galculator.desktop');
 report.basic=await observe(d,'window','galculator');assert(report.basic.pid>0);
 await canvas.click({position:await canvasPosition(canvas,{x:report.basic.x+report.basic.width/2,y:report.basic.y-12})});
 await s.page.waitForTimeout(500);
 await writeFile(resolve(run,stem+'-basic.png'),await canvas.screenshot(),{flag:'wx'});
 // Source main_frame.ui: View mnemonic, Scientific is second mode item.
 await s.page.keyboard.press('Alt+v');await s.page.waitForTimeout(200);
 await writeFile(resolve(run,stem+'-view-menu.png'),await canvas.screenshot(),{flag:'wx'});
 await s.page.keyboard.press('Home');await s.page.keyboard.press('ArrowDown');await s.page.keyboard.press('Enter');
 await s.page.waitForTimeout(500);report.scientific=await observe(d,'window','galculator');
 await writeFile(resolve(run,stem+'-scientific.png'),await canvas.screenshot(),{flag:'wx'});
 await s.page.keyboard.press('Control+q');await observe(d,'absent','galculator');
 await d.command(`n=0; while kill -0 ${report.basic.pid} 2>/dev/null; do n=$((n+1)); [ "$n" -lt 100 ] || exit 1; sleep 0.1; done`);
 const config=await s.page.evaluate(async()=>Array.from(await shell.busybox.read('/home/user/.config/galculator/galculator.conf')||[]));
 report.config={bytes:config.length,sha256:sha(Buffer.from(config)),text:Buffer.from(config).toString()};
 await d.finish();await s.command('echo GALCULATOR-LAYOUT-TERMINAL-RESTORED');report.status='completed-layout-discovery';
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
