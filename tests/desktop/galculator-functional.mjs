// PRIVATE PROPOSAL. Independent B review required before any execution/copy.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const sha=b=>createHash('sha256').update(b).digest('hex');
const repo=resolve(process.env.MIGRATION_REPO_ROOT||'.');
const run=resolve(process.env.COMPAT_RUN_DIR||'.');
const attempt=process.env.MIGRATION_ATTEMPT;
const phase=process.argv[2];assert(['normal','reload'].includes(phase));
const require=createRequire(resolve(repo,'tests/migration/package.json'));
const {PNG}=require('pngjs');
assert(process.env.MACHINE_JOB_ID,'Real browser reservation required');
assert(process.env.MIGRATION_REPO_ROOT&&process.env.COMPAT_RUN_DIR);
assert(/^[A-Za-z0-9_-]{1,40}$/.test(attempt||''));
assert(/^[a-f0-9]{64}$/.test(process.env.GALCULATOR_REVIEWED_BINARY_SHA256||''),'Explicit reviewed corrected export required');
assert(process.env.GALCULATOR_OLD_RUN_DIR,'Old failed fixture path required for exclusion');
const old=await realpath(process.env.GALCULATOR_OLD_RUN_DIR);
assert.notEqual(await realpath(run),old);
assert(!(await realpath(run)).startsWith(old+'/'),'No nested old evidence/profile path');
assert.notEqual(await realpath(resolve(run,'profile')),await realpath(resolve(old,'profile')),'Never open old profile');
const stem='galculator-functional-'+attempt;
const output=resolve(run,stem+'-'+phase);
const statePath=resolve(run,stem+'-normal-state.json');
let prior,retainedConfig;
await mkdir(output); // Exclusive directory creation: never overwrite evidence.
const guest='/home/user/'+stem+'-'+phase;
const configPath='/home/user/.config/galculator/galculator.conf';
const report={status:'running',startedAt:new Date().toISOString(),scope:'Proposed instrumented supervised menu; numeric GUI and Scientific-mode config persistence. No remembered display value claim.',phase,cases:[],guest};
let s,d;const errors=[];
const host=(name,data)=>writeFile(resolve(output,name),data,{flag:'wx'});
async function bounded(p,ms,label){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label)),ms);})]);}finally{clearTimeout(timer);}}
const load=async path=>import(pathToFileURL(resolve(repo,path)));
const {session}=await load('tests/compatibility/session.mjs');
const {installObserver,observe,rootMenuRows}=await load('tests/desktop/menu-xapps.mjs');
const {visibleCanvas,canvasPosition}=await load('tests/migration/canvas.mjs');
const {desktopSession}=await import('./galculator-functional-session.mjs');
const fatal=/fatal:\s*wasm trap|\bpid \d+(?: thread \d+)? crashed:|RuntimeError:|uncaught|unhandled.*rejection|\[galculator\] configuration file: (?:Failed to create directory|couldn.t save\/write)/i;
async function readGuest(path){return Buffer.from(await bounded(s.page.evaluate(async path=>{const b=await shell.busybox.read(path);if(!ArrayBuffer.isView(b))throw Error('Missing guest evidence: '+path);return Array.from(b);},path),15000,'Guest evidence read timeout'));}
async function put(path,bytes){await bounded(s.page.evaluate(async({path,bytes})=>shell.busybox.write(path,Uint8Array.from(bytes)),{path,bytes:Array.from(Buffer.from(bytes))}),15000,'Guest upload timeout');}
async function rawLog(){const text=await bounded(s.page.evaluate(()=>shell.busybox.log),5000,'Raw log timeout');assert.equal(typeof text,'string');return text;}
async function noCrash(){const text=await rawLog();assert(!fatal.test(text),'Fatal/crash evidence in session');assert.deepEqual(errors,[]);return text;}
try{
 const configBytes=await readFile(resolve(run,'config.json')),config=JSON.parse(configBytes);
 const candidateBytes=await readFile(resolve(run,'candidate-manifests.json')),m=JSON.parse(candidateBytes).galculator;
 assert(m?.binary&&m.runtime===config.expectedRuntime,'Frozen corrected binary fixture required');
 assert.equal(m.binary.sha256,process.env.GALCULATOR_REVIEWED_BINARY_SHA256);
 assert.notEqual(m.binary.sha256,'d8c2501adcf66ecb631bef119b8e1459f434472fcb28bbbad486ac7ff8f1e994','Known broken export');
 const base=resolve(config.inputDist||config.dist,'migration/galculator');
 assert.deepEqual(JSON.parse(await readFile(resolve(base,'package.json'))),m);
 for(const [name,hash] of [['source.tar','672d2a942776a4e29bbe6363fd75af469d1e218fbb17a789c0bc1ad6bc7f24ec'],['main-config-dirs.c','40524cf68df22dc2a4a57188c68cbe162593ecf666a9f39f47a7d96e7297fbe0'],['build.sh','255de6e063b89197421dd8c41282ede46417edaa0496f9a25528fb2793ee685e']]){
  assert.equal(m.files.find(f=>f.path===name)?.sha256,hash,'Requires eba5f3d reviewed input');
 }
 for(const f of m.files){assert(/^[A-Za-z0-9_.-]+$/.test(f.path));const b=await readFile(resolve(base,f.path));assert.equal(b.length,f.size);assert.equal(sha(b),f.sha256);}
 const archive=await readFile(resolve(base,'binary.tar'));assert.equal(archive.length,m.binary.size);assert.equal(sha(archive),m.binary.sha256);
 const sums=await readFile(resolve(run,'galculator.sha256'),'utf8'),map={};
 for(const line of sums.trimEnd().split('\n')){const x=/^([a-f0-9]{64})  \/usr\/local\/([A-Za-z0-9_.\/+@-]+)$/.exec(line);assert(x);assert(!x[2].split('/').some(p=>!p||p==='.'||p==='..'));assert(!Object.hasOwn(map,x[2]));map[x[2]]=x[1];}
 assert.deepEqual(Object.keys(map).sort(),m.outputs.map(o=>o.path).sort());
 // Read-only archive validation: all regular members, exact names/modes/hashes.
 const validation=execFileSync('python3',['-c',`import sys,json,tarfile,hashlib
v=json.load(sys.stdin)
with tarfile.open(sys.argv[1]) as t:
 ms=t.getmembers();assert len(ms)==len(v['outputs'])
 assert all(m.isfile() for m in ms)
 assert {m.name:m.mode for m in ms}=={o['path']:o['mode'] for o in v['outputs']}
 for m in ms:assert hashlib.sha256(t.extractfile(m).read()).hexdigest()==v['hashes'][m.name]
print('EXACT-BINARY-OUTPUTS-PASS')`,resolve(base,'binary.tar')],{input:JSON.stringify({outputs:m.outputs,hashes:map}),timeout:30000}).toString();
 report.binding={runtime:m.runtime,inputCommit:config.inputCommit,binary:m.binary,configSha256:sha(configBytes),candidateSha256:sha(candidateBytes),checksumsSha256:sha(sums),validation};
 if(config.dist){const b=await readFile(resolve(run,'dist-files.json'));assert.equal(sha(b),config.distributionSnapshotSha256);report.binding.distributionSnapshotSha256=sha(b);}
 report.sourceHashes={};
 for(const name of ['galculator-functional.mjs','galculator-functional-session.mjs','galculator-functional-supervisor.c']){const b=await readFile(new URL(name,import.meta.url));report.sourceHashes[name]=sha(b);await host(name,b);}
 if(phase==='reload'){
  prior=JSON.parse(await readFile(statePath));
  const b=await readFile(resolve(run,stem+'-normal/report.json'));assert.equal(sha(b),prior.normalReportSha256);
  const r=JSON.parse(b);assert.equal(r.status,'passed-normal');assert.deepEqual(prior.binding,report.binding);assert.deepEqual(prior.sourceHashes,report.sourceHashes);
  retainedConfig=await readFile(resolve(run,stem+'-normal/retained-config.conf'));assert.equal(sha(retainedConfig),prior.config.sha256);assert.equal(retainedConfig.length,prior.config.size);
 }
 s=await session();s.page.on('pageerror',e=>errors.push(String(e)));assert.equal(s.runtime,m.runtime);
 if(phase==='reload'){await s.page.reload({timeout:120000});await s.page.waitForFunction(()=>window.shell?.ready,null,{timeout:120000});assert.equal(await s.page.evaluate(()=>shell.toolchain.systemBuild),m.runtime);report.browserReloaded=true;}
 await s.command('true');
 if(phase==='normal'){report.absentParentEvidence=await s.command('set -eu\ntest "$HOME" = /home/user\ntest -z "${GALCULATOR_CONFIG+x}"\ntest -z "${XDG_CONFIG_HOME+x}"\ntest ! -e /home/user/.config\ntest ! -L /home/user/.config\ntest ! -e /home/user/.galculator\necho GALCULATOR-CONFIG-PARENT-ABSENT');}
 else {await s.command('set -eu\ntest -z "${GALCULATOR_CONFIG+x}"\ntest -z "${XDG_CONFIG_HOME+x}"');assert.deepEqual(await readGuest(configPath),retainedConfig);}
 assert.equal(await s.page.evaluate(()=>[...shell.busybox.windows.values()].filter(w=>w.shown).length),0);
 const installed=JSON.parse((await readGuest('/usr/local/lib/gucman/packages/galculator/current/manifest.json')).toString());assert.deepEqual(installed,m);
 await s.command(`set -eu\ntest ! -e ${guest}\nmkdir ${guest}`);
 await put(guest+'/galculator.sha256',sums);await s.command(`sha256sum -c ${guest}/galculator.sha256`);
 const entry=await readGuest('/usr/local/share/applications/galculator.desktop');report.ownedEntry={sha256:sha(entry),text:entry.toString()};await host('owned-galculator.desktop',entry);
 assert.match(entry.toString(),/^Exec=galculator$/m);
 // Preserve/record original configuration and exact generated owned menu.
 const configOriginal=(await readGuest('/usr/local/share/jwm/wasm.jwmrc')).toString();await host('original-jwmrc',configOriginal);
 const originalMenu=await s.command('sh /usr/local/share/jwm/app-menu.sh');await host('original-menu.xml',originalMenu);
 const command='/usr/local/bin/desktop-menu launch galculator.desktop';
 assert.equal(originalMenu.split('>'+command+'</Program>').length,2,'Exactly one owned menu command required');
 const include='<Include>exec:/bin/sh /usr/local/share/jwm/app-menu.sh</Include>';
 assert.equal(configOriginal.split(include).length,2,'Expected JWM include required');
 // WM close button geometry is bound to this exact retained flat theme.
 assert(configOriginal.includes('<Height>24</Height>')&&configOriginal.includes('decorations="flat"'));
 const source=await readFile(new URL('./galculator-functional-supervisor.c',import.meta.url));await put(guest+'/supervisor.c',source);
 report.supervisorCompile=await s.command(`set -eu\nprintf '${sha(source)}  ${guest}/supervisor.c\\n' | sha256sum -c -\ncc ${guest}/supervisor.c -o ${guest}/supervisor\nsha256sum ${guest}/supervisor`);
 report.observer=await installObserver(s);
 function parseConfig(bytes){
  const text=bytes.toString('utf8');assert(text.length>0&&!text.includes('\u0000'));const sections={};let section;
  for(const raw of text.split('\n')){const line=raw.trim();if(!line||line.startsWith('#'))continue;
   const h=/^\[([^\]]+)\]$/.exec(line);if(h){section=h[1];assert(!Object.hasOwn(sections,section));sections[section]={};continue;}
   assert(section,'Config key before section');const eq=line.indexOf('=');assert(eq>0);const key=line.slice(0,eq),value=line.slice(eq+1);assert(!Object.hasOwn(sections[section],key),'Duplicate config key');sections[section][key]=value;
  }
  assert.deepEqual(Object.keys(sections).sort(),['constants','general','user functions']);
  assert.equal(sections.general.mode,'1','SCIENTIFIC_MODE enum is 1');assert(Object.keys(sections.general).length>=40);
  for(const [k,v] of Object.entries(sections.general)){assert(/^[a-z_]+$/.test(k));assert(/^(?:"[^\n]*"|true|false|-?\d+)$/.test(v),'Malformed general config value');}
  return {size:bytes.length,sha256:sha(bytes),mode:1,generalKeys:Object.keys(sections.general).length};
 }
 let firstPid;
 for(const mode of (phase==='normal'?['first','relaunch']:['first'])){
  const g=guest+'/'+mode,c={mode,status:'running',startedAt:new Date().toISOString()};report.cases.push(c);
  await s.command(`mkdir ${g}`);
  const menu=originalMenu.replace('>'+command+'</Program>','>'+guest+'/supervisor '+g+'</Program>');
  const jwmrc=configOriginal.replace(include,'<Include>'+g+'/menu.xml</Include>');
  await host(mode+'-menu.xml',menu);await host(mode+'-jwmrc',jwmrc);await put(g+'/menu.xml',menu);await put(g+'/jwmrc',jwmrc);
  c.launch={instrumented:true,supervisor:guest+'/supervisor',delegates:command,menuSha256:sha(menu),jwmrcSha256:sha(jwmrc)};
  d=await desktopSession(s,{configPath:g+'/jwmrc',controlPath:g+'/control'});c.helpers=d.helper;
  if(phase==='normal'&&mode==='first'){
   c.immediateAbsentParent=await d.command('set -eu\ntest ! -e /home/user/.config\ntest ! -L /home/user/.config\necho GALCULATOR-PRELAUNCH-PARENT-ABSENT');
  }else assert.deepEqual(await readGuest(configPath),retainedConfig,'Config must survive before relaunch unchanged');
  const canvas=await visibleCanvas(s.page),rows=rootMenuRows(menu),index=rows.findIndex(r=>r.includes('>'+guest+'/supervisor '+g+'</Program>'));assert(index>=0);
  await canvas.click({position:await canvasPosition(canvas,{x:10,y:585})});const popup=await observe(d,'menu');
  await canvas.click({position:await canvasPosition(canvas,{x:popup.x+popup.width/2,y:popup.y+1+(index+0.5)*(popup.height-2)/(rows.length+2)})});
  c.menu={index,popup};const title='galculator';c.main=await observe(d,'window',title);
  const pid=Number((await readGuest(g+'/child.pid')).toString().trim());assert(Number.isSafeInteger(pid)&&pid>0);assert.equal(c.main.pid,pid);
  c.supervisorPid=Number((await readGuest(g+'/supervisor.pid')).toString().trim());assert(c.supervisorPid>0&&c.supervisorPid!==pid);
  if(firstPid!==undefined)assert.notEqual(pid,firstPid,'Fresh PID required for normal relaunch');else firstPid=pid;
  await canvas.click({position:await canvasPosition(canvas,{x:c.main.x+c.main.width/2,y:c.main.y-12})});
  async function screen(label){await noCrash();await host(mode+'-'+label+'.png',await canvas.screenshot());}
  if(phase==='normal'&&mode==='first'){
   assert.equal(c.main.width,366);assert.equal(c.main.height,347);await screen('initial-basic');
   c.parentCreated=await d.command('set -eu\ntest -d /home/user/.config\ntest -d /home/user/.config/galculator\necho GALCULATOR-APP-CREATED-CONFIG-DIRS');
   await s.page.keyboard.press('Alt+v');await s.page.waitForTimeout(250);await screen('view-menu');
   await s.page.keyboard.press('Home');await s.page.keyboard.press('ArrowDown');await s.page.keyboard.press('Enter');
  }
  // Retained layout6b7bd7b: exact scientific size. Fresh/reload phases never change mode.
  let w,previous,stable=0;
  for(let i=0;i<20;i++){w=await observe(d,'window',title);assert.equal(w.pid,pid);const key=JSON.stringify(w);stable=key===previous?stable+1:0;previous=key;if(w.width===682&&w.height===319&&stable>=2)break;await s.page.waitForTimeout(250);}
  assert(w.width===682&&w.height===319&&stable>=2,'Scientific layout not restored');c.scientific=w;await screen('scientific');
  // Crop only numeric display, excluding notation/module row and button focus.
  // Coordinates are client-relative and bound to the retained682x319 layout.
  async function numericSample(){
   const current=await observe(d,'window',title);assert.deepEqual(current,w,'Numeric layout moved/changed');
   const box=await canvas.boundingBox();assert(box);
   const parked=await canvasPosition(canvas,{x:790,y:590});await s.page.mouse.move(box.x+parked.x,box.y+parked.y);
   const a=await canvasPosition(canvas,{x:w.x+340,y:w.y+32}),b=await canvasPosition(canvas,{x:w.x+550,y:w.y+82});
   const png=PNG.sync.read(await canvas.screenshot());const sx=png.width/box.width,sy=png.height/box.height;
   const x=Math.round(a.x*sx),y=Math.round(a.y*sy),width=Math.round(b.x*sx)-x,height=Math.round(b.y*sy)-y;
   assert(width>100&&height>20&&x>=0&&y>=0&&x+width<=png.width&&y+height<=png.height);
   const crop=new PNG({width,height});PNG.bitblt(png,crop,x,y,width,height,0,0);
   return {bytes:PNG.sync.write(crop),pixels:Buffer.from(crop.data),width,height};
  }
  async function numeric(label){let last,stable=0,value;
   for(let i=0;i<20;i++){value=await numericSample();const h=sha(value.pixels);stable=h===last?stable+1:0;last=h;if(stable>=2)break;await s.page.waitForTimeout(150);}
   assert(stable>=2,'Numeric display did not settle');await noCrash();await host(mode+'-'+label+'-numeric.png',value.bytes);await screen(label);
   (c.numeric??={})[label]={sha256:sha(value.pixels),width:value.width,height:value.height};return value;
  }
  async function digits(text){await s.page.keyboard.press('Escape');for(const ch of text)await s.page.keyboard.press(ch);}
  // Independent direct-digit references and negative controls, newly captured each launch.
  await digits('0');const zero=await numeric('reference-0');
  await digits('3');const three=await numeric('reference-3');
  await digits('12');const twelve=await numeric('reference-12');
  await digits('144');const square=await numeric('reference-144');
  assert.equal(new Set([zero,three,twelve,square].map(x=>sha(x.pixels))).size,4,'Blank/stuck/non-discriminating display');
  await digits('1');await s.page.keyboard.press('Shift+Equal');await s.page.keyboard.press('2');await s.page.keyboard.press('Enter');
  const sum=await numeric('one-plus-two');assert.deepEqual(sum.pixels,three.pixels);assert.notDeepEqual(sum.pixels,twelve.pixels);assert.notDeepEqual(sum.pixels,zero.pixels);
  await digits('12');const before=await numeric('before-square');assert.deepEqual(before.pixels,twelve.pixels);
  // Actual x^2 button center from retained Scientific screenshot, client-relative.
  await canvas.click({position:await canvasPosition(canvas,{x:w.x+111,y:w.y+215})});
  const squared=await numeric('twelve-squared');assert.deepEqual(squared.pixels,square.pixels);assert.notDeepEqual(squared.pixels,before.pixels);
  c.arithmetic='1+2 equals direct3 and differs from12/0; physical x^2 on12 equals direct144 and differs from12';
  await s.page.keyboard.press('Control+q');
  await bounded(s.page.waitForFunction(async path=>{const b=await shell.busybox.read(path);return ArrayBuffer.isView(b)&&new TextDecoder().decode(b)==='done\n';},g+'/done',{timeout:15000}),18000,'Supervisor did not finish');
  const resultBytes=await readGuest(g+'/result.json');await host(mode+'-waitpid.json',resultBytes);c.exit=JSON.parse(resultBytes.toString());
  assert.equal(c.exit.pid,pid);assert.equal(c.exit.exited,1);assert.equal(c.exit.exitCode,0);assert.equal(c.exit.signaled,0);assert.equal(c.exit.signal,0);assert.equal(c.exit.rawStatus,0);
  await observe(d,'absent',title);await noCrash();
  await d.command(`set -eu\n! kill -0 ${pid} 2>/dev/null\nsha256sum -c ${guest}/galculator.sha256\ntest -f ${configPath}\ntest ! -L ${configPath}`);
  const bytes=await readGuest(configPath);c.config=parseConfig(bytes);await host(mode+'-config.conf',bytes);
  if(!retainedConfig){retainedConfig=bytes;report.retainedConfig=c.config;await host('retained-config.conf',bytes);}
  else {assert.deepEqual(bytes,retainedConfig,'Actual application save changed retained config bytes');report.retainedConfig=c.config;}
  const log=await noCrash();await host(mode+'-session.log',log);c.sessionLogSha256=sha(log);
  await d.finish();d=null;await s.command('echo GALCULATOR-FUNCTIONAL-TERMINAL-RESTORED');await noCrash();
  c.status='passed';c.finishedAt=new Date().toISOString();
 }
 report.status='passed-'+phase;
}catch(e){report.status='failed';report.error=String(e.stack||e);}
finally{
 if(s){
  try{const log=await rawLog();await host('session.log',log);report.sessionLogSha256=sha(log);assert(!fatal.test(log),'Fatal/crash evidence');assert.deepEqual(errors,[]);}catch(e){report.status='failed';report.logError=String(e.stack||e);}
  // No d.finish on failure: it may kill a client and conceal the failure cause.
  // Browser closure is failure containment, never proof of normal exit.
  try{await bounded(s.close(),30000,'Browser close timeout');}catch(e){report.status='failed';report.cleanupError=String(e);}
 }
 report.finishedAt=new Date().toISOString();const finalBytes=JSON.stringify(report,null,2)+'\n';await host('report.json',finalBytes);
 if(report.status==='passed-normal')await writeFile(statePath,JSON.stringify({normalReportSha256:sha(finalBytes),binding:report.binding,sourceHashes:report.sourceHashes,config:report.retainedConfig},null,2)+'\n',{flag:'wx'});
 if(report.status==='failed')process.exitCode=1;
}
