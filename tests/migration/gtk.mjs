// Installed GTK composition/GUI acceptance; only under a serial browser reservation.
import {session} from '../compatibility/session.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(new URL('../../../wasm-posix/package.json',import.meta.url));
const {PNG}=require('pngjs');
assert(process.env.MACHINE_JOB_ID,'machine-job browser reservation required');
const run=process.env.COMPAT_RUN_DIR,attempt=process.env.MIGRATION_ATTEMPT||'';
assert(!attempt||/^[a-zA-Z0-9_-]+$/.test(attempt));
const label='gtk-functional'+(attempt?'-'+attempt:'');
await assert.rejects(access(resolve(run,label+'.json')),{code:'ENOENT'});
const config=JSON.parse(await readFile(resolve(run,'config.json')));
const manifests=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
const input=manifests['gtk3-x11'].files.find(f=>f.path==='source.tar');
const archive=await readFile(resolve(config.inputDist||config.dist,'migration/gtk3-x11/source.tar'));
assert.equal(archive.length,input.size);
assert.equal(createHash('sha256').update(archive).digest('hex'),input.sha256);
const report={status:'running',inputCommit:config.inputCommit,source:input,harnessSha256:createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'),startedAt:new Date().toISOString()};
const s=await session();let pending;
try {
 report.runtime=s.runtime;
 await s.command('true');
 await s.page.evaluate(async encoded=>shell.busybox.write('/tmp/migration-gtk.tar',Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))),archive.toString('base64'));
 pending=s.command(`set -eu
mkdir -p /tmp/migration-gtk
cd /tmp/migration-gtk
tar -xf /tmp/migration-gtk.tar
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
export LD_LIBRARY_PATH=/usr/local/lib/gtk3-x11:/usr/local/lib
cc source/test/consumer.c $(pkg-config --cflags --libs gtk+-3.0) -o /tmp/gtk-x11-consumer
cc -I/usr/local/include source/test/x11-shared.c -L/usr/local/lib -lXtst -lXi -lXrender -lXfixes -lXext -lX11 -lxcb -lXau -o /tmp/x11-shared-consumer
export DISPLAY=:1
Xvfb :1 -screen 0 800x600x24 -fp built-ins -ac -noreset &
server=$!
trap 'kill "$server" 2>/dev/null; wait "$server" 2>/dev/null' EXIT
sleep 2
gtk3-x11-run /tmp/x11-shared-consumer
gtk3-x11-demo --test &
demo=$!
sleep 3
gtk3-x11-run /tmp/gtk-x11-consumer
wait "$demo"
kill "$server"
wait "$server"
trap - EXIT
test ! -e /tmp/.X1-lock
echo GTK-X11-PACKAGE-PASS`);
 pending.catch(()=>{});
 const marker=async text=>Promise.race([
  s.page.waitForFunction(t=>shell.busybox?.log.includes(t),text,{timeout:180000}),
  pending.then(()=>{throw Error('GTK ended before '+text);})
 ]);
 await marker('GTK-X11-READY');await marker('GTK-X11-CLIPBOARD-PASS');
 const canvas=s.page.locator('.screen:not([hidden]) canvas').last();
 async function point(name){
  const log=await s.page.evaluate(()=>shell.busybox.log);
  const m=log.match(new RegExp('GTK-X11-'+name+' (-?\\d+) (-?\\d+) (\\d+) (\\d+)'));
  assert.ok(m,log);return {x:+m[1]+ +m[3]/2,y:+m[2]+ +m[4]/2};
 }
 await canvas.click({position:await point('BUTTON')});
 await marker('GTK-X11-CLICK 1');await marker('GTK-X11-SIZE 640 480');
 await canvas.click({position:await point('ENTRY')});
 await s.page.keyboard.press('Control+a');await s.page.keyboard.type('hello 123/');
 await s.page.keyboard.press('Shift+KeyA');await s.page.keyboard.press('Shift+Minus');await s.page.keyboard.press('Shift+Digit1');
 await marker('GTK-X11-TEXT hello 123/A_!');
 const frame=await canvas.screenshot();await writeFile(resolve(run,label+'.png'),frame,{flag:'wx'});
 const png=PNG.sync.read(frame);let red=0,blue=0;
 for(let i=0;i<png.data.length;i+=4){const [r,g,b]=png.data.subarray(i,i+3);if(r>180&&g<100&&b<100)red++;if(b>100&&b>r*2&&b>g*1.5)blue++;}
 report.pixels={red,blue};assert.ok(red>500&&blue>500,JSON.stringify(report.pixels));
 await s.page.keyboard.press('Escape');const log=await pending;
 for(const token of ['X11-SHARED-SDK-PASS','GTK-X11-BLANK-CURSOR-PASS','GTK-X11-CLOSED','GTK-X11-PACKAGE-PASS'])assert.ok(log.includes(token),token);
 assert.doesNotMatch(log,/CRITICAL/);report.status='passed';
}catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally{
 report.finishedAt=new Date().toISOString();
 try{await writeFile(resolve(run,label+'.log'),await s.page.evaluate(()=>shell.busybox?.log||''),{flag:'wx'});}
 finally{await writeFile(resolve(run,label+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});await s.close();}
}
