#!/bin/sh
set -eu
cc -I"$DESTDIR/include" source/port/check.c -L"$DESTDIR/lib" -lSDL3_gfx -lSDL3 -lm -o gfx-shared
LD_LIBRARY_PATH="$DESTDIR/lib:/usr/local/lib" ./gfx-shared > shared.log
cat shared.log
cc -I"$DESTDIR/include" source/port/check.c "$DESTDIR/lib/libSDL3_gfx.a" -lSDL3 -lm -o gfx-static
./gfx-static > static.log
cat static.log
grep -F SDL3-GFX-PASS shared.log
grep -F SDL3-GFX-PASS static.log
awk '/SDL3-GFX-BENCH/ { if ($2 !~ /^[0-9]+[.][0-9]+$/ || $2 <= 0) exit 1; n++ } END { if (n != 10) exit 1 }' shared.log static.log
