"""Freeze installed closure expectations from pinned manifests and accepted exports.
Usage: python3 tests/migration/freeze-closure.py RUN_DIRECTORY ROOT_PACKAGE [OUTPUT_STEM] [--no-graphics-providers]
Read-only inputs; writes two new expectation files inside the run directory.
"""
import hashlib,io,json,re,subprocess,sys,tarfile
from pathlib import Path
from urllib.parse import urlsplit,unquote
run=Path(sys.argv[1]).resolve();root=sys.argv[2]
stem=sys.argv[3] if len(sys.argv)>3 else 'gtk-closure'
assert re.fullmatch('[a-z0-9-]+',root) and re.fullmatch('[a-z0-9-]+',stem)
assert len(sys.argv)<=5
no_providers=len(sys.argv)==5
if no_providers:assert sys.argv[4]=='--no-graphics-providers' and root!='gtk3-x11'
config=json.loads((run/'config.json').read_text())
candidates=json.loads((run/'candidate-manifests.json').read_text())
repo=Path(__file__).resolve().parents[2]
def digest(b):return hashlib.sha256(b).hexdigest()
def pinned(ref):
 u=urlsplit(ref['url']);parts=u.path.strip('/').split('/')
 if u.hostname=='raw.githubusercontent.com':
  assert parts[:2]==['GroundUpCoder','gucos-packages'] and re.fullmatch('[a-f0-9]{40}',parts[2])
  b=subprocess.check_output(['git','show',parts[2]+':'+ '/'.join(parts[3:])],cwd=repo)
 else:
  assert u.hostname=='127.0.0.1' and u.scheme=='http'
  path=unquote(u.path).lstrip('/');assert '..' not in Path(path).parts
  b=(Path(config.get('inputDist',config.get('dist')))/path).read_bytes()
 assert len(b)==ref['size'] and digest(b)==ref['sha256']
 return b
manifests={};files={};archives={}
def visit(name):
 if name in manifests:return
 m=candidates.get(name)
 if m is None:m=json.loads(pinned(config['baselinePackages'][name]))
 assert m['name']==name;manifests[name]=m
 for dep in m.get('dependencies',[]):visit(dep)
 if 'binary' in m:b=pinned(m['binary'])
 else:
  receipt=json.loads((run/'exports'/name/'build-receipt.json').read_text())
  assert receipt['guestManifest']==m
  b=(run/'exports'/name/(receipt['sha256']+'.tar')).read_bytes()
  assert digest(b)==receipt['sha256'] and len(b)==receipt['size']
 expected={o['path']:o for o in m['outputs']};seen=set()
 with tarfile.open(fileobj=io.BytesIO(b)) as archive:
  for f in archive:
   assert f.isfile() and f.name in expected and f.name not in seen
   assert f.mode==expected[f.name]['mode'];seen.add(f.name)
   path='/usr/local/'+f.name;assert path not in files
   files[path]=digest(archive.extractfile(f).read())
 assert seen==set(expected);archives[name]={'sha256':digest(b),'size':len(b)}
visit(root)
for basename in ([] if no_providers else ['libcairo.so','libXau.so','libxcb.so','libX11.so','libXext.so','libXrender.so','libXfixes.so','libXi.so','libXtst.so']):
 assert [p for p in files if p.rsplit('/',1)[-1]==basename]==['/usr/local/lib/'+basename]
sums=''.join(h+'  '+p+'\n' for p,h in sorted(files.items()))
with (run/(stem+'.sha256')).open('x') as f:f.write(sums)
with (run/(stem+'.json')).open('x') as f:json.dump(dict(root=root,inputCommit=config['inputCommit'],manifests=manifests,archives=archives,checksumsSha256=digest(sums.encode()),fileCount=len(files)),f,indent=2);f.write('\n')
print(len(manifests),'manifests;',len(files),'payload hashes frozen')
