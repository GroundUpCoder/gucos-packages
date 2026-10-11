#!/bin/sh
set -eu
tar -xf source.tar
cp project.json source/gucos-project.json
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/vim/vim91" "$DESTDIR/share/licenses/vim"
cc --project source/gucos-project.json --rebuild -o "$DESTDIR/bin/vim"
cp -R source/runtime/. "$DESTDIR/share/vim/vim91/"
cp vimrc "$DESTDIR/share/vim/"
cp source/LICENSE "$DESTDIR/share/licenses/vim/LICENSE"
