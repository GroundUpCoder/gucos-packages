// One-off development compile: same runtime/profile, retained configure output.
import {session} from '../../../tests/compatibility/session.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
const run=process.env.COMPAT_RUN_DIR,config=JSON.parse(await readFile(resolve(run,'config.json')));
const previous=JSON.parse(await readFile(resolve(config.resumedFrom,'config.json')));
assert.equal(previous.expectedRuntime,config.expectedRuntime,'No configure reuse across runtimes');
const s=await session(), report={runtime:s.runtime,resumedFrom:config.resumedFrom,status:'running',scope:config.scope};
try {
 await s.command('true');
 const recipe=await readFile(resolve(config.dist,'inputs/tmux/build.sh'),'utf8');
 const a=recipe.indexOf('CC=cc '),b=recipe.indexOf('make -j1',a);assert(a>0&&b>a);
 const NL=String.fromCharCode(10);
 const script=recipe.slice(0,a)+['test -f Makefile','rm -f ./*.o compat/*.o',''].join(NL)+recipe.slice(b).replace('make -j1','make -k -j1');
 await writeFile(resolve(run,'executed-resume-build.sh'),script);
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/tmux-integrated/tmux/resume-build.sh',new TextEncoder().encode(text)),script);
 await s.command(['set -eu','cd /tmp/tmux-integrated/tmux','DESTDIR=/usr/local sh resume-build.sh','DESTDIR=/usr/local sh test.sh','sync'].join(NL));
 report.status='passed';
} catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally {
 await writeFile(resolve(run,'resume-compile.json'),JSON.stringify(report,null,2)+String.fromCharCode(10));
 await s.close();
}
