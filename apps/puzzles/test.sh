#!/bin/sh
set -eu
export PATH="$DESTDIR/bin:$PATH"
# Exercise the staged binaries through the installed GTK environment wrapper.
while read -r game; do
 gtk3-x11-run "$DESTDIR/libexec/puzzles/$game" --version
 gtk3-x11-run "$DESTDIR/libexec/puzzles/$game" --generate 1 > /tmp/puzzle-generated
 test -s /tmp/puzzle-generated
done < "$DESTDIR/share/sgt-puzzles/games"
gtk3-x11-run "$DESTDIR/libexec/puzzles/solo" --generate 2 --test-solve '3x3#12345' > /tmp/solo-generated
gtk3-x11-run "$DESTDIR/libexec/puzzles/net" --generate 2 --test-solve '5x5#12345' > /tmp/net-generated
gtk3-x11-run "$DESTDIR/libexec/puzzles/fifteen" --generate 1 --save /tmp/fifteen.sav '4x4#12345'
test -s /tmp/fifteen.sav0
echo PUZZLES-CONSUMERS-PASS
