#!/bin/sh
set -eu
TERM=xterm "$DESTDIR/bin/nyancat" -I -s -n -e -r 20 -R 40 -c 15 -C 50 -f 1 > /tmp/nyan-one
TERM=xterm "$DESTDIR/bin/nyancat" -I -s -n -e -r 20 -R 40 -c 15 -C 50 -f 2 > /tmp/nyan-two
test "$(wc -c < /tmp/nyan-one)" -gt 100
test "$(wc -c < /tmp/nyan-two)" -gt "$(wc -c < /tmp/nyan-one)"

cmp /tmp/nyan-one source/port/native-1.ansi
cmp /tmp/nyan-two source/port/native-2.ansi
echo NYANCAT-ACCEPTANCE-PASS
