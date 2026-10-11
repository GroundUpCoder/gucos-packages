"""Pin explicitly selected new migrations without rewriting baseline19.
Usage: python3 tools/pin-migration.py manifests|catalog COMMIT NAME [NAME ...]
Only use after independent review and actual guest acceptance of the artifacts.
"""
import hashlib,json,re,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
mode,revision,*names=sys.argv[1:]
assert mode in ('manifests','catalog') and re.fullmatch('[a-f0-9]{40}',revision)
assert names and len(names)==len(set(names)) and all(re.fullmatch('[a-z0-9][a-z0-9-]*',n) for n in names)
def blob(path):return subprocess.check_output(['git','show',revision+':'+path],cwd=ROOT)
def frozen(path):
 b=blob(path);assert b==(ROOT/path).read_bytes(),(path,'not frozen at revision');return b
def entry(path):
 b=frozen(path);return dict(url='https://raw.githubusercontent.com/GroundUpCoder/wasm-posix-packages/'+revision+'/'+path,sha256=hashlib.sha256(b).hexdigest(),size=len(b))
baseline=json.loads(subprocess.check_output(['git','show','716bfe27a56357513abfc7213d542bda63129cd1:catalog.json'],cwd=ROOT))
assert not set(names)&set(baseline['packages']), 'Baseline mutation forbidden'
catalog=json.loads((ROOT/'catalog.json').read_text())
for n,e in baseline['packages'].items():assert catalog['packages'][n]==e
for name in names:
 prefix='apps/'+name+'/'
 if mode=='manifests':
  recipe=json.loads(frozen(prefix+'recipe.json'));inputs=recipe.pop('inputs');assert recipe['name']==name
  outputs=json.loads(frozen(prefix+'outputs.json'));licenses=[o['path'] for o in outputs if o['path'].startswith('share/licenses/')]
  manifest=dict(format=1,**recipe,files=[dict(path=p,**entry(prefix+p)) for p in inputs],build='build.sh',test='test.sh',outputs=outputs,licenses=licenses)
  receipt=json.loads(frozen(prefix+'binaries/receipt.json'));guest=receipt['guestManifest']
  for field in ['name','version','dependencies','dependencyRequirements','platform','outputs','licenses']:
   assert guest[field]==manifest[field],(name,field,'receipt mismatch')
  assert [(f['path'],f['sha256'],f['size']) for f in guest['files']]==[(f['path'],f['sha256'],f['size']) for f in manifest['files']]
  binary=entry(prefix+'binaries/'+receipt['sha256']+'.tar');assert (binary['sha256'],binary['size'])==(receipt['sha256'],receipt['size'])
  manifest.update(runtime=receipt['runtime'],binary=binary)
  (ROOT/prefix/'package.json').write_text(json.dumps(manifest,indent=2)+'\n')
 else:catalog['packages'][name]=entry(prefix+'package.json')
if mode=='catalog':(ROOT/'catalog.json').write_text(json.dumps(catalog,indent=2)+'\n')
