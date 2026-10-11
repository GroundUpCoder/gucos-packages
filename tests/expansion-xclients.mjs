import {session} from './expansion-session.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const s=await session();
try{
 await s.command('true');await s.page.evaluate(async source=>shell.busybox.write('/tmp/xclients-control.c',new TextEncoder().encode(source)),await readFile(new URL('fixtures/xclients-control.c',import.meta.url),'utf8'));
 const log=await s.command(`set -eu
cc /tmp/xclients-control.c -I/usr/local/include -L/usr/local/lib -lXtst -lXext -lX11 -lxcb -lXau -o /tmp/xclients-control
rm -f /tmp/.X1-lock /tmp/.X11-unix/X1
export DISPLAY=:1
Xvfb :1 -screen 0 1100x800x24 -fp built-ins -noreset -ac &
server=$!
trap 'kill "$server" 2>/dev/null; wait "$server" 2>/dev/null' EXIT
sleep 2
xlsfonts -fn fixed > /tmp/fonts
grep fixed /tmp/fonts
xprop -root -f PACKAGE_TEST 8s -set PACKAGE_TEST checked
xprop -root PACKAGE_TEST | grep checked
xrefresh
xclock -digital -update 1 -fn fixed -geometry 220x100+260+30 &
xcalc -fn fixed -geometry 230x300+0+30 &
xeyes -geometry 200x100+520+30 &
xlogo -geometry 120x120+780+30 &
logo=$!
xmessage -fn fixed -geometry 240x100+260+300 -buttons Okay:7 -default Okay 'Guest message' &
message=$!
xev -event keyboard -geometry 150x100+600+300 > /tmp/xev.log &
sleep 2
/tmp/xclients-control
if wait "$message"; then exit 1; else test "$?" = 7; fi
grep KeyPress /tmp/xev.log
xkill -id "$(cat /tmp/xapps-kill-id)"
sleep 1
if kill -0 "$logo" 2>/dev/null; then exit 1; fi
echo XCLIENTS-RUNTIME-PASS
kill "$server"
wait "$server"
trap - EXIT`);
 await writeFile(s.root+'test-results/xclients-runtime-output.txt',log);
}finally{await s.close();}
