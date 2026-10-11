#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
src="$PWD/source"
build="$PWD/build"
fm=$src/libfm-1.3.2
mc=$src/menu-cache-1.1.0
mkdir -p "$build/fm" "$build/mc" "$stage/lib/pkgconfig" "$stage/include/libfm" "$stage/include/menu-cache" "$stage/libexec/menu-cache" "$stage/share/libfm/ui" "$stage/share/libfm/images" "$stage/share/doc/libfm" "$stage/lib/libfm/modules"
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
pc=/usr/local/bin/pkgconf
flags="$($pc --cflags gtk+-3.0 gio-core)"
libs="$($pc --libs gtk+-3.0 gio-core) -lintl"
cp "$src/config.h" "$build/fm/config.h"
cp "$src/menu-config.h" "$build/mc/config.h"
cp "$fm/src/fm-extra.h" "$fm/src/fm-version.h" "$fm/src/extra/fm-xml-file.h" "$stage/include/libfm/"
sed -e 's/@MC_VERSION_MAJOR@/1/g' -e 's/@MC_VERSION_MINOR@/1/g' -e 's/@MC_VERSION_MICRO@/0/g' "$mc/libmenu-cache/menu-cache.h.in" > "$build/mc/menu-cache.h"
mkdir -p "$build/compat/sys"
printf '#include <fcntl.h>\n' > "$build/compat/sys/fcntl.h"
common="-I$stage/include -I$build/compat -DHAVE_CONFIG_H -DPACKAGE_LOCALE_DIR=\"/usr/local/share/locale\""
# Keep upstream libraries separate, as on a native installation.
cc -O2 $common $flags -I"$build/fm" -I"$fm/src" -I"$fm/src/extra" -c "$fm/src/extra/fm-xml-file.c" -o "$build/extra.o"
cc -shared "$build/extra.o" $libs -Wl,-soname,libfm-extra.so -o "$stage/lib/libfm-extra.so"
cc -O2 $common $flags -I"$build/mc" -I"$mc/libmenu-cache" '-DMENUCACHE_LIBEXECDIR="/usr/local/libexec/menu-cache"' -c "$mc/libmenu-cache/menu-cache.c" -o "$build/menu-cache.o"
cc -shared "$build/menu-cache.o" $libs -Wl,-soname,libmenu-cache.so -o "$stage/lib/libmenu-cache.so"
cc -O2 $common $flags -I"$build/mc" -I"$mc/libmenu-cache" '-DMENUCACHE_LIBEXECDIR="/usr/local/libexec/menu-cache"' "$mc/menu-cache-daemon/menu-cached.c" $libs -o "$stage/libexec/menu-cache/menu-cached"
objs=
for file in main menu-merge menu-compose; do
 cc -O2 $common $flags -I"$build/mc" -I"$mc/libmenu-cache" -I"$fm/src" -I"$fm/src/extra" -c "$mc/menu-cache-gen/$file.c" -o "$build/$file.o"
 objs="$objs $build/$file.o"
done
cc $objs -L"$stage/lib" -lfm-extra $libs -o "$stage/libexec/menu-cache/menu-cache-gen"
for group in core gtk; do
 failed=0
 objects=
 while read file; do
  object="$build/$(echo "$file" | tr / _).o"
  cc -O2 $common $flags -I"$build/fm" -I"$build/mc" -I"$mc/libmenu-cache" -I"$fm/src" -I"$fm/src/base" -I"$fm/src/job" -I"$fm/src/gtk" -I"$fm/src/extra" '-DPACKAGE_DATA_DIR="/usr/local/share/libfm"' '-DPACKAGE_MODULES_DIR="/usr/local/lib/libfm/modules"' '-DPACKAGE_UI_DIR="/usr/local/share/libfm/ui"' '-DPACKAGE_THEME_DIR="/usr/local/share/libfm/images"' -c "$fm/src/$file" -o "$object" || failed=1
  objects="$objects $object"
 done < "$src/$group.sources"
 test "$failed" = 0
 if test "$group" = core; then name=fm; deps='-lmenu-cache'; else name=fm-gtk3; deps='-lfm -lmenu-cache'; fi
 cc -shared $objects -L"$stage/lib" $deps $libs -Wl,-soname,lib$name.so -o "$stage/lib/lib$name.so"
done
# Loadable VFS and GTK property/menu modules from the upstream build.
for name in vfs-menu vfs-search gtk-fileprop-x-desktop gtk-fileprop-x-shortcut gtk-menu-trash gtk-menu-actions; do
 cc -O2 $common $flags -I"$build/fm" -I"$build/mc" -I"$fm/src" -I"$fm/src/base" -I"$fm/src/job" -I"$fm/src/gtk" -I"$fm/src/extra" -c "$fm/src/modules/$name.c" -o "$build/$name.o"
 cc -shared "$build/$name.o" -L"$stage/lib" -lfm-gtk3 -lfm -lfm-extra -lmenu-cache $libs -o "$stage/lib/libfm/modules/$name.so"
done
mkdir -p "$stage/bin" "$stage/libexec/libfm" "$stage/share/libfm/xdg/libfm" "$stage/share/mime/packages"
for name in libfm-pref-apps lxshortcut; do
 cc -O2 $common $flags -I"$build/fm" -I"$fm/src" -I"$fm/src/base" -I"$fm/src/job" -I"$fm/src/gtk" '-DPACKAGE_UI_DIR="/usr/local/share/libfm/ui"' "$fm/src/tools/$name.c" -L"$stage/lib" -lfm-gtk3 -lfm -lmenu-cache $libs -o "$stage/libexec/libfm/$name"
 printf '#!/bin/sh\nexport XDG_CONFIG_DIRS=${XDG_CONFIG_DIRS:-/usr/local/etc/xdg:/etc/xdg}:/usr/local/share/libfm/xdg\nexec gtk3-x11-run /usr/local/libexec/libfm/%s "$@"\n' "$name" > "$stage/bin/$name"
 chmod 755 "$stage/bin/$name"
done
cp "$fm/data/images/"*.png "$stage/share/libfm/images/"
cp "$fm/data/libfm.conf" "$stage/share/libfm/xdg/libfm/"
chmod 644 "$stage/share/libfm/xdg/libfm/libfm.conf"
cp "$fm/data/libfm.xml" "$stage/share/mime/packages/"
cp "$fm/src/"*.h "$fm/src/base/"*.h "$fm/src/job/"*.h "$fm/src/gtk/"*.h "$fm/src/extra/"*.h "$stage/include/libfm/"
cp "$build/mc/menu-cache.h" "$stage/include/menu-cache/"
cp "$fm/data/ui/"*.ui "$stage/share/libfm/ui/"
cp "$fm/data/"*.conf "$stage/share/libfm/"
cp "$fm/data/"*.list "$stage/share/libfm/"
cp "$fm/COPYING" "$stage/share/doc/libfm/COPYING"
cp "$mc/COPYING" "$stage/share/doc/libfm/menu-cache-COPYING"
for name in libfm libfm-gtk3 libfm-extra libmenu-cache; do
 cp "$src/$name.pc" "$stage/lib/pkgconfig/$name.pc"
done
mkdir -p "$stage/share/licenses/libfm"
cp "$fm/COPYING" "$stage/share/licenses/libfm/COPYING"
cp "$mc/COPYING" "$stage/share/licenses/libfm/menu-cache-COPYING"
