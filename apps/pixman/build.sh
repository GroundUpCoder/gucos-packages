#!/bin/sh
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/objects" "$stage/include/pixman-1" "$stage/pkgconfig"
objects=
for source in pixman.c pixman-access.c pixman-access-accessors.c pixman-arm.c pixman-bits-image.c pixman-combine32.c pixman-combine-float.c pixman-conical-gradient.c pixman-edge.c pixman-edge-accessors.c pixman-fast-path.c pixman-filter.c pixman-glyph.c pixman-general.c pixman-gradient-walker.c pixman-image.c pixman-implementation.c pixman-linear-gradient.c pixman-matrix.c pixman-mips.c pixman-noop.c pixman-ppc.c pixman-radial-gradient.c pixman-region16.c pixman-region32.c pixman-region64f.c pixman-riscv.c pixman-solid-fill.c pixman-timer.c pixman-trap.c pixman-utils.c pixman-x86.c; do
  cc -DHAVE_CONFIG_H -Ipixman -c pixman/$source -o "$stage/objects/$source.o"
  objects="$objects $stage/objects/$source.o"
done
ar rcs "$stage/libpixman-1.a" $objects
cc -shared $objects -Wl,-soname,libpixman-1.so -o "$stage/libpixman-1.so"
cp pixman/pixman.h pixman/pixman-version.h "$stage/include/pixman-1/"
cp port/pixman-1.pc "$stage/pkgconfig/"

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/pixman"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp "COPYING" "$DESTDIR/share/licenses/pixman/COPYING"
