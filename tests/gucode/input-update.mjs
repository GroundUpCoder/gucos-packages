// Deterministic credential/action checks in a real guest; no real API credentials.
import {browserSession,quote} from '../../tools/browser.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
const mode=process.argv[2]||'build',live=mode==='public';
const expected=process.env.GUCOS_EXPECTED_RUNTIME;assert(expected);
const extra=new Map(),sha=b=>createHash('sha256').update(b).digest('hex');
const s=await browserSession({...live?{url:'https://os.groundupcoder.com'}:{directory:process.env.GUCOS_CORE_DIST,extra},allowedOrigins:['https://raw.githubusercontent.com','https://api.deepseek.com'],timeout:900000});
const out='docs/research/gucode-0.1.2';await mkdir(out,{recursive:true});
const report={mode,startedAt:new Date().toISOString(),status:'running',checks:[],fixture:'Mock DeepSeek SSE; no live provider request'};
async function write(path,data){await s.page.evaluate(async({path,b})=>shell.busybox.write(path,Uint8Array.from(b)),{path,b:Array.from(Buffer.from(data))});}
async function read(path){return Buffer.from(await s.page.evaluate(async path=>Array.from(await shell.busybox.read(path)),path));}
let wanted='default-test',requests=0,binaryOutput=false,editing=false; const edited=[];
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,content-type','Access-Control-Allow-Methods':'POST,GET,OPTIONS'};
await s.page.route('https://api.deepseek.com/chat/completions',async route=>{
 try {
  if(route.request().method()==='OPTIONS'){await route.fulfill({status:204,headers:cors,body:''});return;}
  assert.equal(route.request().headers()['authorization'],'Bearer '+wanted);requests++;
  const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(route.request().postDataBuffer())),last=body.messages.at(-1);
  if(editing){edited.push(last.content);await route.fulfill({status:200,headers:cors,contentType:'text/event-stream',body:'data: '+JSON.stringify({choices:[{delta:{content:'Editing verified'},finish_reason:'stop'}]})+'\n\ndata: [DONE]\n\n'});return;}
  const previous=body.messages.filter(m=>m.role==='tool').length;
  let delta,finish;
  if(previous===0){delta={tool_calls:[{index:0,id:'edit',type:'function',function:{name:'write_file',arguments:JSON.stringify({path:'result.txt',content:'updated\n'})}}]};finish='tool_calls';}
  else if(previous===1){assert.equal(JSON.parse(last.content).ok,true);delta={tool_calls:[{index:0,id:'shell',type:'function',function:{name:'shell',arguments:JSON.stringify({command:binaryOutput?'head -c 2000 /bin/cc; cat invalid.dat':'test -z "${DEEPSEEK_API_KEY:-}" && cat result.txt'})}}]};finish='tool_calls';}
  else {assert.equal(JSON.parse(last.content).ok,true);if(binaryOutput){assert(JSON.parse(last.content).output.includes('�'));assert(JSON.parse(last.content).output.endsWith('tail'));}else assert.equal(JSON.parse(last.content).output,'updated\n');delta={content:'Verified'};finish='stop';}
  await route.fulfill({status:200,headers:cors,contentType:'text/event-stream',body:'data: '+JSON.stringify({choices:[{delta,finish_reason:finish}]})+'\n\ndata: [DONE]\n\n'});
 }catch(e){report.fixtureError=String(e);await route.abort();}
});

async function interactive(){
 editing=true;wanted='env-test';
 const command="DEEPSEEK_API_KEY=env-test HOME=/tmp/key-home gucode --no-color";
 const cases=[
  {keys:['world','Control+a','hello '],want:'hello world'},
  {keys:['abd','Control+b','c','Control+e','!'],want:'abcd!'},
  {keys:['bad','Control+u','good'],want:'good'},
  {keys:['hello wrong','Control+w','world'],want:'hello world'},
  {keys:['abcdef','Home','ArrowRight','ArrowRight','Control+k','XY','Control+y'],want:'abXYcdef'},
  {keys:['1234','Home','ArrowRight','Delete','End','Backspace'],want:'13'},
  {keys:['abc','Home','Control+d'],want:'bc'},
  {keys:['가나','Backspace','다'],want:'가다'},
  {keys:['ArrowUp','Control+e','!'],want:'가다!'},
  {keys:['draft','Control+p','Control+n',' updated','Control+p','Control+n'],want:'draft updated'},
  {keys:['a'.repeat(120),'Control+a','X','Control+e','Y'],want:'X'+'a'.repeat(120)+'Y'},
  {keys:['abc','Control+l','Control+a','X'],want:'Xabc'}
 ];
 const special=new Set(['Home','End','Delete','Backspace','ArrowRight','ArrowUp']);
 async function drive(label){
  for(const original of cases){
   const test=label==='X11 xterm'?{keys:original.keys.map(k=>k.replaceAll('가','x').replaceAll('나','y').replaceAll('다','z')),want:original.want.replaceAll('가','x').replaceAll('다','z')}:original;
   const n=edited.length;
   for(const key of test.keys){
    if(key.startsWith('Control+')||special.has(key))await s.page.keyboard.press(key);
    else if(label==='X11 xterm'){for(const c of key){if(/^[A-Z]$/.test(c))await s.page.keyboard.press('Shift+Key'+c);else if(c==='!')await s.page.keyboard.press('Shift+Digit1');else await s.page.keyboard.type(c);}}
    else await s.page.keyboard.type(key);
   }
   await s.page.keyboard.press('Enter');
   const end=Date.now()+30000;
   while(edited.length===n && Date.now()<end)await s.page.waitForTimeout(50);
   assert.equal(edited.length,n+1,label+' API request');assert.equal(edited[n],test.want,label+' edited prompt');
   await s.page.waitForTimeout(150);
  }
  console.log(label+': editing passed');report.checks.push(label+': 12 real keyboard editing cases, exact provider input');
 }
 await write('/tmp/termstate.c',`#include <stdio.h>
#include <termios.h>
#include <unistd.h>
int main(void){struct termios t;if(tcgetattr(0,&t))return 1;printf("%u:%u:%u:%u",t.c_iflag,t.c_oflag,t.c_cflag,t.c_lflag);for(int i=0;i<NCCS;i++)printf(":%u",t.c_cc[i]);puts("");return 0;}
`);
 await s.command('cc /tmp/termstate.c -o /tmp/termstate');
 async function startTTY(script){
  await write('/tmp/input-test.sh','#!/bin/sh\n'+script+'\n');
  const before=await s.page.evaluate(()=>shell.busybox.log.length);
  const finished=s.page.evaluate(()=>shell.command('sh'));finished.catch(()=>{});
  await s.page.waitForFunction(()=>shell.busybox.running && shell.ui.session===shell.busybox);
  await s.page.waitForTimeout(200);
  await s.page.evaluate(()=>shell.ui.data('sh /tmp/input-test.sh; exit\n'));
  return {done:finished.then(async result=>{assert.equal(result.code,0);return s.page.evaluate(n=>shell.busybox.log.slice(n),before);})};
 }
 let offset=await s.page.evaluate(()=>shell.busybox.log.length);
 let pending=(await startTTY('before=$(/tmp/termstate) || exit 3; '+command+'; code=$?; test "$code" = 0 || exit 1; after=$(/tmp/termstate) || exit 4; test -n "$before" && test "$after" = "$before" || exit 2; echo "TERMSTATE before=$before after=$after"; echo INPUT-RESTORED')).done;pending.catch(()=>{});
 await Promise.race([s.page.waitForFunction(n=>shell.busybox.log.slice(n).includes('\x1b[?2004h'),offset,{timeout:30000}),pending.then(()=>{throw Error('Interactive process exited before editor ready');})]);
 await s.page.locator('.xterm-helper-textarea').focus();await drive('VT');
 // Exercise real bracketed-paste framing through the same terminal input route.
 let n=edited.length;
 await s.page.evaluate(()=>shell.ui.data('\x1b[200~hello\nworld\x1b[201~'));
 await s.page.keyboard.press('Enter');
 const until=Date.now()+30000;while(edited.length===n&&Date.now()<until)await s.page.waitForTimeout(50);
 assert.equal(edited[n],'hello world');await s.page.waitForTimeout(150);
 await s.page.keyboard.type('/exit');await s.page.keyboard.press('Enter');assert.match(await pending,/INPUT-RESTORED/);
 for(const key of ['Control+c','Control+d']){
  offset=await s.page.evaluate(()=>shell.busybox.log.length);
  pending=(await startTTY('before=$(/tmp/termstate) || exit 3; '+command+'; code=$?; test "$code" = '+(key==='Control+c'?130:0)+' || exit 1; after=$(/tmp/termstate) || exit 4; test -n "$before" && test "$after" = "$before" || exit 2; echo "TERMSTATE before=$before after=$after"; echo INPUT-RESTORED')).done;pending.catch(()=>{});
  await Promise.race([s.page.waitForFunction(n=>shell.busybox.log.slice(n).includes('\x1b[?2004h'),offset,{timeout:30000}),pending.then(()=>{throw Error('Interactive process exited before editor ready');})]);
  await s.page.locator('.xterm-helper-textarea').focus();await s.page.keyboard.press(key);assert.match(await pending,/INPUT-RESTORED/);
 }
 report.checks.push('VT bracketed paste and terminal restoration after exit, Ctrl-C and Ctrl-D');
 if(mode!=='build'){
  // One repository identity for the whole installed closure.
  await s.command('gucman install '+(live?'groundupcoder':'candidate')+':jwm\ngucman install '+(live?'groundupcoder':'candidate')+':xterm');
  await write('/tmp/gucode-focus.c',await readFile(new URL('../compatibility/live-desktop-focus.c',import.meta.url)));
  await s.command('cc /tmp/gucode-focus.c -I/usr/local/include -L/usr/local/lib -lX11 -lxcb -lXau -o /tmp/gucode-focus');
  await write('/tmp/gucode-xterm.sh','#!/bin/sh\nbefore=$(/tmp/termstate) || exit 3\n'+command+'\ncode=$?\ntest "$code" = 0 || exit 1\nafter=$(/tmp/termstate) || exit 4\ntest -n "$before" && test "$after" = "$before" || exit 2\nprintf "before=%s after=%s\\n" "$before" "$after" > /tmp/gucode-xterm-termstate\necho restored > /tmp/gucode-xterm-result\n');
  offset=await s.page.evaluate(()=>shell.busybox.log.length);
  pending=s.command(`set -eu
export DISPLAY=:1
Xvfb :1 -screen 0 800x600x24 -fp built-ins -noreset -ac &
server=$!
wm=
terminal=
cleanup(){ [ -z "$terminal" ] || kill "$terminal" 2>/dev/null || true; [ -z "$wm" ] || kill "$wm" 2>/dev/null || true; kill "$server" 2>/dev/null || true; wait "$server" 2>/dev/null || true; }
trap cleanup EXIT
/usr/local/libexec/jwm/wait-display
jwm -f /usr/local/share/jwm/wasm.jwmrc &
wm=$!
xterm -fn fixed -title 'Live desktop PTY' -e /bin/sh /tmp/gucode-xterm.sh &
terminal=$!
/tmp/gucode-focus
wait "$terminal"
terminal=
test "$(cat /tmp/gucode-xterm-result)" = restored
cat /tmp/gucode-xterm-termstate
jwm -exit
wait "$wm"
wm=
cleanup
trap - EXIT
echo XTERM-INPUT-RESTORED`);pending.catch(()=>{});
  await s.page.waitForFunction(n=>shell.busybox.log.slice(n).includes('LIVE-JWM-XTERM-FOCUSED'),offset);
  await s.page.locator('.vt:visible canvas').focus();
  await s.page.waitForTimeout(500);await drive('X11 xterm');
  await s.page.screenshot({path:out+'/'+mode+'-xterm.png'});
  await s.page.keyboard.type('/exit');await s.page.keyboard.press('Enter');assert.match(await pending,/XTERM-INPUT-RESTORED/);
  report.checks.push('X11 xterm termios restoration and desktop cleanup');
 }
 editing=false;
}
try{
 report.runtime=await s.page.evaluate(()=>shell.toolchain.systemBuild);assert.equal(report.runtime,expected);console.log(mode+': core ready');
 if(live){
  // Pin the old published manifest first, then upgrade through the public catalog.
  const plan=JSON.parse(await readFile(out+'/upgrade-plan.json'));
  const catalogURL='https://raw.githubusercontent.com/GroundUpCoder/gucos-packages/main/catalog.json';
  const oldCatalog={format:1,packages:{gucode:plan.upgrades.gucode.oldCatalogEntry,libcurl:JSON.parse(await readFile('catalog.json')).packages.libcurl}};
  await s.page.route(catalogURL,route=>route.fulfill({status:200,headers:cors,contentType:'application/json',body:JSON.stringify(oldCatalog)}));
  await s.command('gucman install groundupcoder:gucode');
  assert.match(await s.command('gucode --version'),/0\.1\.1/);
  await s.page.unroute(catalogURL);
  await s.command('gucman install groundupcoder:gucode');
  report.checks.push('public upgrade 0.1.1 to 0.1.2');
 }else{
  const {inputs,...recipe}=JSON.parse(await readFile('apps/gucode/recipe.json'));
  const outputs=JSON.parse(await readFile('apps/gucode/outputs.json')),files=[];
  for(const path of inputs){const b=await readFile('apps/gucode/'+path);extra.set('/candidate/'+path,b);files.push({path,url:s.url+'/candidate/'+path,sha256:sha(b),size:b.length});}
  const manifest={format:1,...recipe,files,build:'build.sh',test:'test.sh',outputs,licenses:outputs.filter(o=>o.path.startsWith('share/licenses/')).map(o=>o.path)};
  if(mode==='binary'){
   const receipt=JSON.parse(await readFile('apps/gucode/binaries/receipt.json')),b=await readFile('apps/gucode/binaries/'+receipt.sha256+'.tar');
   extra.set('/candidate/binary.tar',b);Object.assign(manifest,{runtime:receipt.runtime,binary:{url:s.url+'/candidate/binary.tar',sha256:sha(b),size:b.length}});
  }
  const bytes=Buffer.from(JSON.stringify(manifest));extra.set('/candidate/package.json',bytes);
  const catalog=JSON.parse(await readFile('catalog.json'));catalog.packages.gucode={url:s.url+'/candidate/package.json',sha256:sha(bytes),size:bytes.length};extra.set('/candidate/catalog.json',Buffer.from(JSON.stringify(catalog)));
  await s.command('gucman repo remove groundupcoder\ngucman repo add candidate '+s.url+'/candidate/catalog.json\ngucman '+(mode==='build'?'build':'install')+' candidate:gucode');
  report.checks.push(mode==='build'?'real guest source build':'fresh binary install');console.log(mode+': package installed');
  if(mode==='build'){
   await s.command('gucman pack gucode /tmp/gucode.tar');const b=await read('/tmp/gucode.tar'),hash=sha(b);
   await writeFile('apps/gucode/binaries/'+hash+'.tar',b);
   const guestManifest=JSON.parse(await read('/usr/local/lib/gucman/packages/gucode/current/manifest.json'));assert.deepEqual(guestManifest,manifest);
   await writeFile('apps/gucode/binaries/receipt.json',JSON.stringify({runtime:report.runtime,sha256:hash,size:b.length,guestManifest,method:'Actual guest gucman build/test and pack on platform 1.0.1'},null,2)+'\n');
  }
 }
 assert.match(await s.command('gucode --version'),/0\.1\.2/);
 const receipt=JSON.parse(await readFile('apps/gucode/binaries/receipt.json'));
 report.binary={sha256:receipt.sha256,size:receipt.size};report.sourceArchiveSha256=JSON.parse(await readFile('apps/gucode/provenance.json')).sourceArchiveSha256;
 const {execFileSync}=await import('node:child_process');
 async function verify(){for(const o of JSON.parse(await readFile('apps/gucode/outputs.json'))){const b=await read('/usr/local/'+o.path);assert.equal(sha(b),sha(execFileSync('tar',['-xOf','apps/gucode/binaries/'+receipt.sha256+'.tar',o.path])));}}
 await verify();
 await s.command('mkdir -p /tmp/key-home/.guc/creds /tmp/key-task');
 await write('/tmp/key-home/.guc/creds/deepseek-api-key','default-test\r\n');await write('/tmp/explicit-key','explicit-test');
 async function run(key,args=''){wanted=key;const before=requests;const log=await s.command('HOME=/tmp/key-home DEEPSEEK_API_KEY=env-test gucode --yolo --no-color -C /tmp/key-task '+args+' -p '+quote('Write result.txt then check it using shell'));assert.equal(requests-before,3);assert(!log.includes('Allow this action?'));assert.equal((await read('/tmp/key-task/result.txt')).toString(),'updated\n');}
 await run('default-test','--key-file /tmp/explicit-key');report.checks.push('default key overrides explicit and environment; yolo permits edit and shell');
 await s.page.reload();await s.page.waitForFunction(()=>window.shell?.ready);await s.command('gucode --version');await verify();await run('default-test');report.checks.push('reload payloads and default key');
 await s.command('rm /tmp/key-home/.guc/creds/deepseek-api-key');await run('explicit-test','--key-file /tmp/explicit-key');await run('env-test');report.checks.push('explicit and environment fallbacks');
 await write('/tmp/key-task/invalid.dat',Buffer.from([0xff,0xed,0xa0,0x80,0x74,0x61,0x69,0x6c]));
 binaryOutput=true;await run('env-test','--session binary-session.json');
 JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await read('/tmp/key-task/binary-session.json')));
 report.checks.push('raw /bin/cc output and malformed UTF-8 produce valid API requests and saved JSON');
 await write('/tmp/key-task/damaged.json',Buffer.concat([Buffer.from('[{"role":"user","content":"old"},{"role":"assistant","content":"bad '),Buffer.from([0xff,0xed,0xa0,0x80]),Buffer.from(' tail"}]')]));
 await run('env-test','--session damaged.json');
 const repaired=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await read('/tmp/key-task/damaged.json')));assert(repaired[1].content.includes('�'));
 report.checks.push('damaged saved conversation repaired on resume');
 await interactive();
 assert(!report.fixtureError);report.status='passed';console.log(mode+': all acceptance checks passed');
}catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}
finally{try{await writeFile(out+'/'+mode+'.log',await s.page.evaluate(()=>shell.busybox?.log||''));await s.page.screenshot({path:out+'/'+mode+'-final.png'});}catch{}report.finishedAt=new Date().toISOString();await writeFile(out+'/'+mode+'.json',JSON.stringify(report,null,2)+'\n');await s.close();}
// Keep source and fresh-binary acceptance in the same browser reservation,
// with each browser closed before the next one starts.
if(mode==='build'){
 const {execFileSync}=await import('node:child_process');
 execFileSync(process.execPath,[process.argv[1],'binary'],{stdio:'inherit',env:process.env});
}
