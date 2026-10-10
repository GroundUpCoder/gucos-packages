#!/bin/sh
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/objects" "$stage/include/jpeg-turbo" "$stage/pkgconfig"
objects=
for source in src/jcapimin.c src/wrapper/jcapistd-8.c src/wrapper/jcapistd-12.c src/wrapper/jcapistd-16.c src/wrapper/jccoefct-8.c src/wrapper/jccoefct-12.c src/wrapper/jccolor-8.c src/wrapper/jccolor-12.c src/wrapper/jccolor-16.c src/wrapper/jcdctmgr-8.c src/wrapper/jcdctmgr-12.c src/wrapper/jcdiffct-8.c src/wrapper/jcdiffct-12.c src/wrapper/jcdiffct-16.c src/jchuff.c src/jcicc.c src/jcinit.c src/jclhuff.c src/wrapper/jclossls-8.c src/wrapper/jclossls-12.c src/wrapper/jclossls-16.c src/wrapper/jcmainct-8.c src/wrapper/jcmainct-12.c src/wrapper/jcmainct-16.c src/jcmarker.c src/jcmaster.c src/jcomapi.c src/jcparam.c src/jcphuff.c src/wrapper/jcprepct-8.c src/wrapper/jcprepct-12.c src/wrapper/jcprepct-16.c src/wrapper/jcsample-8.c src/wrapper/jcsample-12.c src/wrapper/jcsample-16.c src/jctrans.c src/jdapimin.c src/wrapper/jdapistd-8.c src/wrapper/jdapistd-12.c src/wrapper/jdapistd-16.c src/jdatadst.c src/jdatasrc.c src/wrapper/jdcoefct-8.c src/wrapper/jdcoefct-12.c src/wrapper/jdcolor-8.c src/wrapper/jdcolor-12.c src/wrapper/jdcolor-16.c src/wrapper/jddctmgr-8.c src/wrapper/jddctmgr-12.c src/wrapper/jddiffct-8.c src/wrapper/jddiffct-12.c src/wrapper/jddiffct-16.c src/jdhuff.c src/jdicc.c src/jdinput.c src/jdlhuff.c src/wrapper/jdlossls-8.c src/wrapper/jdlossls-12.c src/wrapper/jdlossls-16.c src/wrapper/jdmainct-8.c src/wrapper/jdmainct-12.c src/wrapper/jdmainct-16.c src/jdmarker.c src/jdmaster.c src/wrapper/jdmerge-8.c src/wrapper/jdmerge-12.c src/jdphuff.c src/wrapper/jdpostct-8.c src/wrapper/jdpostct-12.c src/wrapper/jdpostct-16.c src/wrapper/jdsample-8.c src/wrapper/jdsample-12.c src/wrapper/jdsample-16.c src/jdtrans.c src/jerror.c src/jfdctflt.c src/wrapper/jfdctfst-8.c src/wrapper/jfdctfst-12.c src/wrapper/jfdctint-8.c src/wrapper/jfdctint-12.c src/wrapper/jidctflt-8.c src/wrapper/jidctflt-12.c src/wrapper/jidctfst-8.c src/wrapper/jidctfst-12.c src/wrapper/jidctint-8.c src/wrapper/jidctint-12.c src/wrapper/jidctred-8.c src/wrapper/jidctred-12.c src/jmemmgr.c src/jmemnobs.c src/jpeg_nbits.c src/wrapper/jquant1-8.c src/wrapper/jquant1-12.c src/wrapper/jquant2-8.c src/wrapper/jquant2-12.c src/wrapper/jutils-8.c src/wrapper/jutils-12.c src/wrapper/jutils-16.c src/jaricom.c src/jcarith.c src/jdarith.c; do
 object="$stage/objects/${source##*/}.o"
 cc -I. -Isrc -c "$source" -o "$object"
 objects="$objects $object"
done
ar rcs "$stage/libjpeg-turbo.a" $objects
cc -shared $objects  -Wl,-soname,libjpeg-turbo.so -o "$stage/libjpeg-turbo.so"
cp src/jpeglib.h src/jerror.h src/jmorecfg.h jconfig.h "$stage/include/jpeg-turbo/"
cp port/*.pc "$stage/pkgconfig/"

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/libjpeg-turbo"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp "LICENSE.md" "$DESTDIR/share/licenses/libjpeg-turbo/LICENSE.md"
cp "README.ijg" "$DESTDIR/share/licenses/libjpeg-turbo/README.ijg"
