// Private A standalone gate adaptation of the B-reviewed Feh closure helper.
// Independent B review required. Feh original remains unchanged.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const sha=b=>createHash('sha256').update(b).digest('hex');
const safe=p=>typeof p==='string'&&/^[A-Za-z0-9_./+@-]+$/.test(p)&&p.split('/').every(x=>x&&x!=='.'&&x!=='..');
export async function frozenClosure(repo,config,candidates,app){
 assert(['xarchiver','galculator'].includes(app));
 assert.deepEqual(Object.keys(candidates),[app],'Exactly the named binary candidate required');
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
 for(const name of [app,'jwm','desktop-entries','xterm'])visit(name);
 const packages={},all=new Map();
 for(const name of Object.keys(manifests).sort()){
  const m=manifests[name];let archive;
  if(candidates[name]){
   const base=resolve(config.inputDist||config.dist,'migration',name);
   assert.deepEqual(JSON.parse(await readFile(resolve(base,'package.json'))),m);
   for(const f of m.files){assert(safe(f.path));const bytes=await readFile(resolve(base,f.path));assert.equal(bytes.length,f.size);assert.equal(sha(bytes),f.sha256);}
   archive=await readFile(resolve(base,'binary.tar'));
  }
  else{
   const x=/^https:\/\/raw\.githubusercontent\.com\/GroundUpCoder\/gucos-packages\/([a-f0-9]{40})\/(apps\/[A-Za-z0-9_-]+\/binaries\/[a-f0-9]{64}\.tar)$/.exec(m.binary.url);assert(x,'Immutable binary required '+name);
   archive=git(x[1],x[2],128*1024*1024);
  }
  assert.equal(archive.length,m.binary.size);assert.equal(sha(archive),m.binary.sha256);
  assert(Array.isArray(m.outputs)&&m.outputs.length>0);assert.equal(new Set(m.outputs.map(o=>o.path)).size,m.outputs.length);
  for(const o of m.outputs){assert(safe(o.path),'Unsafe output');assert(Number.isInteger(o.mode)&&o.mode>=0&&o.mode<=0o7777);}
  // B proposed single-pass reader; existing archive hash/size checks stay above.
  // Header and payload share one bounded child input stream; no Python whole-archive copy.
  const archiveStarted=Date.now();
  const archiveIdentity={package:name,sha256:m.binary.sha256,size:archive.length,outputs:m.outputs.length};
  process.stderr.write('[closure-archive] '+JSON.stringify({...archiveIdentity,phase:'start'})+'\n');
  let payload;
  try{
   const header=Buffer.from(JSON.stringify(m.outputs)+'\n');assert(header.length<=4*1024*1024,'Archive header cap');
   payload=JSON.parse(execFileSync('python3',['-c',`import json,sys,tarfile,hashlib
phase="header"; member=""; count=0; expected_count=0
# Diagnostics contain bounded repr strings; no archive-controlled newlines.
def progress():
 print("phase=%s members=%d expected=%d member=%s" % (phase,count,expected_count,repr(member[:160])),file=sys.stderr,flush=True)
try:
 header=sys.stdin.buffer.readline(4*1024*1024+1)
 assert len(header)<=4*1024*1024 and header.endswith(b"\\n"), "invalid bounded archive header"
 spec=json.loads(header); expected={o["path"]:o["mode"] for o in spec}
 assert len(expected)==len(spec)>0, "duplicate/empty expected output set"
 expected_count=len(expected); seen=set(); payload=[]
 phase="open"; progress()
 with tarfile.open(fileobj=sys.stdin.buffer,mode="r|*") as t:
  for m in t:
   member=m.name; count+=1; phase="member-header"
   if count<=8 or count&(count-1)==0: progress()
   assert m.isfile(), "nonregular archive member"
   assert m.name not in seen, "duplicate archive member"
   assert m.name in expected, "unexpected archive member"
   assert m.mode==expected[m.name], "archive mode mismatch"
   assert m.size>=0, "negative member size"
   seen.add(m.name); phase="member-data"
   digest=hashlib.sha256(); remaining=m.size
   with t.extractfile(m) as f:
    while remaining:
     chunk=f.read(min(1024*1024,remaining))
     assert chunk, "truncated archive member"
     remaining-=len(chunk); digest.update(chunk)
    assert f.read(1)==b"", "member size mismatch"
   payload.append(dict(path=m.name,mode=m.mode,sha256=digest.hexdigest()))
  phase="membership"
  assert seen==set(expected), "missing archive member"
 phase="complete"; progress()
 print(json.dumps(payload))
except BaseException:
 progress()
 raise
`],{input:Buffer.concat([header,archive]),timeout:30000,maxBuffer:8*1024*1024,stdio:['pipe','pipe','pipe']}));
  }catch(error){
   const detail=Buffer.isBuffer(error.stderr)?error.stderr.subarray(-8192).toString():'';
   throw Error('Closure archive reader failed '+JSON.stringify({...archiveIdentity,elapsedMs:Date.now()-archiveStarted,code:error.code||null,signal:error.signal||null})+' '+String(error.message).slice(0,300)+'\n'+detail);
  }
  process.stderr.write('[closure-archive] '+JSON.stringify({...archiveIdentity,phase:'complete',elapsedMs:Date.now()-archiveStarted})+'\n');
  const sorted=a=>a.slice().sort((a,b)=>a.path.localeCompare(b.path));
  assert.deepEqual(sorted(payload.map(({path,mode})=>({path,mode}))),sorted(m.outputs));
  for(const o of payload){assert(!all.has(o.path),'Duplicate package output ownership');all.set(o.path,o);}
  packages[name]={manifest:m,payload:sorted(payload)};
 }
 const outputs=[...all.values()].sort((a,b)=>a.path.localeCompare(b.path));
 const binding={roots:[app,'jwm','desktop-entries','xterm'],packages,outputs};
 return {binding,sha256:sha(JSON.stringify(binding)),checksums:outputs.map(o=>o.sha256+'  /usr/local/'+o.path+'\n').join('')};
}
// command is either the foreground session or its single-shell desktop adapter.
// stat follows package-manager output symlinks to check actual payload modes.
export async function verifyInstalledClosure(closure,readGuest,command,checksumPath,label){
 assert(/^\/home\/user\/migration-closure-(xarchiver|galculator)-[A-Za-z0-9_-]+\/(normal|reload)-(before|after)\/closure.sha256$/.test(checksumPath));
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
