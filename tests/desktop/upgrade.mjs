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
const attempt=process.env.MIGRATION_ATTEMPT||'';assert(!attempt||/^[a-zA-Z0-9_-]+$/.test(attempt));
const report={status:'running',startedAt:new Date().toISOString()};
let s;
try {
 s=await session();report.runtime=s.runtime;
 // Package ownership is tied to the catalog URL. Serve the frozen old catalog
 // at the same URL for the initial install, then reveal the frozen candidate.
 if(config.baselinePackages.jwm)assert.deepEqual(config.baselinePackages.jwm,plan.upgrades.jwm.oldCatalogEntry);
 const oldCatalog={format:1,packages:{...config.baselinePackages,jwm:plan.upgrades.jwm.oldCatalogEntry}};
 await s.page.route(config.catalogUrl,route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(oldCatalog)}));
 await s.command('set -eu\ngucman repo remove migration || true\ngucman repo add migration '+config.catalogUrl+'\ngucman install migration:jwm');
 await s.page.unroute(config.catalogUrl);
 const installed=()=>s.page.evaluate(async()=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/jwm/current/manifest.json'))));
 assert.equal((await installed()).version,plan.upgrades.jwm.oldVersion);
 report.oldVersion=(await installed()).version;
 await s.command('gucman repo remove migration || true\ngucman repo add migration '+config.catalogUrl+'\ngucman install migration:desktop-entries\ngucman install migration:jwm');
 assert.deepEqual(await installed(),expected.jwm);
 report.newVersion=expected.jwm.version;report.status='passed';
} catch(error) {report.status='failed';report.error=String(error.stack||error);throw error;}
finally {report.finishedAt=new Date().toISOString();await writeFile(resolve(run,'jwm-upgrade'+(attempt?'-'+attempt:'')+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});if(s)await s.close();}
