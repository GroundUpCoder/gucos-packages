import {session} from './session.mjs';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const run=process.env.COMPAT_RUN_DIR;
const baseline=JSON.parse(await readFile(resolve(run,'baseline.json')));
const names=['x11-server','x11-toolkit','x11-widgets','jwm','xterm'];
const paths=new Set(names.flatMap(name=>baseline.packages[name].outputs.map(o=>'/usr/local/'+o.path)));
const s=await session();
async function integrity(){
 await s.command('true');
 for(const name of names){
  const installed=await s.page.evaluate(async name=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'))),name);
  assert.deepEqual(installed,baseline.packages[name],name+' public manifest');
 }
 const lines=(await readFile(resolve(run,'installed.sha256'),'utf8')).trim().split('\n').filter(line=>paths.has(line.slice(66)));
 assert.equal(lines.length,paths.size);
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/live-desktop.sha256',new TextEncoder().encode(text)),lines.join('\n')+'\n');
 await s.command('set -eu\nsha256sum -c /tmp/live-desktop.sha256\necho LIVE-DESKTOP-INTEGRITY-PASS');
}
try{
 if(process.argv[2]==='run'){
  await integrity();
  await s.page.evaluate(async source=>shell.busybox.write('/tmp/live-desktop-focus.c',new TextEncoder().encode(source)),await readFile(new URL('live-desktop-focus.c',import.meta.url),'utf8'));
  const pending=s.command(`set -eu
cc /tmp/live-desktop-focus.c -I/usr/local/include -L/usr/local/lib -lX11 -lxcb -lXau -o /tmp/live-desktop-focus
export DISPLAY=:1
Xvfb :1 -screen 0 800x600x24 -fp built-ins -noreset -ac &
server=$!
wm=
terminal=
cleanup() {
 [ -z "$terminal" ] || kill "$terminal" 2>/dev/null || true
 [ -z "$wm" ] || kill "$wm" 2>/dev/null || true
 kill "$server" 2>/dev/null || true
 wait "$server" 2>/dev/null || true
}
trap cleanup EXIT
/usr/local/libexec/jwm/wait-display
jwm -f /usr/local/share/jwm/wasm.jwmrc &
wm=$!
rm -f /home/user/live-desktop-pty-result
xterm -fn fixed -title 'Live desktop PTY' -e /bin/sh -c 'printf "Type a line: "; read line; printf "%s" "$line" > /home/user/live-desktop-pty-result' &
terminal=$!
/tmp/live-desktop-focus
wait "$terminal"
terminal=
test "$(cat /home/user/live-desktop-pty-result)" = 'live desktop keyboard'
kill -0 "$wm"
jwm -exit
wait "$wm"
wm=
kill "$server"
wait "$server"
trap - EXIT
sync
echo LIVE-JWM-XTERM-PTY-PASS`);
  await Promise.race([s.page.waitForFunction(()=>shell.busybox?.log.includes('LIVE-JWM-XTERM-FOCUSED')),pending.then(()=>{throw Error('Desktop ended before keyboard focus');})]);
  await s.page.locator('.vt:visible canvas').focus();
  await s.page.keyboard.type('live desktop keyboard');await s.page.keyboard.press('Enter');
  assert.match(await pending,/LIVE-JWM-XTERM-PTY-PASS/);
 }else if(process.argv[2]==='reload'){
  // This stage already reopens the persisted profile; also test in-page reload.
  await s.page.reload();await s.page.waitForFunction(()=>window.shell?.ready);
  assert.equal(await s.page.evaluate(()=>shell.toolchain.systemBuild),s.runtime);
  await integrity();
  await s.command('set -eu\ntest "$(cat /home/user/live-desktop-pty-result)" = "live desktop keyboard"\njwm -v\nxterm -version\necho LIVE-DESKTOP-RELOAD-PASS');
 }else throw Error('Expected run or reload');
}finally{await s.close();}
