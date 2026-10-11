#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/pigz"
cd source
cc -DNOZOPFLI -I. -I/usr/local/include pigz.c yarn.c try.c -L/usr/local/lib -lz -o "$DESTDIR/bin/pigz"
cat > "$DESTDIR/bin/unpigz" <<'EOF'
#!/bin/sh
exec /usr/local/bin/pigz -d "$@"
EOF
chmod 755 "$DESTDIR/bin/unpigz"
cp README "$DESTDIR/share/licenses/pigz/README"
