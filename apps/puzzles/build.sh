#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
src="$PWD/source"
up=$src/puzzles-20260923.616da16
build="$PWD/puzzles-build"
mkdir -p "$build" "$stage/bin" "$stage/libexec/puzzles" "$stage/share/sgt-puzzles/help" "$stage/share/doc/puzzles"
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
pc=/usr/local/bin/pkgconf
flags="-I/usr/local/include/gtk3-x11 -I/usr/local/include/gtk3-x11/cairo $($pc --cflags gtk+-3.0) -DNO_TGMATH_H -DWASM_POSIX_NO_PRINTING -I$up"
libs="-L/usr/local/lib/gtk3-x11 $($pc --libs gtk+-3.0) -lm"
objects=
for file in combi divvy draw-poly drawing dsf findloop grid latin laydomino loopgen malloc matching midend misc penrose penrose-legacy ps random sort tdq tree234 version hat spectre gtk printing; do
 input="$up/$file.c"
 if test "$file" = gtk; then input="$src/overlays/gtk.c"; fi
 cc -O2 $flags '-DHELP_DIR="/usr/local/share/sgt-puzzles/help"' -c "$input" -o "$build/$file.o"
 objects="$objects $build/$file.o"
done
ar rcs "$build/common.a" $objects
while read game; do
 echo "Building puzzle $game"
 cc -O2 $flags -c "$up/$game.c" -o "$build/game.o"
 cc -O2 $flags -c "$up/no-icon.c" -o "$build/icon.o"
 cc "$build/game.o" "$build/icon.o" "$build/common.a" $libs -o "$stage/libexec/puzzles/$game"
 printf '#!/bin/sh\nexec gtk3-x11-run /usr/local/libexec/puzzles/%s "$@"\n' "$game" > "$stage/bin/sgt-$game"
 chmod +x "$stage/bin/sgt-$game"
done < "$src/games"
cp "$src/games" "$stage/share/sgt-puzzles/games"
cp "$up/html/"* "$stage/share/sgt-puzzles/help/"
cp "$up/LICENCE" "$stage/share/doc/puzzles/"
mkdir -p "$stage/share/licenses/puzzles" "$stage/share/applications"
cp "$up/LICENCE" "$stage/share/licenses/puzzles/LICENCE"
cp gucos-puzzles-*.desktop "$stage/share/applications/"
