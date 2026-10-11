# oclock

Migrated source from historical `apps/x11-apps-more/source/oclock-1.0.6` at `0b9b3245fe11a3bc677d81113cba90cd0ae80446`.
Upstream X.Org oclock 1.0.6; COPYING is retained inside source.tar and installed.
The separate recipe/config inputs adapt the historical source for the current package layout.
Software X11/core-font profile using existing x11-widgets and its dependency closure.


Published after independent review of `bd69eea5c6776962c8d669dae034b1cd7d53b1e3`.
Fresh public installation, functional guest XTest checks and reload integrity
passed on runtime `61a87f8861fa6ddaa6052eb25408036a2bcb238ad4b8e48dd91303beb36714d0`.
Evidence: `docs/research/package-migration/batch-02` at repository root.
Supported scope is software X11/core fonts. Missing charset/fontset and optional
menu12/xlogo11 pixmap warnings remain; physical browser keyboard and OS clipboard
integration were not tested.
