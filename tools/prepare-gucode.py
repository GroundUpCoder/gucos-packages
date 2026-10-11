"""Freeze an explicitly supplied gucode checkout into declared package inputs."""
import argparse,hashlib,io,json,subprocess,tarfile
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('source',type=Path);args=p.parse_args()
base=args.source.resolve();out=Path(__file__).resolve().parents[1]/'apps/gucode'
paths=[*base.glob('src/*'),*base.glob('vendor/cjson/*'),base/'LICENSE']
with tarfile.open(out/'source.tar','w',format=tarfile.USTAR_FORMAT) as tar:
 for f in sorted(paths):
  assert f.is_file();data=f.read_bytes();info=tarfile.TarInfo('source/'+str(f.relative_to(base)));info.size=len(data);info.mode=0o644;tar.addfile(info,io.BytesIO(data))
rev=subprocess.check_output(['git','rev-parse','HEAD'],cwd=base,text=True).strip() if (base/'.git/refs/heads/main').exists() else None
receipt={'repository':'https://github.com/josephkimgpt/gucode','revision':rev,'sourceArchiveSha256':hashlib.sha256((out/'source.tar').read_bytes()).hexdigest(),'sourceFiles':{str(f.relative_to(base)):hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(paths)}}
(out/'provenance.json').write_text(json.dumps(receipt,indent=2)+'\n')
