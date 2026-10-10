#!/bin/sh
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/objects" "$stage/include/glib-2.0/gobject" "$stage/pkgconfig"
objects=
for source in glib-enumtypes.c gatomicarray.c gbinding.c gbindinggroup.c gboxed.c gclosure.c genums.c gmarshal.c gobject.c gparam.c gparamspecs.c gsignal.c gsignalgroup.c gsourceclosure.c gtype-wasm-posix.c gtypemodule.c gtypeplugin.c gvalue.c gvaluearray.c gvaluetransform.c gvaluetypes.c; do
 cc -DGOBJECT_COMPILATION '-DG_LOG_DOMAIN="GLib-GObject"' -I. -Iglib -Igobject -I/usr/local/include -c gobject/$source -o "$stage/objects/$source.o"
 objects="$objects $stage/objects/$source.o"
done
ar rcs "$stage/libgobject-2.0.a" $objects
cc -shared $objects -lglib-2.0 -lffi -Wl,-soname,libgobject-2.0.so -o "$stage/libgobject-2.0.so"
cp glib-object.h "$stage/include/glib-2.0/"
cp gobject/*.h gobject/gobjectnotifyqueue.c "$stage/include/glib-2.0/gobject/"
cp port/gobject-2.0.pc "$stage/pkgconfig/"

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/gobject"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp COPYING "$DESTDIR/share/licenses/gobject/COPYING"
