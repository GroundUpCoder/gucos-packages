# Run under agentone machine-job after explicitly supplied final site is staged.
# Does not discover a core tree, rebuild payloads, or edit production catalogs.
from pathlib import Path
import hashlib,json,os,socket,shutil,tarfile,io,sys
assert os.environ.get('MACHINE_JOB_ID')
r=Path(__file__).resolve().parents[3]
run=Path(sys.argv[1]).resolve();config=json.loads((run/'config.json').read_text())
site=Path(config['dist']);assert config['sourceDist'] and config['expectedRuntime']
assert json.loads((site/'build.json').read_text())['runtime']==config['expectedRuntime']
assert not (run/'profile').exists(), 'Install acceptance requires fresh profile'
plan=json.loads((r/'docs/research/tmux-ipc/final-artifact-plan.json').read_text())
with socket.socket() as sock:
 sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
(run/'port').write_text(str(port));origin='http://127.0.0.1:'+str(port)
def sha(b):return hashlib.sha256(b).hexdigest()
def write(p,v):p.write_text(json.dumps(v,indent=2)+'\n')
def entry(path,b):return {'url':origin+'/'+path,'sha256':sha(b),'size':len(b)}
fixture=site/'tmux-fixture';fixture.mkdir()
catalog={'format':1,'packages':{}};manifests={};receipts={}
for item in plan['artifacts']:
 name=item['name'];folder=fixture/name;folder.mkdir()
 data=(r/'docs/research/tmux-ipc'/item['archive']).read_bytes()
 assert sha(data)==item['sha256'] and len(data)==item['size']
 receipt=json.loads((r/'docs/research/tmux-ipc'/item['receipt']).read_text());receipts[name]=receipt
 outputs=receipt['outputs'];checks=[]
 with tarfile.open(fileobj=io.BytesIO(data)) as archive:
  members=archive.getmembers();assert all(m.isfile() for m in members)
  assert len(members)==len(outputs) and {m.name for m in members}=={o['path'] for o in outputs}
  for m in members:checks.append(sha(archive.extractfile(m).read())+'  /usr/local/'+m.name)
 (run/(name+'.sha256')).write_text('\n'.join(checks)+'\n')
 (folder/'binary.tar').write_bytes(data)
 recipe=json.loads((r/'apps'/name/'recipe.json').read_text());recipe.pop('inputs')
 manifest={'format':1,**recipe,'runtime':receipt['sourceRuntime'],'outputs':outputs,'licenses':[o['path'] for o in outputs if o['path'].startswith('share/licenses/')],'binary':entry('tmux-fixture/'+name+'/binary.tar',data)}
 write(folder/'package.json',manifest);manifests[name]=manifest
 catalog['packages'][name]=entry('tmux-fixture/'+name+'/package.json',(folder/'package.json').read_bytes())
write(fixture/'catalog.json',catalog);write(run/'candidate-manifests.json',manifests);write(run/'original-artifact-receipts.json',receipts)
config.update(catalogUrl=origin+'/tmux-fixture/catalog.json',artifactOnly=True,scope='Actual gucman install with dependency/eligibility checks; retained unchanged payloads; then lifecycle')
write(run/'config.json',config)
write(run/'dist-files.json',{str(p.relative_to(site)):{'sha256':sha(p.read_bytes()),'size':p.stat().st_size} for p in sorted(site.rglob('*')) if p.is_file()})
print('Private fixture ready:',run)
