#!/bin/sh
set -eu
tar -xf source.tar
stage="$PWD/stage"
cd source
mkdir -p "$stage/objects" "$stage/include/pango-1.0/pango" "$stage/pkgconfig"
if ! cc port/preflight.c -I/usr/local/include/cairo -I/usr/local/include/freetype2 -I/usr/local/include/harfbuzz -lcairo -lharfbuzz -lharfbuzz-runtime -lpcre2-8 -lintl -liconv -lz -o "$stage/preflight"; then
 echo 'Pango dependency preflight failed; verify installed Cairo and HarfBuzz dependency closure' >&2
 exit 1
fi
rm "$stage/preflight"
objects=
for source in break.c ellipsize.c fonts.c glyphstring.c itemize.c modules.c pango-attributes.c pango-bidi-type.c pango-color.c pango-context.c pango-coverage-wasm-posix.c pango-emoji.c pango-engine.c pango-fontmap.c pango-fontset.c pango-fontset-simple.c pango-glyph-item.c pango-gravity.c pango-item.c pango-language.c pango-layout.c pango-markup.c pango-matrix.c pango-renderer.c pango-script.c pango-tabs.c pango-utils.c reorder-items.c shape.c serializer.c json/gtkjsonparser.c json/gtkjsonprinter.c pango-enum-types.c; do
 object="$stage/objects/${source##*/}.o"
 cc -DPANGO_COMPILATION -DG_LOG_USE_STRUCTURED=1 -DG_LOG_DOMAIN=\"Pango\" -I. -Ipango -I/usr/local/include/pango-1.0 -I/usr/local/include/glib-2.0 -I/usr/local/include/harfbuzz -I/usr/local/include/fribidi -I/usr/local/include/freetype2 -I/usr/local/include/cairo -I/usr/local/include -c pango/$source -o "$object"
 objects="$objects $object"
done
ar rcs "$stage/libpango-1.0.a" $objects
cc -shared $objects -lgio-listmodel -lgobject-2.0 -lglib-2.0 -lharfbuzz -lharfbuzz-runtime -lpcre2-8 -lintl -liconv -lz -lfribidi -lfontconfig -lfreetype -lcairo -Wl,-soname,libpango-1.0.so -o "$stage/libpango-1.0.so"
objects=
for source in pangofc-font.c pangofc-fontmap.c pangofc-decoder.c pango-trace.c pangoft2-fontmap.c pangoft2-render.c pangoft2.c; do
 object="$stage/objects/${source##*/}.o"
 cc -DPANGO_COMPILATION -DG_LOG_USE_STRUCTURED=1 -DG_LOG_DOMAIN=\"Pango\" -I. -Ipango -I/usr/local/include/pango-1.0 -I/usr/local/include/glib-2.0 -I/usr/local/include/harfbuzz -I/usr/local/include/fribidi -I/usr/local/include/freetype2 -I/usr/local/include/cairo -I/usr/local/include -c pango/$source -o "$object"
 objects="$objects $object"
done
ar rcs "$stage/libpangoft2-1.0.a" $objects
cc -shared $objects -L"$stage" -lpango-1.0 -lgio-listmodel -lgobject-2.0 -lglib-2.0 -lharfbuzz -lharfbuzz-runtime -lpcre2-8 -lintl -liconv -lz -lfribidi -lfontconfig -lfreetype -lcairo -Wl,-soname,libpangoft2-1.0.so -o "$stage/libpangoft2-1.0.so"
objects=
for source in pangocairo-context.c pangocairo-font.c pangocairo-fontmap.c pangocairo-render.c pangocairo-fcfont.c pangocairo-fcfontmap.c; do
 object="$stage/objects/${source##*/}.o"
 cc -DPANGO_COMPILATION -DG_LOG_USE_STRUCTURED=1 -DG_LOG_DOMAIN=\"Pango\" -I. -Ipango -I/usr/local/include/pango-1.0 -I/usr/local/include/glib-2.0 -I/usr/local/include/harfbuzz -I/usr/local/include/fribidi -I/usr/local/include/freetype2 -I/usr/local/include/cairo -I/usr/local/include -c pango/$source -o "$object"
 objects="$objects $object"
done
ar rcs "$stage/libpangocairo-1.0.a" $objects
cc -shared $objects -L"$stage" -lpangoft2-1.0 -L"$stage" -lpango-1.0 -lgio-listmodel -lgobject-2.0 -lglib-2.0 -lharfbuzz -lharfbuzz-runtime -lpcre2-8 -lintl -liconv -lz -lfribidi -lfontconfig -lfreetype -lcairo -Wl,-soname,libpangocairo-1.0.so -o "$stage/libpangocairo-1.0.so"
cp pango/pango.h pango/pango-attributes.h pango/pango-bidi-type.h pango/pango-break.h pango/pango-color.h pango/pango-context.h pango/pango-coverage.h pango/pango-direction.h pango/pango-engine.h pango/pango-font.h pango/pango-fontmap.h pango/pango-fontset.h pango/pango-fontset-simple.h pango/pango-glyph.h pango/pango-glyph-item.h pango/pango-gravity.h pango/pango-item.h pango/pango-language.h pango/pango-layout.h pango/pango-matrix.h pango/pango-markup.h pango/pango-modules.h pango/pango-renderer.h pango/pango-script.h pango/pango-tabs.h pango/pango-types.h pango/pango-utils.h pango/pango-version-macros.h pango/pango-enum-types.h pango/pango-features.h pango/pangofc-font.h pango/pangofc-fontmap.h pango/pangofc-decoder.h pango/pangoft2.h pango/pangocairo.h "$stage/include/pango-1.0/pango/"
cp port/*.pc "$stage/pkgconfig/"

mkdir -p "$DESTDIR/lib/pkgconfig" "$DESTDIR/include" "$DESTDIR/share/licenses/pango"
cp "$stage/"*.a "$stage/"*.so "$DESTDIR/lib/"
cp -R "$stage/include/." "$DESTDIR/include/"
cp "$stage/pkgconfig/"*.pc "$DESTDIR/lib/pkgconfig/"
cp "COPYING" "$DESTDIR/share/licenses/pango/COPYING"
cp "port/fonts/Noto-CJK.txt" "$DESTDIR/share/licenses/pango/Noto-CJK.txt"
