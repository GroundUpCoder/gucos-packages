#!/bin/sh
set -eu
# Source stages contain regular files; public installs use exact managed links.
check_owned_file() {
 relative=$1
 expected_mode=$2
 public="$DESTDIR/$relative"
 if test "$DESTDIR" = /usr/local; then
  package=/usr/local/lib/gucman/packages/libfm
  test -L "$package/current"
  release=$(readlink "$package/current")
  case "$release" in "$package"/release.*) ;; *) echo 'Unexpected package release target' >&2; return 1;; esac
  suffix=${release#"$package"/release.}
  case "$suffix" in ''|*[!a-zA-Z0-9]*) echo 'Invalid release suffix' >&2; return 1;; esac
  test -d "$release" && test ! -L "$release"
  grep -Fx "$relative" "$package/current/paths" >/dev/null
  test -L "$public"
  test "$(readlink "$public")" = "$package/current/$relative"
  payload="$release/$relative"
  test "$(readlink -f "$public")" = "$payload"
 else
  payload="$public"
 fi
 test -f "$payload" && test ! -L "$payload"
 test "$(stat -c %a "$payload")" = "$expected_mode"
}
# Source stage: real file operations and direct menu generation, without X.
# Installed stage additionally exercises a managed foreground menu daemon.
work=$(mktemp -d /tmp/fmm.XXXXXX)
# Relocation preserves upstream bytes and declared regular-file modes.
cmp "source/libfm-1.3.2/data/libfm.conf" "$DESTDIR/share/libfm/xdg/libfm/libfm.conf"
check_owned_file "share/libfm/xdg/libfm/libfm.conf" 644
# A stub observes launcher environment/argv without starting GTK or an X client.
mkdir -p "$work/stub"
cat > "$work/stub/gtk3-x11-run" <<'STUB'
#!/bin/sh
printf '%s\n' "$XDG_CONFIG_DIRS" "${XDG_MENU_PREFIX-unset}"
printf '<%s>\n' "$@"
STUB
chmod 755 "$work/stub/gtk3-x11-run"
for launcher in libfm-pref-apps lxshortcut; do
 check_owned_file "bin/$launcher" 755
 target=/usr/local/libexec/libfm/$launcher
 for scenario in unset empty custom; do
  (
   case "$scenario" in
    unset) unset XDG_CONFIG_DIRS XDG_MENU_PREFIX;;
    empty) export XDG_CONFIG_DIRS= XDG_MENU_PREFIX=;;
    custom) export XDG_CONFIG_DIRS='/tmp/caller one:/tmp/caller-two' XDG_MENU_PREFIX=custom-;;
   esac
   PATH="$work/stub:$PATH" "$DESTDIR/bin/$launcher" 'space argument' '' '*' --no-desktop
  ) > "$work/wrapper.actual"
  case "$scenario" in
   custom) dirs='/tmp/caller one:/tmp/caller-two'; prefix=custom-;;
   unset) dirs=/usr/local/etc/xdg:/etc/xdg; prefix=unset;;
   empty) dirs=/usr/local/etc/xdg:/etc/xdg; prefix=;;
  esac
  { printf '%s\n' "$dirs:/usr/local/share/libfm/xdg" "$prefix"; printf '<%s>\n' "$target" 'space argument' '' '*' --no-desktop; } > "$work/wrapper.expected"
  cmp "$work/wrapper.expected" "$work/wrapper.actual"
 done
done
# End launcher-only checks.
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
# A separate process avoids GLib's cached XDG directories. Set non-default
# sentinels before loading, so this proves loading rather than built-in defaults.
XDG_CONFIG_DIRS="$DESTDIR/share/libfm/xdg" "$work/consumer" config
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
