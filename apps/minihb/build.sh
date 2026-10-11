#!/bin/sh
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/objects" "$stage/include/minihb" "$stage/pkgconfig"
for source in minihb font-api shape unicode-data; do
  cc -Iinclude -I/usr/local/include/freetype2 -c "$source.c" -o "$stage/objects/$source.o"
done
ar rcs "$stage/libminihb.a" "$stage"/objects/*.o
cc -shared "$stage"/objects/*.o -lfreetype -lm -lpthread -Wl,-soname,libminihb.so -o "$stage/libminihb.so"
cp include/*.h "$stage/include/minihb/"
cp port/minihb.pc "$stage/pkgconfig/"

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/minihb"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp "COPYING-HARFBUZZ" "$DESTDIR/share/licenses/minihb/COPYING-HARFBUZZ"
cp "port/fonts/licenses/OFL-NotoSans.txt" "$DESTDIR/share/licenses/minihb/OFL-NotoSans.txt"
