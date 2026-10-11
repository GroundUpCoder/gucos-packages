// One-off tmux compilation assessment; run remotely inside machine-job browser.
import {session} from '../../../tests/compatibility/session.mjs';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
const s=await session(), results=[];
try {
 for(const name of process.argv.slice(2)) {
  assert(['libevent','ncurses','tmux'].includes(name));
  await s.command('mkdir -p /tmp/tmux-build/'+name);
  for(const file of ['source.tar','build.sh','test.sh']) await s.page.evaluate(async ({name,file})=>{
   const response=await fetch('/inputs/'+name+'/'+file);if(!response.ok)throw Error('input HTTP '+response.status);
   await shell.busybox.write('/tmp/tmux-build/'+name+'/'+file,new Uint8Array(await response.arrayBuffer()));
  },{name,file});
  const start=Date.now();
  try {await s.command('set -eu\ncd /tmp/tmux-build/'+name+'\nDESTDIR=/usr/local sh build.sh\nDESTDIR=/usr/local sh test.sh\nsync');results.push({name,status:'passed',elapsedMs:Date.now()-start});}
  catch(error){
   results.push({name,status:'failed',error:String(error),elapsedMs:Date.now()-start});
   for(const file of ['config.log','config.h','Makefile']) {
    const encoded=await s.page.evaluate(async path=>{try {const bytes=await shell.busybox.read(path);return bytes?Array.from(bytes):null;}catch{return null;}},'/tmp/tmux-build/'+name+'/source/'+file);
    if(encoded)await writeFile(resolve(process.env.COMPAT_RUN_DIR,name+'-'+file),Buffer.from(encoded));
   }
   throw error;
  }
 }
} finally {
 await writeFile(resolve(process.env.COMPAT_RUN_DIR,'build-'+process.argv.slice(2).join('-')+'.json'),JSON.stringify({runtime:s.runtime,results},null,2)+'\n');
 await s.close();
}
