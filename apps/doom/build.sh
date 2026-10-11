#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/bin" "$DESTDIR/libexec" "$DESTDIR/share/applications" "$DESTDIR/share/licenses/doom"
cc --project source/bin.json --rebuild -o "$DESTDIR/libexec/doom"
cp launch.sh "$DESTDIR/bin/doom"
chmod 755 "$DESTDIR/bin/doom"
cp gucos-doom.desktop "$DESTDIR/share/applications/"
cp source/LICENSE "$DESTDIR/share/licenses/doom/1-LICENSE"
cp source/Nuked-OPL3/LICENSE "$DESTDIR/share/licenses/doom/2-LICENSE"
mkdir -p "$DESTDIR/share/games/doom"
cp source/data/doom1.wad "$DESTDIR/share/games/doom/doom1.wad"
cp doom-shareware-notice.txt "$DESTDIR/share/licenses/doom/doom-shareware-notice.txt"
