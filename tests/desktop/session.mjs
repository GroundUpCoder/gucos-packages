// One foreground guest shell owns X/JWM and services read-only observation
// requests. Never attempt a second BusyBoxSession.start while it is running.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {poll} from './poll.mjs';
import {installObserver} from './menu.mjs';
async function bounded(p,ms,label){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label)),ms);})]);}finally{clearTimeout(timer);}}
export async function desktopSession(s){
 const helper=await installObserver(s);
 helper.pollHelperSha256=createHash('sha256').update(await readFile(new URL('./poll.mjs',import.meta.url))).digest('hex');
 helper.sessionHelperSha256=createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
 const pending=s.command(`set -eu
rm -rf /tmp/jwm-test-control
mkdir /tmp/jwm-test-control
rm -f /tmp/.X1-lock /tmp/.X11-unix/X1
export DISPLAY=:1
Xvfb :1 -screen 0 800x600x24 -fp built-ins -noreset -ac &
server=$!
wm=
cleanup() {
 [ -z "$wm" ] || kill "$wm" 2>/dev/null || true
 kill "$server" 2>/dev/null || true
 [ -z "$wm" ] || wait "$wm" 2>/dev/null || true
 wait "$server" 2>/dev/null || true
}
trap cleanup EXIT
/usr/local/libexec/jwm/wait-display
jwm -f /usr/local/share/jwm/wasm.jwmrc &
wm=$!
/tmp/jwm-observe wm
echo JWM-CONTROL-READY
n=1
while :; do
 while [ ! -f /tmp/jwm-test-control/$n.ready ]; do sleep 0.1; done
 if [ -f /tmp/jwm-test-control/stop ]; then break; fi
 code=0
 sh /tmp/jwm-test-control/$n.request > /tmp/jwm-test-control/$n.output 2>&1 || code=$?
 echo "$code" > /tmp/jwm-test-control/$n.code.tmp
mv /tmp/jwm-test-control/$n.code.tmp /tmp/jwm-test-control/$n.code
 n=$((n+1))
done
kill -0 "$wm"
jwm -exit
wait "$wm"
wm=
cleanup
trap - EXIT
echo JWM-CONTROL-PASS`);
 pending.catch(()=>{});
 async function race(p){return Promise.race([p,pending.then(()=>{throw Error('JWM control shell exited prematurely');})]);}
 await race(s.page.waitForFunction(()=>shell.busybox?.log.includes('JWM-CONTROL-READY'),null,{timeout:60000}));
 let serial=0;
 const write=async(path,text)=>s.page.evaluate(async({path,text})=>shell.busybox.write(path,new TextEncoder().encode(text)),{path,text});
 function command(script){return bounded((async()=>{
  const stem='/tmp/jwm-test-control/'+(++serial);
  await write(stem+'.request',script+'\n');await write(stem+'.ready','ready');
  // Take one complete response snapshot; status readiness alone does not bind
  // a later read of both files. Missing output is not an empty successful result.
  const response=await race(poll(s.page,async stem=>{
   const status=await shell.busybox.read(stem+'.code');
   if(!ArrayBuffer.isView(status))return false;
   const code=new TextDecoder().decode(status);if(!/^[0-9]+\n$/.test(code))return false;
   const bytes=await shell.busybox.read(stem+'.output');
   if(!ArrayBuffer.isView(bytes))return false;
   return {code,output:new TextDecoder().decode(bytes)};
  },stem,45000));
  const {code,output}=response;
  assert.match(code,/^[0-9]+\n$/);assert.equal(Number(code),0,output);return output;
 })(),45000,'Complete JWM observation request exceeded 45 seconds');}
 return {...s,command,helper,pending,finish:()=>bounded((async()=>{
  await write('/tmp/jwm-test-control/stop','stop');await write('/tmp/jwm-test-control/'+(++serial)+'.ready','ready');
  assert.match(await pending,/JWM-CONTROL-PASS/);
  await s.page.waitForFunction(()=>[...shell.busybox.windows.values()].filter(v=>v.shown).length===0,null,{timeout:15000});
 })(),45000,'Complete JWM shutdown exceeded 45 seconds')};
}
