"""Verify preserved archive bytes against immutable historical Git blobs."""
from pathlib import Path
import hashlib,json,subprocess,tarfile
root=Path(__file__).resolve().parents[1];old=Path('/Users/jku/git/wasm-posix-old')
rev='0b9b3245fe11a3bc677d81113cba90cd0ae80446'
for p in sorted((root/'apps').glob('*/recipe.json')):
 name=p.parent.name;recipe=json.loads(p.read_text())
 if not (p.parent/'source.tar').exists():
  provenance=json.loads((p.parent/'provenance.json').read_text());assert hashlib.sha256((p.parent/'source.tar.gz').read_bytes()).hexdigest()==provenance['sha256'];continue
 source='apps/x11-apps/source' if name in ('x11-widgets','xmessage','xprop','xev','xterm') else 'apps/jwm/source' if name=='jwm' else 'apps/zstd' if name=='zstd' else 'apps/x11-apps-more/source/'+name+'-'+recipe['version'].removesuffix('-1')
 records={}
 listing=subprocess.check_output(['git','-C',str(old),'ls-tree','-r',rev,'--',source],text=True)
 for line in listing.splitlines():
  meta,path=line.split('\t',1);records[path]=(meta.split()[0],meta.split()[2])
 count=0;seen=set()
 with tarfile.open(p.parent/'source.tar') as t:
  for member in t.getmembers():
   path=source+'/'+member.name.removeprefix('source/');b=member.linkname.encode() if member.issym() else t.extractfile(member).read()
   assert path not in seen,(name,'duplicate archive path',path);seen.add(path)
   assert member.issym()==(records[path][0]=='120000'),(name,'file type',path)
   expected=records[path][1];actual=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
   assert expected==actual,(name,path,'differs from historical Git')
   count+=1
 assert count>0,(name,"empty source archive")
 assert seen==set(records),(name,'archive differs from complete historical tree')
 provenance=dict(repository='wasm-posix-old (preserved local historical repository)',commit=rev,path=source,files=count,archiveSha256=hashlib.sha256((p.parent/'source.tar').read_bytes()).hexdigest(),method='Every archive file byte-compared with its immutable Git blob identity; package overlays are separate inputs.')
 if name=='xeyes':
  overlay='apps/x11-apps-more/source/overlays/xeyes-Eyes.c';b=(p.parent/'Eyes.c').read_bytes();blob=subprocess.check_output(['git','-C',str(old),'rev-parse',rev+':'+overlay],text=True).strip();assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==blob
  provenance['overlays']=[dict(file='Eyes.c',historicalPath=overlay,blob=blob,sha256=hashlib.sha256(b).hexdigest())]
 (p.parent/'provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
 print(name,count,'historical files verified')
