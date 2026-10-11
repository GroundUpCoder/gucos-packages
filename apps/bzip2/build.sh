#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/bzip2"
cd source
cc -O2 -I. bzip2.c blocksort.c huffman.c crctable.c randtable.c compress.c decompress.c bzlib.c -o "$DESTDIR/bin/bzip2"
cp "$DESTDIR/bin/bzip2" "$DESTDIR/bin/bunzip2"
cp "$DESTDIR/bin/bzip2" "$DESTDIR/bin/bzcat"
cp LICENSE "$DESTDIR/share/licenses/bzip2/LICENSE"
