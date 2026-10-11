#!/bin/sh
set -eu
export LD_LIBRARY_PATH="$DESTDIR/lib:/usr/local/lib"
"$DESTDIR/libexec/feh" --version > /tmp/feh-version.txt
grep '3.13.1' /tmp/feh-version.txt
cc -I/usr/local/include source/tests/control.c -L/usr/local/lib -lImlib2 -lX11 -o /tmp/feh-source-control
/tmp/feh-source-control create
"$DESTDIR/libexec/feh" --conversion-timeout -1 --customlist '%w %h' /tmp/red.png > /tmp/feh-metadata.txt
printf '80 60\n' > /tmp/feh-expected.txt
cmp /tmp/feh-metadata.txt /tmp/feh-expected.txt
mkdir -p /tmp/feh-source-images
rm -f /tmp/feh-source-images/red.png /tmp/feh-source-images/green.png
cp /tmp/red.png /tmp/green.png /tmp/feh-source-images/
"$DESTDIR/libexec/feh" --conversion-timeout -1 --customlist '%w %h' /tmp/feh-source-images > /tmp/feh-directory.txt
printf '80 60\n80 60\n' > /tmp/feh-directory-expected.txt
cmp /tmp/feh-directory.txt /tmp/feh-directory-expected.txt
test -s "$DESTDIR/share/licenses/feh/OFL.txt"
echo FEH-HEADLESS-PASS
