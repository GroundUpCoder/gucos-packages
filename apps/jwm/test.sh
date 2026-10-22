#!/bin/sh
set -eu
"$DESTDIR/bin/jwm" -v
"$DESTDIR/bin/jwm" -p -f "$DESTDIR/share/jwm/wasm.jwmrc"
