#!/bin/sh
set -eu
# Gzip-compressed source.tar keeps all historical blobs, including build tests.
tar -xzf source.tar
printf '%s  source/Lib/site.py\n' 08da608a54b013e2bf353c841d231a5e26bfbb33a0c90516f9a87d2ec57b4e4a | sha256sum -c -
# This must precede configure/build: site.py is also frozen into the interpreter.
cp site-gucman.py source/Lib/site.py
# Diagnostic-only overlay must precede configure and every module freeze.
printf '%s  source/Modules/getpath.c\n' 5a2ecbe4176c02a0a27fb95a98b0a96ff8712e53865134e0db7ce4bb107116f4 | sha256sum -c -
printf '%s  getpath-diagnostic.c\n' 43a2b96bbec8e8f9d7892496a3409c259fae7631184aa78228becead8d986d97 | sha256sum -c -
cp getpath-diagnostic.c source/Modules/getpath.c
# Preserve a separator for one-character relative directory names.
printf '%s  source/Python/fileutils.c\n' 7141679d2d4d1ac7faa9f17b4fa3596e042bbd4d32bbab659bb5336c24b79d95 | sha256sum -c -
printf '%s  fileutils-path.c\n' c43305d02cd0992c9081baa4093ac5864b1ecf4338107b00162a4dbd12236812 | sha256sum -c -
cp fileutils-path.c source/Python/fileutils.c
stage="$DESTDIR"
mkdir -p "$stage/build" "$stage/bin" "$stage/lib/python3.14" "$stage/include/python3.14" "$stage/share/doc/cpython" "$stage/share/licenses/cpython"
cp README.md "$stage/share/doc/cpython/MIGRATION.md"
cp -R source/. "$stage/build/"
cd "$stage/build"
chmod +x install-sh config.guess config.sub
sh port/probe-build.sh
make platform
./python port/smoke.py
./python -c 'import zlib; data=b"CPython compression"*100; assert zlib.decompress(zlib.compress(data)) == data'
cp python "$stage/bin/python3.14"
chmod +x "$stage/bin/python3.14"
test -f "$stage/bin/python3.14" && test ! -L "$stage/bin/python3.14"
test "$(stat -c %a "$stage/bin/python3.14")" = 755
echo CPYTHON-STAGED-EXECUTABLE-MODE-PASS
# gucman requires regular outputs; preserve the two public command names.
for name in python3 cpython; do
 printf '#!/bin/sh\nexec /usr/local/bin/python3.14 "$@"\n' > "$stage/bin/$name"
 chmod +x "$stage/bin/$name"
done
cp -R Lib/. "$stage/lib/python3.14/"
mkdir -p "$stage/lib/python3.14/lib-dynload"
printf '%s\n' 'CPython extension modules can be installed in this directory.' > "$stage/lib/python3.14/lib-dynload/README"
rm -rf "$stage/lib/python3.14/test" "$stage/lib/python3.14/ensurepip"
find "$stage/lib/python3.14" -type d -name __pycache__ -exec rm -rf '{}' +
buildlib=$(cat pybuilddir.txt)
# Assert the generated identity; never rename a mismatched platform's data.
set -- "$buildlib"/_sysconfigdata_*.py
test "$#" -eq 1
test "${1##*/}" = _sysconfigdata__wasm1_.py
test -s "$1"
cp "$1" "$stage/lib/python3.14/"
cp -R Include/. "$stage/include/python3.14/"
cp pyconfig.h "$stage/include/python3.14/"
mkdir -p "$stage/lib/python3.14/config-3.14"
cp Makefile "$stage/lib/python3.14/config-3.14/"
cp LICENSE PORT.md "$stage/share/doc/cpython/"
cp LICENSE "$stage/share/licenses/cpython/"
cp Doc/license.rst "$stage/share/licenses/cpython/third-party-license.rst"
cp Modules/expat/COPYING "$stage/share/licenses/cpython/expat-COPYING"
# HACL notices live in source headers; retain their complete owned source files.
cp -R Modules/_hacl "$stage/share/licenses/cpython/hacl"
cd /
rm -rf "$stage/build"
