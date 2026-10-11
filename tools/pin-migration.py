"""Pin explicitly selected new migrations without rewriting published baseline.
Usage: python3 tools/pin-migration.py manifests|catalog COMMIT NAME [NAME ...]
Only use after independent review and actual guest acceptance of the artifacts.
"""
import hashlib,json,re,subprocess,sys,argparse
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--upgrade-plan',type=Path)
parser.add_argument('mode',choices=['manifests','catalog'])
parser.add_argument('revision')
parser.add_argument('names',nargs='+')
args=parser.parse_args()
mode,revision,names=args.mode,args.revision,args.names
if not __debug__: raise RuntimeError('Validation requires assertions enabled')
assert mode in ('manifests','catalog') and re.fullmatch('[a-f0-9]{40}',revision)
assert names and len(names)==len(set(names)) and all(re.fullmatch('[a-z0-9][a-z0-9-]*',n) for n in names)
def blob(path):return subprocess.check_output(['git','show',revision+':'+path],cwd=ROOT)
def frozen(path):
 b=blob(path);assert b==(ROOT/path).read_bytes(),(path,'not frozen at revision');return b
def entry(path):
 b=frozen(path);return dict(url='https://raw.githubusercontent.com/GroundUpCoder/gucos-packages/'+revision+'/'+path,sha256=hashlib.sha256(b).hexdigest(),size=len(b))
baseline_revision=json.loads((ROOT/'tools/publication-baseline.json').read_text())['revision']
baseline=json.loads(subprocess.check_output(['git','show',baseline_revision+':catalog.json'],cwd=ROOT))
plan=json.loads(args.upgrade_plan.read_text()) if args.upgrade_plan else {'baselineRevision':baseline_revision,'upgrades':{}}
assert plan['baselineRevision']==baseline_revision
upgrades=plan['upgrades']
assert set(upgrades)<=set(names)
assert set(names)&set(baseline['packages'])==set(upgrades), 'Published replacements require an exact upgrade plan'
catalog=json.loads((ROOT/'catalog.json').read_text())
for n,e in baseline['packages'].items():
 assert catalog['packages'][n]==e, (n,'catalog differs from accepted baseline before pinning')
for n,u in upgrades.items():
 assert u['oldCatalogEntry']==baseline['packages'][n]
 old=json.loads(subprocess.check_output(['git','show',baseline_revision+':apps/'+n+'/package.json'],cwd=ROOT))
 assert old['version']==u['oldVersion'] and u['newVersion']!=u['oldVersion']
 recipe=json.loads(frozen('apps/'+n+'/recipe.json'))
 assert recipe['version']==u['newVersion']
 assert json.loads(frozen('apps/'+n+'/outputs.json'))==old['outputs'], 'Upgrade output set must remain identical'
 if mode=='catalog':
  candidate=json.loads(frozen('apps/'+n+'/package.json'))
  assert candidate['version']==u['newVersion'] and candidate['outputs']==old['outputs']
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
