#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p objects "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/expat"
objects=
for file in xmlparse xmlrole xmltok; do
 cc -O2 -DHAVE_EXPAT_CONFIG_H -Isource -Isource/lib -c "source/lib/$file.c" -o "objects/$file.o"
 objects="$objects objects/$file.o"
done
ar rcs "$DESTDIR/lib/libexpat.a" $objects
cc -shared $objects -Wl,-soname,libexpat.so -o "$DESTDIR/lib/libexpat.so"
cp source/lib/expat.h source/lib/expat_external.h "$DESTDIR/include/"
cp source/port/expat.pc "$DESTDIR/lib/pkgconfig/"
cp source/COPYING "$DESTDIR/share/licenses/expat/COPYING"
