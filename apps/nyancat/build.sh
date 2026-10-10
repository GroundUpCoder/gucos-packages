#!/bin/sh
set -eu
tar -xf source.tar
cd source
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/doc/nyancat" "$DESTDIR/share/man/man1" "$DESTDIR/share/licenses/nyancat"
cc -O2 nyancat.c -o "$DESTDIR/bin/nyancat"
cp README.md UPSTREAM.json "$DESTDIR/share/doc/nyancat/"
cp nyancat.c "$DESTDIR/share/licenses/nyancat/nyancat.c"
cp nyancat.1 "$DESTDIR/share/man/man1/nyancat.1"
