#!/bin/sh
set -eu
"$DESTDIR/bin/pkgconf" --version
mkdir -p pc-test
cat > pc-test/base.pc <<'PC'
prefix=/example
Name: base
Description: Static/private dependency test
Version: 1.2.3
Libs: -L${prefix}/lib -lbase
Libs.private: -lm
Cflags: -I${prefix}/include
PC
PKG_CONFIG_PATH="$PWD/pc-test" "$DESTDIR/bin/pkg-config" --exact-version=1.2.3 base
result=$(PKG_CONFIG_PATH="$PWD/pc-test" "$DESTDIR/bin/pkg-config" --static --libs base)
printf '%s\n' "$result" | grep -- '-lbase'
printf '%s\n' "$result" | grep -- '-lm'
