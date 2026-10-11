set -eu
test ! -e /tmp/.X1-lock
test ! -e /tmp/.X11-unix/X1
test ! -e /tmp/no-such-image.png
test -x /usr/local/libexec/jwm/wait-display
sha256sum -c /tmp/imlib2-x11-supervised/imlib2.sha256
sha256sum -c /tmp/imlib2-x11-supervised/feh.sha256
printf '0a20280c434932cf94df31fb0270d7bb3e225e6b4e0691fa5bc575791ff9a95e  /tmp/imlib2-x11-supervised/consumer.c
' | sha256sum -c -
cc -I/usr/local/include /tmp/imlib2-x11-supervised/consumer.c -L/usr/local/lib -lImlib2 -lX11 -o /tmp/imlib2-x11-supervised/consumer
sha256sum /tmp/imlib2-x11-supervised/consumer
export DISPLAY=:1
export IMLIB2_LOADER_PATH=/usr/local/lib/imlib2/loaders
export LD_LIBRARY_PATH=/usr/local/lib
server=
cleanup() {
 if [ -n "$server" ]; then
  kill "$server" 2>/dev/null || true
  wait "$server" 2>/dev/null || true
  if kill -0 "$server" 2>/dev/null; then return 1; fi
  server=
 fi
}
trap 'rc=$?; trap - EXIT; cleanup || rc=1; exit "$rc"' EXIT
trap 'exit 143' TERM
trap 'exit 130' INT
Xvfb :1 -screen 0 800x600x24 -fp built-ins -noreset -ac &
server=$!
/usr/local/libexec/jwm/wait-display
kill -0 "$server"
echo IMLIB2-X11-READY
/tmp/imlib2-x11-supervised/consumer
kill -0 "$server"
cleanup
trap - EXIT TERM INT
echo IMLIB2-X11-CLEANUP-PASS
