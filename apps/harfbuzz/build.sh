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
sh port/generated/build.sh "$stage"
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
