#!/bin/sh
set -eu
cc -O2 main.c -o desktop-menu
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/doc/desktop-entries" "$DESTDIR/share/licenses/desktop-entries"
cp desktop-menu "$DESTDIR/bin/desktop-menu"
cp README.md "$DESTDIR/share/doc/desktop-entries/README.md"
cp LICENSE "$DESTDIR/share/licenses/desktop-entries/LICENSE"
