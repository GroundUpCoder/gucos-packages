# Vim

Source candidate retaining the historical Vim9.1 tree and full runtime. The
project overlay changes only the system vimrc path to a package-owned file;
the executable is installed as bin/vim, outside reserved core directories.
Package defaults enable filetype detection and syntax; users retain their own
vimrc. Source-build Ex editing fixtures are retained. Interactive editing,
syntax colors, resize, splits, save, terminal restoration and reload remain
required acceptance gates. No new execution or publication is claimed here.

The staged runtime omits two obsolete Windows 95/98/NT locale alias files,
`lang/menu_chinese(gb)_gb.936.vim` and
`lang/menu_chinese(taiwan)_taiwan.950.vim`, because parentheses are outside
accepted gucman output paths. Their source bytes remain in the source archive;
the referenced `menu_chinese_gb.936.vim` and
`menu_chinese_taiwan.950.vim` translations remain installed. The first source
attempt was rejected before compilation, and is retained as attempt1 evidence.
