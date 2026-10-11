"""Pin reviewed NEW packages while preserving every pre-existing catalog entry.

Unlike migration upgrades, this operation cannot replace any package. An explicit
pre-addition catalog revision is frozen, including entries published by other
work. It neither advances the historical publication baseline nor accepts another
package's pending gates. Run only after review and actual guest acceptance.
"""
import argparse,hashlib,json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('mode',choices=['manifests','catalog']);p.add_argument('--catalog-base',required=True);p.add_argument('--artifacts',required=True);p.add_argument('--manifests');p.add_argument('names',nargs='+');args=p.parse_args()
assert __debug__
for rev in [args.catalog_base,args.artifacts,*([args.manifests] if args.manifests else [])]:
 assert re.fullmatch('[a-f0-9]{40}',rev)
subprocess.run(['git','merge-base','--is-ancestor',args.catalog_base,args.artifacts],cwd=ROOT,check=True)
def blob(rev,path):return subprocess.check_output(['git','show',rev+':'+path],cwd=ROOT)
def frozen(rev,path):
 b=blob(rev,path);assert (ROOT/path).read_bytes()==b,(path,'differs from frozen revision');return b
def ref(rev,path):
 b=frozen(rev,path);return {'url':'https://raw.githubusercontent.com/GroundUpCoder/gucos-packages/'+rev+'/'+path,'sha256':hashlib.sha256(b).hexdigest(),'size':len(b)}
base=json.loads(blob(args.catalog_base,'catalog.json'))
assert json.loads((ROOT/'catalog.json').read_text())==base,'Existing catalog changed; review/rebase before adding'
assert len(args.names)==len(set(args.names))
assert all(re.fullmatch('[a-z0-9][a-z0-9-]*',n) and n not in base['packages'] for n in args.names),'Only new packages permitted'
prepared={}
for name in args.names:
 prefix='apps/'+name+'/'
 recipe=json.loads(frozen(args.artifacts,prefix+'recipe.json'));inputs=recipe.pop('inputs');assert recipe['name']==name
 outputs=json.loads(frozen(args.artifacts,prefix+'outputs.json'))
 manifest={'format':1,**recipe,'files':[{'path':f,**ref(args.artifacts,prefix+f)} for f in inputs],'build':'build.sh','test':'test.sh','outputs':outputs,'licenses':[o['path'] for o in outputs if o['path'].startswith('share/licenses/')]}
 receipt=json.loads(frozen(args.artifacts,prefix+'binaries/receipt.json'));guest=receipt['guestManifest']
 for field in ['name','version','dependencies','dependencyRequirements','platform','outputs','licenses']:assert guest[field]==manifest[field],(name,field)
 tuples=lambda fs:[(f['path'],f['sha256'],f['size']) for f in fs]
 assert tuples(guest['files'])==tuples(manifest['files'])
 binary=ref(args.artifacts,prefix+'binaries/'+receipt['sha256']+'.tar');assert binary['sha256']==receipt['sha256'] and binary['size']==receipt['size']
 manifest.update(runtime=receipt['runtime'],binary=binary)
 prepared[prefix+'package.json']=manifest
if args.mode=='manifests':
 for path,m in prepared.items():(ROOT/path).write_text(json.dumps(m,indent=2)+'\n')
else:
 assert args.manifests
 subprocess.run(['git','merge-base','--is-ancestor',args.artifacts,args.manifests],cwd=ROOT,check=True)
 for name in args.names:
  path='apps/'+name+'/package.json';assert json.loads(frozen(args.manifests,path))==prepared[path]
  base['packages'][name]=ref(args.manifests,path)
 (ROOT/'catalog.json').write_text(json.dumps(base,indent=2)+'\n')
