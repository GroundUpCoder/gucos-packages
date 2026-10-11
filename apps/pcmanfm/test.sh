#!/bin/sh
set -eu
# PCManFM initializes GTK; do not pretend a headless CLI is an application gate.
work=$(mktemp -d /tmp/pcmanfm-test.XXXXXX)
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
export LD_LIBRARY_PATH=/usr/local/lib/gtk3-x11:/usr/local/lib
mkdir -p "$work/files/nested"
printf 'hello\n' > "$work/files/hello.txt"
test -s "$DESTDIR/libexec/pcmanfm"
test -x "$DESTDIR/bin/pcmanfm"
test -s "$DESTDIR/share/licenses/pcmanfm/COPYING"
test -s "$DESTDIR/share/pcmanfm/ui/pref.ui"
test -s "$DESTDIR/etc/xdg/menus/lxde-applications.menu"
grep -q '^Exec=pcmanfm --no-desktop %U$' "$DESTDIR/share/applications/pcmanfm.desktop"
sh -n "$DESTDIR/bin/pcmanfm"
cc -I"$DESTDIR/include" $(pkgconf --cflags libfm-gtk3) consumer.c $(pkgconf --libs libfm-gtk3) -lintl -o "$work/consumer"
"$work/consumer" "$work/files"
printf 'PCMANFM-CONSUMER-EVIDENCE %s\n' "$work"
