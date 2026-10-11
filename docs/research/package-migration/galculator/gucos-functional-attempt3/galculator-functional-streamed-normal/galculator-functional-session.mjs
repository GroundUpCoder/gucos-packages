// One foreground guest shell owns X/JWM and services read-only observation
// requests. Never attempt a second BusyBoxSession.start while it is running.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const repo=resolve(process.env.MIGRATION_REPO_ROOT);
const {poll}=await import(pathToFileURL(resolve(repo,'tests/desktop/poll.mjs')));
const {installObserver}=await import(pathToFileURL(resolve(repo,'tests/desktop/menu.mjs')));
async function bounded(p,ms,label){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label)),ms);})]);}finally{clearTimeout(timer);}}
export async function desktopSession(s,{workingDirectory,configPath,controlPath}={}){
 assert(/^\/home\/user\/galculator-functional-[A-Za-z0-9_-]+\/(first|relaunch)\/jwmrc$/.test(configPath));
 assert(controlPath===configPath.replace(/jwmrc$/, 'control'));
 // JWM children inherit this directory; later request-shell cd cannot change it.
 // Restrict to ordinary absolute guest paths before interpolation into the shell.
 if(workingDirectory!==undefined){
  assert(typeof workingDirectory==='string' && workingDirectory.startsWith('/home/user/'));
  assert(workingDirectory.length<=240 && /^\/home\/user\/[A-Za-z0-9_/-]+$/.test(workingDirectory));
  assert(workingDirectory.split('/').slice(1).every(part=>part.length>0));
 }
 const helper=await installObserver(s);
 helper.pollHelperSha256=createHash('sha256').update(await readFile(resolve(repo,'tests/desktop/poll.mjs'))).digest('hex');
 helper.sessionHelperSha256=createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
 const logStart=await s.page.evaluate(()=>shell.busybox.log.length);
 const pending=s.command(`set -eu
mkdir ${controlPath}
test ! -e /tmp/.X1-lock
test ! -e /tmp/.X11-unix/X1
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
${workingDirectory?`cd '${workingDirectory}'\n`:''}jwm -f ${configPath} &
wm=$!
/tmp/jwm-observe wm
echo JWM-CONTROL-READY
n=1
while :; do
 while [ ! -f ${controlPath}/$n.ready ]; do sleep 0.1; done
 if [ -f ${controlPath}/stop ]; then break; fi
 code=0
 sh ${controlPath}/$n.request > ${controlPath}/$n.output 2>&1 || code=$?
 echo "$code" > ${controlPath}/$n.code.tmp
mv ${controlPath}/$n.code.tmp ${controlPath}/$n.code
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
 await race(s.page.waitForFunction(n=>shell.busybox?.log.slice(n).includes('JWM-CONTROL-READY'),logStart,{timeout:60000}));
 let serial=0;
 const write=async(path,text)=>s.page.evaluate(async({path,text})=>shell.busybox.write(path,new TextEncoder().encode(text)),{path,text});
 function command(script){return bounded((async()=>{
  const stem=controlPath+'/'+(++serial);
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
 return {...s,command,helper,workingDirectory,pending,finish:()=>bounded((async()=>{
  await write(controlPath+'/stop','stop');await write(controlPath+'/' +(++serial)+'.ready','ready');
  assert.match(await pending,/JWM-CONTROL-PASS/);
  await s.page.waitForFunction(()=>[...shell.busybox.windows.values()].filter(v=>v.shown).length===0,null,{timeout:15000});
 })(),45000,'Complete JWM shutdown exceeded 45 seconds')};
}
