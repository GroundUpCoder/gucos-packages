# L3afpad GTK3 editor migration candidate

Exact historical vendor/l3afpad source is retained at the provenance revision.
The historical direct C build now uses accepted gtk3-x11/pkgconf/libintl and the
GTK X11 environment wrapper. No historical source bytes are changed. Stable
l3afpad command and desktop identifiers are retained. Only the six declared
outputs are installed; historical PORT.md is provenance, not current acceptance.

The staged test checks real option parsing/help. Publication additionally needs
fresh binary installation, actual JWM menu launch, typing/undo, save and reopen,
quit/relaunch, browser reload, independent review, and the same public gates.
This preparation establishes no successful build or interactive acceptance.
