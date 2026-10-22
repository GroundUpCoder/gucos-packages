#!/bin/sh
set -eu
tar -xf source.tar
cc -O2 source/2048.c -o game
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/doc/2048" "$DESTDIR/share/licenses/2048"
cp game "$DESTDIR/bin/2048"
cp source/README.md source/UPSTREAM.json "$DESTDIR/share/doc/2048/"
cp source/LICENSE "$DESTDIR/share/licenses/2048/LICENSE"
