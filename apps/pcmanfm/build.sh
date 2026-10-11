#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
src="$PWD/source"
up=$src/pcmanfm-1.3.2
build="$PWD/build"
mkdir -p "$build" "$stage/bin" "$stage/libexec" "$stage/share/pcmanfm/ui" "$stage/share/applications" "$stage/etc/xdg/pcmanfm/default" "$stage/include" "$stage/etc/xdg/menus" "$stage/lib/pcmanfm" "$stage/share/doc/pcmanfm"
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
pc=/usr/local/bin/pkgconf
flags="-I/usr/local/include/gtk3-x11 $($pc --cflags libfm-gtk3)"
libs="-L/usr/local/lib/gtk3-x11 $($pc --libs libfm-gtk3) -lX11 -lintl"
objects=
for name in pcmanfm app-config main-win tab-page desktop volume-manager pref single-inst connect-server; do
 cc -O2 -DHAVE_CONFIG_H $flags -I"$src" -I"$up/src" '-DPACKAGE_DATA_DIR="/usr/local/share/pcmanfm"' '-DPACKAGE_UI_DIR="/usr/local/share/pcmanfm/ui"' '-DPACKAGE_MODULES_DIR="/usr/local/lib/pcmanfm"' '-DPACKAGE_LOCALE_DIR="/usr/local/share/locale"' -c "$up/src/$name.c" -o "$build/$name.o"
 objects="$objects $build/$name.o"
done
cc $objects $libs -o "$stage/libexec/pcmanfm"
cp "$src/pcmanfm" "$stage/bin/pcmanfm"
chmod +x "$stage/bin/pcmanfm"
cp "$up/data/ui/"*.ui "$stage/share/pcmanfm/ui/"
cp "$src/applications.menu" "$stage/etc/xdg/menus/lxde-applications.menu"
cp "$up/data/pcmanfm.conf" "$stage/etc/xdg/pcmanfm/default/"
for name in pcmanfm pcmanfm-desktop-pref; do
 sed 's/^_//' "$up/data/$name.desktop.in" > "$stage/share/applications/$name.desktop"
done
cp "$up/src/pcmanfm-modules.h" "$stage/include/"
printf 'Optional PCManFM modules belong in this directory.\n' > "$stage/lib/pcmanfm/README"
cp "$up/COPYING" "$stage/share/doc/pcmanfm/"
# The owned menu launches a file manager, never a desktop takeover.
sed 's/^Exec=pcmanfm %U$/Exec=pcmanfm --no-desktop %U/' "$stage/share/applications/pcmanfm.desktop" > "$build/pcmanfm.desktop"
cp "$build/pcmanfm.desktop" "$stage/share/applications/pcmanfm.desktop"
mkdir -p "$stage/share/licenses/pcmanfm"
cp "$up/COPYING" "$stage/share/licenses/pcmanfm/COPYING"
