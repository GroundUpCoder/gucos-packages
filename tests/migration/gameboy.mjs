// Retained built-in ROM acceptance, adapted to a standalone graphical VT.
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
const run=process.env.COMPAT_RUN_DIR;
await assert.rejects(access(resolve(run,'gameboy-functional.json')),{code:'ENOENT'});
const report={canvasHelperSha256,status:'running',startedAt:new Date().toISOString(),scope:'Built-in ROM palette, animation, process termination and terminal recovery; no external ROM, controls, audio or CPU conformance claim'};
let s;
try {
 s=await session();report.runtime=s.runtime;await s.command('true');
 const expected=JSON.parse(await readFile(resolve(run,'candidate-manifests.json'))).gameboy;
 const installed=await s.page.evaluate(async()=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/gameboy/current/manifest.json'))));
 assert.deepEqual(installed,expected);
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/gameboy.sha256',new TextEncoder().encode(text)),await readFile(resolve(run,'gameboy.sha256'),'utf8'));
 await s.command('sha256sum -c /tmp/gameboy.sha256');
 report.harnessSha256=createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
 await s.command('gameboy > /tmp/gameboy.log 2>&1 &\necho $! > /tmp/gameboy.pid');
 const canvas=await visibleCanvas(s.page);
 async function frame(){
  const clip=await canvas.evaluate(c=>{const b=c.getBoundingClientRect(),w=+c.dataset.logicalWidth||c.width,h=+c.dataset.logicalHeight||c.height,scale=Math.min(b.width/w,b.height/h);return{x:b.x+(b.width-w*scale)/2,y:b.y+(b.height-h*scale)/2,width:w*scale,height:h*scale};});
  return s.page.screenshot({clip});
 }
 const colors=['155,188,15','139,172,15','48,98,48','15,56,15'];
 let first,counts;
 const end=Date.now()+20000;
 while(Date.now()<end){
  first=await frame();const {data}=PNG.sync.read(first);counts=Object.fromEntries(colors.map(c=>[c,0]));
  for(let i=0;i<data.length;i+=4){const key=[...data.subarray(i,i+3)].join(',');if(Object.hasOwn(counts,key))counts[key]++;}
  if(colors.every(c=>counts[c]>100)&&Object.values(counts).reduce((a,b)=>a+b,0)/(data.length/4)>0.95)break;
  await s.page.waitForTimeout(137);
 }
 assert(colors.every(c=>counts[c]>100),'All original palette colors');
 assert(Object.values(counts).reduce((a,b)=>a+b,0)/(PNG.sync.read(first).data.length/4)>0.95,'Original palette covers frame');
 await writeFile(resolve(run,'gameboy-frame.png'),first,{flag:'wx'});report.palette=counts;
 let animated=false;
 for(let i=0;i<20;i++){await s.page.waitForTimeout(137);const next=await frame();if(!PNG.sync.read(first).data.equals(PNG.sync.read(next).data)){animated=true;await writeFile(resolve(run,'gameboy-animated.png'),next,{flag:'wx'});break;}}
 assert(animated,'Built-in ROM continues scrolling');report.animated=animated;
 await s.page.locator('#terminal-focus').click();
 await s.command('kill -TERM "$(cat /tmp/gameboy.pid)"');
 await s.page.waitForFunction(()=>[...shell.busybox.windows.values()].filter(v=>v.shown).length===0);
 await s.command('echo GAMEBOY-TERMINAL-RECOVERED');
 report.status='passed';
} catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally{report.finishedAt=new Date().toISOString();if(s){await writeFile(resolve(run,'gameboy-stdout.log'),await s.page.evaluate(async()=>new TextDecoder().decode(await shell.busybox.read('/tmp/gameboy.log'))).catch(()=>''),{flag:'wx'});await writeFile(resolve(run,'gameboy-functional.log'),await s.page.evaluate(()=>shell.busybox?.log||'').catch(()=>''),{flag:'wx'});await s.close();}await writeFile(resolve(run,'gameboy-functional.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
