#!/bin/sh
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/objects" "$stage/include/glib-2.0/gio" "$stage/pkgconfig"
objects=
for source in glistmodel.c gmarshal-internal.c; do
 cc -DGIO_COMPILATION -I. -I/usr/local/include/glib-2.0 -I/usr/local/include -c gio/$source -o "$stage/objects/$source.o"
 objects="$objects $stage/objects/$source.o"
done
ar rcs "$stage/libgio-listmodel.a" $objects
cc -shared $objects -lgobject-2.0 -lglib-2.0 -Wl,-soname,libgio-listmodel.so -o "$stage/libgio-listmodel.so"
cp gio/gio.h gio/glistmodel.h gio/giotypes.h gio/gioenums.h gio/gio-visibility.h "$stage/include/glib-2.0/gio/"
cp port/gio-listmodel.pc "$stage/pkgconfig/"

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/gio-listmodel"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp ../COPYING "$DESTDIR/share/licenses/gio-listmodel/COPYING"
