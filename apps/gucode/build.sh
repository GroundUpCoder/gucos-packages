#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/gucode"
cc -O2 -Isource/src -Isource/vendor/cjson -I/usr/local/include source/src/main.c source/src/common.c source/src/http.c source/src/tools.c source/vendor/cjson/cJSON.c /usr/local/lib/libcurl.a -o "$DESTDIR/bin/gucode"
cp source/LICENSE "$DESTDIR/share/licenses/gucode/LICENSE"
cp source/vendor/cjson/LICENSE "$DESTDIR/share/licenses/gucode/cJSON-LICENSE"
