import {session} from '../compatibility/session.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
assert(process.env.MACHINE_JOB_ID,'machine-job browser reservation required');
const report=resolve(process.env.COMPAT_RUN_DIR,'gio-functional'+(process.env.MIGRATION_ATTEMPT?'-'+process.env.MIGRATION_ATTEMPT:'')+'.log');
await assert.rejects(access(report),{code:'ENOENT'});
const s=await session();
try {
 await s.command('true');
 await s.page.evaluate(async source=>shell.busybox.write('/tmp/migration-gio.c',new TextEncoder().encode(source)),await readFile(new URL('gio-consumer.c',import.meta.url),'utf8'));
 const run=process.env.COMPAT_RUN_DIR;
 const config=JSON.parse(await readFile(resolve(run,'config.json')));
 const manifests=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
 const input=manifests['gio-core'].files.find(f=>f.path==='source.tar');
 const archive=await readFile(resolve(config.inputDist||config.dist,'migration/gio-core/source.tar'));
 assert.equal(archive.length,input.size);assert.equal(createHash('sha256').update(archive).digest('hex'),input.sha256);
 await s.page.evaluate(async encoded=>shell.busybox.write('/tmp/migration-gio-source.tar',Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))),archive.toString('base64'));
 const log=await s.command(`set -eu
export LD_LIBRARY_PATH=/usr/local/lib
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig
printf 'int migration_answer(void) { return 42; }\n' > /tmp/migration-gio-module.c
cc -shared /tmp/migration-gio-module.c -o /tmp/migration-gio-module.so
pkg-config --cflags --libs gio-core gmodule-2.0
cc /tmp/migration-gio.c $(pkg-config --cflags --libs gio-core gmodule-2.0) -o /tmp/migration-gio
/tmp/migration-gio
mkdir -p /tmp/migration-gio-retained
cd /tmp/migration-gio-retained
tar -xf /tmp/migration-gio-source.tar
cc source/port/files-check.c $(pkg-config --cflags --libs gio-core) -o /tmp/migration-gio-files
/tmp/migration-gio-files
cc source/port/ipc-check.c -Isource/gio $(pkg-config --cflags --libs gio-core) -o /tmp/migration-gio-ipc
/tmp/migration-gio-ipc
guc-session /tmp/migration-gio-ipc --session-client
echo GIO-FROZEN-SOURCE-SHA256 ${input.sha256}
echo GIO-RETAINED-EXTENDED-PASS`);
 await writeFile(report,log,{flag:'wx'});
} finally { await s.close(); }
