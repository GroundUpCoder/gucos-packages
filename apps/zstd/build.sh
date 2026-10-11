#!/bin/sh
set -eu
tar -xf source.tar
sed 's|/usr/src/zstd|.|g' source/install.sh > source/build-local.sh
(cd source; sh build-local.sh "$DESTDIR")
mkdir -p "$DESTDIR/share/licenses/zstd"
cp source/LICENSE source/COPYING "$DESTDIR/share/licenses/zstd/"
