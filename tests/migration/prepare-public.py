"""Prepare fresh public acceptance from exact private binary inputs and catalog.
Usage: python3 tests/migration/prepare-public.py BINARY_RUN NEW_RUN CATALOG_COMMIT NAME ...
Does not publish or launch a browser. Never reuses an existing run directory.
"""
import hashlib,json,re,shutil,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]
source_name,new_name,revision,*names=sys.argv[1:]
assert all(re.fullmatch('[a-zA-Z0-9_-]+',n) for n in [source_name,new_name])
assert re.fullmatch('[a-f0-9]{40}',revision)
assert names and len(names)==len(set(names))
base=root/'test-results/migration';source=base/source_name;run=base/new_name
config=json.loads((source/'config.json').read_text());old=json.loads((source/'candidate-manifests.json').read_text())
def git(path,commit=revision):return subprocess.check_output(['git','show',commit+':'+path],cwd=root)
catalog=json.loads(git('catalog.json'));manifests={}
for name in names:
 ref=catalog['packages'][name]
 prefix='https://raw.githubusercontent.com/GroundUpCoder/gucos-packages/'
 assert ref['url'].startswith(prefix)
 commit,path=ref['url'][len(prefix):].split('/',1)
 assert re.fullmatch('[a-f0-9]{40}',commit) and path=='apps/'+name+'/package.json'
 b=git(path,commit);assert len(b)==ref['size'] and hashlib.sha256(b).hexdigest()==ref['sha256']
 m=json.loads(b)
 for field in ['name','version','dependencies','dependencyRequirements','platform','outputs','licenses','runtime']:
  assert m[field]==old[name][field],(name,field)
 tuples=lambda files:[(f['path'],f['sha256'],f['size']) for f in files]
 assert tuples(m['files'])==tuples(old[name]['files'])
 assert all(m['binary'][f]==old[name]['binary'][f] for f in ['sha256','size'])
 manifests[name]=m
run.mkdir(exist_ok=False)
config['inputDist']=config.pop('dist',config.get('inputDist'))
config.update(url='https://os.groundupcoder.com/',catalogUrl=prefix+revision+'/catalog.json',catalogCommit=revision,candidates=names,baselinePackages={k:v for k,v in catalog['packages'].items() if k not in names})
for name in names:shutil.copyfile(source/(name+'.sha256'),run/(name+'.sha256'))
(run/'config.json').write_text(json.dumps(config,indent=2)+'\n')
(run/'candidate-manifests.json').write_text(json.dumps(manifests,indent=2)+'\n')
print(run)
