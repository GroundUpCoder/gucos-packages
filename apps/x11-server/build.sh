#!/bin/sh
set -eu
tar -xf source.tar
sed 's|/usr/src/x11-server|.|g' source/install.sh > source/build-local.sh
(cd source; sh build-local.sh "$DESTDIR")
mkdir -p "$DESTDIR/share/licenses"
cp -R source/licenses "$DESTDIR/share/licenses/x11-server"
