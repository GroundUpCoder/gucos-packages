import {session} from './expansion-session.mjs';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const s=await session();
try{
 await s.command('true');await s.page.evaluate(async source=>shell.busybox.write('/tmp/jwm-features.c',new TextEncoder().encode(source)),await readFile(new URL('fixtures/jwm-features.c',import.meta.url),'utf8'));
 const log=await s.command(`set -eu
cc /tmp/jwm-features.c -I/usr/local/include -L/usr/local/lib -lXtst -lXext -lX11 -lxcb -lXau -o /tmp/jwm-features
rm -f /tmp/.X1-lock /tmp/.X11-unix/X1
export DISPLAY=:1
Xvfb :1 -screen 0 800x600x24 -fp built-ins -noreset -ac &
server=$!
trap 'kill "$server" 2>/dev/null; wait "$server" 2>/dev/null' EXIT
sleep 2
jwm -f /usr/local/share/jwm/wasm.jwmrc &
wm=$!
sleep 2
xterm -fn fixed -geometry 48x12+30+40 -title JWM_TERMINAL &
terminal=$!
/tmp/jwm-features ready
xmessage -title JWM_WIDGETS -fn fixed -geometry 300x160+450+80 -buttons Okay:0 'Athena client' &
widgets=$!
touch /tmp/jwm-pager-ready /tmp/jwm-captured
/tmp/jwm-features
wait "$wm"
kill -0 "$terminal"
kill -0 "$widgets"
kill "$terminal" "$widgets" "$server"
wait "$server"
trap - EXIT
echo JWM-FEATURES-PASS`);
 assert.match(log,/JWM quit/);assert.match(log,/JWM-FEATURES-PASS/);
}finally{await s.close();}
