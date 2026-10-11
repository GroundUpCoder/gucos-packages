"""Adapt the retained GTK X11 recipe to one public Cairo/X11 provider closure."""
from pathlib import Path
import subprocess,tarfile,json,hashlib,shutil,re
ROOT=Path(__file__).resolve().parents[1];OLD=Path('/Users/jku/git/wasm-posix-old');REV='0b9b3245fe11a3bc677d81113cba90cd0ae80446'
out=ROOT/'apps/gtk3-x11';out.mkdir()
def blob(p):return subprocess.check_output(['git','-C',str(OLD),'show',REV+':'+p])
def archive(tree,name):subprocess.run(['python3',str(ROOT/'tools/historical-archive.py'),str(OLD),REV,tree,str(out/name)],cwd=ROOT,check=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(n,x):(out/n).write_text(json.dumps(x,indent=2)+'\n')
archive('apps/gtk3-x11/source','source.tar');archive('vendor/gtk3','gtk-source.tar');shutil.copyfile(ROOT/'apps/gio-core/source.tar',out/'gio-source.tar')
licenses={'COPYING-GTK':'apps/gtk3-x11/COPYING-GTK','COPYING-Cairo':'apps/gtk3-x11/COPYING-Cairo','GLib-COPYING':'vendor/glib/COPYING'}
for n,p in licenses.items():(out/n).write_bytes(blob(p))
original=blob('apps/gtk3-x11/source/install.sh').decode();lines=original.splitlines();start=next(i for i,l in enumerate(lines) if l.startswith('cc -O2 '));adapted=[];units=0
for line in lines[start:]:
 if line.startswith('echo "GTK X11:'):continue
 if line.startswith('cc -O2 ') and ' -c "$stage/work/cairo/' in line:continue
 if '-Wl,-soname,libcairo.so' in line:continue
 if '"$stage/include/gtk3-x11/cairo' in line:continue
 if line.startswith("sed 's|^libdir="):continue
 line=line.replace('-I"$stage/work/cairo" ','').replace('-I"$stage/work/cairo/src" ','')
 line=line.replace('/usr/src/gio-core',str('$PWD/gio-source/source')).replace('/usr/src/gtk3-x11',str('$PWD/source'))
 if line.startswith('"$stage/objects/resource-pack"'):
  line='sed "s@/usr/src/gtk3/@$stage/work/gtk3/@g" "$stage/work/gtk3/port/resources.tsv" > "$stage/work/resources.tsv"\n"$stage/objects/resource-pack" "$stage/work/resources.tsv" "$stage/lib/gtk-3-x11/gtk.gresource"'
 if line.startswith('cp "$PWD/source/pkgconfig/*.pc') or line.startswith('cp $PWD/source/pkgconfig/*.pc'):
  line='cp source/pkgconfig/gtk+-3.0.pc source/pkgconfig/gdk-3.0.pc "$stage/lib/gtk3-x11/pkgconfig/"'
 # Exact original unquoted source prefix becomes expanded shell path.
 line=line.replace('cp $PWD/source/pkgconfig/*.pc','cp source/pkgconfig/gtk+-3.0.pc source/pkgconfig/gdk-3.0.pc')
 if line.startswith('cc -O2 '):
  units+=1
  if units%25==0:adapted.append('echo "GTK X11: '+str(units)+' / 586 units"')
 adapted.append(line)
assert units==586
build='''#!/bin/sh
set -eu
tar -xf source.tar
mkdir gtk-source gio-source
tar -xf gtk-source.tar -C gtk-source
tar -xf gio-source.tar -C gio-source
stage="$PWD/stage"
mkdir -p "$stage/work" "$stage/objects" "$stage/lib/gtk3-x11/pkgconfig" "$stage/lib/gtk-3-x11" "$stage/include/gtk3-x11" "$stage/bin" "$stage/libexec"
mv gtk-source/source "$stage/work/gtk3"
cp -R source/overlays/gtk3/. "$stage/work/gtk3/"
'''+ '\n'.join(adapted)+'''
# Resolve full public GIO headers before minimal GLib/GIO-listmodel headers.
sed 's/^Requires: gdk-3.0 atk$/Requires: gio-core gdk-3.0 atk/' source/pkgconfig/gtk+-3.0.pc > "$stage/lib/gtk3-x11/pkgconfig/gtk+-3.0.pc"
sed 's/^Requires: pangocairo gdk-pixbuf-2.0 cairo-gobject gio-core /Requires: gio-core pangocairo gdk-pixbuf-2.0 cairo-gobject /' source/pkgconfig/gdk-3.0.pc > "$stage/lib/gtk3-x11/pkgconfig/gdk-3.0.pc"
mkdir -p "$DESTDIR"
cp -R "$stage/." "$DESTDIR/"
mkdir -p "$DESTDIR/share/licenses/gtk3-x11"
cp COPYING-GTK COPYING-Cairo GLib-COPYING "$DESTDIR/share/licenses/gtk3-x11/"
'''
assert '/usr/src/' not in build.replace('s@/usr/src/gtk3/','s@HISTORICAL/')
assert 'libcairo.so' not in build and 'work/xlibs' not in build
assert 'pkgconfig/*.pc' not in build
(out/'build.sh').write_text(build)
(out/'test.sh').write_text('''#!/bin/sh
set -eu
cat > consumer.c <<'C'
#include <gtk/gtk.h>
#include <stdio.h>
int main(void) { if(gtk_get_major_version()!=3 || gtk_get_minor_version()!=24 || gtk_get_micro_version()!=43) return 1; puts("GTK-X11-LINK-VERSION-PASS"); return 0; }
C
export PKG_CONFIG_PATH="$DESTDIR/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig"
cflags=$(pkg-config --cflags gtk+-3.0)
case "$cflags" in *-I/usr/local/include/gio-core-2.0*-I/usr/local/include/glib-2.0*) ;; *) echo "Full GIO must precede GLib headers: $cflags" >&2; exit 1;; esac
cc consumer.c -I"$DESTDIR/include/gtk3-x11" $cflags -L"$DESTDIR/lib/gtk3-x11" $(pkg-config --libs gtk+-3.0) -o consumer
LD_LIBRARY_PATH="$DESTDIR/lib/gtk3-x11:/usr/local/lib" ./consumer
''')
# Original header copies cover these exact directories after GTK overlays.
headers={}
with tarfile.open(out/'gtk-source.tar') as t:
 for m in t:
  n=m.name.removeprefix('source/')
  if m.isfile():headers[n]=True
with tarfile.open(out/'source.tar') as t:
 for m in t:
  if m.isfile() and m.name.startswith('source/overlays/gtk3/'):headers[m.name.removeprefix('source/overlays/gtk3/')]=True
header_dirs={'gdk','gdk/deprecated','gdk/x11','gtk','gtk/deprecated','gtk/a11y'}
outputs=['include/gtk3-x11/'+n for n in headers if n.endswith('.h') and str(Path(n).parent) in header_dirs]
outputs+=['lib/gtk3-x11/libgtk-3.so','lib/gtk3-x11/libgdk-3.so','lib/gtk-3-x11/gtk.gresource','lib/gtk3-x11/pkgconfig/gtk+-3.0.pc','lib/gtk3-x11/pkgconfig/gdk-3.0.pc','bin/gtk3-x11-demo','bin/gtk3-x11-run','libexec/gtk3-x11-demo']+['share/licenses/gtk3-x11/'+n for n in licenses]
write('outputs.json',[dict(path=n,mode=493 if n.startswith(('bin/','libexec/')) else 420) for n in sorted(outputs)])
deps=['pkgconf','x11-shared','cairo','pango','gdk-pixbuf','cairo-gobject','atk','gtk3-schemas','harfbuzz','gio-core','gio-listmodel','gobject','glib','fribidi','fontconfig','libintl']
versions={n:json.loads((ROOT/'apps'/n/'recipe.json').read_text())['version'] for n in deps}
write('recipe.json',dict(name='gtk3-x11',version='3.24.43-1',dependencies=deps,dependencyRequirements={n:{'version':versions[n]} for n in deps},platform=dict(target='wasm32-wasm-posix',minVersion='1.0.0',runtimeAbi=5,features=['posix-core','pthreads','unix-stream']),inputs=['source.tar','gtk-source.tar','gio-source.tar',*licenses,'build.sh','test.sh']))
write('provenance.json',dict(repository='wasm-posix-old (preserved local historical repository)',commit=REV,path='apps/gtk3-x11/source',archiveSha256=sha(out/'source.tar'),additionalArchives=[dict(file=f,historicalPath=p,archiveSha256=sha(out/f)) for f,p in [('gtk-source.tar','vendor/gtk3'),('gio-source.tar','vendor/gio-core')]],overlays=[dict(file=n,historicalPath=p,sha256=sha(out/n)) for n,p in licenses.items()],status='adapted source candidate; no new GTK guest acceptance'))
(out/'README.md').write_text('''# GTK3 X11 software profile\n\nUnpublished3.24.43 migration candidate. Exact GTK/X11 overlays and GTK/GIO\nsource trees retain pinned historical provenance. The adapter compiles the586\noriginal GTK/GDK units. It omits the private Cairo build, X11 archive relinks,\nprivate Cairo headers/pkg-config files and private X11 pkg-config overrides.\nCairo and X11 shared libraries are explicit public dependencies. GTK/GDK keep\ntheir historical private gtk3-x11 library/header paths.\n\nThe recipe test currently checks shared linking/version only. Full guest GUI,\ninput, resize, clipboard, reload and composition acceptance remains pending.\nHistorical profile excludes GLArea, printing and AT-SPI bridge. Co-installation\nwith the later SDL GTK profile is not yet verified. No compatibility claim is\ninferred from the source-level provider cleanup.\n''')
print('prepared',units,'GTK/GDK units;',len(outputs),'outputs; no private Cairo/X11 providers')
