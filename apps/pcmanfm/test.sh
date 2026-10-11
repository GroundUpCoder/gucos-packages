#!/bin/sh
set -eu
# Source stages contain regular files; public installs use exact managed links.
check_owned_file() {
 relative=$1
 expected_mode=$2
 public="$DESTDIR/$relative"
 if test "$DESTDIR" = /usr/local; then
  package=/usr/local/lib/gucman/packages/pcmanfm
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
# PCManFM initializes GTK; do not pretend a headless CLI is an application gate.
work=$(mktemp -d /tmp/pcmanfm-test.XXXXXX)
# Relocation preserves upstream bytes and declared regular-file modes.
cmp "source/applications.menu" "$DESTDIR/share/pcmanfm/xdg/menus/lxde-applications.menu"
check_owned_file "share/pcmanfm/xdg/menus/lxde-applications.menu" 644
cmp "source/pcmanfm-1.3.2/data/pcmanfm.conf" "$DESTDIR/share/pcmanfm/xdg/pcmanfm/default/pcmanfm.conf"
check_owned_file "share/pcmanfm/xdg/pcmanfm/default/pcmanfm.conf" 644
# A stub observes launcher environment/argv without starting GTK or an X client.
mkdir -p "$work/stub"
cat > "$work/stub/gtk3-x11-run" <<'STUB'
#!/bin/sh
printf '%s\n' "$XDG_CONFIG_DIRS" "${XDG_MENU_PREFIX-unset}"
printf '<%s>\n' "$@"
STUB
chmod 755 "$work/stub/gtk3-x11-run"
for launcher in pcmanfm; do
 check_owned_file "bin/$launcher" 755
 target=/usr/local/libexec/pcmanfm
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
   *) dirs=/usr/local/etc/xdg:/etc/xdg; prefix=lxde-;;
  esac
  { printf '%s\n' "$dirs:/usr/local/share/pcmanfm/xdg:/usr/local/share/libfm/xdg" "$prefix"; printf '<%s>\n' "$target" 'space argument' '' '*' --no-desktop; } > "$work/wrapper.expected"
  cmp "$work/wrapper.expected" "$work/wrapper.actual"
 done
done
# End launcher-only checks.
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
export LD_LIBRARY_PATH=/usr/local/lib/gtk3-x11:/usr/local/lib
mkdir -p "$work/files/nested"
printf 'hello\n' > "$work/files/hello.txt"
test -s "$DESTDIR/libexec/pcmanfm"
test -x "$DESTDIR/bin/pcmanfm"
test -s "$DESTDIR/share/licenses/pcmanfm/COPYING"
test -s "$DESTDIR/share/pcmanfm/ui/pref.ui"
test -s "$DESTDIR/share/pcmanfm/xdg/menus/lxde-applications.menu"
grep -q '^Exec=pcmanfm --no-desktop %U$' "$DESTDIR/share/applications/pcmanfm.desktop"
sh -n "$DESTDIR/bin/pcmanfm"
cc -I"$DESTDIR/include" $(pkgconf --cflags libfm-gtk3) consumer.c $(pkgconf --libs libfm-gtk3) -lintl -o "$work/consumer"
# Keep host/user configuration out of the SDK/config and menu lookup checks.
export XDG_CONFIG_HOME="$work/settings" XDG_CACHE_HOME="$work/cache" XDG_DATA_HOME="$work/data"
export XDG_CONFIG_DIRS="$DESTDIR/share/pcmanfm/xdg:/usr/local/share/libfm/xdg"
export XDG_DATA_DIRS="$work/data" XDG_MENU_PREFIX=lxde-
mkdir -p "$XDG_CONFIG_HOME" "$XDG_CACHE_HOME" "$XDG_DATA_HOME/applications"
cat > "$XDG_DATA_HOME/applications/relocation.desktop" <<'DESKTOP'
[Desktop Entry]
Type=Application
Name=Relocated Menu Fixture
Exec=/bin/true
Categories=Utility;
DESKTOP
/usr/local/libexec/menu-cache/menu-cache-gen -i applications.menu -o "$work/relocated.cache" -l C
grep -q 'relocation.desktop' "$work/relocated.cache"
grep -q 'Relocated Menu Fixture' "$work/relocated.cache"
"$work/consumer" "$work/files"
printf 'PCMANFM-CONSUMER-EVIDENCE %s\n' "$work"
