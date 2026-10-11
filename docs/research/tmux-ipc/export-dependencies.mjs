// Run only AFTER the existing build releases its browser reservation.
// Export retained guest outputs; do not relabel them as built on a newer runtime.
import {session} from '../../../tests/compatibility/session.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
const root=new URL('../../../',import.meta.url).pathname;
const run=process.env.COMPAT_RUN_DIR;
const out=resolve(run,'dependency-exports');await mkdir(out,{recursive:true});
const config=JSON.parse(await readFile(resolve(run,'config.json')));
const frozen=JSON.parse(await readFile(resolve(run,'dist-files.json')));
const s=await session();
try {
 await s.command('true');
 const configBytes=await s.page.evaluate(async()=>{try{return Array.from(await shell.busybox.read('/tmp/tmux-build/tmux/source/config.log'));}catch{return null;}});
 if(configBytes)await writeFile(resolve(run,'tmux-config.log'),Buffer.from(configBytes));
 for(const name of process.argv.slice(2)) {
  assert(['libevent','ncurses','tmux'].includes(name));
  const outputs=JSON.parse(await readFile(resolve(root,'apps',name,'outputs.json')));
  assert(outputs.every(x=>/^[a-zA-Z0-9_+.,/@%=-]+$/.test(x.path)&&!x.path.split('/').includes('..')));
  const list='/tmp/'+name+'-export-files';
  await s.page.evaluate(async ({list,text})=>shell.busybox.write(list,new TextEncoder().encode(text)),{list,text:outputs.map(x=>x.path).join(String.fromCharCode(10))+String.fromCharCode(10)});
  const archive='/tmp/'+name+'-retained.tar';
  await s.command(['set -eu','tar -cf '+archive+' -C /usr/local -T '+list,'sync'].join(String.fromCharCode(10)));
  const encoded=await s.page.evaluate(async path=>{
   const bytes=await shell.busybox.read(path);let out='';
   for(let i=0;i<bytes.length;i+=16383)out+=btoa(String.fromCharCode(...bytes.subarray(i,i+16383)));
   return out;
  },archive);
  const bytes=Buffer.from(encoded,'base64'),sha256=createHash('sha256').update(bytes).digest('hex');
  await writeFile(resolve(out,sha256+'.tar'),bytes,{flag:'wx'});
  await writeFile(resolve(out,name+'-receipt.json'),JSON.stringify({name,sourceRuntime:s.runtime,sourceDist:config.sourceDist||config.dist,sha256,size:bytes.length,outputs,frozenInputs:Object.fromEntries(['source.tar','build.sh','test.sh'].map(f=>[f,frozen['inputs/'+name+'/'+f]])),scope:'Retained guest output bytes. Reuse on another runtime requires explicit compatibility validation; this export is not new-runtime acceptance.'},null,2)+String.fromCharCode(10),{flag:'wx'});
 }
} finally {await s.close();}
