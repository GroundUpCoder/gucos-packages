import {session} from '../compatibility/session.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID,'machine-job browser reservation required');
const report=resolve(process.env.COMPAT_RUN_DIR,'gio-functional'+(process.env.MIGRATION_ATTEMPT?'-'+process.env.MIGRATION_ATTEMPT:'')+'.log');
await assert.rejects(access(report),{code:'ENOENT'});
const s=await session();
try {
 await s.command('true');
 await s.page.evaluate(async source=>shell.busybox.write('/tmp/migration-gio.c',new TextEncoder().encode(source)),await readFile(new URL('gio-consumer.c',import.meta.url),'utf8'));
 const log=await s.command(`set -eu
export LD_LIBRARY_PATH=/usr/local/lib
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig
printf 'int migration_answer(void) { return 42; }\n' > /tmp/migration-gio-module.c
cc -shared /tmp/migration-gio-module.c -o /tmp/migration-gio-module.so
pkg-config --cflags --libs gio-core gmodule-2.0
cc /tmp/migration-gio.c $(pkg-config --cflags --libs gio-core gmodule-2.0) -o /tmp/migration-gio
/tmp/migration-gio`);
 await writeFile(report,log,{flag:'wx'});
} finally { await s.close(); }
