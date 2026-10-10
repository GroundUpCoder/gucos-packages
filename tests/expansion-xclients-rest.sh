set -eu
for name in xlsfonts xkill xrefresh xmessage xprop xev; do
 gucman build "expansion:$name"
done
echo XCLIENTS-REST-BUILD-PASS
