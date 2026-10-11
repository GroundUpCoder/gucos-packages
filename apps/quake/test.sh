#!/bin/sh
set -eu
test -x "$DESTDIR/bin/quake"
test -x "$DESTDIR/libexec/quake"
# Interactive rendering/gameplay is a separate required browser gate.
