#!/bin/sh
# Invoked by gucman in a private staging directory. No source freshness checks.
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/include" "$stage/objects"
objects=
cc -I. -Iinclude -Ilib  -c lib/iconv.c -o "$stage/objects/0.o"
objects="$objects $stage/objects/0.o"
cc -I. -Iinclude -Ilib  -c libcharset/lib/localcharset.c -o "$stage/objects/1.o"
objects="$objects $stage/objects/1.o"
cc -I. -Iinclude -Ilib  -c lib/compat.c -o "$stage/objects/2.o"
objects="$objects $stage/objects/2.o"
ar rcs "$stage/libiconv.a" $objects
cc -shared $objects -Wl,-soname,libiconv.so -o "$stage/libiconv.so"
cp include/iconv.h "$stage/include/iconv.h"
cp include/localcharset.h "$stage/include/localcharset.h"

mkdir -p "$stage/pkgconfig"
cat > "$stage/pkgconfig/libiconv.pc" <<'EOF'
prefix=/usr/local
libdir=${prefix}/lib
includedir=${prefix}/include
Name: libiconv
Description: Bundled libiconv for wasm-posix
Version: 1.18
Libs: -L${libdir} -liconv
Requires.private:
Cflags: -I${includedir}
EOF

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/libiconv"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp COPYING.LIB "$DESTDIR/share/licenses/libiconv/COPYING.LIB"
