# xedit

X.Org xedit 1.2.5, software X11/core-font profile.
Includes Lisp modules and separate Lisp/regex test executables. Historical source
and four explicit port overlays retain their pinned Git provenance. The build
adapter derives the source groups from upstream Makefile.am, with fork enabled
as in the historical profile. 

Published after independent review of `bd69eea5c6776962c8d669dae034b1cd7d53b1e3`.
Fresh public installation, functional guest XTest checks and reload integrity
passed on runtime `61a87f8861fa6ddaa6052eb25408036a2bcb238ad4b8e48dd91303beb36714d0`.
Evidence: `docs/research/package-migration/batch-02` at repository root.
Supported scope is software X11/core fonts. Missing charset/fontset and optional
menu12/xlogo11 pixmap warnings remain; physical browser keyboard and OS clipboard
integration were not tested.
