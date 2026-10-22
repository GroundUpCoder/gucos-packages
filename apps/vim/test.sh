#!/bin/sh
set -eu
export VIMRUNTIME="$DESTDIR/share/vim/vim91"
vim() { "$DESTDIR/bin/vim" "$@"; }
printf 'alpha\nbeta\n' > /tmp/edit.txt
cat > /tmp/edit.vim <<'EOF'
set nomore
%s/alpha/ALPHA/
call append('$', 'gamma')
wq
EOF
vim -Nu NONE -n -es -S /tmp/edit.vim /tmp/edit.txt
printf 'ALPHA\nbeta\ngamma\n' > /tmp/expected
cmp /tmp/expected /tmp/edit.txt

echo VIM-ACCEPTANCE-PASS
test -s "$VIMRUNTIME/defaults.vim"
test -s "$VIMRUNTIME/syntax/c.vim"
