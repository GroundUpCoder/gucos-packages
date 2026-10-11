#!/bin/sh
set -eu
test -x "$DESTDIR/bin/doom"
test -x "$DESTDIR/libexec/doom"
# Interactive rendering/gameplay is a separate required browser gate.
