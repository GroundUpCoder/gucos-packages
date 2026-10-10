#!/bin/sh
# Invoked by gucman in a private staging directory. No source freshness checks.
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/include" "$stage/objects"
objects=
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/bindtextdom.c -o "$stage/objects/0.o"
objects="$objects $stage/objects/0.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/dcgettext.c -o "$stage/objects/1.o"
objects="$objects $stage/objects/1.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/dgettext.c -o "$stage/objects/2.o"
objects="$objects $stage/objects/2.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/gettext.c -o "$stage/objects/3.o"
objects="$objects $stage/objects/3.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/finddomain.c -o "$stage/objects/4.o"
objects="$objects $stage/objects/4.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/hash-string.c -o "$stage/objects/5.o"
objects="$objects $stage/objects/5.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/loadmsgcat.c -o "$stage/objects/6.o"
objects="$objects $stage/objects/6.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/localealias.c -o "$stage/objects/7.o"
objects="$objects $stage/objects/7.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/textdomain.c -o "$stage/objects/8.o"
objects="$objects $stage/objects/8.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/l10nflist.c -o "$stage/objects/9.o"
objects="$objects $stage/objects/9.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/explodename.c -o "$stage/objects/10.o"
objects="$objects $stage/objects/10.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/dcigettext.c -o "$stage/objects/11.o"
objects="$objects $stage/objects/11.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/dcngettext.c -o "$stage/objects/12.o"
objects="$objects $stage/objects/12.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/dngettext.c -o "$stage/objects/13.o"
objects="$objects $stage/objects/13.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/ngettext.c -o "$stage/objects/14.o"
objects="$objects $stage/objects/14.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/plural.c -o "$stage/objects/15.o"
objects="$objects $stage/objects/15.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/plural-exp.c -o "$stage/objects/16.o"
objects="$objects $stage/objects/16.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/langprefs.c -o "$stage/objects/17.o"
objects="$objects $stage/objects/17.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/log.c -o "$stage/objects/18.o"
objects="$objects $stage/objects/18.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/version.c -o "$stage/objects/19.o"
objects="$objects $stage/objects/19.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/osdep.c -o "$stage/objects/20.o"
objects="$objects $stage/objects/20.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/intl-compat.c -o "$stage/objects/21.o"
objects="$objects $stage/objects/21.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/compat.c -o "$stage/objects/22.o"
objects="$objects $stage/objects/22.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/gnulib-lib/localename.c -o "$stage/objects/23.o"
objects="$objects $stage/objects/23.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/gnulib-lib/localename-unsafe.c -o "$stage/objects/24.o"
objects="$objects $stage/objects/24.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/gnulib-lib/glthread/lock.c -o "$stage/objects/25.o"
objects="$objects $stage/objects/25.o"
cc -I. -Iinclude -Iintl -Iintl/gnulib-lib -I/usr/local/include -DHAVE_CONFIG_H -c intl/gnulib-lib/glthread/once.c -o "$stage/objects/26.o"
objects="$objects $stage/objects/26.o"
ar rcs "$stage/libintl.a" $objects
cc -shared $objects -liconv -Wl,-soname,libintl.so -o "$stage/libintl.so"
cp include/libintl.h "$stage/include/libintl.h"

mkdir -p "$stage/pkgconfig"
cat > "$stage/pkgconfig/libintl.pc" <<'EOF'
prefix=/usr/local
libdir=${prefix}/lib
includedir=${prefix}/include
Name: libintl
Description: Bundled libintl for wasm-posix
Version: 0.23.1
Libs: -L${libdir} -lintl
Requires.private: libiconv
Cflags: -I${includedir}
EOF

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/libintl"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp COPYING "$DESTDIR/share/licenses/libintl/COPYING"
cp intl/COPYING.LIB "$DESTDIR/share/licenses/libintl/COPYING.LIB"
