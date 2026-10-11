#!/bin/sh
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/objects" "$stage/include" "$stage/pkgconfig"
objects=
for source in types prep_cif wasm-posix; do
 cc -Iinclude -c src/$source.c -o "$stage/objects/$source.o"
 objects="$objects $stage/objects/$source.o"
done
ar rcs "$stage/libffi.a" $objects
cc -shared $objects -Wl,-soname,libffi.so -o "$stage/libffi.so"
cp include/ffi.h include/ffitarget.h "$stage/include/"
cp port/libffi.pc "$stage/pkgconfig/"

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/libffi"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp LICENSE "$DESTDIR/share/licenses/libffi/LICENSE"
