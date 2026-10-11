// Private B discovery adaptation of A layout/supervision; independent A review required.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyStream} from './xarchiver-bzip2-oracle.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const repo=resolve(process.env.MIGRATION_REPO_ROOT||'.');
const run=resolve(process.env.COMPAT_RUN_DIR||'.');
const attempt=process.env.MIGRATION_ATTEMPT;
assert(process.env.MACHINE_JOB_ID,'Real browser reservation required');
assert(process.env.MIGRATION_REPO_ROOT&&process.env.COMPAT_RUN_DIR);
assert(/^[A-Za-z0-9_-]{1,40}$/.test(attempt||''));
assert(/^[a-f0-9]{64}$/.test(process.env.XARCHIVER_REVIEWED_BINARY_SHA256||''),'Explicit reviewed corrected export required');
assert(process.env.XARCHIVER_OLD_RUN_DIR,'Old failed fixture path required for exclusion');
const old=await realpath(process.env.XARCHIVER_OLD_RUN_DIR);
assert.notEqual(await realpath(run),old);
assert(!(await realpath(run)).startsWith(old+'/'),'No nested old evidence/profile path');
assert.notEqual(await realpath(resolve(run,'profile')),await realpath(resolve(old,'profile')),'Never open old profile');
const output=resolve(run,'xarchiver-bzip2-discovery-'+attempt);
await mkdir(output); // Exclusive directory creation: never overwrite evidence.
const guest='/home/user/xarchiver-bzip2-discovery-'+attempt;
const report={machineJobId:process.env.MACHINE_JOB_ID,attempt,status:'running',startedAt:new Date().toISOString(),scope:'Instrumented private JWM menu command -> unmodified owned desktop-menu entry -> package wrapper. DISCOVERY ONLY: host-seeded reference stream, cancelled Add/Extract, Test presentation, two supervised exits. No GUI creation/extraction/test success or persistence claim.',cases:[],guest};
let s,d;const errors=[];
const host=(name,data)=>writeFile(resolve(output,name),data,{flag:'wx'});
async function bounded(p,ms,label){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label)),ms);})]);}finally{clearTimeout(timer);}}
const load=async path=>import(pathToFileURL(resolve(repo,path)));
const {session}=await load('tests/compatibility/session.mjs');
const {installObserver,observe,rootMenuRows}=await load('tests/desktop/menu-xapps.mjs');
const {visibleCanvas,canvasPosition}=await load('tests/migration/canvas.mjs');
const {desktopSession}=await import('./xarchiver-bzip2-discovery-session.mjs');
const {poll}=await load('tests/desktop/poll.mjs');
const fatal=/fatal:\s*wasm trap|\bpid \d+(?: thread \d+)? crashed:|RuntimeError:|uncaught|unhandled.*rejection/i;
async function readGuest(path){return Buffer.from(await bounded(s.page.evaluate(async path=>{const b=await shell.busybox.read(path);if(!ArrayBuffer.isView(b))throw Error('Missing guest evidence: '+path);return Array.from(b);},path),15000,'Guest evidence read timeout'));}
async function put(path,bytes){await bounded(s.page.evaluate(async({path,bytes})=>shell.busybox.write(path,Uint8Array.from(bytes)),{path,bytes:Array.from(Buffer.from(bytes))}),15000,'Guest upload timeout');}
async function rawLog(){const text=await bounded(s.page.evaluate(()=>shell.busybox.log),5000,'Raw log timeout');assert.equal(typeof text,'string');return text;}
async function noCrash(){const text=await rawLog();assert(!fatal.test(text),'Fatal/crash evidence in session');assert.deepEqual(errors,[]);return text;}
try{
 report.awaitedPollHelperSha256=sha(await readFile(resolve(repo,'tests/desktop/poll.mjs')));
 const configBytes=await readFile(resolve(run,'config.json')),config=JSON.parse(configBytes);
 const candidateBytes=await readFile(resolve(run,'candidate-manifests.json')),m=JSON.parse(candidateBytes).xarchiver;
 assert(m?.binary&&m.runtime===config.expectedRuntime,'Frozen corrected binary fixture required');
 assert.equal(m.binary.sha256,process.env.XARCHIVER_REVIEWED_BINARY_SHA256);
 assert.notEqual(m.binary.sha256,'a309654d4252f17f0b527337f1adb7df5081e13a224253a162dc340744b8eeb8','Known broken export');
 const base=resolve(config.inputDist||config.dist,'migration/xarchiver');
 assert.deepEqual(JSON.parse(await readFile(resolve(base,'package.json'))),m);
 for(const [name,hash] of [['source.tar','3079314237de853ead97dd53edecdb01d4d0be4e60a2350c4cb94189769994bf'],['interface-signal-abi.c','f464b9a2c5b9f0f89061fa32ddd3739f1be699ee42006307b0ff948a0985c7bf'],['build.sh','923c0b58fb0820b8da996465b542115a2375d2b2c47cc2fe42d7be56e465f1f6']]){
  assert.equal(m.files.find(f=>f.path===name)?.sha256,hash,'Requires c79bd05 reviewed input');
 }
 for(const f of m.files){assert(/^[A-Za-z0-9_.-]+$/.test(f.path));const b=await readFile(resolve(base,f.path));assert.equal(b.length,f.size);assert.equal(sha(b),f.sha256);}
 const archive=await readFile(resolve(base,'binary.tar'));assert.equal(archive.length,m.binary.size);assert.equal(sha(archive),m.binary.sha256);
 const sums=await readFile(resolve(run,'xarchiver.sha256'),'utf8'),map={};
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
 for(const name of ['xarchiver-bzip2-discovery.mjs','xarchiver-bzip2-discovery-session.mjs','xarchiver-bzip2-discovery-supervisor.c','probe.txt','probe.txt.bz2','xarchiver-bzip2-oracle.mjs']){const b=await readFile(new URL(name,import.meta.url));report.sourceHashes[name]=sha(b);await host(name,b);}
 const fixture=await readFile(new URL('./probe.txt',import.meta.url)),reference=await readFile(new URL('./probe.txt.bz2',import.meta.url));
 assert.equal(fixture.length,704);assert.equal(sha(fixture),'d3bb834b4ecb3448ba96eb107faad279ee47bc647ca4a93bf68cb0b39f7788c4');
 verifyStream(reference);
 report.reference={fixtureSha256:sha(fixture),archiveSha256:sha(reference),archiveSize:reference.length,origin:'HOST-SEEDED DISCOVERY REFERENCE; NOT GUI CREATED'};
 const beforeBytes=await readFile(resolve(run,'migration-closure-xarchiver-'+attempt+'-normal-before/report.json')),before=JSON.parse(beforeBytes);
 assert.equal(before.status,'passed-closure');assert.equal(before.app,'xarchiver');assert.equal(before.phase,'normal');assert.equal(before.edge,'before');assert.equal(before.attempt,attempt);assert.equal(before.machineJobId,process.env.MACHINE_JOB_ID);
 assert.equal(before.binding.profile,await realpath(resolve(run,'profile')));assert.equal(before.binding.configSha256,sha(configBytes));assert.equal(before.binding.candidateSha256,sha(candidateBytes));
 assert.deepEqual(before.binding.driverSources,report.sourceHashes);report.closureBeforeSha256=sha(beforeBytes);
 s=await session();s.page.on('pageerror',e=>errors.push(String(e)));assert.equal(s.runtime,m.runtime);await s.command('true');
 assert.equal(await s.page.evaluate(()=>[...shell.busybox.windows.values()].filter(w=>w.shown).length),0);
 const installed=JSON.parse((await readGuest('/usr/local/lib/gucman/packages/xarchiver/current/manifest.json')).toString());assert.deepEqual(installed,m);
 await s.command(`set -eu\ntest ! -e ${guest}\nmkdir ${guest}`);
 await s.command(`set -eu\nmkdir ${guest}/input ${guest}/cancel-empty\ntest ! -e ${guest}/new-probe.txt.bz2\ntest ! -L ${guest}/new-probe.txt.bz2`);
 await put(guest+'/input/probe.txt',fixture);await put(guest+'/probe.txt.bz2',reference);
 const provider=await s.command("set -eu\ntest \"$(command -v bzip2)\" = /usr/local/bin/bzip2\ntest \"$(readlink -f /usr/local/bin/bzip2)\" = \"$(readlink -f /usr/local/lib/gucman/packages/bzip2/current/bin/bzip2)\"\nprintf 'OWNED-BZIP2-PROVIDER\\n'");report.provider=provider;
 await put(guest+'/xarchiver.sha256',sums);await s.command(`sha256sum -c ${guest}/xarchiver.sha256`);
 const entry=await readGuest('/usr/local/share/applications/xarchiver.desktop');report.ownedEntry={sha256:sha(entry),text:entry.toString()};await host('owned-xarchiver.desktop',entry);
 assert.match(entry.toString(),/^Exec=xarchiver %f$/m);
 // Preserve/record original configuration and exact generated owned menu.
 const configOriginal=(await readGuest('/usr/local/share/jwm/wasm.jwmrc')).toString();await host('original-jwmrc',configOriginal);
 const originalMenu=await s.command('sh /usr/local/share/jwm/app-menu.sh');await host('original-menu.xml',originalMenu);
 const command='/usr/local/bin/desktop-menu launch xarchiver.desktop';
 assert.equal(originalMenu.split('>'+command+'</Program>').length,2,'Exactly one owned menu command required');
 const include='<Include>exec:/bin/sh /usr/local/share/jwm/app-menu.sh</Include>';
 assert.equal(configOriginal.split(include).length,2,'Expected JWM include required');
 // WM close button geometry is bound to this exact retained flat theme.
 assert(configOriginal.includes('<Height>24</Height>')&&configOriginal.includes('decorations="flat"'));
 const source=await readFile(new URL('./xarchiver-bzip2-discovery-supervisor.c',import.meta.url));await put(guest+'/supervisor.c',source);
 report.supervisorCompile=await s.command(`set -eu\nprintf '${sha(source)}  ${guest}/supervisor.c\\n' | sha256sum -c -\ncc ${guest}/supervisor.c -o ${guest}/supervisor\nsha256sum ${guest}/supervisor`);
 report.observer=await installObserver(s);
 for(const mode of ['add-cancel','reference']){
  const g=guest+'/'+mode,c={mode,status:'running',startedAt:new Date().toISOString()};report.cases.push(c);
  await s.command(`mkdir ${g}`);
  const menu=originalMenu.replace('>'+command+'</Program>','>'+guest+'/supervisor '+g+'</Program>');
  const jwmrc=configOriginal.replace(include,'<Include>'+g+'/menu.xml</Include>');
  await host(mode+'-menu.xml',menu);await host(mode+'-jwmrc',jwmrc);await put(g+'/menu.xml',menu);await put(g+'/jwmrc',jwmrc);
  c.launch={instrumented:true,supervisor:guest+'/supervisor',delegates:command,menuSha256:sha(menu),jwmrcSha256:sha(jwmrc)};
  d=await desktopSession(s,{configPath:g+'/jwmrc',controlPath:g+'/control'});c.helpers=d.helper;
  const canvas=await visibleCanvas(s.page),rows=rootMenuRows(menu),index=rows.findIndex(r=>r.includes('>'+guest+'/supervisor '+g+'</Program>'));assert(index>=0);
  await canvas.click({position:await canvasPosition(canvas,{x:10,y:585})});const popup=await observe(d,'menu');
  await canvas.click({position:await canvasPosition(canvas,{x:popup.x+popup.width/2,y:popup.y+1+(index+0.5)*(popup.height-2)/(rows.length+2)})});
  c.menu={index,popup};const title='xarchiver 0.5.4.22';c.main=await observe(d,'window',title);
  const pid=Number((await readGuest(g+'/child.pid')).toString().trim());assert(Number.isSafeInteger(pid)&&pid>0);assert.equal(c.main.pid,pid,'Observed X PID must be actual supervised child');
  c.supervisorPid=Number((await readGuest(g+'/supervisor.pid')).toString().trim());assert(c.supervisorPid>0&&c.supervisorPid!==pid);
  await canvas.click({position:await canvasPosition(canvas,{x:c.main.x+c.main.width/2,y:c.main.y-12})});
  async function capture(label){await s.page.waitForTimeout(500);await noCrash();await host(mode+'-'+label+'.png',await canvas.screenshot());}
  await capture('main');
  async function dialog(title,label){
   let previous,stable=0,value;
   for(let i=0;i<12;i++){value=await observe(d,'window',title);assert.equal(value.pid,pid);const k=JSON.stringify(value);stable=k===previous?stable+1:0;previous=k;if(stable>=2)break;await s.page.waitForTimeout(250);}assert(stable>=2);
   c[label]=value;await capture(label);return value;
  }
  if(mode==='add-cancel'){
   // Known GTK save chooser keyboard route, but bzip2 combo/focus remain discovery observations.
   await s.page.keyboard.press('Control+n');await dialog('Create a new archive','new-before');
   await s.page.keyboard.press('Control+a');await s.page.keyboard.type(guest+'/new-probe.txt.bz2',{delay:30});await capture('new-filled');
   await s.page.keyboard.press('Enter');await observe(d,'absent','Create a new archive');
   await s.page.keyboard.press('Control+d');await dialog('Add files','add');
   // Never commit an unknown Add control or select an input in discovery.
   await s.page.keyboard.press('Escape');await observe(d,'absent','Add files');
   await d.command(`set -eu\ntest ! -e ${guest}/new-probe.txt.bz2\ntest ! -L ${guest}/new-probe.txt.bz2\ntest -z "$(ls -A ${guest}/cancel-empty)"`);
   c.cancelledAddNoArchive=true;
  }else{
   // This reference was explicitly host-seeded. Opening it is not GUI creation evidence.
   await s.page.keyboard.press('Control+o');await dialog('Open an archive','open-before');
   await s.page.keyboard.press('Control+l');await s.page.keyboard.type(guest+'/probe.txt.bz2',{delay:30});await capture('open-filled');
   await s.page.keyboard.press('Enter');await observe(d,'absent','Open an archive');await s.page.waitForTimeout(1500);await capture('reference-open');
   await s.page.keyboard.press('Control+e');await dialog('Extract files','extract');
   // Destination entry has no mnemonic; do not guess its coordinates or type into unknown focus.
   await s.page.keyboard.press('Escape');await observe(d,'absent','Extract files');
   await d.command(`set -eu\ntest -z "$(ls -A ${guest}/cancel-empty)"`);
   c.cancelWitnessEmpty=true;c.cancelDestinationAssigned=false;
   await s.page.keyboard.press('Control+t');await s.page.waitForTimeout(1500);await capture('test-presentation-unclassified');
   // Source-backed output dialog is one possible branch. Other branches stop for review.
   await dialog('Archiver output','test-output');await s.page.keyboard.press('Enter');await observe(d,'absent','Archiver output');
   c.testOutcome='NOT CLASSIFIED: screenshots require independent review';
  }
  assert((await readGuest(guest+'/input/probe.txt')).equals(fixture));
  assert((await readGuest(guest+'/probe.txt.bz2')).equals(reference));
  await s.page.keyboard.press('Control+q');
  await bounded(poll(s.page,async path=>{const b=await shell.busybox.read(path);return ArrayBuffer.isView(b)&&new TextDecoder().decode(b)==='done\n';},g+'/done',15000),18000,'Supervisor did not finish');
  const resultBytes=await readGuest(g+'/result.json');await host(mode+'-waitpid.json',resultBytes);c.exit=JSON.parse(resultBytes.toString());
  assert.equal(c.exit.pid,pid);assert.equal(c.exit.exited,1);assert.equal(c.exit.exitCode,0);assert.equal(c.exit.signaled,0);assert.equal(c.exit.signal,0);assert.equal(c.exit.rawStatus,0);
  await noCrash();
  await d.command(`set -eu\n! kill -0 ${pid} 2>/dev/null\nsha256sum -c ${guest}/xarchiver.sha256`);
  const log=await noCrash();await host(mode+'-session.log',log);c.sessionLogSha256=sha(log);
  await d.finish();d=null;await s.command('echo XARCHIVER-V2-TERMINAL-RESTORED');await noCrash();
  c.status='passed';c.finishedAt=new Date().toISOString();
 }
 report.status='passed-discovery-and-two-normal-exits';
}catch(e){report.status='failed';report.error=String(e.stack||e);if(s){try{const canvas=await bounded(visibleCanvas(s.page),5000,'Failure canvas deadline');await host('failure.png',await bounded(canvas.screenshot(),5000,'Failure screenshot deadline'));}catch(x){report.failureScreenshotError=String(x);}}}
finally{
 if(s){
  try{const log=await rawLog();await host('session.log',log);report.sessionLogSha256=sha(log);assert(!fatal.test(log),'Fatal/crash evidence');assert.deepEqual(errors,[]);}catch(e){report.status='failed';report.logError=String(e.stack||e);}
  // No d.finish on failure: it may kill a client and conceal the failure cause.
  // Browser closure is failure containment, never proof of normal exit.
  try{await bounded(s.close(),30000,'Browser close timeout');}catch(e){report.status='failed';report.cleanupError=String(e);}
 }
 report.finishedAt=new Date().toISOString();await host('report.json',JSON.stringify(report,null,2)+'\n');if(report.status==='failed')process.exitCode=1;
}
