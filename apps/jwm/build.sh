#!/bin/sh
set -eu
tar -xf source.tar
sed -e 's|/usr/src/jwm|.|g' -e 's|/tmp/jwm-build|./objects|g' source/install.sh > source/build-local.sh
(cd source; sh build-local.sh "$DESTDIR")
# No menu item for an absent optional terminal.
sed '/<Program label="Terminal">/d' source/wasm.jwmrc > "$DESTDIR/share/jwm/wasm.jwmrc"
cp "$DESTDIR/share/jwm/wasm.jwmrc" "$DESTDIR/share/jwm/system.jwmrc"
mkdir -p "$DESTDIR/share/licenses/jwm"
cp source/licenses/JWM "$DESTDIR/share/licenses/jwm/LICENSE"

cp app-menu.sh "$DESTDIR/share/jwm/app-menu.sh"
cp start-jwm "$DESTDIR/bin/start-jwm"
chmod +x "$DESTDIR/bin/start-jwm"
