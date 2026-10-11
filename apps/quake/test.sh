#!/bin/sh
set -eu
test -x "$DESTDIR/bin/quake"
test -x "$DESTDIR/libexec/quake"
# Interactive rendering/gameplay is a separate required browser gate.
fixture=$(mktemp -d /tmp/game-launcher.XXXXXX)
trap 'rm -rf "$fixture"' EXIT
mkdir -p "$fixture/bin" "$fixture/libexec" "$fixture/home"
cp launch.sh "$fixture/bin/quake"
cat > "$fixture/libexec/quake" <<'CAPTURE'
#!/bin/sh
pwd
printf '<%s>\n' "$@"
CAPTURE
chmod 755 "$fixture/bin/quake" "$fixture/libexec/quake"
mkdir -p "$fixture/share/quake/id1" "$fixture/home/.local/share/quake/id1"
printf 'default\n' > "$fixture/share/quake/id1/autoexec.cfg"
cp shareware-payload.tar.gz "$fixture/share/quake/"
printf 'user edit\n' > "$fixture/home/.local/share/quake/id1/autoexec.cfg"
ln -s /missing-user-pak "$fixture/home/.local/share/quake/id1/pak0.pak"
HOME="$fixture/home" "$fixture/bin/quake" -nosound > "$fixture/result"
grep -Fx 'user edit' "$fixture/home/.local/share/quake/id1/autoexec.cfg"
test "$(readlink "$fixture/home/.local/share/quake/id1/pak0.pak")" = /missing-user-pak
rm "$fixture/home/.local/share/quake/id1/autoexec.cfg"
HOME="$fixture/home" "$fixture/bin/quake" -nosound > "$fixture/result"
test ! -e "$fixture/home/.local/share/quake/id1/autoexec.cfg"
grep -Fx '<-nosound>' "$fixture/result"
test -s "$fixture/home/.local/share/quake/original/SLICNSE.TXT"
test -s "$fixture/home/.local/share/quake/original/ID1/PAK0.PAK"
