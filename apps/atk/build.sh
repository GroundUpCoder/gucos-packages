#!/bin/sh
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/objects" "$stage/include/atk-1.0/atk" "$stage/pkgconfig"
objects=
for source in atk/atkaction.c atk/atkcomponent.c atk/atkdocument.c atk/atkeditabletext.c atk/atkgobjectaccessible.c atk/atkhyperlink.c atk/atkhyperlinkimpl.c atk/atkhypertext.c atk/atkimage.c atk/atknoopobject.c atk/atknoopobjectfactory.c atk/atkobject.c atk/atkobjectfactory.c atk/atkplug.c atk/atkprivate.c atk/atkrange.c atk/atkregistry.c atk/atkrelation.c atk/atkrelationset.c atk/atkselection.c atk/atksocket.c atk/atkstate.c atk/atkstateset.c atk/atkstreamablecontent.c atk/atktable.c atk/atktablecell.c atk/atktext.c atk/atkutil.c atk/atkmisc.c atk/atkvalue.c atk/atkversion.c atk/atkwindow.c atk/atk-enum-types.c atk/atkmarshal.c; do
 object="$stage/objects/${source##*/}.o"
 cc -DATK_COMPILATION -I. -Iatk -I/usr/local/include/glib-2.0 -I/usr/local/include -c "$source" -o "$object"
 objects="$objects $object"
done
ar rcs "$stage/libatk-1.0.a" $objects
cc -shared $objects -lgobject-2.0 -lglib-2.0 -lintl -Wl,-soname,libatk-1.0.so -o "$stage/libatk-1.0.so"
cp atk/atkaction.h atk/atkcomponent.h atk/atkdocument.h atk/atkeditabletext.h atk/atkgobjectaccessible.h atk/atkhyperlink.h atk/atkhyperlinkimpl.h atk/atkhypertext.h atk/atkimage.h atk/atkmisc.h atk/atknoopobject.h atk/atknoopobjectfactory.h atk/atkobject.h atk/atkobjectfactory.h atk/atkplug.h atk/atkrange.h atk/atkregistry.h atk/atkrelation.h atk/atkrelationtype.h atk/atkrelationset.h atk/atkselection.h atk/atksocket.h atk/atkstate.h atk/atkstateset.h atk/atkstreamablecontent.h atk/atktable.h atk/atktablecell.h atk/atktext.h atk/atkutil.h atk/atkvalue.h atk/atkwindow.h atk/atk-autocleanups.h atk/atk.h atk/atkversion.h atk/atk-enum-types.h "$stage/include/atk-1.0/atk/"
cp port/*.pc "$stage/pkgconfig/"

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/atk"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp COPYING "$DESTDIR/share/licenses/atk/COPYING"
