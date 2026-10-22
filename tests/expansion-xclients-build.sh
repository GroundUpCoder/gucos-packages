set -eu
for name in xcalc xclock xeyes xlogo xlsfonts xkill xrefresh xmessage xprop xev; do
 gucman build "expansion:$name"
done
echo XCLIENTS-BUILD-PASS
