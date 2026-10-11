// Retained Doom/Quake rendering and keyboard workload in direct SDL VTs.
import {session} from '../compatibility/session.mjs';
import {visibleCanvas,canvasPosition,canvasHelperSha256} from './canvas.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
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
try {
 s=await session();report.runtime=s.runtime;await s.command('true');
 const expected=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')))[name];
 const installed=await s.page.evaluate(async n=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+n+'/current/manifest.json'))),name);
 assert.deepEqual(installed,expected);
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/game.sha256',new TextEncoder().encode(text)),await readFile(resolve(run,name+'.sha256'),'utf8'));
 await s.command('sha256sum -c /tmp/game.sha256');
 report.harnessSha256=createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
 await s.command(name+(name==='quake'?' -nosound +map e1m1':'')+' > /tmp/'+name+'.log 2>&1 &\necho $! > /tmp/game.pid');
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
 async function quakeState(){
  await s.page.keyboard.press('Backquote');
  await s.page.keyboard.type('status; edict 1',{delay:40});
  await s.page.keyboard.press('Enter');await s.page.waitForTimeout(400);
  const log=await s.page.evaluate(async()=>new TextDecoder().decode(await shell.busybox.read('/tmp/quake.log')));
  assert.match(log,/map:\s+e1m1/,'Expected live shareware level');
  const block=log.slice(log.lastIndexOf('EDICT 1:'));
  const origin=block.match(/^origin\s+([^\n]+)/m),ammo=block.match(/^ammo_shells\s+([\d.]+)/m);
  assert(origin&&ammo,'Engine reports player origin and shotgun ammunition');
  await s.page.keyboard.press('Backquote');await s.page.waitForTimeout(300);
  return {origin:origin[1].trim(),ammo:Number(ammo[1])};
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
 await s.command('echo GAME-TERMINAL-RECOVERED');report.status='passed';
} catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally{report.finishedAt=new Date().toISOString();if(s){await writeFile(resolve(run,stem+'-stdout.log'),await s.page.evaluate(async n=>new TextDecoder().decode(await shell.busybox.read('/tmp/'+n+'.log')),name).catch(()=>''),{flag:'wx'});await writeFile(resolve(run,stem+'-functional.log'),await s.page.evaluate(()=>shell.busybox?.log||'').catch(()=>''),{flag:'wx'});await s.close();}await writeFile(resolve(run,stem+'-functional.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
