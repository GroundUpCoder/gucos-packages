#!/bin/sh
set -eu
test -x "$DESTDIR/bin/gameboy"
test -s "$DESTDIR/share/licenses/gameboy/peanut_gb.h"
# The no-ROM graphical fixture and original four-color palette are tested by
# the browser harness. This metadata check alone is not runtime acceptance.
grep -Fx 'Exec=gameboy' "$DESTDIR/share/applications/gucos-gameboy.desktop"
