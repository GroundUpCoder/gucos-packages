set -eu
for name in xrefresh xmessage xprop xev; do gucman build "expansion:$name"; done
echo FINAL-GRAPHICS-C-PASS
