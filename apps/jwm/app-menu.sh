#!/bin/sh
# JWM reads this at startup/restart; advertise only installed executables.
printf '%s\n' '<JWM>'
if command -v xterm >/dev/null 2>&1; then
 printf '%s\n' '<Program label="Terminal">xterm -fn fixed -title Terminal</Program>'
fi
if command -v xcalc >/dev/null 2>&1; then
 printf '%s\n' '<Program label="Calculator">xcalc -fn fixed</Program>'
fi
if command -v xedit >/dev/null 2>&1; then
 printf '%s\n' '<Program label="Text editor">xedit -xrm "*font: fixed"</Program>'
fi
if command -v xclock >/dev/null 2>&1; then
 printf '%s\n' '<Program label="Clock">xclock -update 1</Program>'
fi
if command -v xeyes >/dev/null 2>&1; then
 printf '%s\n' '<Program label="Eyes">xeyes</Program>'
fi
# Optional desktop clients. Arguments are fixed configuration, never filenames.
for entry in 'pcmanfm|File manager|pcmanfm' 'mtpaint|Paint|mtpaint' 'xmag|Magnifier|xmag' 'bitmap|Bitmap editor|bitmap' 'feh|Image viewer|feh /usr/local/share/feh/images' 'leafpad|Text editor (Leafpad)|leafpad' 'xarchiver|Archive manager|xarchiver'; do
 command_name=${entry%%|*}
 rest=${entry#*|}
 label=${rest%%|*}
 command_line=${rest#*|}
 if test -x "/usr/local/bin/$command_name" && command -v "$command_name" >/dev/null 2>&1; then
  printf '<Program label="%s">%s</Program>\n' "$label" "$command_line"
 fi
done
if command -v sgt-fifteen >/dev/null 2>&1; then
 printf '%s\n' '<Menu label="Puzzles">'
 while IFS='|' read -r game label; do
  if command -v "sgt-$game" >/dev/null 2>&1; then
   printf '<Program label="%s">sgt-%s</Program>\n' "$label" "$game"
  fi
 done <<'GAMES'
blackbox|Blackbox
bridges|Bridges
cube|Cube
dominosa|Dominosa
fifteen|Fifteen
filling|Filling
flip|Flip
flood|Flood
galaxies|Galaxies
guess|Guess
inertia|Inertia
keen|Keen
lightup|Lightup
loopy|Loopy
magnets|Magnets
map|Map
mines|Mines
mosaic|Mosaic
net|Net
netslide|Netslide
palisade|Palisade
pattern|Pattern
pearl|Pearl
pegs|Pegs
range|Range
rect|Rect
samegame|Samegame
signpost|Signpost
singles|Singles
sixteen|Sixteen
slant|Slant
solo|Solo
tents|Tents
towers|Towers
tracks|Tracks
twiddle|Twiddle
undead|Undead
unequal|Unequal
unruly|Unruly
untangle|Untangle
GAMES
 printf '%s\n' '</Menu>'
fi
if command -v desktop-menu >/dev/null 2>&1; then
 desktop-menu jwm-items
fi
printf '%s\n' '</JWM>'
