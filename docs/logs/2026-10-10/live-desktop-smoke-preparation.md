# Post-activation package desktop smoke preparation

User is running platform-1-0-c4411d72 against the immutable c4411d72 distribution
and explicitly requested no duplicate candidate run or smoke against old live
production. This preparation adds only new package-repository files; the running
full acceptance driver and its helpers are unmodified. Published apps, manifests,
archives and catalog are unchanged. No platform metadata is published.

The new tools/accept-live-desktop.mjs command uses six independently bounded
300-second browser stages and a separate fresh profile. It reuses the existing
pinned-catalog probe and binary-install primitives. A new desktop test runs JWM
and xterm on the same X server, verifies the WM property and reparented terminal,
sends actual browser keyboard input through the PTY, then checks persistence and
original artifact hashes after reopening and reloading. Only a test controller
is compiled; no package rebuild or fallback is requested.

Node syntax checks and CLI help passed. No browser was launched for this new
smoke, and no candidate acceptance result is claimed here. Execution is held for
after activation. The command and exact supplied runtime are documented in
docs/live-desktop-smoke.md.
