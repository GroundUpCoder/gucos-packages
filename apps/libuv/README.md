# libuv

Unpublished source candidate from pinned historical Git blobs; see provenance.json.
Upstream: https://libuv.org/; retained LICENSE is installed with the package.

Tests prepare static/shared consumers for fork-capable linkage, timer lifecycle and pipe polling.
The port includes interfaces outside the platform network profile; TCP/UDP/DNS
are not supported by this migration. Full upstream conformance is not claimed.
Guest build, binary installation, installed-consumer and reload acceptance pending.

The build adapter removes the obsolete private ptsname stub from the extracted
platform header, so core libc owns that symbol. The immutable archive is unchanged.
Installed header tests compile stdlib.h and uv.h in both include orders.
