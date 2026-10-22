#!/usr/bin/env node
// Post-activation only. Does not modify the full candidate acceptance runner.
import {mkdir,writeFile,readFile,open} from 'node:fs/promises';
import {spawn,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
if(process.argv.includes('--help')){
 console.log('After activation: COMPAT_CORE_URL=https://os.groundupcoder.com/ COMPAT_EXPECT_RUNTIME=<activated-sha256> node tools/accept-live-desktop.mjs\nOptional COMPAT_RUN_NAME; always a fresh profile. Six separate 300-second browser jobs. No package rebuilds or metadata publication.');process.exit(0);
}
assert.equal(process.argv.length,2,'No positional arguments');
assert(!process.env.MACHINE_JOB_ID,'Run directly; each stage reserves/releases its own browser job');
assert(!process.env.COMPAT_CORE_DIST,'Live smoke accepts COMPAT_CORE_URL only');
assert.match(process.env.COMPAT_EXPECT_RUNTIME||'',/^[a-f0-9]{64}$/);
const url=new URL(process.env.COMPAT_CORE_URL||'https://os.groundupcoder.com/');
assert(['https:','http:'].includes(url.protocol));assert(!url.username&&!url.password&&!url.search&&!url.hash);
if(!url.pathname.endsWith('/'))url.pathname+='/';
const name=process.env.COMPAT_RUN_NAME||new Date().toISOString().replace(/[:.]/g,'-');assert.match(name,/^[a-zA-Z0-9_-]+$/);
const parent=resolve(root,'test-results/live-desktop-smoke');await mkdir(parent,{recursive:true});
const run=resolve(parent,name);await mkdir(run);
const config={url:url.href,expectedRuntime:process.env.COMPAT_EXPECT_RUNTIME,startedAt:new Date().toISOString()};
await writeFile(resolve(run,'config.json'),JSON.stringify(config,null,2)+'\n');
const prepared=spawnSync('python3',['tests/compatibility/prepare.py',run],{cwd:root,encoding:'utf8'});assert.equal(prepared.status,0,prepared.stderr);
const stages=[
 ['probe',['tests/compatibility/check.mjs','probe']],
 ['install-server',['tests/compatibility/check.mjs','install','x11-server']],
 ['install-widgets',['tests/compatibility/check.mjs','install','x11-widgets']],
 ['install-desktop',['tests/compatibility/check.mjs','install','jwm','xterm']],
 ['jwm-xterm-keyboard',['tests/compatibility/live-desktop.mjs','run']],
 ['reload',['tests/compatibility/live-desktop.mjs','reload']],
];
const report={...config,scope:'live-desktop-smoke',baselineCatalog:'fab65cba24c8c6dd59e11a63e096138e13835c42',status:'running',stages:[]};
async function save(){await writeFile(resolve(run,'report.json'),JSON.stringify(report,null,2)+'\n');}
await save();console.log('Evidence:',run);
for(const [name,args] of stages){
 console.log('START',name);const start=Date.now(),file=await open(resolve(run,name+'.log'),'w');
 const status=await new Promise(ok=>{const child=spawn('machine-job',['run','--kind','browser','--timeout','300','--',process.execPath,...args],{cwd:root,env:{...process.env,COMPAT_RUN_DIR:run},stdio:['ignore',file.fd,file.fd]});child.once('error',e=>ok({exitCode:null,error:String(e)}));child.once('exit',(exitCode,signal)=>ok({exitCode,signal}));});
 await file.close();const log=await readFile(resolve(run,name+'.log'));
 report.stages.push({name,...status,elapsedMs:Date.now()-start,log:name+'.log',sha256:createHash('sha256').update(log).digest('hex')});await save();console.log(status.exitCode===0?'PASS':'FAIL',name);
 if(status.exitCode!==0){report.status='failed';report.notRun=stages.slice(report.stages.length).map(s=>s[0]);console.error(log.toString().slice(-6000));break;}
}
if(report.status==='running')report.status='passed';report.finishedAt=new Date().toISOString();await save();console.log(report.status.toUpperCase(),resolve(run,'report.json'));if(report.status==='failed')process.exitCode=1;
