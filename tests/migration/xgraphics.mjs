// Installed bitmap/xmag GUI acceptance adapted from retained upstream port tests.
import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {session} from '../compatibility/session.mjs';
import {visibleCanvas,canvasPosition,canvasHelperSha256} from './canvas.mjs';
assert(process.env.MACHINE_JOB_ID);
const run=process.env.COMPAT_RUN_DIR,name=process.argv[2];assert(['bitmap','xmag'].includes(name));
await assert.rejects(access(resolve(run,name+'-functional.json')),{code:'ENOENT'});
const report={status:'running',startedAt:new Date().toISOString(),name,canvasHelperSha256};
let s,pending;
try {
 s=await session();report.runtime=s.runtime;await s.command('true');
 const expected=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')))[name];
 const installed=await s.page.evaluate(async name=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'))),name);
 assert.deepEqual(installed,expected);
 const sums=await readFile(resolve(run,name+'.sha256'),'utf8');
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/xgraphics.sha256',new TextEncoder().encode(text)),sums);
 await s.command('sha256sum -c /tmp/xgraphics.sha256');
 const helper=await readFile(new URL(name+'-control.c',import.meta.url));
 report.helperSha256=createHash('sha256').update(helper).digest('hex');
 report.harnessSha256=createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/xgraphics.c',new TextEncoder().encode(text)),helper.toString());
 const bitmap=name==='bitmap';
 const setup=bitmap?`printf '........\n........\n........\n........\n........\n........\n........\n........\n' > /tmp/original.txt
atobm -chars '.#' -name sample /tmp/original.txt > /tmp/sample.xbm
bmtoa -chars '.#' /tmp/sample.xbm > /tmp/roundtrip.txt
cmp /tmp/original.txt /tmp/roundtrip.txt
bitmap -fn fixed -geometry 550x450+30+30 /tmp/sample.xbm &
app=$!
/tmp/xgraphics > /tmp/bitmap-coordinates`:`/tmp/xgraphics paint
xmag -source 40x40+0+0 -mag 6 -geometry +100+100 &
app=$!
/tmp/xgraphics`;
 const finish=bitmap?`while [ ! -f /tmp/bitmap-done ]; do sleep 1; done
bmtoa -chars '.#' /tmp/sample.xbm > /tmp/edited.txt
printf '########\n########\n########\n########\n########\n########\n########\n########\n' > /tmp/expected.txt
cmp /tmp/expected.txt /tmp/edited.txt`:'';
 pending=s.command(`set -eu
cc /tmp/xgraphics.c -I/usr/local/include -L/usr/local/lib -lX11 -lxcb -lXau -o /tmp/xgraphics
rm -f /tmp/bitmap-done /tmp/.X1-lock /tmp/.X11-unix/X1
export DISPLAY=:1
Xvfb :1 -screen 0 800x600x24 -fp built-ins -noreset -ac &
server=$!
trap 'kill "$server" 2>/dev/null; wait "$server" 2>/dev/null || true' EXIT
sleep 2
${setup}
echo XGRAPHICS-READY
${finish}
wait "$app"
echo XGRAPHICS-PASS`);pending.catch(()=>{});
 await Promise.race([s.page.waitForFunction(()=>shell.busybox?.log.includes('XGRAPHICS-READY')),pending.then(()=>{throw Error('GUI exited before interaction');})]);
 const canvas=await visibleCanvas(s.page);
 if(bitmap){
  const coords=await s.page.evaluate(async()=>new TextDecoder().decode(await shell.busybox.read('/tmp/bitmap-coordinates')));
  const [x,y]=coords.trim().split(/\s+/).map(Number);const pos=await canvasPosition(canvas,{x,y}),box=await canvas.boundingBox();
  await s.page.mouse.move(box.x+pos.x,box.y+pos.y);await s.page.keyboard.press('i');await s.page.keyboard.press('Control+s');
  await s.page.waitForFunction(async()=>new TextDecoder().decode(await shell.busybox.read('/tmp/sample.xbm')).includes('0xff'));
 }else await canvas.click({position:await canvasPosition(canvas,{x:220,y:220})});
 await canvas.screenshot({path:resolve(run,name+'-gui.png')});
 await s.page.keyboard.press('q');
 if(bitmap)await s.page.evaluate(()=>shell.busybox.write('/tmp/bitmap-done',new TextEncoder().encode('yes')));
 await pending;pending=undefined;
 await s.page.waitForFunction(()=>[...shell.busybox.windows.values()].filter(v=>v.shown).length===0);
 await s.command('echo XGRAPHICS-TERMINAL-RECOVERED');report.status='passed';
}catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally{
 report.finishedAt=new Date().toISOString();
 if(s){await writeFile(resolve(run,name+'-functional.log'),await s.page.evaluate(()=>shell.busybox?.log||'').catch(()=>''),{flag:'wx'});await s.close();}
 await writeFile(resolve(run,name+'-functional.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}
