// Private B zoom-only adaptation of A Feh v2; requires independent A review.
// Original B feh-observe.c remains byte-identical.
// Requires independent A review before copy/execution; no package changes.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const sha=b=>createHash('sha256').update(b).digest('hex');
assert(process.env.MACHINE_JOB_ID&&process.env.MIGRATION_REPO_ROOT&&process.env.COMPAT_RUN_DIR);
const phase=process.argv[2];assert(['normal','reload'].includes(phase));
const attempt=process.env.MIGRATION_ATTEMPT;assert(/^[A-Za-z0-9_-]{1,40}$/.test(attempt||''));
const repo=await realpath(process.env.MIGRATION_REPO_ROOT),run=await realpath(process.env.COMPAT_RUN_DIR);
assert(process.env.FEH_OLD_RUN_DIR);const old=await realpath(process.env.FEH_OLD_RUN_DIR);
assert(run!==old&&!run.startsWith(old+'/'));assert.notEqual(await realpath(resolve(run,'profile')),await realpath(resolve(old,'profile')));
const stem='feh-functional-v2-'+attempt,output=resolve(run,stem+'-'+phase),root='/home/user/'+stem;
await mkdir(output);const g=root+'/'+phase,directory=root+'/images',statePath=resolve(run,stem+'-normal-state.json');
const require=createRequire(resolve(repo,'tests/migration/package.json'));const {PNG}=require('pngjs');
const load=async p=>import(pathToFileURL(resolve(repo,p)));
const {session}=await load('tests/compatibility/session.mjs');
const {poll}=await load('tests/desktop/poll.mjs');
const {frozenClosure,verifyInstalledClosure}=await import('./feh-functional-v2-closure.mjs');
const {installObserver,observe,rootMenuRows}=await load('tests/desktop/menu-xapps.mjs');
const {visibleCanvas,canvasPosition}=await load('tests/migration/canvas.mjs');
const {desktopSession}=await import('./feh-functional-v2-session.mjs');
const report={status:'running',phase,startedAt:new Date().toISOString(),scope:'Explicit instrumented JWM menu -> original desktop-menu entry; exact solid-image navigation, zoom/reset, supervised normal exit, retained image reload. No preference or slideshow-position persistence claim.',samples:{},fixtures:{}};
const fatal=/fatal:\s*wasm trap|\bpid \d+(?: thread \d+)? crashed:|RuntimeError:|uncaught|unhandled.*rejection/i;
const host=(p,b)=>writeFile(resolve(output,p),b,{flag:'wx'});
let s,d,canvas,prior;const pageErrors=[];
async function bounded(p,ms,label){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label)),ms);})]);}finally{clearTimeout(timer);}}
async function readGuest(p){return Buffer.from(await bounded(s.page.evaluate(async p=>{const b=await shell.busybox.read(p);if(!ArrayBuffer.isView(b))throw Error('Missing guest evidence: '+p);return Array.from(b);},p),15000,'Guest read deadline'));}
async function put(p,b){await bounded(s.page.evaluate(async({p,b})=>shell.busybox.write(p,Uint8Array.from(b)),{p,b:Array.from(Buffer.from(b))}),15000,'Guest upload deadline');}
async function raw(){const log=await bounded(s.page.evaluate(()=>shell.busybox.log),5000,'Raw log deadline');assert.equal(typeof log,'string');return log;}
async function noCrash(){assert(!fatal.test(await raw()),'Fatal/crash evidence');assert.deepEqual(pageErrors,[]);}
// A proposed URL-only public preflight. Original private equality stays exact.
function checkedManifest(name,local,candidate){
 assert(['imlib2','feh'].includes(name));
 if(/^http:\/\/127\.0\.0\.1:[0-9]+\/migration\//.test(candidate?.binary?.url||'')){
  assert.deepEqual(local,candidate,'Exact private frozen manifest');
  return {kind:'private-exact',localSha256:sha(JSON.stringify(local))};
 }
 const manifestCommit='13421d9c28b7b2b58d8184a0e9989b88a8076ac6';
 const catalogCommit='a50ac305be3456843987c4ee02e4a6a10fecca90';
 const artifactCommit='d7e0823581298bf91e5ce09cac79c1c95fab4ced';
 const raw='https://raw.githubusercontent.com/GroundUpCoder/gucos-packages/';
 const git=path=>execFileSync('git',['show',path],{cwd:repo,timeout:10000,maxBuffer:4*1024*1024});
 const publicBytes=git(manifestCommit+':apps/'+name+'/package.json');
 const catalogBytes=git(catalogCommit+':catalog.json');
 const published=JSON.parse(publicBytes),catalog=JSON.parse(catalogBytes);
 assert.deepEqual(catalog.packages[name],{url:raw+manifestCommit+'/apps/'+name+'/package.json',sha256:sha(publicBytes),size:publicBytes.length},'Exact reviewed catalog pin');
 assert.deepEqual(candidate,published,'Only exact reviewed public candidate is permitted');
 const receipt=JSON.parse(git(artifactCommit+':apps/'+name+'/binaries/receipt.json'));
 function identity(m){
  const v=structuredClone(m);
  assert(Array.isArray(v.files));
  for(const f of v.files)delete f.url;
  if(v.binary)delete v.binary.url;
  return v;
 }
 // Full structural equality: only files[].url and binary.url can differ.
 assert.deepEqual(identity(published),identity({...receipt.guestManifest,runtime:receipt.runtime,binary:{sha256:receipt.sha256,size:receipt.size}}),'Complete reviewed artifact identity');
 assert.deepEqual(identity(local),identity(published),'Local/public difference must be URLs only');
 for(const f of published.files){
  assert(/^[A-Za-z0-9_.-]+$/.test(f.path));
  assert.equal(f.url,raw+artifactCommit+'/apps/'+name+'/'+f.path,'Exact immutable source URL');
 }
 assert.equal(published.binary.url,raw+artifactCommit+'/apps/'+name+'/binaries/'+receipt.sha256+'.tar','Exact immutable binary URL');
 if(local.binary.url!==published.binary.url){
  const match=/^(http:\/\/127\.0\.0\.1:[0-9]+)\/migration\/(imlib2|feh)\/binary\.tar$/.exec(local.binary.url);
  assert(match&&match[2]===name,'Expected retained loopback binary URL');
  const url=new URL(match[1]);assert(Number(url.port)>0&&Number(url.port)<=65535);
  for(const f of local.files)assert.equal(f.url,match[1]+'/migration/'+name+'/'+f.path,'Exact retained loopback source URL');
 }else assert.deepEqual(local,published,'Public local metadata must also be exact');
 return {kind:'reviewed-public-url-rebind',manifestCommit,catalogCommit,artifactCommit,
  manifestSha256:sha(publicBytes),catalogSha256:sha(catalogBytes),localSha256:sha(JSON.stringify(local))};
}
try{
 const configBytes=await readFile(resolve(run,'config.json')),config=JSON.parse(configBytes),candidateBytes=await readFile(resolve(run,'candidate-manifests.json')),candidates=JSON.parse(candidateBytes);
 assert.equal(config.expectedRuntime,'19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441');
 report.binding={runtime:config.expectedRuntime,inputCommit:config.inputCommit,configSha256:sha(configBytes),candidatesSha256:sha(candidateBytes),packages:{}};
 const sums={};
 for(const [name,hash,size,sourceHash] of [['imlib2','43adacc717051755db71a86bee4486bb7a0a2eeb5865f49ee723744f13e690df',937472,'e6b74f0375815f53c18ecca27165e41813b168def4311c525ca6761d01201715'],['feh','06fb7aa51a0381e6f300481ee8dae239161579e874837eef7a6bced0394be433',1182208,'4852202d3f41950ddbd0f5c6dc5cffeabcd213837850c0b39804f64a4edb0c03']]){
  const m=candidates[name];
  const reviewed=JSON.parse(execFileSync('git',['show','d7e0823:apps/'+name+'/binaries/receipt.json'],{cwd:repo,timeout:10000})).guestManifest;
  for(const key of ['format','name','version','dependencies','dependencyRequirements','platform','build','test','outputs','licenses'])assert.deepEqual(m[key],reviewed[key],'Reviewed source/export contract: '+name+'/'+key);
  const tuples=files=>files.map(({path,sha256,size})=>({path,sha256,size}));assert.deepEqual(tuples(m.files),tuples(reviewed.files));
  assert(m?.binary&&m.runtime===config.expectedRuntime);assert.equal(m.binary.sha256,hash);assert.equal(m.binary.size,size);
  const base=resolve(config.inputDist||config.dist,'migration',name);
  (report.binding.manifestPreflight??={})[name]=checkedManifest(name,JSON.parse(await readFile(resolve(base,'package.json'))),m);
  const archive=await readFile(resolve(base,'binary.tar'));assert.equal(sha(archive),hash);assert.equal(archive.length,size);
  assert.equal(m.files.find(f=>f.path==='source.tar')?.sha256,sourceHash);
  for(const f of m.files){assert(/^[A-Za-z0-9_.-]+$/.test(f.path));const b=await readFile(resolve(base,f.path));assert.equal(b.length,f.size);assert.equal(sha(b),f.sha256);}
  sums[name]=await readFile(resolve(run,name+'.sha256'),'utf8');const hashes={};
  for(const line of sums[name].trimEnd().split('\n')){const x=/^([a-f0-9]{64})  \/usr\/local\/([A-Za-z0-9_./+@-]+)$/.exec(line);assert(x);assert(!x[2].split('/').some(p=>!p||p==='.'||p==='..'));assert(!Object.hasOwn(hashes,x[2]));hashes[x[2]]=x[1];}
  assert.deepEqual(Object.keys(hashes).sort(),m.outputs.map(o=>o.path).sort());
  execFileSync('python3',['-c',`import json,tarfile,sys,hashlib
v=json.load(sys.stdin)
with tarfile.open(sys.argv[1]) as t:
 ms=t.getmembers();assert len(ms)==len(v['outputs']) and all(m.isfile() for m in ms)
 assert {m.name:m.mode for m in ms}=={o['path']:o['mode'] for o in v['outputs']}
 for m in ms:assert hashlib.sha256(t.extractfile(m).read()).hexdigest()==v['hashes'][m.name]`,resolve(base,'binary.tar')],{input:JSON.stringify({outputs:m.outputs,hashes}),timeout:30000});
  report.binding.packages[name]={binary:m.binary,checksumsSha256:sha(sums[name])};
 }
 if(config.dist){const b=await readFile(resolve(run,'dist-files.json'));assert.equal(sha(b),config.distributionSnapshotSha256);report.binding.distributionSnapshotSha256=sha(b);}
 const closure=await frozenClosure(repo,config,candidates);
 report.binding.closure=closure.binding;report.binding.closureSha256=closure.sha256;
 await host('closure.json',JSON.stringify(closure.binding,null,2)+'\n');
 report.sourceHashes={};
 for(const name of ['feh-functional-v2.mjs','feh-functional-v2-session.mjs','feh-functional-v2-supervisor.c','feh-functional-v2-closure.mjs','feh-zoom-observe.c']){const b=await readFile(new URL(name,import.meta.url));report.sourceHashes[name]=sha(b);await host(name,b);}
 for(const [name,hash] of Object.entries({'feh-functional-v2-session.mjs':'245a0939fc0758bcddc7bbc43a3b3db4cdbd34c98f12f4d9b329787b4c7d9328','feh-functional-v2-supervisor.c':'02e9c06e113cecc6cad249bd4185ba6a8b54dd784d22b4755ac877649ebbec67'}))assert.equal(report.sourceHashes[name],hash);
 for(const name of ['tests/compatibility/session.mjs','tests/desktop/menu-xapps.mjs','tests/desktop/windows-xapps.c','tests/desktop/menu.mjs','tests/desktop/poll.mjs','tests/migration/canvas.mjs'])report.sourceHashes[name]=sha(await readFile(resolve(repo,name)));
 const observer=await readFile(resolve(repo,'tests/desktop/feh-observe.c'));
 assert.equal(sha(observer),'15c5ae24aa8fb2538ffe34c67f19c10872959d19b1e8f0badd6820b9817556b5');report.originalBObserverSha256=sha(observer);await host('original-B-feh-observe.c',observer);
 const zoomObserver=await readFile(new URL('./feh-zoom-observe.c',import.meta.url));assert.equal(sha(zoomObserver),'32980fd5c5480a63a28b246331e604ae5c81553503ec6c1bd32f1bd119859455');
 report.zoomObserver={sha256:sha(zoomObserver),scope:'Native80x60 fixture; narrow near-primary histogram/extents; green scaling unobserved before this proposal'};
 if(phase==='reload'){
  prior=JSON.parse(await readFile(statePath));const b=await readFile(resolve(run,stem+'-normal/report.json'));assert.equal(sha(b),prior.normalReportSha256);assert.equal(JSON.parse(b).status,'passed-normal');assert.deepEqual(prior.binding,report.binding);assert.deepEqual(prior.sourceHashes,report.sourceHashes);
 }
 s=await session();s.page.on('pageerror',e=>pageErrors.push(String(e)));assert.equal(s.runtime,config.expectedRuntime);
 if(phase==='reload'){await s.page.reload({timeout:120000});await s.page.waitForFunction(()=>window.shell?.ready,null,{timeout:120000});assert.equal(await s.page.evaluate(()=>shell.toolchain.systemBuild),config.expectedRuntime);report.explicitBrowserReload=true;}
 await s.command('true');assert.equal(await s.page.evaluate(()=>[...shell.busybox.windows.values()].filter(w=>w.shown).length),0);
 for(const name of ['imlib2','feh'])assert.deepEqual(JSON.parse((await readGuest('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json')).toString()),candidates[name]);
 if(phase==='normal')await s.command(`set -eu\ntest ! -e ${root}\ntest ! -L ${root}\nmkdir ${root}\nmkdir ${directory}`);
 else await s.command(`test -d ${directory}`);
 await s.command(`mkdir ${g}`);
 await put(g+'/closure.sha256',closure.checksums);
 report.closureBefore=await verifyInstalledClosure(closure,readGuest,s.command,g+'/closure.sha256','before');
 for(const [name,r,green] of [['red.png',255,0],['green.png',0,255]]){
  const png=new PNG({width:80,height:60});for(let i=0;i<png.data.length;i+=4){png.data[i]=r;png.data[i+1]=green;png.data[i+2]=0;png.data[i+3]=255;}
  const expected=PNG.sync.write(png);if(phase==='normal')await put(directory+'/'+name,expected);
  const b=await readGuest(directory+'/'+name);assert.deepEqual(b,expected);report.fixtures[name]={size:b.length,sha256:sha(b)};await host(name,b);
 }
 if(prior)assert.deepEqual(report.fixtures,prior.fixtures);
 await s.command(`set -eu\ncd ${directory}\nfeh --customlist '%w %h' . > ${g}/metadata\nprintf '80 60\\n80 60\\n' > ${g}/expected\ncmp ${g}/metadata ${g}/expected`);
 const owned=await readGuest('/usr/local/share/applications/feh.desktop');await host('owned-feh.desktop',owned);assert.match(owned.toString(),/^Exec=feh %F$/m);
 const originalMenu=await s.command('sh /usr/local/share/jwm/app-menu.sh'),originalConfig=(await readGuest('/usr/local/share/jwm/wasm.jwmrc')).toString();
 const command='/usr/local/bin/desktop-menu launch feh.desktop',include='<Include>exec:/bin/sh /usr/local/share/jwm/app-menu.sh</Include>';
 assert.equal(originalMenu.split('>'+command+'</Program>').length,2);assert.equal(originalConfig.split(include).length,2);
 const menu=originalMenu.replace('>'+command+'</Program>','>'+g+'/supervisor '+g+'</Program>'),jwmrc=originalConfig.replace(include,'<Include>'+g+'/menu.xml</Include>');
 for(const [name,text] of [['original-menu.xml',originalMenu],['original-jwmrc',originalConfig],['menu.xml',menu],['jwmrc',jwmrc]])await host(name,text);
 await put(g+'/menu.xml',menu);await put(g+'/jwmrc',jwmrc);
 const supervisor=await readFile(new URL('./feh-functional-v2-supervisor.c',import.meta.url));await put(g+'/supervisor.c',supervisor);await put(g+'/observer.c',observer);await put(g+'/zoom-observer.c',zoomObserver);
 report.compile=await s.command(`set -eu\nprintf '${sha(supervisor)}  ${g}/supervisor.c\\n${sha(observer)}  ${g}/observer.c\\n${sha(zoomObserver)}  ${g}/zoom-observer.c\\n' | sha256sum -c -\ncc ${g}/supervisor.c -o ${g}/supervisor\ncc ${g}/observer.c -I/usr/local/include -L/usr/local/lib -lX11 -lxcb -lXau -o ${g}/observer\ncc ${g}/zoom-observer.c -I/usr/local/include -L/usr/local/lib -lX11 -lxcb -lXau -o ${g}/zoom-observer\nsha256sum ${g}/supervisor ${g}/observer ${g}/zoom-observer`);
 report.menuHelpers=await installObserver(s);d=await desktopSession(s,{configPath:g+'/jwmrc',controlPath:g+'/control',workingDirectory:directory});report.helpers=d.helper;canvas=await visibleCanvas(s.page);
 const rows=rootMenuRows(menu),index=rows.findIndex(r=>r.includes('>'+g+'/supervisor '+g+'</Program>'));assert(index>=0);
 await canvas.click({position:await canvasPosition(canvas,{x:10,y:585})});const popup=await observe(d,'menu');await canvas.click({position:await canvasPosition(canvas,{x:popup.x+popup.width/2,y:popup.y+1+(index+0.5)*(popup.height-2)/(rows.length+2)})});
 report.menu={instrumented:true,index,popup,workingDirectory:directory,delegates:command};
 async function sample(mode,args=''){
  const executable=mode==='pixels'?'zoom-observer':'observer';
  const output=await d.command(`rc=0; DISPLAY=:1 ${g}/${executable} ${mode} ${args} || rc=$?; printf '\\nFEH-OBSERVER-STATUS %s\\n' "$rc"`);
  const m=output.match(/\nFEH-OBSERVER-STATUS (\d+)\r?\n$/);assert(m,output);const code=Number(m[1]);assert([0,3,4].includes(code),output);return {code,value:code===0?JSON.parse(output.slice(0,m.index).trim()):null};
 }
 let w;await bounded((async()=>{const until=Date.now()+30000;while(Date.now()<until){w=(await sample('window')).value;if(w)return;await s.page.waitForTimeout(150);}throw Error('Feh client discovery failed');})(),45000,'Feh discovery deadline');assert(w);report.window=w;
 const pid=Number((await readGuest(g+'/child.pid')).toString().trim());assert(Number.isSafeInteger(pid)&&pid>0);assert.equal(w.pid,pid);
 report.supervisorPid=Number((await readGuest(g+'/supervisor.pid')).toString().trim());assert(report.supervisorPid>0&&report.supervisorPid!==pid);
 // Client click avoids tiny title controls. Source mouse button1 may advance image;
 // this is intentional and recorded, and all comparison baselines are captured AFTER it.
 report.focus={method:'physical client-center click; may advance slide',point:{x:w.x+w.width/2,y:w.y+w.height/2}};
 await canvas.click({position:await canvasPosition(canvas,report.focus.point)});
 async function settled(label,predicate){
  report.samples[label]=[];return bounded((async()=>{
   const box=await canvas.boundingBox();assert(box);const park=await canvasPosition(canvas,{x:799,y:599});await s.page.mouse.move(box.x+park.x,box.y+park.y);
   let previous,stable=0;const until=Date.now()+30000;
   while(Date.now()<until){assert(report.samples[label].length<120,'Native sample cap: '+label);const sampleResult=await sample('pixels',`${w.xid} ${pid}`),value=sampleResult.value;
    const history=report.samples[label],record={at:new Date().toISOString(),...sampleResult};history.push(record);
    await host(`sample-${label}-${String(history.length).padStart(3,'0')}.json`,JSON.stringify(record)+'\n');
    if(value){assert(Array.isArray(value.histogram)&&value.histogram.length>0&&value.histogram.length<=4800);let total=0,last=-1;for(const bin of value.histogram){assert(Number.isInteger(bin.rgb)&&bin.rgb>last&&bin.rgb<=0xffffff&&Number.isInteger(bin.count)&&bin.count>0);last=bin.rgb;total+=bin.count;}assert.equal(total,4800);}
    const key=value&&JSON.stringify(value);stable=key&&key===previous?stable+1:0;previous=key;
    if(value&&stable>=3&&predicate(value)){await noCrash();await host(label+'.png',await canvas.screenshot());return value;}
    await s.page.waitForTimeout(150);
   }throw Error('Feh settled predicate failed: '+label);
  })(),35000,'Feh observation deadline: '+label);
 }
 const extent=(v,color)=>{const e=v[color];return {e,width:e.maxX-e.minX+1,height:e.maxY-e.minY+1};};
 function solid(v,color){const other=color==='red'?'green':'red',{e,width,height}=extent(v,color);return e.count===4800&&v[other].count===0&&width===80&&height===60&&e.count===width*height&&e.minX>=0&&e.minY>=0&&e.maxX<v.width&&e.maxY<v.height&&e.minX===Math.floor((v.width-80)/2)&&e.minY===Math.floor((v.height-60)/2);}
 const first=report.initial=await settled('initial',v=>solid(v,'red')||solid(v,'green'));
 const color=first.red.count?'red':'green',other=color==='red'?'green':'red';const identity=v=>`${v.width}x${v.height}:${v.hash}`;
 await s.page.keyboard.press('ArrowRight');report.next=await settled('next',v=>solid(v,other));
 await s.page.keyboard.press('ArrowLeft');const baseline=report.previous=await settled('previous',v=>solid(v,color));
 report.zoomBaseline={width:baseline.width,height:baseline.height,hash:baseline.hash,color};
 assert.equal(baseline.width,80);assert.equal(baseline.height,60);
 const sameViewport=v=>v.width===80&&v.height===60;
 function zoomed(v){
  const e=v[color+'Near'],opposite=v[other+'Near'];
  return sameViewport(v)&&e.count===3072&&e.minX===8&&e.minY===6&&e.maxX===71&&e.maxY===53
   &&e.count===(e.maxX-e.minX+1)*(e.maxY-e.minY+1)&&opposite.count===0&&v[other].count===0&&identity(v)!==identity(baseline);
 }
 const restored=v=>sameViewport(v)&&solid(v,color)&&identity(v)===identity(baseline)
  &&JSON.stringify(v.histogram)===JSON.stringify(baseline.histogram);
 await s.page.keyboard.press('ArrowDown');report.zoomOut=await settled('zoom-out',zoomed);
 await s.page.keyboard.press('ArrowUp');report.zoomIn=await settled('zoom-in',restored);
 await s.page.keyboard.press('ArrowDown');report.beforeReset=await settled('before-reset',zoomed);
 await s.page.keyboard.press('Shift+Digit8');report.reset=await settled('reset',restored);
 await s.page.keyboard.press('q');
 await bounded(poll(s.page,async p=>{const b=await shell.busybox.read(p);return ArrayBuffer.isView(b)&&new TextDecoder().decode(b)==='done\n';},g+'/done',15000),18000,'Feh supervised quit deadline');
 const wait=await readGuest(g+'/result.json');await host('waitpid.json',wait);report.exit=JSON.parse(wait.toString());assert.equal(report.exit.pid,pid);assert.equal(report.exit.rawStatus,0);assert.equal(report.exit.exited,1);assert.equal(report.exit.exitCode,0);assert.equal(report.exit.signaled,0);assert.equal(report.exit.signal,0);
 assert.deepEqual(await sample('absent'),{code:0,value:{absent:true}});await noCrash();
 await d.command(`set -eu\n! kill -0 ${pid} 2>/dev/null`);
 for(const name of ['red.png','green.png']){const b=await readGuest(directory+'/'+name);assert.equal(sha(b),report.fixtures[name].sha256);assert.equal(b.length,report.fixtures[name].size);}
 await d.finish();d=null;
 report.closureAfter=await verifyInstalledClosure(closure,readGuest,s.command,g+'/closure.sha256','after');
 await s.command('echo FEH-V2-TERMINAL-RESTORED');await noCrash();report.status='passed-'+phase;
}catch(e){report.status='failed';report.error=String(e.stack||e);
 if(canvas)try{await host('failure.png',await bounded(canvas.screenshot(),5000,'Failure screenshot deadline'));}catch(x){report.failureScreenshotError=String(x);}
}finally{
 if(s){try{const log=await raw();await host('session.log',log);report.sessionLogSha256=sha(log);assert(!fatal.test(log));assert.deepEqual(pageErrors,[]);}catch(e){report.status='failed';report.logError=String(e);}
  // Failure containment only, never interpreted as a normal client exit.
  try{await bounded(s.close(),30000,'Session close deadline');}catch(e){report.status='failed';report.cleanupError=String(e);}}
 report.finishedAt=new Date().toISOString();const bytes=JSON.stringify(report,null,2)+'\n';await host('report.json',bytes);
 if(report.status==='passed-normal')await writeFile(statePath,JSON.stringify({normalReportSha256:sha(bytes),binding:report.binding,sourceHashes:report.sourceHashes,fixtures:report.fixtures},null,2)+'\n',{flag:'wx'});
 if(report.status==='failed')process.exitCode=1;
}
