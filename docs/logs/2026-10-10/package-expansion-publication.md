# Package expansion publication

Independent external reviewer 01a123e0-2fb3-7521-9fa3-e936e0997405 (Codex,
gpt-6-astra metadata verified) approved exact package tip
fab65cba24c8c6dd59e11a63e096138e13835c42 against public base
8dc5a1d65ec6a30e6f5e64839b53f52b54bbb889. No remaining blockers found.
The reviewer independently checked all 19 catalog packages, 17 expansion binary
manifests and receipt/source/runtime/inventory/mode/license bindings, immutable
ancestor references, and exact evidence hashes/job IDs. Browser runs were
executed by the author and audited by the reviewer, not independently rerun.

The author pushed that exact approved tip to public main successfully. Inputs
and archives are pinned to 6d7a417; manifests to ed61c5f. No core or hosting
publication occurred in this package-only task. The publication gate requires
subsequent anonymous live-core binary/source, graphical and persistence checks;
those results will be appended here after execution.

Anonymous HTTP verification after push fetched main/catalog.json and matched its
local reviewed bytes (SHA256
8d7c4cbf0b2110f66aadabf766f0aad93563d090adb46861d31b3869bbba25fd).
Remote main was separately observed at fab65cba24c8c6dd59e11a63e096138e13835c42.
The public X11 server binary returned HTTP 200, the declared 25,956,864-byte
length and Access-Control-Allow-Origin: *. This HTTP inspection alone is not
browser install acceptance; the following browser jobs exercise installation.

Live fresh profile expansion-public-v1, unmodified production runtime 2a9cca…:
job dbb7dbec-d843-4c5e-9a64-2ec8b062ce33 passed public search and binary
installation of JWM, xterm, xcalc, xclock, and their server/toolkit/widgets
dependencies (PUBLIC-BINARY-A-PASS). The initial install took longer than the
local fixture but completed within the 300-second browser reservation.

Job 4aee10d9-87f3-4f50-941a-a4697492868e reopened that live profile and passed
public binary installation of xeyes, xlogo, xlsfonts, xkill and xrefresh
(PUBLIC-BINARY-B-PASS). Existing installed dependencies survived browser close
and reopening between the two jobs.

Job 4c608dcc-7433-43ff-ae11-1cde5b2350b3 passed public binary installs of
xmessage, xprop, xev, Lua and Zstandard. Lua executed arithmetic and Zstandard
compressed/decompressed a file with byte comparison (PUBLIC-LUA-PASS and
PUBLIC-BINARY-C-PASS). Thus all 15 additions and their two existing X11
dependencies were installed from the actual public catalog on the live OS.

Job 04158405-14b0-496f-8363-9157635f2749 passed live JWM feature tests, delayed
server readiness, occupied-display preservation, cleanup, and stalled-handshake
bounding. It then reloaded the page, checked a persisted user file, compared all
17 installed manifests with their exact published manifests, and executed JWM,
Lua and Zstandard again (PUBLIC-RELOAD-PASS).

Job 82fc6701-136d-4ed0-86d3-071718864607 passed actual browser title-bar dragging,
JWM hidden-VT progress, all recorded X-client functional assertions and browser
keyboard input through xterm's PTY (XTERM-PTY-PASS). Expected X connection errors
occur when the test deliberately terminates its server. Known calculator icon
and charset fallback warnings remain; no full international font support is
claimed. All sessions used a disposable automation profile, not a user disk.

Job 33444492-3d29-4147-aa52-4372691bd91a used a second fresh live profile,
expansion-public-source-v1. It installed public X11 dependency binaries, fetched
JWM and Lua source inputs from their immutable public URLs, compiled both in the
guest, ran recipe tests, installed the results, executed JWM's version command
and Lua protected-error handling, and passed PUBLIC-SOURCE-PASS. No local fixture
provided package or core bytes in any public-mode job.

All six public jobs exited zero within their individual 300-second browser
reservations. Browser instances were sequential and closed between jobs. Public
log hashes and exact job IDs are in package-expansion-public-evidence.json.
The source/binary release remains the reviewed fab65cb catalog; the final commit
adds only evidence documentation and the explicit reload acceptance harness.
No core, hosting, historical repository or user browser disk was modified.
