#!/bin/sh
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/objects" "$stage/include/." "$stage/pkgconfig"
objects=
for source in jaricom.c jcapimin.c jcapistd.c jcarith.c jccoefct.c jccolor.c jcdctmgr.c jchuff.c jcinit.c jcmainct.c jcmarker.c jcmaster.c jcomapi.c jcparam.c jcprepct.c jcsample.c jctrans.c jdapimin.c jdapistd.c jdarith.c jdatadst.c jdatasrc.c jdcoefct.c jdcolor.c jddctmgr.c jdhuff.c jdinput.c jdmainct.c jdmarker.c jdmaster.c jdmerge.c jdpostct.c jdsample.c jdtrans.c jerror.c jfdctflt.c jfdctfst.c jfdctint.c jidctflt.c jidctfst.c jidctint.c jquant1.c jquant2.c jutils.c jmemmgr.c jmemnobs.c; do
 object="$stage/objects/${source##*/}.o"
 cc -DJPEG_NO_REQUIRE_SOURCES -I. -c "$source" -o "$object"
 objects="$objects $object"
done
ar rcs "$stage/libjpeg.a" $objects
cc -shared $objects  -Wl,-soname,libjpeg.so -o "$stage/libjpeg.so"
for header in jpeglib.h jerror.h jconfig.h jmorecfg.h; do
 sed '/^__require_source(/d' "$header" > "$stage/include/$header"
done
cp port/*.pc "$stage/pkgconfig/"

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/libjpeg"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp "LICENSE" "$DESTDIR/share/licenses/libjpeg/LICENSE"
