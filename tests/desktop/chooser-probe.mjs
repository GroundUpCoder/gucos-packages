import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {session} from '../compatibility/session.mjs';
import {desktopSession} from './session.mjs';
import {observe} from './menu.mjs';
import {visibleCanvas,canvasPosition} from '../migration/canvas.mjs';
assert(process.env.MACHINE_JOB_ID);
const run=process.env.COMPAT_RUN_DIR;let s,d;
try{
 s=await session();await s.command('true');
 await s.page.evaluate(async source=>shell.busybox.write('/tmp/chooser-probe.c',new TextEncoder().encode(source)),await readFile(new URL('./chooser-probe.c',import.meta.url),'utf8'));
 await s.command('export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig; cc /tmp/chooser-probe.c $(pkgconf --cflags --libs gtk+-3.0) -L/usr/local/lib/gtk3-x11 -lintl -o /tmp/chooser-probe');
 d=await desktopSession(s);const canvas=await visibleCanvas(s.page);
 for(const mode of ['typed','preset']){
  await d.command(`gtk3-x11-run /tmp/chooser-probe ${mode==='preset'?'preset':''} > /tmp/chooser-${mode}.log 2>&1 &`);
  const w=await observe(d,'window','Chooser Probe');
  if(mode==='typed'){await s.page.keyboard.press('Control+l');await s.page.keyboard.type('/home/user/chooser-probe.txt');}
  await new Promise(r=>setTimeout(r,5000));
  await canvas.screenshot({path:resolve(run,`chooser-probe-${mode}-before.png`)});
  await canvas.click({position:await canvasPosition(canvas,{x:w.x+w.width-52,y:w.y+w.height-24})});
  await observe(d,'absent','Chooser Probe');
  await writeFile(resolve(run,`chooser-probe-${mode}.log`),await d.command(`cat /tmp/chooser-${mode}.log`),{flag:'wx'});
 }
 await d.finish();
}finally{if(s){await writeFile(resolve(run,'chooser-probe-session.log'),await s.page.evaluate(()=>shell.busybox.log));await s.close();}}
