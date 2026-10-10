#!/bin/sh
set -eu
cc source/port/libjpeg-turbo-accept.c -I"$DESTDIR/include/jpeg-turbo" "$DESTDIR/lib/libjpeg-turbo.a" -o static-test
./static-test
cc source/port/libjpeg-turbo-accept.c -I"$DESTDIR/include/jpeg-turbo" -L"$DESTDIR/lib" -ljpeg-turbo -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
