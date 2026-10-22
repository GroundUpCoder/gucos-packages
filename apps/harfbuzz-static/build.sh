#!/bin/sh
set -eu
tar -xf source.tar
tar -xzf prepared.tar.gz -C source/port
cd source
mkdir -p "$DESTDIR/lib"
# Retain and execute the complete original generated build, then package its
# static objects separately to keep each raw binary archive transportable.
sh port/generated/build.sh "$DESTDIR"
rm "$DESTDIR/lib/libharfbuzz.so"
mkdir -p "$DESTDIR/share/licenses/harfbuzz-static"
cp upstream/COPYING "$DESTDIR/share/licenses/harfbuzz-static/COPYING"
cp port/fonts/ABeeZee-OFL.txt "$DESTDIR/share/licenses/harfbuzz-static/ABeeZee-OFL.txt"
