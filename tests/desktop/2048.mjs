// JWM integration gate for the already accepted terminal game. Numeric engine
// correctness remains bound to the retained terminal acceptance, not pixel hashes.
import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {session} from '../compatibility/session.mjs';
import {desktopSession} from './session.mjs';
import {observe,clickMenuEntry} from './menu.mjs';
import {visibleCanvas,canvasPosition} from '../migration/canvas.mjs';
const {PNG}=createRequire(new URL('../migration/package.json',import.meta.url))('pngjs');
const sha=b=>createHash('sha256').update(b).digest('hex');
async function bounded(p,ms){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Desktop test deadline')),ms);})]);}finally{clearTimeout(timer);}}
assert(process.env.MACHINE_JOB_ID);
const run=process.env.COMPAT_RUN_DIR,attempt=process.env.MIGRATION_ATTEMPT||'first';assert(/^[a-zA-Z0-9_-]+$/.test(attempt));const stem='2048-jwm-'+attempt;
await assert.rejects(access(resolve(run,stem+'.json')),{code:'ENOENT'});
const report={status:'running',startedAt:new Date().toISOString(),scope:'Owned JWM entry launches accepted 2048 in xterm; real movement/restart/quit and relaunch; screenshots require independent review'};let s,d;
try{
 s=await session();report.runtime=s.runtime;await s.command('true');
 const config=JSON.parse(await readFile(resolve(run,'config.json'))),candidates=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
 assert(candidates['desktop-apps'].binary);
 for(const name of ['desktop-apps','2048','jwm','desktop-entries','xterm']){
  const bytes=await s.page.evaluate(async name=>Array.from(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json')),name);
  const actual=JSON.parse(Buffer.from(bytes));
  if(candidates[name])assert.deepEqual(actual,candidates[name]);
  else{
   const ref=config.baselinePackages[name];const response=await fetch(ref.url);assert(response.ok);const pinned=Buffer.from(await response.arrayBuffer());assert.equal(sha(pinned),ref.sha256);assert.equal(pinned.length,ref.size);assert.deepEqual(actual,JSON.parse(pinned));
  }
  (report.manifests??={})[name]=actual;
 }
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/desktop-apps.sha256',new TextEncoder().encode(text)),await readFile(resolve(run,'desktop-apps.sha256'),'utf8'));
 await s.command('sha256sum -c /tmp/desktop-apps.sha256');
 report.harnessSha256=sha(await readFile(new URL(import.meta.url)));d=await desktopSession(s);report.helpers=d.helper;
 const canvas=await visibleCanvas(s.page);const entry='gucos-desktop-2048.desktop';report.menu=await clickMenuEntry(d,entry);
 let w=await observe(d,'window','2048');assert(w.pid>0);report.firstWindow=w;
 await canvas.click({position:await canvasPosition(canvas,{x:w.x+w.width/2,y:w.y+w.height/2})});
 async function frame(label){
  await s.page.waitForTimeout(500);const b=await canvas.screenshot();await writeFile(resolve(run,stem+'-'+label+'.png'),b,{flag:'wx'});
  const png=PNG.sync.read(b),box=await canvas.boundingBox(),a=await canvasPosition(canvas,{x:w.x+4,y:w.y+4}),z=await canvasPosition(canvas,{x:w.x+w.width-4,y:w.y+w.height-40});
  const x=Math.round(a.x*png.width/box.width),y=Math.round(a.y*png.height/box.height),right=Math.round(z.x*png.width/box.width),bottom=Math.round(z.y*png.height/box.height);
  assert(x>=0&&y>=0&&right<=png.width&&bottom<=png.height&&right>x&&bottom>y);const rows=[];for(let r=y;r<bottom;r++)rows.push(png.data.subarray((r*png.width+x)*4,(r*png.width+right)*4));return sha(Buffer.concat(rows));
 }
 const initial=await frame('initial');assert.equal(await frame('idle'),initial,'Idle board must be stable before input comparison');
 for(const key of ['a','d','w','s']){await s.page.keyboard.type(key);await s.page.waitForTimeout(200);}
 const moved=await frame('moved');assert.notEqual(moved,initial,'Real keys must alter stable board pixels');
 await s.page.keyboard.type('r');await frame('restart-prompt');await s.page.keyboard.type('y');await frame('restarted');
 async function quit(){await s.page.keyboard.type('q');await frame('quit-prompt-'+w.pid);await s.page.keyboard.type('y');await observe(d,'absent','2048');await d.command(`n=0; while kill -0 ${w.pid} 2>/dev/null; do n=$((n+1)); [ "$n" -lt 100 ] || exit 1; sleep 0.1; done`);}
 await quit();report.relaunchMenu=await clickMenuEntry(d,entry);w=await observe(d,'window','2048');assert(w.pid>0);assert.notEqual(w.pid,report.firstWindow.pid);await frame('relaunched');await quit();await d.finish();
 await s.command('echo JWM-2048-TERMINAL-RESTORED');report.boardHashes={initial,moved};report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}
finally{
 report.finishedAt=new Date().toISOString();if(s){try{await bounded((async()=>{await writeFile(resolve(run,stem+'.log'),await s.page.evaluate(()=>shell.busybox.log),{flag:'wx'});})(),5000);}catch(e){report.logError=String(e);}try{await bounded(s.close(),30000);}catch(e){report.cleanupError=String(e);report.status='failed';}}
 await writeFile(resolve(run,stem+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});if(report.status!=='passed')process.exitCode=1;
}
