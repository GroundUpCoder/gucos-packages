#!/bin/sh
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/objects" "$stage/include/fribidi" "$stage/pkgconfig"
objects=
for source in lib/fribidi-arabic.c lib/fribidi-bidi-types.c lib/fribidi-bidi.c lib/fribidi-brackets.c lib/fribidi-char-sets-cap-rtl.c lib/fribidi-char-sets-cp1255.c lib/fribidi-char-sets-cp1256.c lib/fribidi-char-sets-iso8859-6.c lib/fribidi-char-sets-iso8859-8.c lib/fribidi-char-sets-utf8.c lib/fribidi-char-sets.c lib/fribidi-deprecated.c lib/fribidi-joining-types.c lib/fribidi-joining.c lib/fribidi-mirroring.c lib/fribidi-run.c lib/fribidi-shape.c lib/fribidi.c; do
  object="$stage/objects/${source##*/}.o"
  cc -DHAVE_CONFIG_H -DFRIBIDI_BUILD -I. -Ilib -c "$source" -o "$object"
  objects="$objects $object"
done
ar rcs "$stage/libfribidi.a" $objects
cc -shared $objects  -Wl,-soname,libfribidi.so -o "$stage/libfribidi.so"
cp lib/*.h "$stage/include/fribidi/"
cp port/fribidi.pc "$stage/pkgconfig/"

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/fribidi"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp COPYING "$DESTDIR/share/licenses/fribidi/COPYING"
