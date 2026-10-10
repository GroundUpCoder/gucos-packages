#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p objects "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/zlib"
objects=
for file in adler32 compress crc32 deflate gzclose gzlib gzread gzwrite infback inflate inftrees inffast trees uncompr zutil; do
 cc -O2 -DZ_HAVE_UNISTD_H -DZLIB_NO_REQUIRE_SOURCES -Isource/src -c "source/src/$file.c" -o "objects/$file.o"
 objects="$objects objects/$file.o"
done
ar rcs "$DESTDIR/lib/libz.a" $objects
cc -shared $objects -Wl,-soname,libz.so -o "$DESTDIR/lib/libz.so"
sed '/^__require_source(/d' source/src/zlib.h > "$DESTDIR/include/zlib.h"
sed '/^__require_source(/d' source/src/zconf.h > "$DESTDIR/include/zconf.h"
cp source/port/zlib.pc "$DESTDIR/lib/pkgconfig/zlib.pc"
cp source/LICENSE "$DESTDIR/share/licenses/zlib/LICENSE"
