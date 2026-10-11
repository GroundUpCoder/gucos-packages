#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
src="$PWD/source"
up=$src/feh-3.13.1
build="$PWD/build"
mkdir -p "$build" "$stage/bin" "$stage/libexec" "$stage/share/feh/fonts" "$stage/share/feh/images" "$stage/share/doc/feh" "$stage/share/applications"
objects=
for file in events feh_png filelist gib_hash gib_imlib gib_list gib_style imlib index keyevents list main md5 menu multiwindow options signals slideshow thumbnail timers utils wallpaper winwidget strverscmp; do
 input="$up/src/$file.c"
 if test "$file" = filelist -o "$file" = imlib -o "$file" = main; then input="$src/overlays/$file.c"; fi
 cc -O2 -I/usr/local/include -I"$src/generated" -I"$up/src" '-DPREFIX="/usr/local"' '-DPACKAGE="feh"' '-DVERSION="3.13.1"' -DINCLUDE_HELP -DHOST_NAME_MAX=256 -c "$input" -o "$build/$file.o"
 objects="$objects $build/$file.o"
done
cc $objects -L/usr/local/lib -lImlib2 -lX11 -lpng16 -lm -o "$stage/libexec/feh"
printf '#!/bin/sh\nexec gtk3-x11-run /usr/local/libexec/feh --conversion-timeout -1 "$@"\n' > "$stage/bin/feh"
chmod +x "$stage/bin/feh"
cp "$up/share/fonts/"*.ttf "$up/share/fonts/OFL.txt" "$up/share/fonts/README.md" "$stage/share/feh/fonts/"
cp "$up/share/images/"* "$stage/share/feh/images/"
cp "$up/COPYING" "$up/README.md" "$stage/share/doc/feh/"
cp feh.desktop "$stage/share/applications/"
mkdir -p "$stage/share/licenses/feh"
cp "$up/COPYING" "$up/share/fonts/OFL.txt" "$stage/share/licenses/feh/"
