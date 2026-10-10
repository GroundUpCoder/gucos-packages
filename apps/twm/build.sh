#!/bin/sh
set -eu
tar -xf source.tar
sed -e "s|/usr/src/twm|.|g" -e "s|/tmp/twm-build|./objects|g" source/install.sh > source/build-local.sh
(cd source; sh build-local.sh "$DESTDIR")
mkdir -p "$DESTDIR/share/licenses/twm"
cp source/twm-1.0.13.1/COPYING "$DESTDIR/share/licenses/twm/COPYING"
