"""Validate committed catalog closure and exact binary output inventories."""
import hashlib,io,json,subprocess,tarfile
from pathlib import Path
from urllib.parse import urlparse
root=Path(__file__).resolve().parents[1]
def load_object(entry):
 u=urlparse(entry['url']);prefix='/GroundUpCoder/wasm-posix-packages/'
 assert u.scheme=='https' and u.hostname=='raw.githubusercontent.com' and u.path.startswith(prefix)
 revision,path=u.path[len(prefix):].split('/',1)
 data=subprocess.check_output(['git','show',revision+':'+path],cwd=root)
 assert len(data)==entry['size'] and hashlib.sha256(data).hexdigest()==entry['sha256'],path
 return data
catalog=json.loads((root/'catalog.json').read_text());manifests={name:json.loads(load_object(entry)) for name,entry in catalog['packages'].items()}
owned={}
for name,m in manifests.items():
 assert m['name']==name
 for dep in m['dependencies']:assert dep in manifests,(name,dep)
 for out in m['outputs']:
  path=out['path'];assert path not in owned,(name,path,owned.get(path));owned[path]=name
 if 'binary' in m:
  data=load_object(m['binary'])
  with tarfile.open(fileobj=io.BytesIO(data)) as archive:
   members=archive.getmembers();assert all(x.isfile() for x in members),name
   paths=[x.name for x in members];assert len(set(paths))==len(paths),name
   assert set(paths)=={o['path'] for o in m['outputs']},(name,'binary output closure')
 for f in m['files']:
  if '/GroundUpCoder/wasm-posix-packages/' in f['url']:load_object(f)
for path in owned:
 components=path.split('/')
 for i in range(1,len(components)):assert '/'.join(components[:i]) not in owned,(path,'ancestor conflict')
def visit(name,parents):
 assert name not in parents,(name,'dependency cycle')
 for dep in manifests[name]['dependencies']:visit(dep,parents+[name])
for name in manifests:visit(name,[])
print('PASS catalog pinned inputs, dependency/ownership closure and binary inventories:',len(manifests),'packages')
