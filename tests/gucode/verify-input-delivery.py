"""Verify anonymous public delivery of the exact selected gucode manifest/inputs."""
import hashlib,json,urllib.request
from pathlib import Path
root=Path(__file__).resolve().parents[2]
entry=json.loads((root/'catalog.json').read_text())['packages']['gucode']
url='https://raw.githubusercontent.com/GroundUpCoder/gucos-packages/main/catalog.json'
public=json.load(urllib.request.urlopen(url))
assert public['packages']['gucode']==entry
verified=[]
def fetch(ref):
 data=urllib.request.urlopen(ref['url']).read()
 assert len(data)==ref['size'] and hashlib.sha256(data).hexdigest()==ref['sha256'],ref['url']
 verified.append(ref)
 return data
manifest=json.loads(fetch(entry))
assert manifest==json.loads((root/'apps/gucode/package.json').read_text())
for ref in [*manifest['files'],manifest['binary']]:fetch(ref)
(root/'docs/research/gucode-0.1.2/public-delivery.json').write_text(json.dumps({'status':'passed','version':manifest['version'],'verified':verified},indent=2)+'\n')
print('PASS public catalog, manifest, source inputs and binary hash/size')
