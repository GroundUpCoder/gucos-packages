"""Freeze a private migration run from committed candidates and read-only core dist.
Usage: python3 tests/migration/prepare.py RUN_NAME INPUT_COMMIT NAME [NAME ...]
This only prepares files; browser execution requires a separate machine-job.
"""
import hashlib,io,json,os,re,shutil,socket,subprocess,sys,tarfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
name,revision,*names=sys.argv[1:]
assert re.fullmatch('[a-zA-Z0-9_-]+',name) and re.fullmatch('[a-f0-9]{40}',revision)
assert names and len(names)==len(set(names))
assert all(re.fullmatch('[a-z0-9][a-z0-9-]*',n) for n in names)
# Per-candidate frozen exports allow source recipes to consume exact accepted
# dependency binaries without rebuilding that dependency graph on each retry.
binary_runs=json.loads(os.environ.get('MIGRATION_BINARY_RUNS','{}'))
assert isinstance(binary_runs,dict) and set(binary_runs)<=set(names)
assert all(isinstance(v,str) and v for v in binary_runs.values())
assert not (binary_runs and os.environ.get('MIGRATION_BINARY_RUN')), 'Choose global or per-candidate binary inputs'
run=ROOT/'test-results/migration'/name
run.mkdir(parents=True,exist_ok=False)
def blob(path):return subprocess.check_output(['git','show',revision+':'+path],cwd=ROOT)
def sha(b):return hashlib.sha256(b).hexdigest()
def write(path,x):path.write_text(json.dumps(x,indent=2)+'\n')
site=run/'site';shutil.copytree(os.environ['GUCOS_CORE_DIST'],site)
core=json.loads((site/'build.json').read_text())
assert core['runtime']==os.environ['COMPAT_EXPECT_RUNTIME'], 'Explicit candidate runtime required'
resume=os.environ.get('MIGRATION_PROFILE_FROM')
if resume:
 previous=Path(resume).resolve();assert previous.parent==(ROOT/'test-results/migration').resolve()
 prior=json.loads((previous/'config.json').read_text());assert prior['expectedRuntime']==core['runtime']
 port=int((previous/'port').read_text());shutil.copytree(previous/'profile',run/'profile')
else:
 with socket.socket() as sock:
  sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
(run/'port').write_text(str(port));origin='http://127.0.0.1:'+str(port)
catalog=json.loads(blob('catalog.json'));baseline=dict(catalog['packages']);manifests={}
def entry(path,b):return dict(url=origin+'/'+path,sha256=sha(b),size=len(b))
for n in names:
 recipe=json.loads(blob('apps/'+n+'/recipe.json'));assert recipe['name']==n
 assert n not in baseline, 'baseline candidate replacement prohibited'
 inputs=recipe.pop('inputs');d=site/'migration'/n;d.mkdir(parents=True)
 files=[]
 for file in inputs:
  assert not Path(file).is_absolute() and '..' not in Path(file).parts
  b=blob('apps/'+n+'/'+file);target=d/file;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(b)
  files.append(dict(path=file,**entry('migration/'+n+'/'+file,b)))
 outputs=json.loads(blob('apps/'+n+'/outputs.json'))
 manifest=dict(format=1,**recipe,files=files,build='build.sh',test='test.sh',outputs=outputs,licenses=[o['path'] for o in outputs if o['path'].startswith('share/licenses/')])
 binary_run=binary_runs.get(n) or os.environ.get('MIGRATION_BINARY_RUN')
 if binary_run:
  receipt=json.loads((Path(binary_run)/'exports'/n/'build-receipt.json').read_text())
  guest=receipt['guestManifest']
  for field in ['name','version','dependencies','dependencyRequirements','platform','outputs','licenses']:
   assert guest[field]==manifest[field],(n,field,'stale source receipt')
  assert [(f['path'],f['sha256'],f['size']) for f in guest['files']]==[(f['path'],f['sha256'],f['size']) for f in files]
  b=(Path(binary_run)/'exports'/n/(receipt['sha256']+'.tar')).read_bytes()
  assert sha(b)==receipt['sha256'] and len(b)==receipt['size']
  with tarfile.open(fileobj=io.BytesIO(b)) as archive:
   members=archive.getmembers();assert all(m.isfile() for m in members)
   assert len(members)==len(outputs) and {m.name for m in members}=={o['path'] for o in outputs}
   checksums=[sha(archive.extractfile(m).read())+'  /usr/local/'+m.name for m in members]
  (d/'binary.tar').write_bytes(b);(run/(n+'.sha256')).write_text('\n'.join(checksums)+'\n')
  manifest.update(runtime=receipt['runtime'],binary=entry('migration/'+n+'/binary.tar',b))
 write(d/'package.json',manifest);catalog['packages'][n]=entry('migration/'+n+'/package.json',(d/'package.json').read_bytes());manifests[n]=manifest
for n,m in manifests.items():
 for dep in m['dependencies']:assert dep in catalog['packages'],(n,dep,'missing dependency')
write(site/'migration/catalog.json',catalog)
snapshot={p.relative_to(site).as_posix():dict(sha256=sha(p.read_bytes()),size=p.stat().st_size) for p in site.rglob('*') if p.is_file()}
write(run/'dist-files.json',snapshot)
write(run/'config.json',dict(expectedRuntime=core['runtime'],dist=str(site.resolve()),inputCommit=revision,resumedPrivateProfile=resume,candidates=names,catalogUrl=origin+'/migration/catalog.json',baselinePackages=baseline,distributionSnapshotSha256=sha((run/'dist-files.json').read_bytes())))
write(run/'candidate-manifests.json',manifests)
print(run)
