#!/bin/sh
set -eu
"$DESTDIR/bin/xmahjongg" --help > /tmp/xmahjongg-help.txt
grep xmahjongg /tmp/xmahjongg-help.txt
test -s "$DESTDIR/share/xmahjongg/tiles/thick.gif"
test -s "$DESTDIR/share/licenses/xmahjongg/NOTICE"
echo XMAHJONGG-STAGED-HELP-PASS
