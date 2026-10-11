// Gameplay acceptance against the installed, frozen binary. Run in machine-job.
import {session} from '../compatibility/session.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
const run=process.env.COMPAT_RUN_DIR;
for(const file of ['snake-functional.json','snake-functional.log','snake-playing.png'])
 await assert.rejects(access(resolve(run,file)),{code:'ENOENT'});
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
 const checksums=await readFile(resolve(run,'snake.sha256'),'utf8');
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/snake-expected.sha256',new TextEncoder().encode(text)),checksums);
 await s.command('sha256sum -c /tmp/snake-expected.sha256');
 report.checks.push('frozen-output-checksums');
 await s.page.evaluate(async()=>shell.busybox.write('/tmp/snake-session-test.c',new TextEncoder().encode(`#include <termios.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>
#include <signal.h>
#include <spawn.h>
extern char **environ;
int main(void){struct termios before,after;int status;
if(tcgetattr(0,&before))return 1;signal(SIGINT,SIG_IGN);
pid_t p;char *args[]={"snake",0};if(posix_spawn(&p,"/usr/local/bin/snake",0,0,args,environ))return 2;
if(waitpid(p,&status,0)!=p || status || tcgetattr(0,&after))return 3;
if(before.c_iflag!=after.c_iflag || before.c_oflag!=after.c_oflag || before.c_cflag!=after.c_cflag || before.c_lflag!=after.c_lflag)return 4;
for(int i=0;i<NCCS;i++)if(before.c_cc[i]!=after.c_cc[i])return 5;
puts("SNAKE-TERMIOS-PASS");return 0;}
`)));
 await s.command('cc /tmp/snake-session-test.c -o /tmp/snake-session-test');
 async function launch() {
  const start=await s.page.evaluate(()=>shell.busybox.log.length);
  await s.page.evaluate(()=>shell.terminal.focus());
  await s.page.keyboard.type('sh');await s.page.keyboard.press('Enter');
  await until(()=>s.page.evaluate(()=>shell.busybox.running && shell.ui.busy),'interactive session');
  pending=s.page.evaluate(()=>shell.busybox.done).then(result=>assert.equal(result.code,0));pending.catch(()=>{});
  await until(()=>s.page.evaluate(start=>/[$#] /.test(shell.busybox.log.slice(start)),start),'interactive shell prompt');
  await s.page.evaluate(()=>shell.terminal.focus());
  await s.page.keyboard.type('exec /tmp/snake-session-test');await s.page.keyboard.press('Enter');
 }
 const start=await s.page.evaluate(()=>shell.busybox.log.length);
 await launch();
 await until(async()=>(await headSince(start)).length>=2,'initial movement');
 // Timestamp complete head drawings at the worker/UI boundary. This observes
 // the installed binary; the game and its clock are not mocked or modified.
 await s.page.evaluate(()=>{
  window.snakeFrames=[];let output='';let consumed=0;
  shell.busybox.worker.addEventListener('message',({data})=>{
   if(data.type!=='output')return;
   output+=data.text;
   const re=/\x1b\[(\d+);(\d+)H\x1b\[32m@/g;let m;
   while((m=re.exec(output))!==null){
    if(re.lastIndex>consumed)window.snakeFrames.push({x:+m[2],y:+m[1],at:performance.now()});
    consumed=Math.max(consumed,re.lastIndex);
   }
  });
 });
 await s.page.waitForFunction(()=>snakeFrames.length>=5);
 const idle=await s.page.evaluate(()=>snakeFrames.slice(0,5));
 const intervals=idle.slice(1).map((f,i)=>f.at-idle[i].at).sort((a,b)=>a-b);
 report.idleIntervalsMs=intervals;
 assert(intervals[1]>=75 && intervals[2]<140,'Expected approximately 100 ms idle steps');
 report.inputLatenciesMs=[];
 for(let trial=0;trial<5;trial++){
  const count=await s.page.evaluate(()=>snakeFrames.length);
  await s.page.waitForFunction(n=>snakeFrames.length>n,count,{polling:5});
  await s.page.waitForTimeout(15);
  const marker=await s.page.evaluate(()=>({at:performance.now(),count:snakeFrames.length}));
  await s.page.keyboard.press('ArrowRight');
  await s.page.waitForFunction(n=>snakeFrames.length>n,marker.count,{polling:5});
  const frame=await s.page.evaluate(n=>snakeFrames[n],marker.count);
  report.inputLatenciesMs.push(frame.at-marker.at);
 }
 const sorted=[...report.inputLatenciesMs].sort((a,b)=>a-b);
 assert(sorted[2]<65,'Direction keys should move immediately, not await the next tick');
 report.checks.push('100ms-idle-cadence','immediate-direction-response');
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
 await s.page.evaluate(()=>new Promise(resolve=>shell.terminal.write('',resolve)));
 const screen=await s.page.evaluate(()=>{const b=shell.terminal.buffer.active;return Array.from({length:b.length},(_,i)=>b.getLine(i)?.translateToString(true)||'');});
 assert.match(screen[0],/^\|[-]{58}\|/,'Visible top border');
 assert.match(screen[20],/^\|[-]{58}\|/,'Visible bottom border');
 assert(screen.some(row=>row.includes('@')),'Visible snake head');
 assert(screen.some(row=>row.includes('*')),'Visible food');
 report.checks.push('rendered-board-borders-head-food');
 await s.page.screenshot({path:resolve(run,'snake-playing.png')});
 await s.page.keyboard.press('q');await settled();
 await s.command('echo SNAKE-TERMINAL-RESTORED');
 const log=await s.page.evaluate(start=>shell.busybox.log.slice(start),start);
 assert(log.includes('\x1b[?25h\x1b[?1049l'));
 assert(log.includes('SNAKE-TERMIOS-PASS'));
 report.checks.push('single-q-exit','cursor-and-alternate-screen-restored','termios-restored');
 const second=await s.page.evaluate(()=>shell.busybox.log.length);
 await launch();
 await until(async()=>(await headSince(second)).length>=1,'relaunch');
 await s.page.evaluate(()=>shell.terminal.focus());await s.page.keyboard.press('Control+c');await settled();
 assert((await s.page.evaluate(start=>shell.busybox.log.slice(start),second)).includes('SNAKE-TERMIOS-PASS'));
 await s.command('echo SNAKE-CTRL-C-PASS');
 report.checks.push('relaunch','ctrl-c-exit','termios-restored-after-ctrl-c');
 report.status='passed';
} catch(error) {
 report.status='failed';report.error=String(error.stack||error);
 if(s&&pending)try{await s.page.keyboard.press('q');await s.page.keyboard.type('exit');await s.page.keyboard.press('Enter');await settled();}catch{}
 throw error;
} finally {
 report.finishedAt=new Date().toISOString();
 try{
  if(s)await writeFile(resolve(run,'snake-functional.log'),await s.page.evaluate(()=>shell.busybox.log),{flag:'wx'});
  await writeFile(resolve(run,'snake-functional.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 }finally{if(s)await s.close();}
}
