# xterm 411

Guest-built xterm using core X fonts and bundled GNU termcap. Xft and ncurses
terminfo are disabled in this package profile. The preserved source archive and
separate configuration changes are identified by provenance.json and build.sh.

Run `xterm -fn fixed` on an existing DISPLAY, or install JWM and run `start-jwm`.
Acceptance verifies real browser keyboard input through the PTY into a spawned
guest shell. It does not claim exhaustive escape-sequence compatibility.
