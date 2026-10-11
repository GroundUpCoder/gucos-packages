// One-off integrated tmux compile; no implicit core discovery or dependency rebuild.
import {session} from '../../../tests/compatibility/session.mjs';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
const NL=String.fromCharCode(10), s=await session();
const report={runtime:s.runtime,stages:[],status:'running',tmuxBuildMode:'clean source extraction and configure; dependencies reused with recompiled consumers'};
async function input(name,file){
 await s.page.evaluate(async ({name,file})=>{
  const r=await fetch('/inputs/'+name+'/'+file);if(!r.ok)throw Error('input HTTP '+r.status);
  await shell.busybox.write('/tmp/tmux-integrated/'+name+'/'+file,new Uint8Array(await r.arrayBuffer()));
 },{name,file});
}
try {
 for(const name of ['libevent','ncurses']){
  await s.command('mkdir -p /tmp/tmux-integrated/'+name);
  for(const f of ['retained.tar','test.sh'])await input(name,f);
  if(name==='libevent')await input(name,'source.tar');
  await s.command(['set -eu','cd /tmp/tmux-integrated/'+name,'mkdir -p /usr/local','tar -xf retained.tar -C /usr/local',...(name==='libevent'?['tar -xf source.tar']:[]),'DESTDIR=/usr/local sh test.sh','sync'].join(NL));
  report.stages.push({name,status:'consumer-recompiled-and-passed',scope:'Original bootstrap dependency artifacts; integrated-runtime consumers and tools executed.'});
 }
 await s.command('mkdir -p /tmp/tmux-integrated/tmux');
 for(const f of ['source.tar','build.sh','test.sh'])await input('tmux',f);
 await s.command(['set -eu','cd /tmp/tmux-integrated/tmux','rm -rf source','DESTDIR=/usr/local sh build.sh','DESTDIR=/usr/local sh test.sh','sync'].join(NL));
 report.stages.push({name:'tmux',status:'compiled-and-version-smoke-passed'});report.status='passed';
} catch(error) {
 report.status='failed';report.error=String(error.stack||error);
 throw error;
} finally {
 for(const file of ['config.log','config.h','Makefile']){
  const bytes=await s.page.evaluate(async path=>{try{const b=await shell.busybox.read(path);return b?Array.from(b):null;}catch{return null;}},'/tmp/tmux-integrated/tmux/source/'+file);
  if(bytes)await writeFile(resolve(process.env.COMPAT_RUN_DIR,'tmux-'+file),Buffer.from(bytes));
 }
 report.finishedAt=new Date().toISOString();
 await writeFile(resolve(process.env.COMPAT_RUN_DIR,'integrated-compile.json'),JSON.stringify(report,null,2)+NL);
 await s.close();
}
