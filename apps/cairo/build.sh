#!/bin/sh
set -eu
tar -xf source.tar
cp config.h source/config.h
cp cairo-features.h source/src/cairo-features.h
cp cairo-xlib-surface.c source/src/cairo-xlib-surface.c
mkdir -p objects "$DESTDIR/lib/pkgconfig" "$DESTDIR/include/cairo" "$DESTDIR/share/licenses/cairo"
objects=
while read file; do
 object="objects/${file##*/}.o"
 cc -O2 -D_GNU_SOURCE -DHAVE_CONFIG_H -Isource -Isource/src -I/usr/local/include/pixman-1 -I/usr/local/include/freetype2 -I/usr/local/include -c "source/$file" -o "$object"
 objects="$objects $object"
done < sources.txt
ar rcs "$DESTDIR/lib/libcairo.a" $objects
cc -shared $objects -L/usr/local/lib -lpixman-1 -lfreetype -lfontconfig -lpng16 -lXrender -lXext -lX11 -lxcb -lXau -Wl,-soname,libcairo.so -o "$DESTDIR/lib/libcairo.so"
for header in cairo.h cairo-version.h cairo-features.h cairo-deprecated.h cairo-ft.h cairo-xlib.h cairo-xlib-xrender.h; do
 cp "source/src/$header" "$DESTDIR/include/cairo/"
done
cp source/COPYING* "$DESTDIR/share/licenses/cairo/"
for module in cairo cairo-ft cairo-xlib cairo-xlib-xrender; do
 cat > "$DESTDIR/lib/pkgconfig/$module.pc" <<PC
prefix=/usr/local
libdir=\${prefix}/lib
includedir=\${prefix}/include
Name: $module
Description: Cairo software rendering with FreeType and Xlib
Version: 1.18.4
Libs: -L\${libdir} -lcairo
Requires.private: pixman-1 freetype2 fontconfig libpng xrender xext x11 xcb xau
Libs.private: -lm
Cflags: -I\${includedir}/cairo
PC
done
