#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/applications" "$DESTDIR/share/licenses/gameboy"
cc --project source/bin.json --rebuild -o "$DESTDIR/bin/gameboy"
cp source/src/peanut_gb.h "$DESTDIR/share/licenses/gameboy/peanut_gb.h"
cp gucos-gameboy.desktop "$DESTDIR/share/applications/gucos-gameboy.desktop"
