# Vim

Source candidate retaining the historical Vim9.1 tree and full runtime. The
project overlay changes only the system vimrc path to a package-owned file;
the executable is installed as bin/vim, outside reserved core directories.
Package defaults enable filetype detection and syntax; users retain their own
vimrc. Source-build Ex editing fixtures are retained. Interactive editing,
syntax colors, resize, splits, save, terminal restoration and reload remain
required acceptance gates. No new execution or publication is claimed here.
