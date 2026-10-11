// Install the accepted JWM before exercising the reviewed replacement transaction.
import {session} from '../compatibility/session.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
const run=process.env.COMPAT_RUN_DIR;
const plan=JSON.parse(await readFile(new URL('../../docs/research/snake/jwm-upgrade-plan.json',import.meta.url)));
const config=JSON.parse(await readFile(resolve(run,'config.json')));
const expected=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
const report={status:'running',startedAt:new Date().toISOString()};
let s;
try {
 s=await session();report.runtime=s.runtime;
 await s.command('gucman repo add upgrade-baseline https://raw.githubusercontent.com/GroundUpCoder/gucos-packages/'+plan.baselineRevision+'/catalog.json\ngucman install upgrade-baseline:jwm');
 const installed=()=>s.page.evaluate(async()=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/jwm/current/manifest.json'))));
 assert.equal((await installed()).version,plan.upgrades.jwm.oldVersion);
 report.oldVersion=(await installed()).version;
 await s.command('gucman repo remove migration || true\ngucman repo add migration '+config.catalogUrl+'\ngucman install migration:desktop-entries\ngucman install migration:jwm');
 assert.deepEqual(await installed(),expected.jwm);
 report.newVersion=expected.jwm.version;report.status='passed';
} catch(error) {report.status='failed';report.error=String(error.stack||error);throw error;}
finally {report.finishedAt=new Date().toISOString();await writeFile(resolve(run,'jwm-upgrade.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});if(s)await s.close();}
