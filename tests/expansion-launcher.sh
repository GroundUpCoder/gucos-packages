set -eu
rm -f /tmp/.X1-lock /tmp/.X2-lock /tmp/.X11-unix/X1 /tmp/.X11-unix/X2
printf retained > /tmp/.X1-lock
unset DISPLAY
start-jwm &
session=$!
sleep 4
DISPLAY=:2 xlsfonts -fn fixed | grep fixed
DISPLAY=:2 xprop -root _NET_SUPPORTING_WM_CHECK | grep 'window id'
DISPLAY=:2 jwm -exit
wait "$session"
test "$(cat /tmp/.X1-lock)" = retained
test ! -e /tmp/.X2-lock
rm /tmp/.X1-lock
echo JWM-LAUNCHER-PASS
