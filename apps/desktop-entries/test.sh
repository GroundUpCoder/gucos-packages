#!/bin/sh
set -eu
"$DESTDIR/bin/desktop-menu" --help
cc -O2 test.c -o desktop-test
./desktop-test
fixture=$(mktemp -d /tmp/desktop-fixture.XXXXXX)
trap 'rm -rf "$fixture"' EXIT
cc -O2 -DPREFIX="\"$fixture\"" main.c -o "$fixture/helper"
mkdir -p "$fixture/bin" "$fixture/share/applications" "$fixture/lib/gucman/packages/fixture/release/share/applications"
release=$fixture/lib/gucman/packages/fixture/release
ln -s "$release" "$fixture/lib/gucman/packages/fixture/current"
cat > "$fixture/bin/capture" <<'CAPTURE'
#!/bin/sh
printf '<%s>\n' "$@"
CAPTURE
cp "$fixture/bin/capture" "$fixture/bin/xterm"
chmod 755 "$fixture/bin/capture" "$fixture/bin/xterm"
cat > "$release/share/applications/test.desktop" <<'ENTRY'
[Desktop Entry]
Type=Application
Name=뱀 & "Snake"
Exec=capture "literal; & | \\$(x)" "" %c %k %i %F
Icon=an icon
Terminal=false
ENTRY
printf 'share/applications/test.desktop\n' > "$release/paths"
ln -s "$fixture/lib/gucman/packages/fixture/current/share/applications/test.desktop" "$fixture/share/applications/test.desktop"
"$fixture/helper" jwm-items > "$fixture/menu"
grep -F '뱀 &amp; &quot;Snake&quot;' "$fixture/menu"
"$fixture/helper" launch test.desktop > "$fixture/argv"
grep -Fx '<literal; & | $(x)>' "$fixture/argv"
grep -Fx '<>' "$fixture/argv"
grep -Fx '<뱀 & "Snake">' "$fixture/argv"
grep -Fx '<--icon>' "$fixture/argv"
grep -Fx '<an icon>' "$fixture/argv"
test "$(wc -l < "$fixture/argv")" -eq 6
sed 's/Terminal=false/Terminal=true/' "$release/share/applications/test.desktop" > "$fixture/terminal"
cp "$fixture/terminal" "$release/share/applications/test.desktop"
"$fixture/helper" launch test.desktop > "$fixture/argv"
grep -Fx '<-fn>' "$fixture/argv"
grep -Fx '<fixed>' "$fixture/argv"
grep -Fx '<-title>' "$fixture/argv"
grep -Fx '<-e>' "$fixture/argv"
grep -Fx "<$fixture/bin/capture>" "$fixture/argv"
test "$(wc -l < "$fixture/argv")" -eq 12
rm "$fixture/bin/xterm"
test -z "$("$fixture/helper" jwm-items)"
if "$fixture/helper" launch test.desktop; then exit 1; fi
cp "$fixture/bin/capture" "$fixture/bin/xterm"
chmod 755 "$fixture/bin/xterm"
: > "$release/paths"
test -z "$("$fixture/helper" jwm-items)"
printf 'share/applications/test.desktop\n' > "$release/paths"
rm "$release/share/applications/test.desktop"
test -z "$("$fixture/helper" jwm-items)"
rm "$fixture/share/applications/test.desktop"
cp "$fixture/terminal" "$fixture/share/applications/test.desktop"
test -z "$("$fixture/helper" jwm-items)"
echo 'desktop ownership and direct/terminal argv tests passed'
