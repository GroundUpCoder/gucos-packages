"""Verify every active package object, optionally against anonymous GitHub HTTP.
Usage: python3 tools/check-publication.py [--remote]
No credentials are sent. Historical provenance is outside the active URL closure.
"""
import concurrent.futures, hashlib, json, re, subprocess, sys, urllib.request
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1]
PREFIX='https://raw.githubusercontent.com/GroundUpCoder/gucos-packages/'
catalog=json.loads((ROOT/'catalog.json').read_text());objects={};revisions=set()
def load(entry):
    url=entry['url']
    if 'wasm-posix-packages' in url or 'groundupcoder.net' in url: raise ValueError('Retired origin: '+url)
    previous=objects.setdefault(url,entry)
    if (previous['sha256'],previous['size'])!=(entry['sha256'],entry['size']): raise ValueError('Conflicting identity')
    if not url.startswith(PREFIX): return None
    rev,path=url[len(PREFIX):].split('/',1)
    if not re.fullmatch('[a-f0-9]{40}',rev): raise ValueError('Unpinned revision')
    if rev not in revisions:
        subprocess.run(['git','merge-base','--is-ancestor',rev,'HEAD'],cwd=ROOT,check=True);revisions.add(rev)
    data=subprocess.check_output(['git','show',rev+':'+path],cwd=ROOT)
    if len(data)!=entry['size'] or hashlib.sha256(data).hexdigest()!=entry['sha256']: raise ValueError('Object mismatch: '+url)
    return data
manifests={}
for name,entry in catalog['packages'].items():
    m=json.loads(load(entry));manifests[name]=m
    if m['name']!=name: raise ValueError('Name mismatch')
    for f in [*m['files'],*([m['binary']] if 'binary' in m else [])]:load(f)
for name,m in manifests.items():
    for dep,req in m.get('dependencyRequirements',{}).items():
        selected=manifests[dep]
        if 'sha256' in req and req['sha256']!=catalog['packages'][dep]['sha256']:raise ValueError('Dependency hash mismatch')
        if 'version' in req and req['version']!=selected['version']:raise ValueError('Dependency version mismatch')
print('PASS local active closure:',len(manifests),'packages,',len(objects),'objects,',sum(e['size'] for e in objects.values()),'bytes',flush=True)
if '--remote' in sys.argv:
    def check(item):
        url,entry=item;h=hashlib.sha256();size=0
        with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'gucos-publication-check'}),timeout=120) as r:
            if r.status!=200:raise ValueError('Non-200 object')
            for b in iter(lambda:r.read(1048576),b''):h.update(b);size+=len(b)
        if size!=entry['size'] or h.hexdigest()!=entry['sha256']:raise ValueError('Anonymous object mismatch: '+url)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for i,_ in enumerate(pool.map(check,objects.items()),1):
            if i%50==0:print('Verified anonymous objects:',i,flush=True)
    print('PASS anonymous HTTP hashes and sizes for all active objects')
