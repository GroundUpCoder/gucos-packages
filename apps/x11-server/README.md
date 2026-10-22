# X.Org software server runtime package

Source snapshot imported byte-for-byte from wasm-posix-old apps/x11-server/source
at 0b9b3245f (verify exact tree provenance in the completion journal). X.Org Server
21.1.24 renders through pixman and presents one SDL VT. No GLX, DRI or MIT-SHM;
no GPU sharing with X clients. Fixed-size display and local Unix sockets.

The runtime recipe extracts the pinned archive and adapts its absolute build
paths inside the guest. No host compiler builds this package. Source licenses
are included and installed with the package. The old repository is preserved.

Run `gucman build groundupcoder:x11-server`, then
`Xvfb :1 -screen 0 640x480x24 -fp built-ins -noreset -ac`.
Acceptance status is recorded separately; this recipe is not yet validated.
