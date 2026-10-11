// Gameplay acceptance against the installed, frozen binary. Run in machine-job.
import {session} from '../compatibility/session.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
const run=process.env.COMPAT_RUN_DIR;
await assert.rejects(access(resolve(run,'snake-functional.json')),{code:'ENOENT'});
const report={startedAt:new Date().toISOString(),status:'running',checks:[]};
let s,pending;
async function headSince(start) {
 return s.page.evaluate(start=>{
  const matches=[...shell.busybox.log.slice(start).matchAll(/\x1b\[(\d+);(\d+)H\x1b\[32m@/g)];
  return matches.map(m=>({y:Number(m[1]),x:Number(m[2])}));
 },start);
}
async function until(fn,label,ms=10000) {
 const end=Date.now()+ms;
 while(Date.now()<end){if(await fn())return;await s.page.waitForTimeout(40);}
 throw Error('Timed out: '+label);
}
async function settled() {
 let timer;
 try{await Promise.race([pending,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Snake did not exit')),10000);})]);}
 finally{clearTimeout(timer);}pending=undefined;
}
try {
 s=await session();report.runtime=s.runtime;await s.command('true');
 const manifests=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
 assert(manifests.snake.binary);
 const installed=await s.page.evaluate(async()=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/snake/current/manifest.json'))));
 assert.deepEqual(installed,manifests.snake);report.binary=installed.binary;
 await s.command('stty -g > /tmp/snake-before');
 const start=await s.page.evaluate(()=>shell.busybox.log.length);
 pending=s.command('echo $$ > /tmp/snake-test.pid\nexec snake');pending.catch(()=>{});
 await until(async()=>(await headSince(start)).length>=2,'initial movement');
 await s.page.evaluate(()=>shell.terminal.focus());
 const before=(await headSince(start)).at(-1);
 await s.page.keyboard.press('ArrowUp');
 await until(async()=>(await headSince(start)).some(p=>p.y<before.y),'arrow changes heading');
 report.checks.push('initial-frame','timer-movement','actual-arrow-key-turn');
 await until(()=>s.page.evaluate(start=>shell.busybox.log.slice(start).includes('GAME OVER'),start),'wall collision',15000);
 const restart=await s.page.evaluate(()=>shell.busybox.log.length);
 await s.page.keyboard.press('r');
 await until(async()=>(await headSince(restart)).length>=2,'restart');
 const reset=(await headSince(restart))[0];
 assert(reset.y>before.y-2,'Restart did not return toward board center');
 report.checks.push('wall-collision','restart');
 await s.page.screenshot({path:resolve(run,'snake-playing.png')});
 await s.page.keyboard.press('q');await settled();
 await s.command('stty -g > /tmp/snake-after\ncmp /tmp/snake-before /tmp/snake-after\necho SNAKE-TERMINAL-RESTORED');
 const log=await s.page.evaluate(start=>shell.busybox.log.slice(start),start);
 assert(log.includes('\x1b[?25h\x1b[?1049l'));
 report.checks.push('single-q-exit','cursor-and-alternate-screen-restored','termios-restored');
 const second=await s.page.evaluate(()=>shell.busybox.log.length);
 pending=s.command('echo $$ > /tmp/snake-test.pid\nexec snake');pending.catch(()=>{});
 await until(async()=>(await headSince(second)).length>=1,'relaunch');
 await s.page.evaluate(()=>shell.terminal.focus());await s.page.keyboard.press('Control+c');await settled();
 await s.command('stty -g > /tmp/snake-after\ncmp /tmp/snake-before /tmp/snake-after\necho SNAKE-CTRL-C-PASS');
 report.checks.push('relaunch','ctrl-c-exit','termios-restored-after-ctrl-c');
 report.status='passed';
} catch(error) {
 report.status='failed';report.error=String(error.stack||error);
 if(s&&pending)try{await s.page.evaluate(async()=>{
  const b=await shell.busybox.read('/tmp/snake-test.pid');const pid=Number(new TextDecoder().decode(b));
  if(Number.isInteger(pid)&&pid>0)shell.busybox.worker.postMessage({type:'kill',pid});
 });await settled();}catch{}
 throw error;
} finally {
 report.finishedAt=new Date().toISOString();
 try{
  if(s)await writeFile(resolve(run,'snake-functional.log'),await s.page.evaluate(()=>shell.busybox.log),{flag:'wx'});
  await writeFile(resolve(run,'snake-functional.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 }finally{if(s)await s.close();}
}
