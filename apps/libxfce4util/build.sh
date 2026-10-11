#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
cd source
mkdir -p "$stage/objects" "$stage/lib/pkgconfig" "$stage/include/xfce4/libxfce4util" "$stage/share/doc/libxfce4util"
objects=
for source in libxfce4util/*.c; do
  case "$source" in *-visibility.c) continue ;; esac
  object="$stage/objects/$(basename "$source" .c).o"
  cc -DHAVE_CONFIG_H -Iport -I. $(pkg-config --cflags gio-core) -c "$source" -o "$object"
  objects="$objects $object"
done
ar rcs "$stage/lib/libxfce4util.a" $objects
cc -shared $objects $(pkg-config --libs gio-core) -lintl -Wl,-soname,libxfce4util.so -o "$stage/lib/libxfce4util.so"
cp libxfce4util/*.h "$stage/include/xfce4/libxfce4util/"
cp COPYING PORT.md "$stage/share/doc/libxfce4util/"
cat > "$stage/lib/pkgconfig/libxfce4util-1.0.pc" <<'PC'
prefix=/usr/local
libdir=${prefix}/lib
includedir=${prefix}/include
Name: libxfce4util
Description: Xfce utility library for the browser POSIX profile
Version: 4.20.0
Requires: gio-core
Libs: -L${libdir} -lxfce4util -lintl
Cflags: -I${includedir}/xfce4
PC
rm -rf "$stage/objects"

mkdir -p "$stage/share/licenses/libxfce4util"
cp COPYING "$stage/share/licenses/libxfce4util/COPYING"
