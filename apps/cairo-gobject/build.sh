#!/bin/sh
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
# The optional header advertises its own installed provider; base Cairo does not.
sed '/^#if CAIRO_HAS_GOBJECT_FUNCTIONS/i\
#ifndef CAIRO_HAS_GOBJECT_FUNCTIONS\
#define CAIRO_HAS_GOBJECT_FUNCTIONS 1\
#endif' src/cairo-gobject.h > src/cairo-gobject.h.new
mv src/cairo-gobject.h.new src/cairo-gobject.h
mkdir -p "$stage/objects" "$stage/include/cairo" "$stage/pkgconfig"
objects=
for source in src/cairo-gobject-enums.c src/cairo-gobject-structs.c; do
 object="$stage/objects/${source##*/}.o"
 cc -DCAIRO_COMPILATION -I. -Isrc -I/usr/local/include/cairo -I/usr/local/include/glib-2.0 -I/usr/local/include -c "$source" -o "$object"
 objects="$objects $object"
done
ar rcs "$stage/libcairo-gobject.a" $objects
cc -shared $objects -lcairo -lgobject-2.0 -lglib-2.0 -Wl,-soname,libcairo-gobject.so -o "$stage/libcairo-gobject.so"
cp src/cairo-gobject.h "$stage/include/cairo/"
cp port/*.pc "$stage/pkgconfig/"

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/cairo-gobject"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp COPYING UPSTREAM-NOTICE "$DESTDIR/share/licenses/cairo-gobject/"
