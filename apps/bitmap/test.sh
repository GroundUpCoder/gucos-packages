#!/bin/sh
set -eu
printf '........\n........\n........\n........\n........\n........\n........\n........\n' > /tmp/original.txt
"$DESTDIR/bin/atobm" -chars '.#' -name sample /tmp/original.txt > /tmp/sample.xbm
"$DESTDIR/bin/bmtoa" -chars '.#' /tmp/sample.xbm > /tmp/roundtrip.txt
cmp /tmp/original.txt /tmp/roundtrip.txt
echo BITMAP-CONVERSION-PASS
