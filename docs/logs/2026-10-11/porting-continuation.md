# Package porting resumed in gucos

Source baseline f4e12e9; work continues on porting-continuation in the new
repository. Historical queue provenance remains intact.

## Snake production verification

Scheduled browser reservation d31cddf5-6bf4-456c-9609-4f7089e89466 passed fresh
public installation, physical keyboard gameplay, wall collision/restart, single-q
quit, Ctrl-C, cursor/alternate-screen and termios restoration, and reload payload
integrity on https://os.groundupcoder.com/. Runtime
19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441.
Unchanged Snake 1.0.0-1 archive d7b6a5804fdbd3bfa8cc6782e8204f44c187b8d9445eb4ffefd1aa9934a3ee20
is 39,936 bytes. Evidence: docs/research/snake/gucos-public.
Desktop menu integration is a separate pending acceptance scope.

## Independent continuation review

Reviewer publication_review approved source 6b394e6 (desktop launcher/JWM),
the explicit one-shot JWM upgrade plan in 35f4ac8, retained SDL addon artifact
publication, and MicroPython source correction 123f6d5. SDL evidence hashes,
source/receipt inventories and static/shared/media/reload checks were independently
verified; their build runtime remains 61a87f8861fa6ddaa6052eb25408036a2bcb238ad4b8e48dd91303beb36714d0.
These approvals do not substitute for the pending new public execution gates.

## Desktop execution before publication

Source reservation d0213f4a passed desktop-entries and JWM builds on runtime
19609; exact exports are in cc86e70. Fresh binary reservation b00b7b67 initially
failed an incorrectly modeled cross-catalog upgrade. Corrected stable-source
fixture 23645e8 passed the 2.4.6-1 to 2.4.6-2 transaction under reservation
3f6b3322. Its menu click launched Snake, but the observer assumed pure ANSI
colors instead of accepted xterm colors. Diagnostic screenshot confirmed the
board. Reviewer approved exact resource palette correction 1f83b76.

Reservation dab47d9c passed actual menu selection, board pixels (80 green,
11 red, 958 cyan), single-q close, surviving JWM and clean exit; exact installed
payloads and reload passed. ArrowUp was sent but directional motion was not
measured by this desktop test; that behavior is separately proven by the
production terminal Snake test. All failures and final passes are retained in
docs/research/snake/desktop-gucos-binary with byte-preserved evidence hashes.
Public acceptance remains pending.

## Snake desktop publication complete

Manifest c1ca6fe and catalog 10c3dbd were independently reviewed and published.
Production reservation b6051afb passed on os.groundupcoder.com/runtime19609:
old-to-new JWM, exact payload install, actual menu launch, board pixels, single-q
close, JWM survival and reload. All 71 packages / 406 active objects / 849,601,657
bytes passed anonymous HTTP hashes. Reviewer verified committed public evidence
3f285c2 and approved advancing the baseline to accepted catalog10c3dbd.
Snake terminal and desktop integration are complete. SDL, MicroPython and the
remaining historical queue retain their own separate acceptance gates.

## SDL addons accepted and MicroPython progressed

SDL manifest523d1fe/catalog37928af passed independent immutable review. Public
reservation4fb6e49b on19609 passed all three install/consumer/relink/reload gates,
256 exact image pixels and six browser PCM buffers with22,472 nonzero samples.
Evidence33535be was independently verified. Original61a build provenance remains
unchanged; accepted catalog now74 entries (53 historical additions, original19,
Snake and desktop-entries).

MicroPython source reservation157e3956 passed all26 retained fixtures and alias
on19609, archive7881dde0/1,475,584 bytes. Binary reservation487bb8a6 repeated
fixtures and verified all four outputs/reload. Reviewer approved artifacts and
final manifest02d2bfe/catalog4395482 for publication; public acceptance pending.


### Further source work and execution queue

MicroPython public acceptance completed in batch-16/gucos-public. Game Boy
catalog a69485f is published after independent artifact/manifests review; its
fresh public install/render/reload job is queued, so public acceptance remains
pending. Tcl/Tk source exports completed on runtime19609; the fresh binary,
consumer, GUI and reload job is queued. The prepared utility batch is currently
building ncurses after installing its explicit package dependencies.

Quake2ce3b66/a527d7a retains149 exact historical blobs and explicitly excludes
only the isolated proprietary PAK and inaccurate historical redistribution text.
Each exclusion pins its original Git blob. Independent review verified the
complete original shareware ZIP and all16 original payload files in a compressed
archive. Explicit launch extracts the complete payload into user state while
preserving existing files and links. The compiler's project reader ignores the
historical dataFiles metadata; this was independently checked in compiler-driver.
Corrected source execution is queued. Shooter testff8fb19 adds direct input-effect
assertions; it has not run and must not yet be cited as gameplay acceptance.

GNU Awk0607fac source preparation retains2,023 historical blobs, historical
configure options, generated-file ordering and strict upstream checks, with one
make worker. Independent review approves source execution. The Info manual embeds
its own GFDL license and invariant notices; COPYING applies to the GPL program.
No new Awk source/binary/public execution has completed yet.


The first fresh ncurses source run failed at its staged consumer compile after
both narrow/wide libraries and tools built. The test supplied only the nested
include directory, while generated headers also use ncurses/... includes.
8201e01 adds the staged root include path for both consumer compiles. Failure
logs are retained in ncurses/gucos-source-attempt1; a full corrected source run
remains required. No ncurses binary was published from this failure.


### Reviewed utility source exports

The runtime19609 source batch completed: m4, pcre2test, pcre2grep, libxfce4util,
bitmap, xmag and SDL3_ttf passed; ncurses failed as recorded above. Independent
review verified every receipt input and output inventory plus archive/evidence
hashes in c2effb2,2b62fbc,d3e7c47. Fresh combined binary installation, installed
consumers, bitmap/xmag GUI and reload are queued in utilities-gucos-binary.
The seven new artifacts remain outside the public catalog pending those gates.

m4 skips exactly the optional125–130 changeword and stackovf checks. PCRE test
scope is8-bit/no-JIT, with disabled16/32-bit/JIT/\C tests; grep script callouts
are unsupported and its miscellaneous-arguments section is explicitly unchecked.
Xfce static/shared config/resource and64KiB entry fixtures passed. Bitmap source
scope is converter roundtrip; xmag source scope is version execution. Their
reviewed f6a7fba GUI gate requires exact all-set8x8 saved bitmap and exact240x240
red magnification pixels, physical keyboard quit and terminal recovery.
SDL3_ttf source checks include static/shared consumers and six exact font pixel
hashes, file/memory cache/mutation checks and retained performance bounds.

Vim f25fa47 source preparation is independently reviewed, with2,231 exact blobs
and1,853 outputs including the full runtime. Interactive gate f47efa6 (diagnostics
extended4466d85) uses normal startup without VIMRUNTIME overrides, physical
editing and exact rendered token colors, split/resize/save and stty restoration.
Source and binary execution remain pending; prepare runs are frozen for Vim,
GNU Awk and the corrected ncurses source retry.


### Resumed execution after idle audit

Merged4ac38c8 without conflict, preserving live-accepted Snake1.0.0-2 and all76
catalog identities. The previously queued Game Boy public test had not started;
its resumed run now passes install, exact payload hashes, built-in ROM palette
and animation, process cleanup/terminal recovery and reload on runtime19609.
Evidence e543a15 is committed; final independent review is pending. Scope excludes
external ROMs, user controls, audio and CPU conformance.

Tcl/Tk's retained binary install and installed consumers passed. Its GUI observer
failed because it expected full-intensity green, but the retained named-green
fixture and Tk implementation produce128.6f95d09 corrects only that observer;
GUI retry and reload remain queued without repeating completed installation.
Seven utility packages are running fresh binary acceptance. Corrected ncurses,
Awk, Doom, Quake and Vim source runs are queued sequentially. All browser work
uses the single machine-job lane. No new package addition was published in this
resume step. Review completion and timed continuation wakeups are registered.


Final independent review through e543a15 approves Game Boy's limited public
acceptance and exact source/artifact identities. All14 evidence hashes match.
The ledger now records published-live-accepted for that explicit built-in-ROM
scope. All76 published catalog entries now have their required live gates;
no new catalog entries were added in this resume. Snake1.0.0-2 remains exact.
The same independent review approves the Tcl/Tk artifacts and green128 observer
correction, and the seven utility source exports, without granting their pending
binary/GUI/public acceptance. Tcl consumers retained15,185 passed,54 skipped,
zero failed; Tk static linking passed. Remaining gates continue as scheduled.


### Playable desktop priority and seven utility publications

User priority now places puzzles and menu-accessible games/apps first after
preserving already active/queued acceptance work. Puzzles19b50d8 has independent
source approval (319 exact historical files,40 games,132 outputs), and its source
build is queued. Six owned menu entries require real menu/input/save/relaunch
acceptance; no gameplay acceptance is inferred from CLI generation. A separate
desktop-apps candidatefe6cbb2 owns entries for2048,xcalc,xedit,xclock,xeyes and
pins the accepted applications plus JWM/xterm/desktop-entries. Its concrete
source review is pending. Existing application payloads remain untouched.

Independent review approves seven utility binary gates and immutable publication:
artifacts d3e7c47, manifests109d929, catalogd7e931c, private evidence11b568f.
All24 evidence hashes and71 output identities match;21 retained exports cover
install/consumers/reload. Bitmap invert/save yields exact8x8 all-set output;
xmag yields exactly57,600 red pixels spanning240x240 at6x, with actual q exits.
Source and binary exclusions remain those documented above. Catalog publication
adds seven entries (83 total) while preserving all76 prior entries; these seven
must not be marked live-accepted before fresh public gates.76 existing entries
retain completed live acceptance.

Tk's corrected-color retry exposed staleX1 files left by the first failed GUI
session.3ffe455 removes those files in the isolated fresh-boot test profile;
independent review approves the observer-only cleanup. Package bytes unchanged;
a successful GUI/reload retry is still required. Failed evidence is retained.


### Reconciled historical scope audit

Independent read-only audit closes JWM, X11-server and Zstd ledger rows against
exact already-accepted manifest/binary identities. This changes no published
package count. Twm remains a published source recipe with actual public guest
build/decoration/pointer/hidden-VT acceptance; it has no published binary, so
binary installation/reload remains open. Catalog acceptance counts include that
explicit source-recipe scope and do not mean every catalog entry has a binary.

Core ownership of the SDL shim and C toolchain only partially maps the historical
standalone SDL/SDK packages. Their packaging and exact tests remain open. Core
ash is not hush; custom core ar/nm/ranlib are not the GNU binutils workload;
translated libc++ support remains distinct. Accepted fontconfig already includes
Source Code Pro, removing that missing-font claim from x11-apps; libXft and the
Xft/ncurses xterm profile remain. gtk3-x11 does not satisfy SDL/Broadway profiles.

The exact historical Perl inventory was found in the retained approved archive
77b7ccfa8da364d994908da9fc9598ceef45ded3a2dda3f3a6566a02d3f2803c,
103,812,096 bytes. Its relative-files member lists1,934 paths, SHA256
a8dec66dbe65c47f4ae6eea29f7313cb184922d3fa3a537d7fcc6d9d4651a9ad.
It is an output reference for later source work, not current-platform acceptance.
Playable JWM work remains the new-package priority while current jobs finish.

## Reviewed source exports and JWM game acceptance preparation

Ncurses `1dee6db`, Awk/Doom `a41fc47`, and Quake `136d562` source
exports passed independent review on runtime `19609f47`. Their retained evidence
and exact archives are under each package's `gucos-source` directory and
`binaries/`. Ncurses has 2,928 outputs; Awk 5; Doom 7; Quake 11. Awk's
`make check` passed all enabled checks; unsupported configurations remain the
explicit skips recorded in its log. Doom/Quake staged launcher fixtures do not
establish gameplay. Fresh binary and public gates remain outstanding.

Vim's first run failed at output-path validation before compilation. Reviewed
correction `54c5e55` omits two obsolete Windows locale forwarding aliases with
parentheses, retaining their translation targets and all source bytes. Its
1,851-output retry is prepared; no successful build is claimed.

Puzzles source execution and the first Fifteen binary/JWM test are scheduled.
The reviewed helper handles the accepted JWM Puzzles submenu and services
observations inside the one foreground guest shell. Fifteen's harness uses
physical menu/key input, move/undo pixel comparison, GTK save/load, process
exit/relaunch and a separate persisted-browser reload. These are unexecuted
acceptance gates, not completed gameplay claims. Other puzzle games and the
2048/calculator/editor desktop batch still need their own interactive evidence.

The published count remains 83, with 76 live-accepted in their documented
scopes; seven newly published utilities await their public gates. Snake
1.0.0-2 is preserved. No core build or deployment was performed.

## Seven utility public acceptance and Tcl/Tk publication

Independent review approved `d7957b2`: all seven utility public gates passed,
including exact 71 outputs/21 install-consumer-reload exports, Bitmap invert/save
and Xmag 6x presentation. All 24 evidence hashes and public manifest bindings
were independently checked. The accepted count advances 76 to83; baseline is
now the exact accepted catalog `d7e931c`. This preserves Snake1.0.0-2.

Tcl/Tk private binary gates also passed independent review: Tcl15185 passed,
54 skipped,0failed; Tk pack/grid383 passed,5skipped,0failed with recorded
exclusions. Named green is128. The initial observer mismatch and subsequent
stale-display failure remain retained alongside the successful clean-display
run and binary reload; no package artifacts changed between these GUI attempts.
Final immutable manifests `95e9bbc` and catalog `b58c944` were independently
approved against artifacts `d4d446d`, preserving all prior83entries. Publication
adds Tcl/Tk for85 entries; those two still require fresh public gates.

## Desktop binary preparation and first actual GUI attempt

Desktop-apps export `a635e9b` passed independent source/artifact review: six
outputs,18432bytes,SHA828eca9f171fdf97393f3c99fc436993cbdbcfca1cdc05e556b4520b7ac4eaa3.
Its fresh binary fixture freezes12manifests/774payload hashes. Reviewed2048
JWM tests and the four X app driver establish no execution success yet.
The X app driver uses physical input, calculator result equivalence, pointer
tracking, clock updates, exact editor save/reopen and process lifecycle checks.

Puzzles fresh installation and installed consumers passed. Its first actual
Fifteen test failed before menu selection because a missing status file was
passed to TextDecoder as a plain array. Evidence `efcc1b2` retains this failure.
Independent review reproduced the bug and approved the typed-array correction
`fc56690`. The GUI-only typed-status retry preserves successful earlier stages;
its reports now also hash the guest control bridge (`8250cff`). No Fifteen
menu/gameplay pass is claimed at this point.

XMahjongg source candidate `d107353` passed independent review:159 historical
Git blobs and1064 exact recovered prepared members, with1060C artifacts and
separate constructor ordering verified. Its fresh source job is queued. L3afpad
source execution is active; no new editor execution outcome is claimed.

## L3afpad source result and further desktop gates

L3afpad completed its fresh source build on runtime `19609f47`, using frozen
inputs `a1c6a43`. Evidence/export `db80df4` retains the 310784-byte archive
`c2e645ab03588a01fed7999fc011b152b118c89bb0c7e597661c896883be5000`.
The source test checks staged option parsing; interactive editing and public
acceptance remain pending. The source result is under independent review.

Tcl/Tk public acceptance is now executing. The four reviewed X application
menu/input/relaunch gates, including Xedit persistence across browser sessions,
are queued after the existing desktop installation job. All browser jobs remain
serialized, with durable scheduler parents and foreground descendants.

Net has a separate physical tile rotation, undo, save/load and reload driver
(`f7fe776`), preserving the Fifteen interaction driver. Review requested binding
the prior reload report to the current binary and runtime; `21456b0` adds these
assertions to both puzzle drivers. No Net execution or gameplay pass is claimed.
Counts remain 85 published and 83 live-accepted within documented scopes.

## Public Tcl/Tk results and editor/game test review

Tcl/Tk public install, installed consumers, GUI and reload all passed; evidence
is retained at `a0583e0` under `tcl-tk/gucos-public`. Independent acceptance
review remains pending, so the accepted baseline remains 83 entries for now.
Desktop-apps fresh installation has completed and its queued interaction gates
continue. The reviewed Net normal/reload gate is now queued as well.

L3afpad source export `db80df4` passed independent review. Its editor test and
Xedit's test now compare raw saved bytes, including length, after review found
that text decoding could hide a UTF-8 BOM (`eee21a0`). These implementation gates
are approved for execution; no editor GUI pass is implied.

Mines gate review identified that undoing its first opening legitimately leaves
a start-cell marker. The corrected driver (`4c58d80`) tests flag/undo before
opening, then opening/save/relaunch/reload. It waits for settled expected board
pixels, moves the pointer outside the game, and uses attempt-specific save paths.
Independent review approved execution subject to screenshot/crop inspection.
