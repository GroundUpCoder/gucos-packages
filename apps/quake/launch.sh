#!/bin/sh
set -eu
base=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
data="$HOME/.local/share/quake"
mkdir -p "$data/id1"
# Defaults are copied once. Saved games, edits and deliberate deletions persist.
if [ ! -e "$data/.initialized" ]; then
 if [ ! -e "$data/id1/autoexec.cfg" ] && [ ! -L "$data/id1/autoexec.cfg" ]; then
  cp "$base/share/quake/id1/autoexec.cfg" "$data/id1/autoexec.cfg"
 fi
 if [ ! -e "$data/id1/pak0.pak" ] && [ ! -L "$data/id1/pak0.pak" ]; then
  ln -s "$base/share/quake/id1/pak0.pak" "$data/id1/pak0.pak"
 fi
 touch "$data/.initialized"
fi
exec "$base/libexec/quake" -basedir "$data" "$@"
