#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/bzip2recover"
cc -O2 source/bzip2recover.c -o "$DESTDIR/bin/bzip2recover"
cp source/LICENSE "$DESTDIR/share/licenses/bzip2recover/LICENSE"
