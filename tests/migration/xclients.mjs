import {session} from '../compatibility/session.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID,'machine-job browser reservation required');
const run=process.env.COMPAT_RUN_DIR;
const s=await session();
try{
 await s.command('true');
 await s.page.evaluate(async source=>shell.busybox.write('/tmp/migration-xclients.c',new TextEncoder().encode(source)),await readFile(new URL('xclients-control.c',import.meta.url),'utf8'));
 const log=await s.command(`set -eu
cc /tmp/migration-xclients.c -I/usr/local/include -L/usr/local/lib -lXtst -lXext -lX11 -lxcb -lXau -o /tmp/migration-xclients
(cd /usr/local/share/xedit/tests && /usr/local/libexec/xedit/regex-tests)
echo '(format t "~(~A~)" "HELLO")' | /usr/local/libexec/xedit/lsp > /tmp/migration-lisp.txt
grep hello /tmp/migration-lisp.txt
rm -f /home/user/migration-xedit.txt /tmp/.X1-lock /tmp/.X11-unix/X1
export DISPLAY=:1
Xvfb :1 -screen 0 1100x800x24 -fp built-ins -noreset -ac &
server=$!
trap 'kill "$server" 2>/dev/null; wait "$server" 2>/dev/null' EXIT
sleep 2
xedit -xrm '*font: fixed' -geometry 500x350+550+10 /home/user/migration-xedit.txt &
p1=$!
xfontsel -fn fixed -geometry 500x180+550+400 &
p2=$!
xclipboard -fn fixed -geometry 290x140+250+450 &
p3=$!
xcutsel -fn fixed -geometry 250x80+250+620 &
p4=$!
oclock -geometry 120x120+250+130 &
p5=$!
/tmp/migration-xclients
for pid in "$p1" "$p2" "$p3" "$p4" "$p5"; do
 kill -0 "$pid"
 kill "$pid"
 code=0
 wait "$pid" || code=$?
 test "$code" = 0 -o "$code" = 143
done
sync
echo MIGRATION-GUI-PASS`);
 await writeFile(resolve(run,'xclients-functional'+(process.env.MIGRATION_ATTEMPT?'-'+process.env.MIGRATION_ATTEMPT:'')+'.log'),log,{flag:'wx'});
}finally{await s.close();}
