#!/bin/sh
set -eu
base=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
data="$HOME/.local/share/quake"
mkdir -p "$data/id1"
# Defaults are copied once. Saved games, edits and deliberate deletions persist.
if [ ! -e "$data/.initialized" ]; then
 cp "$base/share/quake/id1/autoexec.cfg" "$data/id1/autoexec.cfg"
 ln -s "$base/share/quake/id1/pak0.pak" "$data/id1/pak0.pak"
 touch "$data/.initialized"
fi
exec "$base/libexec/quake" -basedir "$data" "$@"
