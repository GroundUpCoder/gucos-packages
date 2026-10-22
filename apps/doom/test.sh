#!/bin/sh
set -eu
test -x "$DESTDIR/bin/doom"
test -x "$DESTDIR/libexec/doom"
# Interactive rendering/gameplay is a separate required browser gate.
fixture=$(mktemp -d /tmp/game-launcher.XXXXXX)
trap 'rm -rf "$fixture"' EXIT
mkdir -p "$fixture/bin" "$fixture/libexec" "$fixture/home"
cp launch.sh "$fixture/bin/doom"
cat > "$fixture/libexec/doom" <<'CAPTURE'
#!/bin/sh
pwd
printf '<%s>\n' "$@"
CAPTURE
chmod 755 "$fixture/bin/doom" "$fixture/libexec/doom"
HOME="$fixture/home" "$fixture/bin/doom" -test > "$fixture/result"
grep -Fx "$fixture/home/.local/share/doom" "$fixture/result"
grep -Fx "<$fixture/home/.config/doom/default.cfg>" "$fixture/result"
grep -Fx '<-test>' "$fixture/result"
