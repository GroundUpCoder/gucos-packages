"""Pin candidate inputs/binaries, then catalog after committing manifests.
python3 tools/pin-expansion.py manifests INPUT_COMMIT
python3 tools/pin-expansion.py catalog MANIFEST_COMMIT
"""
import hashlib,json,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
mode,revision=sys.argv[1:]
subprocess.run(['git','cat-file','-e',revision+'^{commit}'],cwd=root,check=True)
base='https://raw.githubusercontent.com/GroundUpCoder/wasm-posix-packages/'+revision+'/'
def entry(path):
 b=(root/path).read_bytes();committed=subprocess.check_output(['git','show',revision+':'+path],cwd=root);assert b==committed,(path,'not committed at input revision')
 return dict(url=base+path,sha256=hashlib.sha256(b).hexdigest(),size=len(b))
names=sorted(p.parent.name for p in (root/'apps').glob('*/recipe.json'))+['x11-server','x11-toolkit']
if mode=='manifests':
 for name in names:
  directory=root/'apps'/name;recipe=directory/'recipe.json'
  if recipe.exists():
   source=json.loads(recipe.read_text());inputs=source.pop('inputs',['source.tar','build.sh','test.sh'])
   manifest=dict(format=1,**source,files=[dict(path=p,**entry('apps/'+name+'/'+p)) for p in inputs],build='build.sh',test='test.sh',outputs=json.loads((directory/'outputs.json').read_text()))
   manifest['licenses']=[p['path'] for p in manifest['outputs'] if p['path'].startswith('share/licenses/')]
  else:manifest=json.loads((directory/'package.json').read_text())
  receipt=json.loads((directory/'binaries/receipt.json').read_text());binary=entry('apps/'+name+'/binaries/'+receipt['sha256']+'.tar');assert (binary['sha256'],binary['size'])==(receipt['sha256'],receipt['size'])
  manifest.update(runtime=receipt['runtime'],binary=binary)
  (directory/'package.json').write_text(json.dumps(manifest,indent=2)+'\n')
elif mode=='catalog':
 catalog=json.loads((root/'catalog.json').read_text())
 for name in names:catalog['packages'][name]=entry('apps/'+name+'/package.json')
 (root/'catalog.json').write_text(json.dumps(catalog,indent=2)+'\n')
else:raise SystemExit('expected manifests or catalog')
