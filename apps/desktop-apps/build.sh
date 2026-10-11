#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/share/applications" "$DESTDIR/share/licenses/desktop-apps"
cp gucos-desktop-*.desktop "$DESTDIR/share/applications/"
cp source/LICENSE "$DESTDIR/share/licenses/desktop-apps/LICENSE"
