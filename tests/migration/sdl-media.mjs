// Extra binary/public acceptance beyond the retained guest static/shared tests.
import {session} from '../compatibility/session.mjs';
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const require=createRequire(new URL('../../../wasm-posix/package.json',import.meta.url));
const {PNG}=require('pngjs');
assert(process.env.MACHINE_JOB_ID,'machine-job browser reservation required');
const run=process.env.COMPAT_RUN_DIR,names=process.argv.slice(2);
assert(names.length&&new Set(names).size===names.length&&names.every(n=>['sdl3-image','sdl3-mixer'].includes(n)));
const attempt=process.env.MIGRATION_ATTEMPT||'';assert(!attempt||/^[a-zA-Z0-9_-]+$/.test(attempt));
const label='sdl-media'+(attempt?'-'+attempt:'');
await assert.rejects(access(resolve(run,label+'.json')),{code:'ENOENT'});
const report={status:'running',names,startedAt:new Date().toISOString(),inputs:[]};let s,pending;
async function boundedCommand(script){
 let timer;pending=s.command(script);pending.catch(()=>{});
 try{const value=await Promise.race([pending,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Media command exceeded180 seconds')),180000);})]);pending=undefined;return value;}finally{clearTimeout(timer);}
}
try{
 const config=JSON.parse(await readFile(resolve(run,'config.json')));
 const manifests=JSON.parse(await readFile(resolve(run,'candidate-manifests.json')));
 report.inputCommit=config.inputCommit;
 report.harnessSha256=createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
 s=await session();report.runtime=s.runtime;await s.command('true');
 for(const name of names){
  const m=manifests[name];assert.deepEqual(m.dependencies,[],'This harness expects core-only SDL dependencies');
  assert(m.binary,'Fresh exact-binary acceptance required');
  const installed=await s.page.evaluate(async name=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'))),name);
  assert.deepEqual(installed,m);
  const binary=await readFile(resolve(config.inputDist||config.dist,'migration',name,'binary.tar'));
  assert.equal(binary.length,m.binary.size);assert.equal(createHash('sha256').update(binary).digest('hex'),m.binary.sha256);
  const inventory=JSON.parse(execFileSync('python3',['-c',`import hashlib,io,json,sys,tarfile
with tarfile.open(fileobj=io.BytesIO(sys.stdin.buffer.read())) as archive:
 members=archive.getmembers()
 assert all(m.isfile() and not m.name.startswith('/') and '..' not in m.name.split('/') for m in members)
 assert len({m.name for m in members})==len(members)
 print(json.dumps([dict(path=m.name,mode=m.mode,sha256=hashlib.sha256(archive.extractfile(m).read()).hexdigest()) for m in members]))
`],{input:binary,maxBuffer:1024*1024}).toString());
  assert.deepEqual(inventory.map(({path,mode})=>({path,mode})).sort((a,b)=>a.path.localeCompare(b.path)),[...m.outputs].sort((a,b)=>a.path.localeCompare(b.path)));
  const sums=inventory.map(f=>f.sha256+'  /usr/local/'+f.path).join('\n')+'\n';
  await s.page.evaluate(async text=>shell.busybox.write('/tmp/sdl-media.sha256',new TextEncoder().encode(text)),sums);
  await s.command('sha256sum -c /tmp/sdl-media.sha256');
  const input=m.files.find(f=>f.path==='source.tar');
  const archive=await readFile(resolve(config.inputDist||config.dist,'migration',name,'source.tar'));
  assert.equal(archive.length,input.size);assert.equal(createHash('sha256').update(archive).digest('hex'),input.sha256);report.inputs.push({name,...input});
  await s.page.evaluate(async encoded=>shell.busybox.write('/tmp/sdl-media.tar',Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))),archive.toString('base64'));
  await s.command('mkdir -p /tmp/media-'+name+'\ncd /tmp/media-'+name+'\ntar -xf /tmp/sdl-media.tar');
  if(name==='sdl3-image'){
   await s.command(`set -eu
cd /tmp/media-sdl3-image
cc source/port/check.c -I/usr/local/include -lSDL3_image -lSDL3 -lm -o check`);
   await boundedCommand(`cd /tmp/media-sdl3-image
echo $$ > /tmp/sdl-media-active.pid
exec ./check "$PWD/source/upstream/test"`);
   const bytes=Buffer.from(await s.page.evaluate(async()=>Array.from(await shell.busybox.read('/tmp/media-sdl3-image/roundtrip.png'))));
   const png=PNG.sync.read(bytes);assert.equal(png.width,16);assert.equal(png.height,16);
   for(let y=0;y<16;y++)for(let x=0;x<16;x++)assert.deepEqual([...png.data.subarray((y*16+x)*4,(y*16+x+1)*4)],[x*15,y*15,(x+y)*7,(x*17+y*11)&255]);
   await writeFile(resolve(run,label+'.png'),bytes,{flag:'wx'});report.image={width:16,height:16,verifiedPixels:256,sha256:createHash('sha256').update(bytes).digest('hex')};
  }else{
   await s.page.mouse.click(10,10);
   await s.page.evaluate(()=>{
    window.migrationMixer={buffers:0,nonzero:0,peak:0};
    window.migrationAudioStart=AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start=function(...args){
     if(this.buffer){window.migrationMixer.buffers++;for(let ch=0;ch<this.buffer.numberOfChannels;ch++)for(const sample of this.buffer.getChannelData(ch)){if(Math.abs(sample)>0.01)window.migrationMixer.nonzero++;window.migrationMixer.peak=Math.max(window.migrationMixer.peak,Math.abs(sample));}}
     return window.migrationAudioStart.apply(this,args);
    };
   });
   await s.command(`set -eu
cd /tmp/media-sdl3-mixer
cc source/port/hello-wrapper.c -I/usr/local/include -lSDL3_mixer -lSDL3 -o hello`);
   await boundedCommand(`cd /tmp/media-sdl3-mixer
echo $$ > /tmp/sdl-media-active.pid
exec ./hello "$PWD/source/port/fixtures/tone.wav"`);
   report.pcm=await s.page.evaluate(()=>window.migrationMixer);
   assert(report.pcm.buffers>0&&report.pcm.nonzero>100&&report.pcm.peak>0.05&&report.pcm.peak<=1,JSON.stringify(report.pcm));
  }
 }
 report.status='passed';
 }catch(error){
 report.status='failed';report.error=String(error.stack||error);
 if(s&&pending){let timer;
  try{await Promise.race([(async()=>{
   await s.page.evaluate(async()=>{const bytes=await shell.busybox.read('/tmp/sdl-media-active.pid');if(bytes){const pid=Number(new TextDecoder().decode(bytes));if(Number.isInteger(pid)&&pid>0)shell.busybox.worker.postMessage({type:'kill',pid});}});
   await pending.catch(()=>{});
  })(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Media cleanup exceeded15 seconds')),15000);})]);report.cleanup='active command terminated and settled';}
  catch(cleanupError){report.cleanup=String(cleanupError);}finally{clearTimeout(timer);}
 }
 throw error;
}
finally{
 report.finishedAt=new Date().toISOString();
 try{
  if(s)try{
   await s.page.evaluate(()=>{if(window.migrationAudioStart)AudioBufferSourceNode.prototype.start=window.migrationAudioStart;});
   await writeFile(resolve(run,label+'.log'),await s.page.evaluate(()=>shell.busybox?.log||''),{flag:'wx'});
  }catch(error){report.logError=String(error);}
  await writeFile(resolve(run,label+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 }finally{if(s)await s.close();}
}
