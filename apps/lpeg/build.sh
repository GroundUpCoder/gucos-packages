#!/bin/sh
set -eu
tar -xf source.tar
cd source
# Original six units and upstream optimization/NDEBUG/C99/PIC flags.
for unit in lpvm lpcap lptree lpcode lpprint lpcset; do
 cc -O2 -DNDEBUG -std=c99 -I/usr/local/include/lua5.5 -fPIC -c "$unit.c" -o "$unit.o"
done
cc -shared -fPIC lpvm.o lpcap.o lptree.o lpcode.o lpprint.o lpcset.o -o lpeg.so
mkdir -p "$DESTDIR/lib/lua/5.5" "$DESTDIR/share/lua/5.5" "$DESTDIR/share/doc/lpeg" "$DESTDIR/share/licenses/lpeg"
cp lpeg.so "$DESTDIR/lib/lua/5.5/"
cp re.lua "$DESTDIR/share/lua/5.5/"
cp lpeg.html re.html "$DESTDIR/share/doc/lpeg/"
cp LICENSE "$DESTDIR/share/licenses/lpeg/"
