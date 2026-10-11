// Retained Doom/Quake rendering and keyboard workload in direct SDL VTs.
import {session} from '../compatibility/session.mjs';
import {visibleCanvas,canvasHelperSha256} from './canvas.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(new URL('./package.json',import.meta.url));
const {PNG}=require('pngjs');
assert(process.env.MACHINE_JOB_ID);
const run=process.env.COMPAT_RUN_DIR,name=process.argv[2];assert(['doom','quake'].includes(name));
await assert.rejects(access(resolve(run,name+'-functional.json')),{code:'ENOENT'});
const report={status:'running',name,canvasHelperSha256,startedAt:new Date().toISOString(),scope:'Retained shareware rendering, new-game/level keyboard workload and process cleanup; no sound or multiplayer acceptance'};
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
 await writeFile(resolve(run,name+'-frame.png'),frame,{flag:'wx'});
 await canvas.click();
 if(name==='doom'){
  for(let i=0;i<4;i++){await s.page.keyboard.press('Enter',{delay:100});await s.page.waitForTimeout(500);}
  await s.page.waitForTimeout(1500);
 }else await s.page.waitForTimeout(4000);
 const level=await canvas.screenshot();await writeFile(resolve(run,name+'-level.png'),level,{flag:'wx'});
 if(name==='doom')assert(!PNG.sync.read(level).data.equals(PNG.sync.read(frame).data),'New-game frame differs from title');
 const move=name==='doom'?'ArrowUp':'w',fire=name==='doom'?'Control':'/';
 await s.page.keyboard.down(move);await s.page.waitForTimeout(1000);await s.page.keyboard.up(move);
 await s.page.keyboard.down(fire);await s.page.waitForTimeout(500);await s.page.keyboard.up(fire);
 const played=await canvas.screenshot();await writeFile(resolve(run,name+'-played.png'),played,{flag:'wx'});
 assert(!PNG.sync.read(played).data.equals(PNG.sync.read(level).data),'Rendered frame changes during movement/fire workload');
 await s.page.keyboard.press('Escape');await s.page.waitForTimeout(250);
 await writeFile(resolve(run,name+'-menu.png'),await canvas.screenshot(),{flag:'wx'});
 await s.page.locator('#terminal-focus').click();await s.command('kill -TERM "$(cat /tmp/game.pid)"');
 await s.page.waitForFunction(()=>[...shell.busybox.windows.values()].filter(v=>v.shown).length===0);
 await s.command('echo GAME-TERMINAL-RECOVERED');report.status='passed';
} catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally{report.finishedAt=new Date().toISOString();if(s){await writeFile(resolve(run,name+'-stdout.log'),await s.page.evaluate(async n=>new TextDecoder().decode(await shell.busybox.read('/tmp/'+n+'.log')),name).catch(()=>''),{flag:'wx'});await writeFile(resolve(run,name+'-functional.log'),await s.page.evaluate(()=>shell.busybox?.log||'').catch(()=>''),{flag:'wx'});await s.close();}await writeFile(resolve(run,name+'-functional.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
