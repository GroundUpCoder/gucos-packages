// Private A revision for independent B review. Host reads only; no fetch/build.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const sha=b=>createHash('sha256').update(b).digest('hex');
const safe=p=>typeof p==='string'&&/^[A-Za-z0-9_./+@-]+$/.test(p)&&p.split('/').every(x=>x&&x!=='.'&&x!=='..');
export async function frozenClosure(repo,config,candidates){
 const manifests={},visiting=new Set();
 const git=(commit,path,maxBuffer)=>execFileSync('git',['show',commit+':'+path],{cwd:repo,timeout:30000,maxBuffer});
 function visit(name){
  assert(/^[A-Za-z0-9_-]+$/.test(name));assert(!visiting.has(name),'Dependency cycle: '+name);
  if(manifests[name])return;
  visiting.add(name);let m=candidates[name];
  if(!m){
   const pin=config.baselinePackages[name];assert(pin,'Missing frozen manifest '+name);
   const x=/^https:\/\/raw\.githubusercontent\.com\/GroundUpCoder\/gucos-packages\/([a-f0-9]{40})\/(apps\/[A-Za-z0-9_-]+\/package\.json)$/.exec(pin.url);assert(x);
   const bytes=git(x[1],x[2],4*1024*1024);assert.equal(bytes.length,pin.size);assert.equal(sha(bytes),pin.sha256);m=JSON.parse(bytes);
  }
  assert.equal(m.name,name);assert(m.binary&&/^[a-f0-9]{64}$/.test(m.binary.sha256));assert(Array.isArray(m.dependencies));
  for(const dep of m.dependencies)visit(dep);
  for(const [dep,requirement] of Object.entries(m.dependencyRequirements||{})){
   assert(m.dependencies.includes(dep),'Undeclared dependency requirement');assert.deepEqual(Object.keys(requirement),['version'],'Unimplemented dependency constraint');assert.equal(manifests[dep].version,requirement.version,name+' -> '+dep);
  }
  visiting.delete(name);manifests[name]=m;
 }
 for(const name of ['feh','imlib2','jwm','desktop-entries','xterm'])visit(name);
 const packages={},all=new Map();
 for(const name of Object.keys(manifests).sort()){
  const m=manifests[name];let archive;
  if(candidates[name])archive=await readFile(resolve(config.inputDist||config.dist,'migration',name,'binary.tar'));
  else{
   const x=/^https:\/\/raw\.githubusercontent\.com\/GroundUpCoder\/gucos-packages\/([a-f0-9]{40})\/(apps\/[A-Za-z0-9_-]+\/binaries\/[a-f0-9]{64}\.tar)$/.exec(m.binary.url);assert(x,'Immutable binary required '+name);
   archive=git(x[1],x[2],128*1024*1024);
  }
  assert.equal(archive.length,m.binary.size);assert.equal(sha(archive),m.binary.sha256);
  assert(Array.isArray(m.outputs)&&m.outputs.length>0);assert.equal(new Set(m.outputs.map(o=>o.path)).size,m.outputs.length);
  for(const o of m.outputs){assert(safe(o.path),'Unsafe output');assert(Number.isInteger(o.mode)&&o.mode>=0&&o.mode<=0o7777);}
  const payload=JSON.parse(execFileSync('python3',['-c',`import io,json,sys,tarfile,hashlib
with tarfile.open(fileobj=io.BytesIO(sys.stdin.buffer.read())) as t:
 ms=t.getmembers()
 assert len(ms)==len({m.name for m in ms}) and all(m.isfile() for m in ms)
 print(json.dumps([dict(path=m.name,mode=m.mode,sha256=hashlib.sha256(t.extractfile(m).read()).hexdigest()) for m in ms]))`],{input:archive,timeout:30000,maxBuffer:8*1024*1024}));
  const sorted=a=>a.slice().sort((a,b)=>a.path.localeCompare(b.path));
  assert.deepEqual(sorted(payload.map(({path,mode})=>({path,mode}))),sorted(m.outputs));
  for(const o of payload){if(all.has(o.path))assert.deepEqual(all.get(o.path),o,'Conflicting closure output');else all.set(o.path,o);}
  packages[name]={manifest:m,payload:sorted(payload)};
 }
 const outputs=[...all.values()].sort((a,b)=>a.path.localeCompare(b.path));
 const binding={roots:['feh','imlib2','jwm','desktop-entries','xterm'],packages,outputs};
 return {binding,sha256:sha(JSON.stringify(binding)),checksums:outputs.map(o=>o.sha256+'  /usr/local/'+o.path+'\n').join('')};
}
// command is either the foreground session or its single-shell desktop adapter.
// stat follows package-manager output symlinks to check actual payload modes.
export async function verifyInstalledClosure(closure,readGuest,command,checksumPath,label){
 assert(/^\/home\/user\/feh-functional-v2-[A-Za-z0-9_-]+\/(normal|reload)\/closure.sha256$/.test(checksumPath));
 for(const [name,{manifest}] of Object.entries(closure.binding.packages))assert.deepEqual(JSON.parse((await readGuest('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json')).toString()),manifest,'Installed closure manifest '+name);
 assert.equal((await readGuest(checksumPath)).toString(),closure.checksums,'Closure checksum list changed');
 assert(['before','after'].includes(label));
 const receiptPath=checksumPath.replace('closure.sha256','closure-'+label);
 await command('set -euC\nsha256sum -c '+checksumPath+' > '+receiptPath+'.hashes');
 const checksums=(await readGuest(receiptPath+'.hashes')).toString().replace(/\r\n/g,'\n');
 assert.equal(checksums,closure.binding.outputs.map(o=>'/usr/local/'+o.path+': OK\n').join(''),'Complete payload checksum receipt');
 const modeCommands=[];
 for(let i=0;i<closure.binding.outputs.length;i+=100)modeCommands.push("stat -L -c '%a %n' "+closure.binding.outputs.slice(i,i+100).map(o=>'/usr/local/'+o.path).join(' '));
 await command('set -euC\n{\n'+modeCommands.join('\n')+'\n} > '+receiptPath+'.modes');
 const modes=(await readGuest(receiptPath+'.modes')).toString();
 const expected=closure.binding.outputs.map(o=>o.mode.toString(8)+' /usr/local/'+o.path+'\n').join('');
 assert.equal(modes.replace(/\r\n/g,'\n'),expected,'Installed closure payload modes');
 return {closureSha256:closure.sha256,manifests:Object.keys(closure.binding.packages).length,outputs:closure.binding.outputs.length,checksums,modes};
}
