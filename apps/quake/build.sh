#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/bin" "$DESTDIR/libexec" "$DESTDIR/share/applications" "$DESTDIR/share/licenses/quake"
cc --project source/bin.json --rebuild -o "$DESTDIR/libexec/quake"
cp launch.sh "$DESTDIR/bin/quake"
chmod 755 "$DESTDIR/bin/quake"
cp gucos-quake.desktop "$DESTDIR/share/applications/"
cp source/gnu.txt "$DESTDIR/share/licenses/quake/1-gnu.txt"
cp source/data/SHAREWARE-LICENSE.txt "$DESTDIR/share/licenses/quake/2-SHAREWARE-LICENSE.txt"
mkdir -p "$DESTDIR/share/quake/id1"
cp source/data/id1/pak0.pak source/data/id1/autoexec.cfg "$DESTDIR/share/quake/id1/"
