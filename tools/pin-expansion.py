"""Pin candidate inputs/binaries, then catalog after committing manifests.
python3 tools/pin-expansion.py manifests INPUT_COMMIT
python3 tools/pin-expansion.py catalog MANIFEST_COMMIT
"""
import hashlib,json,subprocess,sys,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
mode,revision=sys.argv[1:]
assert re.fullmatch('[a-f0-9]{40}',revision),'full immutable commit SHA required'
subprocess.run(['git','cat-file','-e',revision+'^{commit}'],cwd=root,check=True)
base='https://raw.githubusercontent.com/GroundUpCoder/wasm-posix-packages/'+revision+'/'
def entry(path):
 b=(root/path).read_bytes();committed=subprocess.check_output(['git','show',revision+':'+path],cwd=root);assert b==committed,(path,'not committed at input revision')
 return dict(url=base+path,sha256=hashlib.sha256(b).hexdigest(),size=len(b))
def frozen_json(path):
 b=(root/path).read_bytes();assert b==subprocess.check_output(['git','show',revision+':'+path],cwd=root),(path,'metadata differs from pinned commit');return json.loads(b)
names=sorted(p.parent.name for p in (root/'apps').glob('*/recipe.json'))+['x11-server','x11-toolkit']
if mode=='manifests':
 for name in names:
  directory=root/'apps'/name;recipe=directory/'recipe.json'
  if recipe.exists():
   source=frozen_json('apps/'+name+'/recipe.json');inputs=source.pop('inputs',['source.tar','build.sh','test.sh'])
   manifest=dict(format=1,**source,files=[dict(path=p,**entry('apps/'+name+'/'+p)) for p in inputs],build='build.sh',test='test.sh',outputs=frozen_json('apps/'+name+'/outputs.json'))
   manifest['licenses']=[p['path'] for p in manifest['outputs'] if p['path'].startswith('share/licenses/')]
  else:manifest=frozen_json('apps/'+name+'/package.json')
  entry('apps/'+name+'/binaries/receipt.json')  # Receipt must also be frozen at INPUT_COMMIT.
  receipt=json.loads((directory/'binaries/receipt.json').read_text());guest=receipt['guestManifest']
  for field in ('name','version','dependencies','outputs','licenses'):assert guest[field]==manifest[field],(name,'stale guest receipt',field)
  def inputs(value):return sorted((f['path'],f['sha256'],f['size']) for f in value['files'])
  assert inputs(guest)==inputs(manifest),(name,'guest binary source inputs differ')
  binary=entry('apps/'+name+'/binaries/'+receipt['sha256']+'.tar');assert (binary['sha256'],binary['size'])==(receipt['sha256'],receipt['size'])
  manifest.update(runtime=receipt['runtime'],binary=binary)
  (directory/'package.json').write_text(json.dumps(manifest,indent=2)+'\n')
elif mode=='catalog':
 catalog=json.loads((root/'catalog.json').read_text())
 for name in names:catalog['packages'][name]=entry('apps/'+name+'/package.json')
 (root/'catalog.json').write_text(json.dumps(catalog,indent=2)+'\n')
else:raise SystemExit('expected manifests or catalog')
