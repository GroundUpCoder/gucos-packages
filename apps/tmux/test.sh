#!/bin/sh
set -eu
"$DESTDIR/bin/tmux" -V
# Full IPC/PTY lifecycle acceptance runs separately against an explicit core identity.
