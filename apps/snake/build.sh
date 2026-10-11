#!/bin/sh
set -eu
cc -O2 main.c -o snake
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/doc/snake" "$DESTDIR/share/licenses/snake" "$DESTDIR/share/applications"
cp snake "$DESTDIR/bin/snake"
cp README.md provenance.json "$DESTDIR/share/doc/snake/"
cp LICENSE "$DESTDIR/share/licenses/snake/LICENSE"
cp snake.desktop "$DESTDIR/share/applications/wasm-posix-snake.desktop"
