set -eu
rm -f /tmp/.X1-lock /tmp/.X2-lock /tmp/.X11-unix/X1 /tmp/.X11-unix/X2
printf retained > /tmp/.X1-lock
mkdir -p /tmp/delayed-x
cat > /tmp/delayed-x/Xvfb <<'SH'
#!/bin/sh
sleep 3
exec /usr/local/bin/Xvfb "$@"
SH
chmod +x /tmp/delayed-x/Xvfb
export PATH=/tmp/delayed-x:$PATH
unset DISPLAY
start-jwm &
session=$!
sleep 6
DISPLAY=:2 xlsfonts -fn fixed | grep fixed
DISPLAY=:2 xprop -root _NET_SUPPORTING_WM_CHECK | grep 'window id'
DISPLAY=:2 jwm -exit
wait "$session"
test "$(cat /tmp/.X1-lock)" = retained
test ! -e /tmp/.X2-lock
rm /tmp/.X1-lock
echo JWM-LAUNCHER-PASS
