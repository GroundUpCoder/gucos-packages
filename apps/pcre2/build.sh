#!/bin/sh
# Invoked by gucman in a private staging directory. No source freshness checks.
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/include" "$stage/objects"
objects=
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_auto_possess.c -o "$stage/objects/0.o"
objects="$objects $stage/objects/0.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_chkdint.c -o "$stage/objects/1.o"
objects="$objects $stage/objects/1.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_chartables.c -o "$stage/objects/2.o"
objects="$objects $stage/objects/2.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_compile.c -o "$stage/objects/3.o"
objects="$objects $stage/objects/3.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_compile_class.c -o "$stage/objects/4.o"
objects="$objects $stage/objects/4.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_config.c -o "$stage/objects/5.o"
objects="$objects $stage/objects/5.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_context.c -o "$stage/objects/6.o"
objects="$objects $stage/objects/6.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_convert.c -o "$stage/objects/7.o"
objects="$objects $stage/objects/7.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_dfa_match.c -o "$stage/objects/8.o"
objects="$objects $stage/objects/8.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_error.c -o "$stage/objects/9.o"
objects="$objects $stage/objects/9.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_extuni.c -o "$stage/objects/10.o"
objects="$objects $stage/objects/10.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_find_bracket.c -o "$stage/objects/11.o"
objects="$objects $stage/objects/11.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_jit_compile.c -o "$stage/objects/12.o"
objects="$objects $stage/objects/12.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_maketables.c -o "$stage/objects/13.o"
objects="$objects $stage/objects/13.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_match.c -o "$stage/objects/14.o"
objects="$objects $stage/objects/14.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_match_data.c -o "$stage/objects/15.o"
objects="$objects $stage/objects/15.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_newline.c -o "$stage/objects/16.o"
objects="$objects $stage/objects/16.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_ord2utf.c -o "$stage/objects/17.o"
objects="$objects $stage/objects/17.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_pattern_info.c -o "$stage/objects/18.o"
objects="$objects $stage/objects/18.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_script_run.c -o "$stage/objects/19.o"
objects="$objects $stage/objects/19.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_serialize.c -o "$stage/objects/20.o"
objects="$objects $stage/objects/20.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_string_utils.c -o "$stage/objects/21.o"
objects="$objects $stage/objects/21.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_study.c -o "$stage/objects/22.o"
objects="$objects $stage/objects/22.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_substitute.c -o "$stage/objects/23.o"
objects="$objects $stage/objects/23.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_substring.c -o "$stage/objects/24.o"
objects="$objects $stage/objects/24.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_tables.c -o "$stage/objects/25.o"
objects="$objects $stage/objects/25.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_ucd.c -o "$stage/objects/26.o"
objects="$objects $stage/objects/26.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_valid_utf.c -o "$stage/objects/27.o"
objects="$objects $stage/objects/27.o"
cc -Isrc -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 -c src/pcre2_xclass.c -o "$stage/objects/28.o"
objects="$objects $stage/objects/28.o"
ar rcs "$stage/libpcre2-8.a" $objects
cc -shared $objects -Wl,-soname,libpcre2-8.so -o "$stage/libpcre2-8.so"
cp src/pcre2.h "$stage/include/pcre2.h"

mkdir -p "$stage/pkgconfig"
cat > "$stage/pkgconfig/libpcre2-8.pc" <<'EOF'
prefix=/usr/local
libdir=${prefix}/lib
includedir=${prefix}/include
Name: libpcre2-8
Description: Bundled libpcre2-8 for wasm-posix
Version: 10.46
Libs: -L${libdir} -lpcre2-8
Requires.private:
Cflags: -I${includedir}
EOF

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/pcre2"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp LICENCE.md "$DESTDIR/share/licenses/pcre2/LICENCE.md"
