# JWM 2.4.6

Real upstream JWM runs as a userland client of the software X server. It supplies
window decorations, a task list, two workspaces, a root menu and a clock. Core owns
only the X server's SDL VT; no kernel window-management policy is added.

```sh
gucman install groundupcoder:jwm
gucman install groundupcoder:xterm
gucman install groundupcoder:xcalc
gucman install groundupcoder:xclock
gucman install groundupcoder:xeyes
start-jwm
```

`start-jwm` starts an X server and JWM, and opens xterm when installed. With no
DISPLAY set it chooses an unused display without removing existing lock files.
Exit from JWM's menu ends that session and its launcher-owned processes. The OS
terminal VT remains available. Only installed optional clients appear in the
menu; use “Refresh applications” after adding one while JWM is running.

For manual control, start Xvfb, set DISPLAY, then run
`jwm -f /usr/local/share/jwm/wasm.jwmrc`. Run only one WM on a display. Manual
JWM exit leaves clients alive, while the session launcher cleans up its children.

Core X fonts, XShape, XPM/XBM icons and XRender are enabled. Xft, Pango, Xinerama,
Cairo, SVG, PNG/JPEG decoding and gettext are disabled. This is software X11,
not an accelerated desktop or a full Linux distribution.

The source archive preserves the historical port's files; provenance.json pins
its exact Git tree. Package-owned overlays add the conditional terminal menu and
session launcher. All compilation occurs in the guest. Final local acceptance passed decoration, browser drag, hidden-VT progress,
resize, minimize/restore, workspace switching, menu launches and clean WM exit.
The launcher also passed delayed-server readiness, occupied-display preservation,
child cleanup and bounded stalled-handshake tests. Publication receipts are in
[the expansion journal](../../docs/logs/2026-10-10/package-expansion.md).
