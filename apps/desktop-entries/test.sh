#!/bin/sh
set -eu
"$DESTDIR/bin/desktop-menu" --help
cc -O2 test.c -o desktop-test
./desktop-test
