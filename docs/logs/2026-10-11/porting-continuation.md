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
