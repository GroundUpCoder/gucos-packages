#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/ed"
cd source
cc '-DPROGVERSION="1.22.2"' -I. buffer.c carg_parser.c global.c io.c main.c main_loop.c regex.c signal.c -lm -o "$DESTDIR/bin/ed"
cp COPYING "$DESTDIR/share/licenses/ed/COPYING"
cat > "$DESTDIR/bin/red" <<'SH'
#!/bin/sh
exec "$(dirname "$0")/ed" -r "$@"
SH
chmod 755 "$DESTDIR/bin/red"
