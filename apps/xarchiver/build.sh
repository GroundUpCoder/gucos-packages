#!/bin/sh
set -eu
tar -xf source.tar
# Exact historical preimage; apply the declared package-owned C overlay.
printf '%s  source/src/main.c\n' b595772db68dc7f4ea3edbb1c2fd941d641a154e8eb7cd877f79ef9d96bd9979 | sha256sum -c -
cp main-no-gnu-tar.c source/src/main.c
printf '%s  source/src/interface.c\n' 9f899a5cc3e3e7278e3851385fce5b772a75290bb3ed9a6123a86f0ad5f52941 | sha256sum -c -
cp interface-signal-abi.c source/src/interface.c
stage="$DESTDIR"
mkdir -p "$stage/bin" "$stage/libexec" "$stage/share/pixmaps/xarchiver" "$stage/share/doc/xarchiver" "$stage/share/applications" "$stage/share/licenses/xarchiver/xdgmime"
cp xarchiver.desktop "$stage/share/applications/"
cp LGPL-2.1.txt "$stage/share/licenses/xarchiver/"
cd source
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
cc -DHAVE_CONFIG_H -D__unix__ -Iport -Isrc -Isrc/xdgmime src/7zip.c src/add_dialog.c src/ar.c src/archive.c src/arj.c src/cpio.c src/date_utils.c src/exe.c src/extract_dialog.c src/gzip_et_al.c src/interface.c src/iso.c src/lha.c src/main.c src/mime.c src/new_dialog.c src/open-with-dlg.c src/pref_dialog.c src/rar.c src/rpm.c src/socket.c src/squashfs.c src/string_utils.c src/tar.c src/unar.c src/utf8-fnmatch.c src/window.c src/zip.c src/zpaq.c src/xdgmime/xdgmime.c src/xdgmime/xdgmimealias.c src/xdgmime/xdgmimecache.c src/xdgmime/xdgmimeglob.c src/xdgmime/xdgmimeicon.c src/xdgmime/xdgmimeint.c src/xdgmime/xdgmimemagic.c src/xdgmime/xdgmimeparent.c $(pkgconf --cflags --libs gtk+-3.0) -L/usr/local/lib/gtk3-x11 -lgmodule-2.0 -lintl -o "$stage/libexec/xarchiver"
cp pixmaps/*.png "$stage/share/pixmaps/xarchiver/"
cp icons/48x48/xarchiver.png "$stage/share/pixmaps/"
cp COPYING PORT.md "$stage/share/doc/xarchiver/"
cp COPYING "$stage/share/licenses/xarchiver/"
cp src/xdgmime/*.c src/xdgmime/*.h "$stage/share/licenses/xarchiver/xdgmime/"
printf '#!/bin/sh\nexec gtk3-x11-run /usr/local/libexec/xarchiver "$@"\n' > "$stage/bin/xarchiver"
chmod +x "$stage/bin/xarchiver"
