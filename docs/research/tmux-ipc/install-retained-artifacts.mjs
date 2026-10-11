// Artifact-only final-candidate setup. Follow with lifecycle-candidate.mjs.
import {session} from '../../../tests/compatibility/session.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
const run=process.env.COMPAT_RUN_DIR;
const config=JSON.parse(await readFile(resolve(run,'config.json')));
const plan=JSON.parse(await readFile(new URL('./final-artifact-plan.json',import.meta.url)));
assert(config.sourceDist&&config.expectedRuntime,'Explicit candidate required');
assert.equal(config.artifactOnly,true,'Use a fresh artifact-only run');
for(const item of plan.artifacts){
 const bytes=await readFile(resolve(config.dist,'inputs',item.name,'retained.tar'));
 assert.equal(bytes.length,item.size);assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);
}
const s=await session(),report={runtime:s.runtime,status:'running',scope:'Identical retained artifacts; no compiler or source recipe invoked',artifacts:plan.artifacts};
try {
 for(const item of plan.artifacts){
  await s.command('mkdir -p /tmp/tmux-retained/'+item.name);
  await s.page.evaluate(async name=>{
   const response=await fetch('/inputs/'+name+'/retained.tar');assertResponse(response);
   await shell.busybox.write('/tmp/tmux-retained/'+name+'/retained.tar',new Uint8Array(await response.arrayBuffer()));
   function assertResponse(r){if(!r.ok)throw Error('retained artifact HTTP '+r.status);}
  },item.name);
  await s.command('mkdir -p /usr/local && tar -xf /tmp/tmux-retained/'+item.name+'/retained.tar -C /usr/local');
 }
 await s.command('/usr/local/bin/tmux -V && sync');report.status='passed';
} catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally {
 report.finishedAt=new Date().toISOString();
 await writeFile(resolve(run,'retained-artifacts.json'),JSON.stringify(report,null,2)+'\n');
 await s.close();
}
