set -eu
for name in jwm xterm xcalc xclock; do gucman build "expansion:$name"; done
echo FINAL-GRAPHICS-A-PASS
