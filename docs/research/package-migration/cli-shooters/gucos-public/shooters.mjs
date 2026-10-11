// Retained Doom/Quake rendering and keyboard workload in direct SDL VTs.
import {session} from '../compatibility/session.mjs';
import {visibleCanvas,canvasPosition,canvasHelperSha256} from './canvas.mjs';
import {readFile,writeFile,access,realpath} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(new URL('./package.json',import.meta.url));
const {PNG}=require('pngjs');
assert(process.env.MACHINE_JOB_ID);
const run=process.env.COMPAT_RUN_DIR,name=process.argv[2];assert(['doom','quake'].includes(name));
const attempt=process.env.MIGRATION_ATTEMPT||'';assert(!attempt||/^[a-zA-Z0-9_-]+$/.test(attempt));
const stem=name+(attempt?'-'+attempt:'');
await assert.rejects(access(resolve(run,stem+'-functional.json')),{code:'ENOENT'});
const report={status:'running',name,attempt,canvasHelperSha256,startedAt:new Date().toISOString(),scope:'Retained shareware rendering, new-game/level keyboard workload and process cleanup; no sound or multiplayer acceptance'};
let s;
const sha=b=>createHash('sha256').update(b).digest('hex');
const quote=t=>"'"+t.replaceAll("'","'\\''")+"'";
async function bounded(promise,ms,label){
 let timer;
 try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label)),ms);})]);}
 finally{clearTimeout(timer);}
}
let debugPath,debugLast=null,debugSamples=0;
async function readDebug(label){
 return bounded((async()=>{
  await s.command('set -eu\ntest -f '+quote(debugPath)+'\ntest ! -L '+quote(debugPath)+'\nn=$(stat -c %s '+quote(debugPath)+')\ntest "$n" -gt 0\ntest "$n" -le 1048576');
  const bytes=await s.page.evaluate(async path=>{
   const b=await shell.busybox.read(path);
   if(!(b instanceof Uint8Array)||!b.length||b.length>1048576)throw Error('Invalid debug log bytes');
   return Array.from(b);
  },debugPath);
  const b=Buffer.from(bytes);
  assert(b.length>0&&b.length<=1048576,'Debug log byte bound');
  const text=new TextDecoder('utf-8',{fatal:true}).decode(b);
  if(text!==debugLast){
   assert(debugSamples<128,'Debug snapshot count bound');
   const file=stem+'-debug-sample-'+String(++debugSamples).padStart(3,'0')+'.log';
   await writeFile(resolve(run,file),b,{flag:'wx'});
   (report.debugSamples??=[]).push({file,label,size:b.length,sha256:sha(b)});
  }
  if(debugLast!==null)assert(text.startsWith(debugLast),'Debug log truncated or replaced');
  debugLast=text;return text;
 })(),5000,'Quake debug log read timeout: '+label);
}
try {
 s=await session();report.runtime=s.runtime;await s.command('true');
 if(name==='quake'){
  assert(attempt,'Quake requires an explicit unique MIGRATION_ATTEMPT');
  const phase=process.env.QUAKE_QUERY_PHASE;
  assert(['normal','reloaded'].includes(phase),'Explicit QUAKE_QUERY_PHASE required');
  report.queryPhase=phase;
  report.queryBinding={runtime:s.runtime,profile:await realpath(resolve(run,'profile')),
   configSha256:sha(await readFile(resolve(run,'config.json'))),
   candidatesSha256:sha(await readFile(resolve(run,'candidate-manifests.json'))),
   checksumsSha256:sha(await readFile(resolve(run,'quake.sha256'))),
   harnessSha256:sha(await readFile(new URL(import.meta.url)))};
  // Read HOME from the same initialized guest shell used by the owned wrapper.
  const homeLog=await bounded(s.command('printf "\\nQUAKE-HOME:%s\\n" "$HOME"'),5000,'Read wrapper HOME');
  const homes=homeLog.split(/\r?\n/).filter(x=>x.startsWith('QUAKE-HOME:'));
  assert.equal(homes.length,1);const home=homes[0].slice('QUAKE-HOME:'.length);
  assert(/^\/(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/.test(home)&&!home.split('/').includes('..'),'Safe absolute HOME');
  debugPath=home+'/.local/share/quake/id1/qconsole.log';report.debugPath=debugPath;
  if(phase==='normal'){
   assert(!process.env.QUAKE_PREVIOUS_ATTEMPT,'Normal must not name prior run');
   await bounded(s.command('test ! -e '+quote(debugPath)+' && test ! -L '+quote(debugPath)),5000,'Fresh prelaunch log absence');
   report.prelaunchDebugAbsent=true;
  }else{
   const previous=process.env.QUAKE_PREVIOUS_ATTEMPT;
   assert(previous&&/^[a-zA-Z0-9_-]+$/.test(previous)&&previous!==attempt,'Distinct completed normal attempt required');
   const priorReport=JSON.parse(await readFile(resolve(run,'quake-'+previous+'-functional.json')));
   assert.equal(priorReport.status,'passed');assert.equal(priorReport.queryPhase,'normal');
   assert.deepEqual(priorReport.queryBinding,report.queryBinding);
   assert.equal(priorReport.debugPath,debugPath);
   const prior=await readFile(resolve(run,'quake-'+previous+'-debug-final.log'));
   assert.equal(sha(prior),priorReport.debugFinal.sha256);assert.equal(prior.length,priorReport.debugFinal.size);
   const retained=await readDebug('pre-reload-retained');
   assert(Buffer.from(retained).equals(prior),'Exact normal log retained before reload');
   await writeFile(resolve(run,stem+'-debug-prior.log'),prior,{flag:'wx'});
   report.priorDebug={attempt:previous,sha256:sha(prior),size:prior.length};
   await bounded(s.page.reload(),120000,'Actual browser reload');
   await bounded(s.page.waitForFunction(()=>window.shell?.ready),120000,'Reload shell ready');
   assert.equal(await s.page.evaluate(()=>shell.toolchain.systemBuild),s.runtime);
   await s.command('true');
   await bounded(s.command('test "$HOME" = '+quote(home)),5000,'Reload HOME unchanged');
   // Establish byte identity across reload before the engine is allowed to unlink.
   assert.equal(await readDebug('post-reload-prelaunch'),retained);
   report.retainedLogVerifiedAcrossReload=true;
   debugLast=null; // One explicit epoch boundary: subsequent engine Con_Init reset.
  }
 }
 const expected=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')))[name];
 const installed=await s.page.evaluate(async n=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+n+'/current/manifest.json'))),name);
 assert.deepEqual(installed,expected);
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/game.sha256',new TextEncoder().encode(text)),await readFile(resolve(run,name+'.sha256'),'utf8'));
 await s.command('sha256sum -c /tmp/game.sha256');
 report.harnessSha256=createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
 await s.command(name+(name==='quake'?' -nosound -condebug +map e1m1':'')+' > /tmp/'+name+'.log 2>&1 &\necho $! > /tmp/game.pid');
 const canvas=await visibleCanvas(s.page);
 let frame,colors;
 const end=Date.now()+60000;
 while(Date.now()<end){
  frame=await canvas.screenshot();const png=PNG.sync.read(frame);colors=new Set();
  for(let i=0;i<png.data.length;i+=4)colors.add((png.data[i]<<16)|(png.data[i+1]<<8)|png.data[i+2]);
  if(colors.size>50)break;
  await s.page.waitForTimeout(250);
 }
 assert(colors.size>50,'Nontrivial retained game rendering');report.colors=colors.size;
 await writeFile(resolve(run,stem+'-frame.png'),frame,{flag:'wx'});
 await canvas.click();
 if(name==='doom'){
  for(let i=0;i<4;i++){await s.page.keyboard.press('Enter',{delay:100});await s.page.waitForTimeout(500);}
  await s.page.waitForTimeout(1500);
 }else await s.page.waitForTimeout(4000);
 if(name==='quake'){
  const initialized=await readDebug('post-launch-initialization');
  assert(initialized.startsWith('Console initialized.\n'),'Engine initialization reset prefix');
  assert.equal(initialized.split('Console initialized.\n').length-1,1,'Exactly one engine initialization');
  assert(!initialized.includes('quakestate')&&!initialized.includes(']status; edict 1; echo '),'No prior query epoch survives initialization');
  if(report.priorDebug)assert.notEqual(sha(Buffer.from(initialized)),report.priorDebug.sha256,'Engine replaced retained debug log');
  report.engineLogResetVerified=true;
 }
 let quakeQuery = 0;
 async function quakeState(){
  const serial=++quakeQuery,marker=`quakestate${serial}done`;
  const command=`status; edict 1; echo ${marker}`;
  async function boundedQuery(promise,ms,label){
   let timer;
   try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label)),ms);})]);}
   finally{clearTimeout(timer);}
  }
  const readLog=()=>readDebug('query-'+serial);
  const prior=await readLog();let fresh='';
  try{
   await s.page.keyboard.press('Backquote');
   // Console toggle is queued after key-event draining; allow a subsequent frame.
   await s.page.waitForTimeout(500);
   await s.page.keyboard.type(command,{delay:60});await s.page.keyboard.press('Enter');
   // Poll deadline plus at most one bounded read; the outer job bounds all input.
   const deadline=Date.now()+15000;
   while(Date.now()<deadline){
    const log=await readLog();assert(log.startsWith(prior),'Quake log truncated or replaced');fresh=log.slice(prior.length);
    if(fresh.split(/\r?\n/).includes(marker+' '))break;
    await s.page.waitForTimeout(150);
   }
   await writeFile(resolve(run,stem+`-query-${serial}.log`),fresh,{flag:'wx'});
   assert(fresh.split(/\r?\n/).includes(']'+command),'Complete fresh console command echo required');
   assert(fresh.split(/\r?\n/).includes(marker+' '),'Fresh query completion marker required');
   assert.match(fresh,/map:\s+e1m1/,'Expected live shareware level in fresh query');
   assert(!/Unknown command/.test(fresh),'Unknown console command');
   const block=fresh.slice(fresh.lastIndexOf('EDICT 1:'));
   const origin=block.match(/^origin\s+([^\n]+)/m),ammo=block.match(/^ammo_shells\s+([\d.]+)/m);
   assert(origin&&ammo,'Fresh engine player origin and shotgun ammunition');
   (report.quakeQueries??=[]).push({serial,command,marker,logOffset:prior.length,origin:origin[1].trim(),ammo:Number(ammo[1])});
   await s.page.keyboard.press('Backquote');await s.page.waitForTimeout(500);
   return {origin:origin[1].trim(),ammo:Number(ammo[1])};
  }catch(error){
   report.failedQuakeQuery={serial,command,marker,logOffset:prior.length,suffix:fresh};
   await writeFile(resolve(run,stem+`-query-${serial}-failure.png`),await boundedQuery(canvas.screenshot(),5000,'Quake failure screenshot timeout'),{flag:'wx'});
   throw error;
  }
 }
 async function doomAmmo(){
  // Classic Doom's current-ammo digits occupy x2..44,y171..187 in320x200.
  // Crop only those digits, excluding animated face/world and enemy damage.
  const dims=await canvas.evaluate(e=>({w:Number(e.dataset.logicalWidth)||e.width,h:Number(e.dataset.logicalHeight)||e.height}));
  const a=await canvasPosition(canvas,{x:2/320*dims.w,y:171/200*dims.h});
  const b=await canvasPosition(canvas,{x:44/320*dims.w,y:187/200*dims.h});
  const png=PNG.sync.read(await canvas.screenshot());const box=await canvas.boundingBox();
  const x=Math.round(a.x*png.width/box.width),y=Math.round(a.y*png.height/box.height);
  const w=Math.max(1,Math.round((b.x-a.x)*png.width/box.width)),h=Math.max(1,Math.round((b.y-a.y)*png.height/box.height));
  const out=new PNG({width:w,height:h});PNG.bitblt(png,out,x,y,w,h,0,0);return out;
 }
 const beforeState=name==='quake'?await quakeState():null;
 const level=await canvas.screenshot();await writeFile(resolve(run,stem+'-level.png'),level,{flag:'wx'});
 if(name==='doom')assert(!PNG.sync.read(level).data.equals(PNG.sync.read(frame).data),'New-game frame differs from title');
 const move=name==='doom'?'ArrowUp':'w',fire=name==='doom'?'Control':'/';
 await s.page.keyboard.down(move);await s.page.waitForTimeout(1000);await s.page.keyboard.up(move);
 const movedState=name==='quake'?await quakeState():null;
 if(name==='quake')assert.notEqual(movedState.origin,beforeState.origin,'Physical movement key changes engine player coordinates');
 const ammoBefore=name==='doom'?await doomAmmo():null;
 if(name==='doom'){
  await s.page.waitForTimeout(600);const idle=await doomAmmo();
  assert(ammoBefore.data.equals(idle.data),'Ammo digits stay stable without fire input');
  await writeFile(resolve(run,stem+'-ammo-before.png'),PNG.sync.write(ammoBefore),{flag:'wx'});
 }
 await s.page.keyboard.down(fire);await s.page.waitForTimeout(500);await s.page.keyboard.up(fire);
 if(name==='quake'){
  const fired=await quakeState();assert(fired.ammo<movedState.ammo,'Physical fire key consumes shotgun ammunition');
  report.inputEvidence={before:beforeState,moved:movedState,fired};
 }else{
  const ammoAfter=await doomAmmo();assert(!ammoBefore.data.equals(ammoAfter.data),'Physical fire key changes otherwise stable ammo digits');
  await writeFile(resolve(run,stem+'-ammo-after.png'),PNG.sync.write(ammoAfter),{flag:'wx'});
  report.inputEvidence={ammoStableWithoutInput:true,ammoChangedAfterFire:true};
 }
 const played=await canvas.screenshot();await writeFile(resolve(run,stem+'-played.png'),played,{flag:'wx'});
 assert(!PNG.sync.read(played).data.equals(PNG.sync.read(level).data),'Rendered frame changes during movement/fire workload');
 await s.page.keyboard.press('Escape');await s.page.waitForTimeout(250);
 await writeFile(resolve(run,stem+'-menu.png'),await canvas.screenshot(),{flag:'wx'});
 await s.page.locator('#terminal-focus').click();await s.command('kill -TERM "$(cat /tmp/game.pid)"');
 await s.page.waitForFunction(()=>[...shell.busybox.windows.values()].filter(v=>v.shown).length===0);
 await s.command('echo GAME-TERMINAL-RECOVERED');
 if(name==='quake'){
  const final=Buffer.from(await readDebug('after-exit'));
  await writeFile(resolve(run,stem+'-debug-final.log'),final,{flag:'wx'});
  report.debugFinal={size:final.length,sha256:sha(final)};
 }
 report.status='passed';
} catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally{report.finishedAt=new Date().toISOString();if(s){await writeFile(resolve(run,stem+'-stdout.log'),await s.page.evaluate(async n=>new TextDecoder().decode(await shell.busybox.read('/tmp/'+n+'.log')),name).catch(()=>''),{flag:'wx'});await writeFile(resolve(run,stem+'-functional.log'),await s.page.evaluate(()=>shell.busybox?.log||'').catch(()=>''),{flag:'wx'});await s.close();}await writeFile(resolve(run,stem+'-functional.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
