#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
mkdir -p "$stage/bin" "$stage/libexec" "$stage/share/galculator/ui" "$stage/share/doc/galculator" "$stage/share/pixmaps" "$stage/share/applications" "$stage/share/licenses/galculator"
cp galculator.desktop "$stage/share/applications/"
cd source
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
cc -DHAVE_CONFIG_H -Iport -Isrc -I/usr/local/include/gtk3-x11 -I/usr/local/include/gtk3-x11/cairo src/main.c src/math_functions.c src/display.c src/general_functions.c src/calc_basic.c src/config_file.c src/callbacks.c src/ui.c port/flex_parser.c $(pkgconf --cflags --libs gtk+-3.0) -L/usr/local/lib/gtk3-x11 -lgmodule-2.0 -lintl -lm -rdynamic -o "$stage/libexec/galculator"
cp ui/*.ui "$stage/share/galculator/ui/"
sed 's/@VERSION@/2.1.4/g' ui/about.ui.in > "$stage/share/galculator/ui/about.ui"
cp PORT.md "$stage/share/doc/galculator/"
cp COPYING "$stage/share/licenses/galculator/"
cp pixmaps/galculator.png "$stage/share/pixmaps/"
printf '#!/bin/sh\nexec gtk3-x11-run /usr/local/libexec/galculator "$@"\n' > "$stage/bin/galculator"
chmod +x "$stage/bin/galculator"
