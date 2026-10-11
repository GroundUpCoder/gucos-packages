// Actual client install; never extract payloads directly or compile sources.
import {session} from '../../../tests/compatibility/session.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
const run=process.env.COMPAT_RUN_DIR,config=JSON.parse(await readFile(resolve(run,'config.json')));
assert.equal(config.artifactOnly,true);assert(config.catalogUrl);
const manifests=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
const s=await session();
// Long install bounded by the outer 90-minute machine-job reservation.
// page.evaluate/shell.command have no separate short command deadline.
s.page.setDefaultTimeout(90*60*1000);s.page.setDefaultNavigationTimeout(250000);
const report={runtime:s.runtime,status:'running',scope:'Actual gucman install, unchanged retained artifacts, no source build',steps:[]};
try {
 await s.command('true');
 const metadata=JSON.stringify(manifests.tmux);
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/tmux-final-manifest.json',new TextEncoder().encode(text)),metadata);
 const features=','+manifests.tmux.platform.features.join(',')+',';
 const oldCheck='/usr/libexec/guc-json compatible /tmp/tmux-final-manifest.json wasm32-wasm-posix 1.0.1 5 3 '+features+' unused '+s.runtime;
 await s.command('if '+oldCheck+' > /tmp/tmux-old-core-check 2>&1; then echo OLD-CORE-ACCEPTED; exit 1; fi; cat /tmp/tmux-old-core-check; grep -q "binary platform version mismatch" /tmp/tmux-old-core-check');
 report.steps.push({step:'actual-checker-rejects-1.0.1-metadata',status:'passed',scope:'Compatibility checker invocation with old version; not a boot of old runtime'});
 await s.command('gucman repo remove groundupcoder || true');
 await s.command('gucman repo add tmux-final '+config.catalogUrl);
 await s.command('gucman install tmux-final:tmux');
 for(const name of ['libevent','ncurses','tmux']){
  const manifest=await s.page.evaluate(async name=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'))),name);
  assert.deepEqual(manifest,manifests[name]);
  const sums=await readFile(resolve(run,name+'.sha256'),'utf8');
  await s.page.evaluate(async text=>shell.busybox.write('/tmp/tmux-installed.sha256',new TextEncoder().encode(text)),sums);
  await s.command('sha256sum -c /tmp/tmux-installed.sha256');
  report.steps.push({step:'installed-and-byte-verified',name,version:manifest.version,artifactSha256:manifest.binary.sha256,originalBuildRuntime:manifest.runtime});
 }
 await s.command('gucman installed');await s.command('/usr/local/bin/tmux -V && sync');report.status='passed';
}catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally{report.finishedAt=new Date().toISOString();await writeFile(resolve(run,'client-install.json'),JSON.stringify(report,null,2)+'\n');await s.close();}
