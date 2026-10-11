#!/bin/sh
set -eu
# Source stage: real file operations and direct menu generation, without X.
# Installed stage additionally exercises a managed foreground menu daemon.
work=$(mktemp -d /tmp/fmm.XXXXXX)
daemon=
cleanup() {
 if test -n "$daemon"; then
  kill "$daemon" 2>/dev/null || true
  # Bound shutdown even if the guest daemon does not process SIGTERM.
  sleep 1
  kill -KILL "$daemon" 2>/dev/null || true
  wait "$daemon" 2>/dev/null || true
 fi
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
export PKG_CONFIG_PATH="$DESTDIR/lib/pkgconfig:/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig"
export LD_LIBRARY_PATH="$DESTDIR/lib:/usr/local/lib/gtk3-x11:/usr/local/lib"
export XDG_CONFIG_HOME="$work/settings" XDG_CACHE_HOME="$work/cache" XDG_RUNTIME_DIR="$work/run"
export XDG_CONFIG_DIRS="$work/settings" XDG_DATA_HOME="$work/data" XDG_DATA_DIRS="$work/data"
# No X connection is made; this only names the private menu-cache socket.
export DISPLAY=:0
export LC_ALL=C
mkdir -p "$work/files/source/nested" "$work/files/copied" "$work/files/moved" "$XDG_CONFIG_HOME/menus" "$XDG_CACHE_HOME" "$XDG_RUNTIME_DIR" "$XDG_DATA_HOME/applications"
chmod 700 "$XDG_RUNTIME_DIR"
printf 'hello\n' > "$work/files/source/hello.txt"
printf 'nested data\n' > "$work/files/source/nested/data.txt"
cat > "$XDG_CONFIG_HOME/menus/test.menu" <<XML
<Menu><Name>Applications</Name><AppDir>$XDG_DATA_HOME/applications</AppDir><Include><All/></Include></Menu>
XML
cat > "$XDG_DATA_HOME/applications/fixture.desktop" <<'DESKTOP'
[Desktop Entry]
Type=Application
Name=File Manager Fixture
Exec=/bin/true
Categories=Utility;
DESKTOP
cc -I"$DESTDIR/include" -I"$DESTDIR/include/libfm" -I"$DESTDIR/include/menu-cache" $(pkgconf --cflags libfm libmenu-cache) "-DTEST_ROOT=\"$work/files\"" consumer.c -L"$DESTDIR/lib" $(pkgconf --libs libfm libmenu-cache) -o "$work/consumer"
"$work/consumer"
"$DESTDIR/libexec/menu-cache/menu-cache-gen" -i "$XDG_CONFIG_HOME/menus/test.menu" -o "$work/menu.cache" -l C
test -s "$work/menu.cache"
grep -q 'fixture.desktop' "$work/menu.cache"
grep -q 'File Manager Fixture' "$work/menu.cache"
echo LIBFM-STAGED-MENU-GENERATOR-PASS
if test "$DESTDIR" = /usr/local; then
 # Generator paths inside this daemon are deliberately installed paths.
 /usr/local/libexec/menu-cache/menu-cached "$XDG_RUNTIME_DIR/menu-cached-:0" > "$work/daemon.log" 2>&1 &
 daemon=$!
 count=0
 while ! test -S "$XDG_RUNTIME_DIR/menu-cached-:0"; do
  kill -0 "$daemon"
  count=$((count + 1)); test "$count" -le 10
  sleep 1
 done
 "$work/consumer" menu
 kill -0 "$daemon"
else
 echo LIBFM-INSTALLED-MENU-LOOKUP-PENDING
fi
printf 'LIBFM-CONSUMER-EVIDENCE %s\n' "$work"
