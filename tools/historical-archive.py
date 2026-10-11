"""Archive immutable Git blobs without worktree/eol filters; no source checkout edits.
Usage: python3 tools/historical-archive.py REPOSITORY COMMIT TREE_PATH OUTPUT_TAR
"""
import io,subprocess,sys,tarfile
repository,revision,source,destination=sys.argv[1:]
listing=subprocess.check_output(['git','-C',repository,'ls-tree','-r',revision,'--',source],text=True)
entries=[(line.split('\t')[0].split(),line.split('\t')[1]) for line in listing.splitlines()]
assert entries,'empty source tree'
raw=subprocess.check_output(['git','-C',repository,'cat-file','--batch'],input=('\n'.join(meta[2] for meta,path in entries)+'\n').encode());stream=io.BytesIO(raw)
with tarfile.open(destination,'w',format=tarfile.USTAR_FORMAT) as archive:
 for meta,path in entries:
  header=stream.readline().split();data=stream.read(int(header[2]));assert stream.read(1)==b'\n'
  assert path.startswith(source+'/')
  info=tarfile.TarInfo('source/'+path[len(source)+1:]);info.mode=0o755 if meta[0]=='100755' else 0o644
  if meta[0]=='120000':info.type=tarfile.SYMTYPE;info.linkname=data.decode();archive.addfile(info)
  else:assert meta[0] in ('100644','100755');info.size=len(data);archive.addfile(info,io.BytesIO(data))
