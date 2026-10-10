#!/bin/sh
set -eu
tar -xf source.tar
mv source cli
tar -xf pcre2-source.tar
mv source pcre2
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/pcre2grep"
objects=
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_auto_possess.c -o 0.o
objects="$objects 0.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_chkdint.c -o 1.o
objects="$objects 1.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_chartables.c -o 2.o
objects="$objects 2.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_compile.c -o 3.o
objects="$objects 3.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_compile_class.c -o 4.o
objects="$objects 4.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_config.c -o 5.o
objects="$objects 5.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_context.c -o 6.o
objects="$objects 6.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_convert.c -o 7.o
objects="$objects 7.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_dfa_match.c -o 8.o
objects="$objects 8.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_error.c -o 9.o
objects="$objects 9.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_extuni.c -o 10.o
objects="$objects 10.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_find_bracket.c -o 11.o
objects="$objects 11.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_jit_compile.c -o 12.o
objects="$objects 12.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_maketables.c -o 13.o
objects="$objects 13.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_match.c -o 14.o
objects="$objects 14.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_match_data.c -o 15.o
objects="$objects 15.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_newline.c -o 16.o
objects="$objects 16.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_ord2utf.c -o 17.o
objects="$objects 17.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_pattern_info.c -o 18.o
objects="$objects 18.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_script_run.c -o 19.o
objects="$objects 19.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_serialize.c -o 20.o
objects="$objects 20.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_string_utils.c -o 21.o
objects="$objects 21.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_study.c -o 22.o
objects="$objects 22.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_substitute.c -o 23.o
objects="$objects 23.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_substring.c -o 24.o
objects="$objects 24.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_tables.c -o 25.o
objects="$objects 25.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_ucd.c -o 26.o
objects="$objects 26.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_valid_utf.c -o 27.o
objects="$objects 27.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2_xclass.c -o 28.o
objects="$objects 28.o"
cc -Ipcre2/src -DHAVE_CONFIG_H -DPCRE2_STATIC -DPCRE2_CODE_UNIT_WIDTH=8 --no-native-functions -c pcre2/src/pcre2grep.c -o 29.o
objects="$objects 29.o"
cc --no-native-functions $objects -lm -o "$DESTDIR/bin/pcre2grep"
cp cli/LICENCE.md "$DESTDIR/share/licenses/pcre2grep/LICENCE.md"
