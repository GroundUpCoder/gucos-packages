# First playable desktop candidates

The first batch uses existing accepted JWM/X11/GTK packages: Simon Tatham
Puzzles and owned menu entries for 2048, xcalc, xedit, xclock and xeyes. The
Puzzles source export is reviewed, but no new interactive acceptance is inferred
from source generation tests. Each advertised application needs its actual menu,
input, quit/relaunch and applicable persistence evidence.

L3afpad already has a historical direct-C port in vendor/l3afpad. Its 139 source
blobs are now owned inputs, with the GTK3 X11 wrapper replacing the historical
surface setting. The upstream [L3afpad project](https://github.com/stevenhoneyman/l3afpad)
also identifies this as the GTK3 fork of Leafpad. The historical config disables
printing; that limitation is retained. Staged option parsing is only a build
check, not editor acceptance. The source recipe and separate GPL notice have
been independently reviewed; fresh source/GUI/public gates remain.

XMahjongg's [upstream release](https://www.lcdf.org/xmahjongg/xmahjongg-3.7.tar.gz)
is C++, despite its small X11 dependency surface. The downloaded 3.7 archive is
551834 bytes, SHA256
243d63681cc25b97b30fee76aac98f1923f4734e772c57335b911f4c8647ffcf.
The historical port compiles previously translated C, not upstream C++ in core.
An independent read-only audit recovered the exact historical source cache
archive: d490da1844d7a99f68833c2670e1dc209f720d02188ba3d322c0bb4295e5f8f0,
5693440 bytes, 1220 regular members. All 1219 declared source inputs match the
pinned historical source proof. The 1064 generated members comprise 1060 C
files plus manifest/provenance and two response files. Preserve the 1059 archive
objects and separate constructor 762.o ordering. No missing translated-source
blocker remains, but owned packaging, fresh ABI/build and gameplay gates remain.
Only the historical thick.gif/default-background/default-layout installation
scope is proposed, with GPL/Click/upstream tile attribution notices retained.
The historical README's earlier 1061-definition narrative is not the recovered
1060-artifact input count. Host translation reproducibility is not established
by this recovery; exact generated inputs are available.

For a subsequent GTK calculator, [galculator's configure source](https://github.com/galculator/galculator/blob/master/configure.ac)
uses GTK3 by default, with optional quadmath plus lex/gettext/intltool build
requirements. This is a feasibility lead, not a prepared or accepted port.
The accepted xcalc menu integration remains first. Fantasy-console work remains
a subsequent feasibility task after the first playable batch.
