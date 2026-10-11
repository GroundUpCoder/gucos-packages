#!/bin/sh
set -eu
tar -xf source.tar
cp project.json source/gucos-project.json
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/vim/vim91" "$DESTDIR/share/licenses/vim"
cc --project source/gucos-project.json --rebuild -o "$DESTDIR/bin/vim"
cp -R source/runtime/. "$DESTDIR/share/vim/vim91/"
# Obsolete Windows 95/98/NT locale aliases contain characters disallowed by
# gucman's portable output paths. Their referenced translation files remain.
rm "$DESTDIR/share/vim/vim91/lang/menu_chinese(gb)_gb.936.vim" \
   "$DESTDIR/share/vim/vim91/lang/menu_chinese(taiwan)_taiwan.950.vim"
cp vimrc "$DESTDIR/share/vim/"
cp source/LICENSE "$DESTDIR/share/licenses/vim/LICENSE"
