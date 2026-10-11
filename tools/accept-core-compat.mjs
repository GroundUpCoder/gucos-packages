#!/usr/bin/env node
// Each stage gets its own bounded browser reservation; do not wrap this driver.
import {mkdir,readFile,writeFile,readdir,realpath,open} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
if(process.argv.includes('--help')){
 console.log('COMPAT_CORE_DIST=/absolute/distribution OR COMPAT_CORE_URL=https://candidate/\nCOMPAT_EXPECT_RUNTIME=<candidate 64-hex build identity> node tools/accept-core-compat.mjs\nOptional: COMPAT_RUN_NAME=<new name>; --probe-only checks boot/identity/transport only.\nUses the relocated immutable publication baseline. No package builds or metadata publication.');process.exit(0);
}
assert(process.argv.slice(2).every(x=>x==='--probe-only'),'Unknown argument');
assert(!process.env.MACHINE_JOB_ID,'Run driver directly: it reserves/releases machine-job for each stage');
assert(!!process.env.COMPAT_CORE_DIST!==!!process.env.COMPAT_CORE_URL,'Supply exactly one of COMPAT_CORE_DIST or COMPAT_CORE_URL');
assert.match(process.env.COMPAT_EXPECT_RUNTIME||'',/^[a-f0-9]{64}$/,'COMPAT_EXPECT_RUNTIME must identify the frozen candidate');
const name=process.env.COMPAT_RUN_NAME||new Date().toISOString().replace(/[:.]/g,'-');assert.match(name,/^[a-zA-Z0-9_-]+$/);
const parent=resolve(root,'test-results/compatibility');await mkdir(parent,{recursive:true});
const run=resolve(parent,name);await mkdir(run); // Refuse profile reuse: full runs start fresh.
const config={expectedRuntime:process.env.COMPAT_EXPECT_RUNTIME,startedAt:new Date().toISOString()};
if(process.env.COMPAT_CORE_DIST){
 config.dist=await realpath(process.env.COMPAT_CORE_DIST);const files={};
 async function walk(relative=''){
  for(const entry of await readdir(resolve(config.dist,relative),{withFileTypes:true})){
   const path=relative?relative+'/'+entry.name:entry.name;
   if(entry.isDirectory())await walk(path);
   else {assert(entry.isFile(),'Distribution must contain regular files, not symlinks: '+path);const b=await readFile(resolve(config.dist,path));files[path]={sha256:createHash('sha256').update(b).digest('hex'),size:b.length};}
  }
 }
 await walk();assert(files['index.html'],'Distribution needs index.html');
 const snapshot=JSON.stringify(files,null,2)+'\n';config.distributionSnapshotSha256=createHash('sha256').update(snapshot).digest('hex');
 await writeFile(resolve(run,'dist-files.json'),snapshot);
}else{
 const url=new URL(process.env.COMPAT_CORE_URL);assert(['http:','https:'].includes(url.protocol));assert(!url.username&&!url.password&&!url.search&&!url.hash,'Use a candidate base URL without credentials/query/fragment');if(!url.pathname.endsWith('/'))url.pathname+='/';config.url=url.href;
}
await writeFile(resolve(run,'config.json'),JSON.stringify(config,null,2)+'\n');
const prepared=spawnSync('python3',['tests/compatibility/prepare.py',run],{cwd:root,encoding:'utf8'});assert.equal(prepared.status,0,prepared.stderr);console.log(prepared.stdout.trim());
const stages=[
 ['probe',['tests/compatibility/check.mjs','probe']],
 ['install-server',['tests/compatibility/check.mjs','install','x11-server']],
 ['install-widgets',['tests/compatibility/check.mjs','install','x11-widgets']],
 ['install-desktop-a',['tests/compatibility/check.mjs','install','jwm','xterm','xcalc','xclock']],
 ['install-desktop-b',['tests/compatibility/check.mjs','install','xeyes','xlogo','xlsfonts','xkill','xrefresh']],
 ['install-desktop-c',['tests/compatibility/check.mjs','install','xmessage','xprop','xev','lua','zstd']],
 ['integrity-before',['tests/compatibility/check.mjs','integrity']],
 ['cli-and-library-relink',['tests/compatibility/check.mjs','libraries']],
 ['jwm-features',['tests/expansion-jwm-features.mjs']],
 ['jwm-browser',['tests/expansion-jwm.mjs']],
 ['xclients',['tests/expansion-xclients.mjs']],
 ['xterm-pty',['tests/expansion-xterm.mjs']],
 ['launcher',['tests/expansion-launcher-checks.mjs']],
 ['reload-and-integrity-after',['tests/compatibility/check.mjs','reload']],
];
const probeOnly=process.argv.includes('--probe-only');
const report={...config,scope:probeOnly?'boot-probe-only':'baseline-execution-and-relinking',baselineCatalog:JSON.parse(await readFile(new URL('publication-baseline.json',import.meta.url))).revision,stages:[],status:'running'};
async function save(){await writeFile(resolve(run,'report.json'),JSON.stringify(report,null,2)+'\n');}
await save();console.log('Evidence:',run);
for(const [name,args] of probeOnly?stages.slice(0,1):stages){
 console.log('START',name);const started=Date.now(),file=await open(resolve(run,name+'.log'),'w');
 const status=await new Promise(ok=>{
  const child=spawn('machine-job',['run','--kind','browser','--timeout','300','--',process.execPath,...args],{cwd:root,env:{...process.env,COMPAT_RUN_DIR:run},stdio:['ignore',file.fd,file.fd]});
  child.once('error',error=>ok({exitCode:null,error:String(error)}));child.once('exit',(exitCode,signal)=>ok({exitCode,signal}));
 });await file.close();
 const log=await readFile(resolve(run,name+'.log'));
 report.stages.push({name,...status,elapsedMs:Date.now()-started,log:name+'.log',sha256:createHash('sha256').update(log).digest('hex')});
 console.log(status.exitCode===0?'PASS':'FAIL',name);await save();
 if(status.exitCode!==0){report.status='failed';report.notRun=stages.slice(report.stages.length).map(s=>s[0]);console.error(log.toString().slice(-6000));break;}
}
if(report.status==='running')report.status=probeOnly?'probe-passed':'passed';
report.finishedAt=new Date().toISOString();await save();console.log(report.status.toUpperCase(),resolve(run,'report.json'));
if(report.status==='failed')process.exitCode=1;
