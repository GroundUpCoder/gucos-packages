"""Relocate the exact accepted catalog, retaining input and binary bytes.

Run `manifests` first, commit, then `catalog MANIFEST_COMMIT` and commit again.
Old commit URLs remain immutable and work because the source history is retained.
Historical receipt/provenance files are deliberately not rewritten.
"""
import copy, hashlib, json, re, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
OLD = 'https://raw.githubusercontent.com/GroundUpCoder/wasm-posix-packages/'
NEW = 'https://raw.githubusercontent.com/GroundUpCoder/gucos-packages/'
def blob(rev, path):
    if not re.fullmatch('[0-9a-f]{40}', rev): raise ValueError('Unpinned revision')
    return subprocess.check_output(['git', 'show', rev+':'+path], cwd=ROOT)
def load(entry):
    url=entry['url']
    prefix=next((x for x in (OLD,NEW) if url.startswith(x)), None)
    if prefix is None: raise ValueError('Unexpected manifest origin '+url)
    rev,path=url[len(prefix):].split('/',1); data=blob(rev,path)
    if len(data)!=entry['size'] or hashlib.sha256(data).hexdigest()!=entry['sha256']: raise ValueError('Pinned object mismatch')
    return data
def encode(value): return (json.dumps(value,indent=2)+'\n').encode()
catalog=json.loads((ROOT/'catalog.json').read_text())
mode=sys.argv[1]
if mode=='manifests':
    originals={name:json.loads(load(entry)) for name,entry in catalog['packages'].items()}
    migrated={}; active=set()
    def visit(name):
        if name in migrated: return migrated[name]
        if name in active: raise ValueError('Dependency cycle')
        active.add(name); m=copy.deepcopy(originals[name])
        for dep in m['dependencies']:
            child=visit(dep); requirement=m.get('dependencyRequirements',{}).get(dep,{})
            if 'sha256' in requirement:
                if requirement['sha256']!=catalog['packages'][dep]['sha256']: raise ValueError('Old dependency hash mismatch')
                requirement['sha256']=hashlib.sha256(child).hexdigest()
        for entry in [*m['files'], *([m['binary']] if 'binary' in m else [])]:
            if entry['url'].startswith(OLD):
                load(entry);entry['url']=NEW+entry['url'][len(OLD):]
        data=encode(m);(ROOT/'apps'/name/'package.json').write_bytes(data)
        migrated[name]=data;active.remove(name);return data
    for name in originals: visit(name)
    print('Relocated accepted manifests:',len(migrated))
elif mode=='catalog':
    revision=sys.argv[2]
    for name in catalog['packages']:
        path='apps/'+name+'/package.json';data=blob(revision,path)
        if data!=(ROOT/path).read_bytes(): raise ValueError('Uncommitted manifest change')
        catalog['packages'][name]={'url':NEW+revision+'/'+path,'sha256':hashlib.sha256(data).hexdigest(),'size':len(data)}
    (ROOT/'catalog.json').write_bytes(encode(catalog))
    print('Pinned relocated catalog:',len(catalog['packages']))
else: raise ValueError('Use manifests or catalog COMMIT')
