import {session} from './expansion-session.mjs';
import assert from 'node:assert/strict';
const s=await session();
try{
 const pending=s.command(`set -eu
cat > /tmp/focus.c <<'C'
#include <X11/Xlib.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
int main(void){Display*d=XOpenDisplay(0);if(!d)return 1;Window root=DefaultRootWindow(d);for(int n=0;n<100;n++){Window r,p,*c=0;unsigned count;XQueryTree(d,root,&r,&p,&c,&count);for(unsigned i=0;i<count;i++){char*name=0;if(XFetchName(d,c[i],&name)&&name){int yes=!strcmp(name,"PTY test");XFree(name);XWindowAttributes a;if(yes&&XGetWindowAttributes(d,c[i],&a)&&a.map_state==IsViewable){XSetInputFocus(d,c[i],RevertToParent,CurrentTime);XSync(d,False);puts("XTERM-FOCUSED");fflush(stdout);return 0;}}}if(c)XFree(c);usleep(100000);}return 2;}
C
cc /tmp/focus.c -I/usr/local/include -L/usr/local/lib -lX11 -lxcb -lXau -o /tmp/focus
rm -f /tmp/.X1-lock /tmp/.X11-unix/X1
export DISPLAY=:1
Xvfb :1 -screen 0 800x600x24 -fp built-ins -noreset -ac &
server=$!
trap 'kill "$server" 2>/dev/null; wait "$server" 2>/dev/null' EXIT
sleep 2
xterm -fn fixed -title 'PTY test' -e /bin/sh -c 'printf "Type a line: "; read line; printf "%s" "$line" > /tmp/pty-result' &
terminal=$!
/tmp/focus
wait "$terminal"
test "$(cat /tmp/pty-result)" = 'guest pty input'
echo XTERM-PTY-PASS
kill "$server"
wait "$server"
trap - EXIT`);
 await Promise.race([s.page.waitForFunction(()=>shell.busybox?.log.includes('XTERM-FOCUSED')),pending.then(()=>{throw Error('terminal ended before focus');})]);
 await s.page.locator('.vt:visible canvas').focus();await s.page.keyboard.type('guest pty input');await s.page.keyboard.press('Enter');
 assert.match(await pending,/XTERM-PTY-PASS/);
}finally{await s.close();}
