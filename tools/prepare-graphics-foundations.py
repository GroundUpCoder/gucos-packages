"""One-shot, explicit source preparation; never builds or publishes packages."""
import hashlib
import json
import subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OLD='/Users/jku/git/wasm-posix-old'
REV='0b9b3245fe11a3bc677d81113cba90cd0ae80446'
def blob(path):return subprocess.check_output(['git','-C',OLD,'show',REV+':'+path])
def paths(path):return subprocess.check_output(['git','-C',OLD,'ls-tree','-r','--name-only',REV,path],text=True).splitlines()
def save(path,obj):path.write_text(json.dumps(obj,indent=2)+'\n')
specs=[
 ('pixman','0.46.4-1',[],['COPYING'],['lib/libpixman-1.a','lib/libpixman-1.so','include/pixman-1/pixman.h','include/pixman-1/pixman-version.h','lib/pkgconfig/pixman-1.pc']),
 ('libpng','1.6.58-1',['zlib'],['LICENSE'],['lib/libpng16.a','lib/libpng16.so','include/png.h','include/pngconf.h','include/pnglibconf.h','lib/pkgconfig/libpng.pc']),
 ('freetype','2.14.1-1',[],['LICENSE.TXT','docs/FTL.TXT'],['lib/libfreetype.a','lib/libfreetype.so','lib/pkgconfig/freetype2.pc']),
 ('fontconfig','2.15.0-1',['freetype','expat'],['COPYING','port/ABeeZee-OFL.txt','port/SourceCodePro-LICENSE.md'],['lib/libfontconfig.a','lib/libfontconfig.so','include/fontconfig/fontconfig.h','include/fontconfig/fcfreetype.h','lib/pkgconfig/fontconfig.pc','etc/fonts/fonts.conf','share/fonts/wasm-posix/ABeeZee-Regular.ttf','share/fonts/wasm-posix/SourceCodePro-Regular.otf']),
]
versions={p.parent.name:json.loads(p.read_text())['version'] for p in (ROOT/'apps').glob('*/recipe.json')}
versions.update({n:v for n,v,*_ in specs})
for name,version,deps,licenses,outputs in specs:
 d=ROOT/'apps'/name
 assert not d.exists(), 'Refuse to overwrite candidate '+name
 d.mkdir()
 source='vendor/'+name
 subprocess.run(['python3',str(ROOT/'tools/historical-archive.py'),OLD,REV,source,str(d/'source.tar')],check=True,cwd=ROOT)
 inputs=['source.tar','build.sh','test.sh'];overlays=[]
 script=blob(source+'/install.sh').decode().replace('set -e\nstage=$1\ncd /usr/src/'+name,'set -eu\ntar -xf source.tar\nstage="$PWD/stage"\ncd source')
 script=script.replace('/usr/src/'+name+'/', '"$PWD"/')
 if name=='freetype':
  for p in paths(source+'/include'):
   rel=p.removeprefix(source+'/include/')
   if rel=='ft2build.h' or (rel.startswith('freetype/') and rel.endswith('.h') and (rel.count('/')==1 or rel.startswith('freetype/config/') and rel.count('/')==2)):
    outputs.append('include/freetype2/'+rel)
 if name=='fontconfig':
  for filename in ['ABeeZee-Regular.ttf','SourceCodePro-Regular.otf']:
   historical='vendor/freetype/port/fonts/'+filename;b=blob(historical);(d/filename).write_bytes(b)
   inputs.append(filename);overlays.append(dict(file=filename,historicalPath=historical,sha256=hashlib.sha256(b).hexdigest()))
   script=script.replace('/usr/src/freetype/port/fonts/'+filename,'"$PWD/../'+filename+'"')
 script+='\nmkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/'+name+'"\n'
 script+='cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"\ncp -R "$stage/include/." "$DESTDIR/include/"\ncp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"\n'
 if name=='fontconfig':script+='cp -R "$stage/etc" "$DESTDIR/"\nmkdir -p "$DESTDIR/share/fonts"\ncp -R "$stage/share/fonts/." "$DESTDIR/share/fonts/"\n'
 for p in licenses:
  out='share/licenses/'+name+'/'+Path(p).name;outputs.append(out)
  script+='cp "'+p+'" "$DESTDIR/'+out+'"\n'
 (d/'build.sh').write_text(script)
 save(d/'outputs.json',[dict(path=p,mode=420) for p in outputs])
 save(d/'recipe.json',dict(name=name,version=version,dependencies=deps,dependencyRequirements={dep:dict(version=versions[dep]) for dep in deps},platform=dict(target='wasm32-wasm-posix',minVersion='1.0.0',runtimeAbi=5,objectAbi=3,features=['posix-core']),inputs=inputs))
 save(d/'provenance.json',dict(repository='wasm-posix-old (preserved local historical repository)',commit=REV,path=source,archiveSha256=hashlib.sha256((d/'source.tar').read_bytes()).hexdigest(),overlays=overlays,status='source migration candidate; no new guest execution'))
 (d/'README.md').write_text(f'# {name}\n\nUnpublished {version} candidate from `{source}` at `{REV}`.\nHistorical source/configuration is preserved; build.sh adapts the original install\nrecipe to the current prefix/output contract. Static and shared library outputs\nrequire separate guest relink and execution acceptance. No new guest tests ran.\n')
