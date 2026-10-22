import {session} from '../compatibility/session.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID,'machine-job browser reservation required');
const report=resolve(process.env.COMPAT_RUN_DIR,'graphics-functional'+(process.env.MIGRATION_ATTEMPT?'-'+process.env.MIGRATION_ATTEMPT:'')+'.log');
await assert.rejects(access(report),{code:'ENOENT'});
const s=await session();
try {
 await s.command('true');
 await s.page.evaluate(async source=>shell.busybox.write('/tmp/migration-graphics.c',new TextEncoder().encode(source)),await readFile(new URL('graphics-consumer.c',import.meta.url),'utf8'));
 const log=await s.command(`set -eu
export LD_LIBRARY_PATH=/usr/local/lib
cc /tmp/migration-graphics.c -I/usr/local/include -I/usr/local/include/cairo -I/usr/local/include/freetype2 -L/usr/local/lib -lcairo -lfontconfig -lfreetype -lXrender -lXfixes -lXi -lXtst -lXext -lX11 -lxcb -lXau -lm -o /tmp/migration-graphics
rm -f /tmp/.X1-lock /tmp/.X11-unix/X1
export DISPLAY=:1
Xvfb :1 -screen 0 640x480x24 -fp built-ins -noreset -ac &
server=$!
trap 'kill "$server" 2>/dev/null; wait "$server" 2>/dev/null' EXIT
sleep 2
/tmp/migration-graphics`);
 await writeFile(report,log,{flag:'wx'});
} finally { await s.close(); }
