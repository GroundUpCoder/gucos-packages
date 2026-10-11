#!/bin/sh
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
# Package-owned configuration lives under an allowed share prefix.
sed -i 's@/usr/local/etc/fonts@/usr/local/share/fontconfig@g' config.h
mkdir -p "$stage/objects" "$stage/include/fontconfig" "$stage/pkgconfig"
objects=
for source in src/fcatomic.c src/fccache.c src/fccfg.c src/fccharset.c src/fccompat.c src/fcdbg.c src/fcdefault.c src/fcdir.c src/fcformat.c src/fcfreetype.c src/fcfs.c src/fcptrlist.c src/fchash.c src/fcinit.c src/fclang.c src/fclist.c src/fcmatch.c src/fcmatrix.c src/fcname.c src/fcobjs.c src/fcpat.c src/fcrange.c src/fcserialize.c src/fcstat.c src/fcstr.c src/fcweight.c src/fcxml.c src/ftglue.c; do
  object="$stage/objects/${source##*/}.o"
  cc -DHAVE_CONFIG_H -I. -Isrc -I/usr/local/include/freetype2 -I/usr/local/include -c "$source" -o "$object"
  objects="$objects $object"
done
ar rcs "$stage/libfontconfig.a" $objects
cc -shared $objects -L/usr/local/lib -lfreetype -lexpat -Wl,-soname,libfontconfig.so -o "$stage/libfontconfig.so"
cp fontconfig/fontconfig.h fontconfig/fcfreetype.h "$stage/include/fontconfig/"
cp port/fontconfig.pc "$stage/pkgconfig/"

# Runtime font discovery must not depend on build source trees.
mkdir -p "$stage/share/fontconfig" "$stage/share/fonts/wasm-posix"
cp port/fonts.conf "$stage/share/fontconfig/fonts.conf"
cp "$PWD/../ABeeZee-Regular.ttf" "$PWD/../SourceCodePro-Regular.otf" "$stage/share/fonts/wasm-posix/"

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/fontconfig"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
mkdir -p "$DESTDIR/share/fontconfig"
cp "$stage/share/fontconfig/fonts.conf" "$DESTDIR/share/fontconfig/"
mkdir -p "$DESTDIR/share/fonts"
cp -R "$stage/share/fonts/." "$DESTDIR/share/fonts/"
cp "COPYING" "$DESTDIR/share/licenses/fontconfig/COPYING"
cp "port/ABeeZee-OFL.txt" "$DESTDIR/share/licenses/fontconfig/ABeeZee-OFL.txt"
cp "port/SourceCodePro-LICENSE.md" "$DESTDIR/share/licenses/fontconfig/SourceCodePro-LICENSE.md"
