#!/bin/sh
set -eu
"$DESTDIR/bin/xedit" -version
cd "$DESTDIR/share/xedit/tests"
"$DESTDIR/libexec/xedit/regex-tests"
