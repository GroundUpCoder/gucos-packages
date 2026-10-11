#!/bin/sh
set -eu
"$DESTDIR/bin/gucode" --version | grep 'gucode 0.1.1'
"$DESTDIR/bin/gucode" --help | grep 'DeepSeek\|DEEPSEEK'
if "$DESTDIR/bin/gucode" --max-turns 0 -p invalid; then exit 1; fi
