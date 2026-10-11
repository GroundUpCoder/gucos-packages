#!/bin/sh
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/objects" "$stage/include/gdk-pixbuf-2.0/gdk-pixbuf" "$stage/pkgconfig"
objects=
for source in gdk-pixbuf/gdk-pixbuf.c gdk-pixbuf/gdk-pixbuf-animation.c gdk-pixbuf/gdk-pixbuf-data.c gdk-pixbuf/gdk-pixbuf-io.c gdk-pixbuf/gdk-pixbuf-loader.c gdk-pixbuf/gdk-pixbuf-scale.c gdk-pixbuf/gdk-pixbuf-simple-anim.c gdk-pixbuf/gdk-pixbuf-scaled-anim.c gdk-pixbuf/gdk-pixbuf-util.c gdk-pixbuf/gdk-pixdata.c gdk-pixbuf/gdk-pixbuf-enum-types.c gdk-pixbuf/gdk-pixbuf-marshal.c gdk-pixbuf/pixops/pixops.c gdk-pixbuf/io-png-wasm-posix.c gdk-pixbuf/io-jpeg.c; do
 object="$stage/objects/${source##*/}.o"
 cc -DGDK_PIXBUF_COMPILATION -DGDK_PIXBUF_ENABLE_BACKEND -I. -Igdk-pixbuf -I/usr/local/include/gio-core-2.0 -I/usr/local/include/jpeg-turbo -I/usr/local/include/glib-2.0 -I/usr/local/include/libpng16 -I/usr/local/include -c "$source" -o "$object"
 objects="$objects $object"
done
ar rcs "$stage/libgdk_pixbuf-2.0.a" $objects
cc -shared $objects -lgio-core -lgio-listmodel -lgobject-2.0 -lglib-2.0 -lpng16 -ljpeg-turbo -lz -lintl -Wl,-soname,libgdk_pixbuf-2.0.so -o "$stage/libgdk_pixbuf-2.0.so"
cp gdk-pixbuf/gdk-pixbuf.h gdk-pixbuf/gdk-pixbuf-animation.h gdk-pixbuf/gdk-pixbuf-autocleanups.h gdk-pixbuf/gdk-pixbuf-core.h gdk-pixbuf/gdk-pixbuf-io.h gdk-pixbuf/gdk-pixbuf-loader.h gdk-pixbuf/gdk-pixbuf-macros.h gdk-pixbuf/gdk-pixbuf-simple-anim.h gdk-pixbuf/gdk-pixbuf-transform.h gdk-pixbuf/gdk-pixdata.h gdk-pixbuf/gdk-pixbuf-features.h gdk-pixbuf/gdk-pixbuf-enum-types.h "$stage/include/gdk-pixbuf-2.0/gdk-pixbuf/"
cp port/*.pc "$stage/pkgconfig/"

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/gdk-pixbuf"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp "COPYING" "$DESTDIR/share/licenses/gdk-pixbuf/COPYING"
