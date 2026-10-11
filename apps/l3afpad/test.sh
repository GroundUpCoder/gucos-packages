#!/bin/sh
set -eu
# Help exits during option parsing, before opening an X display. Interactive
# editing and save/reload are separate mandatory binary/public GUI gates.
gtk3-x11-run "$DESTDIR/libexec/l3afpad" --help > /tmp/l3afpad-help.txt
grep codeset /tmp/l3afpad-help.txt
test -s "$DESTDIR/share/pixmaps/l3afpad.png"
test -s "$DESTDIR/share/licenses/l3afpad/COPYING"
echo L3AFPАD-STAGED-HELP-PASS
