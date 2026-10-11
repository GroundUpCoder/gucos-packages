#!/bin/sh
set -eu
tar -xf source.tar
tar -xf prepared.tar
mv generated source/port/generated
# Guest compilation uses only owned inputs; preserve the translated archive
# member order and separate constructor object from the historical recipe.
sed 's|cd /usr/src/xmahjongg|cd source|' source/port/install.sh > install-local.sh
sh install-local.sh "$DESTDIR"
cp NOTICE "$DESTDIR/share/licenses/xmahjongg/NOTICE"
