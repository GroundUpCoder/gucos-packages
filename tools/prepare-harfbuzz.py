import os
"""Snapshot retained host-prepared HarfBuzz C with original provenance; no translation."""
from pathlib import Path
import gzip,hashlib,io,json,subprocess,tarfile
ROOT=Path(__file__).resolve().parents[1]
OLD=Path(os.environ['WASM_POSIX_HISTORICAL_CHECKOUT'])
REV='0b9b3245fe11a3bc677d81113cba90cd0ae80446'
prepared=OLD/'apps/harfbuzz/port/generated';original=json.loads((prepared/'provenance.json').read_text())
sha=lambda b:hashlib.sha256(b).hexdigest()
assert sha((prepared/'manifest.json').read_bytes())==original['translationManifestSha256']
files={p.relative_to(prepared).as_posix():p for p in prepared.rglob('*') if p.is_file()}
assert set(files)==set(original['files'])|{'manifest.json','provenance.json'}
for n,h in original['files'].items():assert sha(files[n].read_bytes())==h,n
out=ROOT/'apps/harfbuzz';out.mkdir()
subprocess.run(['python3',str(ROOT/'tools/historical-archive.py'),str(OLD),REV,'apps/harfbuzz',str(out/'source.tar')],cwd=ROOT,check=True)
with (out/'prepared.tar.gz').open('wb') as raw:
 with gzip.GzipFile(filename='',fileobj=raw,mode='wb',mtime=0) as gz:
  with tarfile.open(fileobj=gz,mode='w|',format=tarfile.USTAR_FORMAT) as archive:
   for n,p in sorted(files.items()):
    b=p.read_bytes();entry=tarfile.TarInfo('generated/'+n);entry.size=len(b);entry.mode=0o644;entry.mtime=0;archive.addfile(entry,io.BytesIO(b))
def write(n,x):(out/n).write_text(json.dumps(x,indent=2)+'\n')
write('provenance.json',dict(repository='wasm-posix-old (preserved local historical repository)',commit=REV,path='apps/harfbuzz',archiveSha256=sha((out/'source.tar').read_bytes()),overlays=[],status='historical C++ host preparation retained; no new guest acceptance',preparedArchive=dict(file='prepared.tar.gz',sha256=sha((out/'prepared.tar.gz').read_bytes()),originalPath=str(prepared),provenanceSha256=sha((prepared/'provenance.json').read_bytes()),manifestSha256=original['translationManifestSha256'],fileCount=len(files))))
# Keep original preparation scripts inside source.tar and generated archive.
install=subprocess.check_output(['git','-C',str(OLD),'show',REV+':apps/harfbuzz/port/install.sh'],text=True)
body=install[install.index('if [ ! -f'):]
(out/'build.sh').write_text('#!/bin/sh\nset -eu\ntar -xf source.tar\ntar -xzf prepared.tar.gz -C source/port\nstage="$DESTDIR"\ncd source\n'+body+'\nmkdir -p "$stage/share/licenses/harfbuzz"\ncp upstream/COPYING "$stage/share/licenses/harfbuzz/COPYING"\ncp port/fonts/ABeeZee-OFL.txt "$stage/share/licenses/harfbuzz/ABeeZee-OFL.txt"\n')
deps=['glib','pcre2','libintl','libiconv','zlib','freetype'];versions={n:json.loads((ROOT/'apps'/n/'recipe.json').read_text())['version'] for n in deps}
write('recipe.json',dict(name='harfbuzz',version='14.5.0-1',dependencies=deps,dependencyRequirements={n:{'version':versions[n]} for n in deps},platform=dict(target='wasm32-wasm-posix',minVersion='1.0.0',runtimeAbi=5,objectAbi=3,features=['posix-core','pthreads']),inputs=['source.tar','prepared.tar.gz','build.sh','test.sh']))
outputs=['lib/libharfbuzz.a','lib/libharfbuzz-runtime.a','lib/libharfbuzz.so','share/harfbuzz/translation.json']
outputs+=['include/harfbuzz/'+Path(n).name for n in files if n.startswith('include/')]
outputs+=['lib/pkgconfig/'+n+'.pc' for n in ['harfbuzz','harfbuzz-subset','harfbuzz-raster','harfbuzz-vector','harfbuzz-gpu']]
outputs+=['share/licenses/harfbuzz/'+n for n in ['COPYING','ABeeZee-OFL.txt']]
write('outputs.json',[dict(path=n,mode=420) for n in sorted(outputs)])
flags=' -I"$DESTDIR/include/harfbuzz" -I/usr/local/include/freetype2 -I/usr/local/include/glib-2.0 -I/usr/local/include'
libs=' -lglib-2.0 -lpcre2-8 -lintl -liconv -lz -lfreetype -lm'
args=' source/tests/fonts/a59fd13f1525a91cbe529c882e93d9d1fbb80463.ttf source/port/fonts/ABeeZee-Regular.ttf'
(out/'test.sh').write_text('#!/bin/sh\nset -eu\ncc source/port/consumer.c'+flags+' "$DESTDIR/lib/libharfbuzz.a" "$DESTDIR/lib/libharfbuzz-runtime.a"'+libs+' -o static-test\n./static-test'+args+'\ncc source/port/consumer.c'+flags+' -L"$DESTDIR/lib" -lharfbuzz "$DESTDIR/lib/libharfbuzz-runtime.a"'+libs+' -o shared-test\nLD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test'+args+'\n')
(out/'README.md').write_text('''# HarfBuzz\n\nUnpublished14.5.0 host-prepared C++ translation candidate. Tracked historical\nsources retain commit provenance. prepared.tar.gz separately snapshots the\noriginal generated C, headers, build script, translation manifest and original\nprovenance. Every40940 indexed file and the translation manifest SHA-256 were\nchecked before archiving. No new C++ translation or guest C++ compilation ran.\n\nGuest build compiles retained generated C and the original FreeType ABI adapter.\nThe retained consumer checks golden shaping, subset creation and FreeType-backed\nshaping with static/shared links. This is not a rerun of the full historical\nupstream/translator suite. Fresh guest build/acceptance remains pending.\nOriginal compiler/LLVM configuration and limitations remain in translation.json.\n''')
print(out,'prepared files',len(files),'archive bytes',(out/'prepared.tar.gz').stat().st_size)
