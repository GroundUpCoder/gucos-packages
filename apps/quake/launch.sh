#!/bin/sh
set -eu
base=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
data="$HOME/.local/share/quake"
mkdir -p "$data/id1"
# Defaults are copied once. Saved games, edits and deliberate deletions persist.
if [ ! -e "$data/.initialized" ]; then
 temporary=$(mktemp -d "$data/.extract.XXXXXX")
 trap 'rm -rf "$temporary"' EXIT
 tar -xzf "$base/share/quake/shareware-payload.tar.gz" -C "$temporary"
 mkdir -p "$data/original/ID1"
 for file in CWSDPMI.EXE GENVXD.DLL HELP.TXT ID1/PAK0.PAK LICINFO.TXT MGENVXD.VXD ORDER.TXT PDIPX.COM Q95.BAT QLAUNCH.EXE READV106.TXT QUAKE.EXE QUAKEUDP.DLL README.TXT SLICNSE.TXT TECHINFO.TXT; do
  if [ ! -e "$data/original/$file" ] && [ ! -L "$data/original/$file" ]; then
   cp "$temporary/$file" "$data/original/$file"
  fi
 done
 rm -rf "$temporary"
 trap - EXIT
 if [ ! -e "$data/id1/autoexec.cfg" ] && [ ! -L "$data/id1/autoexec.cfg" ]; then
  cp "$base/share/quake/id1/autoexec.cfg" "$data/id1/autoexec.cfg"
 fi
 if [ ! -e "$data/id1/pak0.pak" ] && [ ! -L "$data/id1/pak0.pak" ]; then
  ln -s "$data/original/ID1/PAK0.PAK" "$data/id1/pak0.pak"
 fi
 touch "$data/.initialized"
fi
exec "$base/libexec/quake" -basedir "$data" "$@"
