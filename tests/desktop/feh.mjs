// Real JWM launch, native image navigation/zoom, and persisted fixtures on reload.
import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {session} from '../compatibility/session.mjs';
import {desktopSession} from './session.mjs';
import {installObserver,clickMenuEntry} from './menu-xapps.mjs';
import {visibleCanvas,canvasPosition} from '../migration/canvas.mjs';
const require=createRequire(new URL('../migration/package.json',import.meta.url));
const {PNG}=require('pngjs');
const sha=b=>createHash('sha256').update(b).digest('hex');
assert(process.env.MACHINE_JOB_ID,'machine-job required');
const run=process.env.COMPAT_RUN_DIR,reload=process.argv.includes('--reload');
const attempt=process.env.MIGRATION_ATTEMPT||'first';assert(/^[a-zA-Z0-9_-]+$/.test(attempt));
const stem='feh-jwm-'+attempt+(reload?'-reload':''),directory='/home/user/feh-gate-'+attempt;
await assert.rejects(access(resolve(run,stem+'.json')),{code:'ENOENT'});
const report={status:'running',directory,reload,scope:'Owned menu, two persisted images, next/previous, zoom-out/reset, normal quit; no slideshow-position or preference persistence claim.',startedAt:new Date().toISOString()};
let s,d;
async function bounded(p,ms){let timer;try{return await Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Feh deadline exceeded')),ms);})]);}finally{clearTimeout(timer);}}
try{
 s=await session();report.runtime=s.runtime;await s.command('true');
 const candidates=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
 for(const name of ['imlib2','feh']){
  const expected=candidates[name];assert(expected?.binary,'Reviewed binary fixture required');
  const actual=await s.page.evaluate(async name=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'))),name);
  assert.deepEqual(actual,expected);
  await s.page.evaluate(async({path,text})=>shell.busybox.write(path,new TextEncoder().encode(text)),{path:'/tmp/'+name+'.sha256',text:await readFile(resolve(run,name+'.sha256'),'utf8')});
  await s.command('sha256sum -c /tmp/'+name+'.sha256');
 }
 report.binaries={imlib2:candidates.imlib2.binary,feh:candidates.feh.binary};
 const prior=reload?JSON.parse(await readFile(resolve(run,'feh-jwm-'+attempt+'.json'))):null;
 if(prior){assert.equal(prior.status,'passed');assert.equal(prior.runtime,s.runtime);assert.deepEqual(prior.binaries,report.binaries);assert.equal(prior.directory,directory);}
 report.fixtures={};
 if(!reload)await s.command(`test ! -e '${directory}'\nmkdir '${directory}'`);
 for(const [name,r,g] of [['red.png',255,0],['green.png',0,255]]){
  const png=new PNG({width:80,height:60});
  for(let i=0;i<png.data.length;i+=4){png.data[i]=r;png.data[i+1]=g;png.data[i+2]=0;png.data[i+3]=255;}
  const bytes=PNG.sync.write(png),path=directory+'/'+name;
  if(!reload)await s.page.evaluate(async({path,bytes})=>shell.busybox.write(path,Uint8Array.from(bytes)),{path,bytes:Array.from(bytes)});
  const actual=Buffer.from(await s.page.evaluate(async path=>Array.from(await shell.busybox.read(path)||[]),path));
  assert.deepEqual(actual,bytes);report.fixtures[name]={size:actual.length,sha256:sha(actual)};
 }
 if(prior)assert.deepEqual(report.fixtures,prior.fixtures);
 // Independent file count/dimensions guard against accidental cwd fixture drift.
 const metadata=await s.command(`cd '${directory}'\nfeh --customlist '%w %h' . > /tmp/feh-gate-list\nprintf '80 60\\n80 60\\n' > /tmp/feh-gate-expected\ncmp /tmp/feh-gate-list /tmp/feh-gate-expected`);
 report.metadata=metadata;
 const source=await readFile(new URL('./feh-observe.c',import.meta.url));
 report.observerSha256=sha(source);report.harnessSha256=sha(await readFile(new URL(import.meta.url)));
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/feh-observe.c',new TextEncoder().encode(text)),source.toString());
 await s.command('cc /tmp/feh-observe.c -I/usr/local/include -L/usr/local/lib -lX11 -lxcb -lXau -o /tmp/feh-observe');
 report.menuHelper=await installObserver(s);d=await desktopSession(s,{workingDirectory:directory});report.helpers=d.helper;
 const canvas=await visibleCanvas(s.page);report.menu=await clickMenuEntry(d,'feh.desktop');
 async function sample(mode,args=''){
  const output=await d.command(`code=0; DISPLAY=:1 /tmp/feh-observe ${mode} ${args} || code=$?; printf '\\nFEH-OBSERVER-STATUS %s\\n' "$code"`);
  const match=output.match(/\nFEH-OBSERVER-STATUS (\d+)\n$/);assert(match,output);
  const code=Number(match[1]);assert([0,3,4].includes(code),output);
  return code===0?JSON.parse(output.slice(0,match.index).trim()):null;
 }
 async function discover(){for(let i=0;i<100;i++){const value=await sample('window');if(value)return value;await s.page.waitForTimeout(150);}throw Error('Feh window not found');}
 const w=report.window=await discover();assert(w.pid>0&&w.y>=24);
 await canvas.click({position:await canvasPosition(canvas,{x:w.x+w.width/2,y:w.y-12})});
 async function settled(label,predicate=()=>true){
  const box=await canvas.boundingBox(),point=await canvasPosition(canvas,{x:799,y:599});await s.page.mouse.move(box.x+point.x,box.y+point.y);
  let previous,stable=0;const until=Date.now()+30000;
  while(Date.now()<until){
   const value=await sample('pixels',`${w.xid} ${w.pid}`),key=value&&JSON.stringify(value);
   stable=key&&key===previous?stable+1:0;previous=key;
   if(value&&stable>=3&&predicate(value)){await writeFile(resolve(run,stem+'-'+label+'.png'),await canvas.screenshot(),{flag:'wx'});return value;}
   await s.page.waitForTimeout(150);
  }throw Error('Feh failed settled pixel oracle: '+label);
 }
 const first=report.initial=await settled('initial',v=>(v.red.count===4800&&v.green.count===0)||(v.green.count===4800&&v.red.count===0));
 const color=first.red.count?'red':'green',other=color==='red'?'green':'red';
 const identity=v=>`${v.width}x${v.height}:${v.hash}`;
 await s.page.keyboard.press('ArrowRight');report.next=await settled('next',v=>v[other].count===4800&&v[color].count===0&&identity(v)!==identity(first));
 await s.page.keyboard.press('ArrowLeft');report.previous=await settled('previous',v=>identity(v)===identity(first));
 await s.page.keyboard.press('ArrowDown');report.zoomOut=await settled('zoom-out',v=>v[color].count>0&&v[color].count<first[color].count&&v[other].count===0);
 await s.page.keyboard.press('ArrowUp');report.zoomIn=await settled('zoom-in',v=>v[color].count>report.zoomOut[color].count);
 await s.page.keyboard.press('Shift+Digit8');report.reset=await settled('reset',v=>identity(v)===identity(first));
 await s.page.keyboard.press('q');
 let absent=false;for(let i=0;i<100;i++){if(await sample('absent')){absent=true;break;}await s.page.waitForTimeout(100);}assert(absent,'Feh window did not disappear');
 await d.command(`n=0; while kill -0 ${w.pid} 2>/dev/null; do n=$((n+1)); [ "$n" -lt 100 ] || exit 1; sleep 0.1; done`);
 await d.finish();await s.command('echo FEH-JWM-TERMINAL-RESTORED');report.status='passed';
}catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally{
 report.finishedAt=new Date().toISOString();
 if(s){
  try{await bounded((async()=>writeFile(resolve(run,stem+'.log'),await s.page.evaluate(()=>shell.busybox.log),{flag:'wx'}))(),5000);}catch(e){report.logError=String(e);}
  try{await bounded(s.close(),30000);}catch(e){report.cleanupError=String(e);report.status='failed';}
 }
 await writeFile(resolve(run,stem+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 if(report.status==='failed')process.exitCode=1;
}
