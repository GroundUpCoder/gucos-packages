#!/bin/sh
set -eu
tar -xf source.tar
tar -xzf prepared.tar.gz -C source/port
stage="$DESTDIR"
cd source
if [ ! -f port/generated/build.sh ]; then
  echo 'HarfBuzz requires host source preparation: see port/README.md' >&2
  exit 1
fi
mkdir -p "$stage/lib/pkgconfig" "$stage/include/harfbuzz" "$stage/share/harfbuzz"
# Link the full shared library from the exact installed static component.
mkdir -p port/build
(
 cd port/build
 ar x /usr/local/lib/libharfbuzz.a
 printf '%s\n' [0-9]*.o > link.rsp
 cc -shared @link.rsp /usr/local/lib/libharfbuzz-runtime.a -lglib-2.0 -lpcre2-8 -lintl -liconv -lz -lfreetype -Wl,-soname,libharfbuzz.so -o "$stage/lib/libharfbuzz.so"
)
rm -rf port/build
cp port/generated/include/* "$stage/include/harfbuzz/"
cp port/generated/provenance.json "$stage/share/harfbuzz/translation.json"
for component in harfbuzz harfbuzz-subset harfbuzz-raster harfbuzz-vector harfbuzz-gpu; do
  cat > "$stage/lib/pkgconfig/$component.pc" <<EOF
prefix=/usr/local
libdir=\${prefix}/lib
includedir=\${prefix}/include
Name: $component
Description: HarfBuzz translated combined static library for wasm-posix
Version: 14.5.0
Libs: -L\${libdir} -lharfbuzz -lharfbuzz-runtime
Requires.private: glib-2.0 zlib freetype2
Cflags: -I\${includedir}/harfbuzz
EOF
done

mkdir -p "$stage/share/licenses/harfbuzz"
cp upstream/COPYING "$stage/share/licenses/harfbuzz/COPYING"
cp port/fonts/ABeeZee-OFL.txt "$stage/share/licenses/harfbuzz/ABeeZee-OFL.txt"
