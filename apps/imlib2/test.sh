#!/bin/sh
set -eu
rm -f /tmp/imlib2-consumer.png /tmp/imlib2-consumer.jpg /tmp/imlib2-consumer-no-such-image.png
cc -I"$DESTDIR/include" consumer-headless.c -L"$DESTDIR/lib" -L/usr/local/lib -lImlib2 -lX11 -o /tmp/imlib2-consumer
IMLIB2_LOADER_PATH="$DESTDIR/lib/imlib2/loaders" LD_LIBRARY_PATH="$DESTDIR/lib:/usr/local/lib" /tmp/imlib2-consumer
