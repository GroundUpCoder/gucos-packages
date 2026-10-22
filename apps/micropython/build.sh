#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/bin" "$DESTDIR/libexec" "$DESTDIR/share/licenses/micropython"
cc --project source/bin.json --rebuild -o "$DESTDIR/libexec/micropython"
cat > "$DESTDIR/bin/micropython" <<'WRAPPER'
#!/bin/sh
base=$(dirname "$0")
exec "$base/../libexec/micropython" "$@"
WRAPPER
cp "$DESTDIR/bin/micropython" "$DESTDIR/bin/python"
chmod 755 "$DESTDIR/bin/micropython" "$DESTDIR/bin/python"
cp source/LICENSE "$DESTDIR/share/licenses/micropython/LICENSE"
