set -eu
for name in xeyes xlogo xlsfonts xkill; do gucman build "expansion:$name"; done
echo FINAL-GRAPHICS-B-PASS
