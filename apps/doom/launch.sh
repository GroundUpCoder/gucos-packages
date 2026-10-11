#!/bin/sh
set -eu
base=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
mkdir -p "$HOME/.config/doom"
exec "$base/libexec/doom" -iwad "$base/share/games/doom/doom1.wad" -config "$HOME/.config/doom/default.cfg" -nosound "$@"
