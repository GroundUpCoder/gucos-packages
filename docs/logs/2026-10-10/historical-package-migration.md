# Historical package migration implementation

Owner: cc thread `01a12509-9373-77dd-b1be-e5935164809b`. Live thread metadata
verified executor `codex`, model `gpt-6-astra`. Initiating thread
`01a12401-30cf-7004-a932-af576a939e08`; independent reviewer
`01a123e0-2fb3-7521-9fa3-e936e0997405` also verified Codex/Astra, initially idle.
Starting package HEAD: `716bfe27a56357513abfc7213d542bda63129cd1`, clean.

Read the inventory README, all catalog rows, machine-readable inventory,
inventory journal, package README/publication instructions, current core
`docs/PLATFORM.md` and `tools/platform.json`. Only this package checkout is writable.
The historical checkout is read through immutable Git blobs at
`0b9b3245fe11a3bc677d81113cba90cd0ae80446`; core is read-only.

The queue is `docs/research/package-migration/queue.json`: all 110 canonical
historical rows retain their evidence and hashes, plus six separately accounted
noncatalog workloads/support profiles. Six core bootstrap entries are excluded
from duplicate packaging. Partial mappings and Lua's missing module profile stay
open. Source-only failed experiments are outside this queue.

Prepared initial source candidates for zlib, cJSON, xfontsel, xclipboard,
xcutsel and oclock. Xcutsel uses the upstream xclipboard source tree and has its
own executable/license output ownership. Historical source tarballs preserve
Git blob bytes; installation adapters/configuration remain separate. Candidate
recipes declare platform 1.0.0/runtime ABI 5 and exact requirements for every
dependency; static libraries additionally declare object ABI 3. No baseline
package manifest, catalog entry, artifact or provenance has been changed.

No new guest execution, browser job, build job, installation, binary publication
or compatibility approval has occurred. Browser hold remains active. Source
preparation is not migration completion. Static and shared consumer scripts
are prepared but have not executed. Core owner's first cc-meta send was refused
because the thread was running; no hold-release confirmation has been received.
Reviewer acknowledged upcoming serial review and the distinction between source
preparation and acceptance. Initiator received kickoff.

## Source review and second preparation increment

Independent reviewer examined exact `7e17011ebc024e40f0e543c3c8ec64fc3b4bd25f`,
confirmed all 156 source blobs and baseline19 preservation, and found cJSON's
historical automatic source hook incompatible with a library-only installation.
Corrected library compilation to define CJSON_NO_REQUIRE_SOURCES and strip the
hook from the installed header. This is a recipe correction, not executed proof.
Reviewer requires functional X/font/selection/clock checks and installed-library
consumers before acceptance. Source review does not approve publication.

Prepared xedit with four exact historical source overlays, Lisp modules, regex
test executable and fork-enabled recipe; also pkgconf 2.3.0, bzip2/bzip2recover
1.0.8 and Expat 2.7.1. Their guest test scripts preserve upstream bzip2 fixtures
and add package-specific consumers. These are all unexecuted candidates.
Added tools/check-migration.py for explicit candidate platform/dependency/output,
source blob/overlay and baseline preservation checks; it never rewrites provenance.
All eleven candidates pass these lightweight checks. No browser/build jobs ran.

## Reviewed source checkpoint and graphics foundations

Reviewer approved source-only scope at `7da0b4a334986858685f930ef50af2352d33b714`
with no further blocking findings, independently running the eleven-candidate
checker. Exact commit pushed to origin/main. This publishes source preparation,
not installable catalog entries or supported binaries. Two historical xedit
overlay whitespace lines were deliberately retained byte-for-byte.

Prepared six more candidates: pixman, libpng, FreeType, Fontconfig, x11-shared
and Cairo. The public Cairo uses the old GTK X11 130-unit Cairo source list and
three exact overlays, replacing the intended duplicate provider in the future
GTK closure. x11-shared prepares eight new DSOs from accepted static archives
without altering the baseline package. Fontconfig retains its two historical
font inputs and their licenses. All are unbuilt and unaccepted. The provider
design explicitly keeps the old GTK blocker open until complete closure tests.

## Browser hold released; first real source acceptance

Core owner explicitly lifted the hold in cc-meta response to operation
01a1250a-0f24-7937-a981-8b242f04d5bd: recording/deployment/live tests complete.
Platform 1.0.1 retains ABI 5/3. This author copied the read-only local distribution
into a packages-local private run, froze every served file hash, and observed
runtime 61a87f8861fa6ddaa6052eb25408036a2bcb238ad4b8e48dd91303beb36714d0
inside the browser. This establishes the private candidate identity, not by itself
live deployment identity; the reviewer corrected an imprecise coordination message
that called local build.json a live identity verification.

Bounded 600-second machine-job browser reservation actually built and tested
zlib, cJSON, pkgconf, bzip2, bzip2recover and Expat, then installed and exported
each with guest gucman pack. All passed on the frozen 1.0.1 candidate. Source
inputs came from reviewed commit 7da0b4a. Evidence currently under
`test-results/migration/first-61a87f88/`; durable evidence and artifact review
will follow binary installation/reload checks. This is new package acceptance,
not repetition of the completed baseline19 compatibility run. No binary/catalog
publication yet. X dependencies install is a separate bounded reservation.

Reviewer found Cairo/Fontconfig pthread feature omissions and unsupported Cairo
GObject feature advertisement at 5c8da3c. Corrected requirements and transformed
the effective Cairo feature header in build.sh while retaining exact overlay
input bytes. Re-review of frozen correction remains pending.

## First six binary candidates accepted privately

Fresh binary install, installed consumer execution/relinking and reload integrity
passed for zlib/cJSON/pkgconf/bzip2/bzip2recover/Expat. Exact output hashes and
frozen installed manifests are checked in guest. First reload attempt failed in
harness setup (lazy shell not initialized after navigation); retained failure
report/log, corrected with a real `true` guest command after reload, and the
separate `initialized` attempt passed. No core failure inferred.

Durable exact logs, reports, output checksum maps, runtime/config identities and
evidence hashes are under docs/research/package-migration/batch-01. Exported
source-built archives and receipts now exist under each candidate's binaries/;
they are not yet publicly pushed or in the catalog. The publisher tool pins only
explicit new names and refuses baseline19 mutations. Final independent review
must precede supported publication. X client source acceptance now runs in a
separate 600-second browser reservation after releasing the foundation slot.

## First reviewed publication and X source correction

Independent reviewer approved exact ebb4a05d834eb6c7fe4bfe7f3ecb6ffe32d745fd
for the six foundations, checking all 25 payload files, immutable manifests,
receipts, evidence hashes and baseline19 preservation. Pushed that exact commit;
public catalog is now 25 entries. Public live verification is a distinct ongoing
run; publication approval does not imply it passed.

Four X candidates built and installed, but the grouped source stage failed on
xedit math.c: missing `finite` declarations. The old recipe supplied
-Dfinite=isfinite globally; the new adapter accidentally omitted it. Corrected
that recipe flag. This is a migration omission, not a demonstrated core defect.
Failed group log is retained. The retry uses a copy of this task's private test
profile at the same local origin, with a separately frozen new candidate site;
no user/historical browser profile is read or changed. Completed dependencies
and existing output metadata remain available without rebuilding baseline19.

## Public-live batch 01 passed

Fresh actual https://os.groundupcoder.net browser boot observed runtime61a87f88;
installed all six from immutable public ebb4a05 catalog and unmodified final
public manifests. All25 payload SHA256s and installed manifest contents matched.
Reopened browser ran committed consumers against installed files, including
static/shared library relinking and bzip2 fixtures. Separate reload stage
rechecked all25 payloads and exact manifests. All three stages passed; durable
evidence under batch-01/public-live. Remote main was verified at approved ebb4a05.
No baseline binary was rebuilt or retagged. This completes only these six items.

## Consumer provenance strengthening and additional foundations

Reviewer approved public-live documentation at24a0a72 with a wording correction:
parsed manifest contents matched; byte-for-byte JSON serialization was not checked.
Reviewer independently matched retained consumer inputs to public hashes, but
requested runtime input verification for subsequent URL-session consumer runs.
Added frozen path/hash/size tuple equality and individual input byte/hash checks.
The first verification retry found a harness working-directory collision in the
bzip2recover fixture (`recovery` already existed); no package bytes changed.
Kept that failure and made consumer work directories attempt-specific. The
separate verified-fresh six-package consumer retry passed, recording every input
hash in its report. Prior reviewed evidence hash map is preserved; retry map is
separate. This closes the consumer runtime-verification gap.

Prepared libiconv1.18, PCRE2-8 10.46, libffi3.4.8 scalar continuation-ABI profile
and libintl0.23.1 candidates with preserved historical source/port consumers.
They are not yet built or accepted. Explicit libintl pthread requirement retained.
Also found pixman-config.h enables HAVE_PTHREADS and added its feature declaration
before any graphics build. These source additions await independent review.
Xedit corrected source build passed; all five X client artifacts exported. Fresh
binary installation is now running before functional X acceptance.

## Five missing X clients: private binary/function/reload acceptance

Corrected source stage passed for all five: four previously built same-input
clients retained; xedit freshly rebuilt with the omitted historical finite macro.
Fresh profile installed the exact exported binaries and unchanged public X11
bootstrap dependencies. Functional guest XTest controller mapped/rendered all
five, saved xedit text, ran Lisp and regex checks, retrieved/load-tested the font
selector's chosen pattern, transferred xcutsel selections in both directions,
retained clipboard text through xclipboard, and observed oclock drawing update.
First GUI attempt failed because the controller assumed child enumeration order
matched visual button order. Position-sorted clicking passed; both logs retained.

Core-font software-X11 profile only. Missing charset/fontset and menu12/xlogo11
optional pixmap warnings were observed; do not claim full international font or
icon coverage. No physical browser keyboard or OS clipboard integration test.
Separate reload checked all declared package output hashes and parsed manifest
contents. Exact source/binary/GUI/reload evidence and failures are retained under
batch-02. Exported artifacts are package-local pending independent review and
publication; no claim of live/public acceptance yet.

## Dependency queue continues

Independent reviewer approved bd69eea for the five X clients, verifying all38
output payloads/modes and immutable references, retained source/GUI failures and
exact evidence bytes. Public-live verification is a separate pending step.

libiconv, PCRE2-8, libffi scalar ABI and libintl passed real guest source build,
static/shared retained port tests, installation and export on61a87f88 in a bounded
600-second reservation. Binary installation/reload/publication remain pending.
Added historical GObject wide signal/closure tests before its first execution,
as reviewer requested; its compilation still uses bundled private GLib headers.

Prepared GIO list-model, GIO core, ATK and FriBidi source candidates. GIO carries
its upstream GLib COPYING as an explicit pinned input; no full networking claim
is made merely because interfaces compile. GIO core's old GLib source-header
path becomes the published GLib private-header directory; actual guest validation
is still required. These four candidates await source review and execution.

## Five X clients publicly accepted

Pushed independently approved bd69eea. Fresh live-site profile installed all five
from immutable public references. Guest functional XTest checks passed, including
xedit save/Lisp/regex, font selection/load, both xcutsel directions, clipboard
retention and clock redraw. Reload verified all38 output hashes and parsed
manifest contents. Actual browser observed runtime61a87f88. Exact public logs,
reports and SHA-256 inventory retained under batch-02/public-live. Existing
baseline binaries unchanged. No claim of full international fonts, optional
pixmaps, physical keyboard or OS clipboard acceptance.

Reviewer cleared source010e993 for GIO/ATK/FriBidi, requiring stronger GIO IPC,
monitoring and module-loading consumers before publication. Added a graphics
consumer for installed font discovery, X extension versions and Cairo Xlib
FreeType pixel rendering; syntax only checked, execution pending.

## GLib foundation candidate acceptance

libiconv, PCRE2-8, libffi scalar ABI, libintl, GLib and GObject completed source
builds, fresh binary installation, installed static/shared consumers and reload
integrity on61a87f88. GObject includes retained wide generic-marshalling tests.
Evidence and exact exported binaries retained in batch-03 and apps respectively.
Independent artifact review and public-live acceptance remain pending.

Graphics first source run passed Pixman/libpng/FreeType, then rejected historical
Fontconfig etc/fonts output before execution. Adapted configuration install and
compiled search paths to share/fontconfig without changing archived sources.
Reviewer approved d85ee1d source/test changes; retry underway. This is a package
layout defect, not evidence of a core runtime defect.

Prepared IJG JPEG9f, libjpeg-turbo3.1.4.1 and GdkPixbuf source adapters. Turbo's
historical separate library/header names avoid replacing IJG files; SIMD remains
disabled. Static/shared retained codec consumers prepared, no guest execution.

## Retained HarfBuzz host preparation

Prepared an unpublished HarfBuzz14.5.0 candidate from pinned tracked sources and
retained original host-generated C. All40940 provenance-indexed generated files
and the original translation manifest matched their recorded hashes before
archiving. The40,942-file prepared archive also includes original provenance and
manifest, unchanged. No host translation rerun, guest C++ compiler or full
historical upstream-suite rerun is claimed. Fresh guest compilation of generated
C, retained shaping/subsetting/FreeType consumers and binary acceptance pending.

Corrected the first graphics ledger wording: the aborted first stage installed
Pixman/libpng/FreeType but did not export them. The resumed corrected profile
subsequently exported those same-input installed builds. Source logs and failures
are retained under batch-04. Graphics fresh binary installation has now passed;
installed consumers, functional rendering and reload remain pending.

## Six GLib foundation packages publicly accepted

Reviewer approved87ffa4f publication after checking all195 declared outputs and
immutable source/artifact references; pushed exact approved catalog commit. Fresh
public browser profile installed six immutable binaries, ran retained installed
static/shared consumers (including wide GObject marshalling), and preserved all
195 payload checksums plus parsed manifest contents after reload. Evidence under
batch-03/public-live. PCRE2 scope is8-bit; libffi scalar continuation ABI only;
libintl does not imply gettext CLI migration. Remaining canonical queue stays open.

Independent source review approved19502f9 Pango fixture fix and optional Cairo
GObject header/provider design. Actual execution and GTK full closure pending.

## Graphics foundation binary acceptance

Six exact guest-exported graphics archives installed in a fresh private profile.
Static/shared consumers, font discovery, X extension negotiation and Cairo Xlib
FreeType glyph rendering passed; reload verified all117 output files and
parsed manifests. Evidence/artifacts retained for independent publication review.
Single public Cairo provider is accepted within this foundation closure only;
full GTK/Scintilla composition and runtime acceptance remain pending.

## Graphics foundations publicly accepted

Pushed reviewer-approved85a890a. Fresh public install, retained installed
static/shared consumers, X extension/font discovery/Cairo FreeType rendering
and reload all117 combined payload hashes plus parsed manifests passed on61a.
Evidence under batch-04/public-live. Cairo/X11 foundation providers are accepted;
this does not establish full GTK/Scintilla composition or GUI support.

GIO list-model, ATK, FriBidi and GIO core source builds/tests/install/export passed.
Extended installed GIO checks also passed files/cancellation, Unix streams,
file-watch delivery, GModule load, local D-Bus naming, remote GApplication
activation and guc-session. Fresh binary acceptance underway; no general
networking/TLS or Unix-FD-passing claim.

## GIO/ATK/FriBidi candidate acceptance

Four exported guest binaries installed in a fresh private profile with published
GLib dependencies. Installed static/shared port consumers, GIO socket/file-watch/
module/retained file/local D-Bus/remote activation/session tests passed. Reload
checked all244 combined outputs and parsed manifests. Exact source and binary
evidence retained under batch-05, exported archives under apps. Independent
publication review and public-live acceptance pending. General network/TLS and
Unix-FD passing are not claimed.

## Resumed-profile dependency metadata rejection

Source run gtk-foundations-v5 built/tested/installed IJG JPEG and Turbo, then
GdkPixbuf dependency resolution rejected with `reinstall dependent with dependency
update: cairo`. The copied profile retained private source Cairo/dependency
metadata while its new catalog referenced published manifests. This is a test
profile transition requiring a consistent dependency graph, not evidence of a
core runtime defect. No validation is bypassed; retry will use a fresh profile
and current published closure. First stage aborted before exporting its successful
predecessors. Exact failure/config retained under batch-06.

## Ed and jq candidate acceptance

Both guest source builds and retained consumers passed, including the upstream
Ed suite/edit/red wrapper checks and jq JSON query plus named-capture regex.
Fresh private binary install, installed consumers and reload exact payload/parsed
manifest integrity passed. Evidence under batch-07 and exports under apps.
Source415b7ca independently reviewed; artifacts/publication/public-live pending.

## GIO/ATK/FriBidi publicly accepted

Pushed approved528ceb04 after reviewer separately cleared the intervening Ed/jq
source commit415b7ca. Fresh public profile installed all four immutable binaries,
passed installed static/shared and extended local-session consumers, then verified
all244 combined outputs/parsed manifests after reload on61a. Exact public evidence
under batch-05/public-live. This brings live-accepted additions to27 package
entries, not27 canonical historical names. Remaining queue is not complete.

## Funding-account transition and interrupted reservation

User authorized replacement of both coordinator01a12401-30cf-7004-a932-af576a939e08
and implementation owner01a12509-9373-77dd-b1be-e5935164809b. Sole successor
owner is01a12557-7667-7b91-b77f-df9b68cb3658; independent reviewer is
01a12556-d14c-71d3-b0d9-aa86966abbf7. Both use Codex/gpt-6-astra, funding gpt.
Successor verified cc-meta thread model/executor and actual PID95937 command
`codex exec ... -m gpt-6-astra`; lsof showed active databases and native session
01a12557-7f34-7ba3-acb9-ef15021add80 under /Users/jku/.codex-gpt.
Project settings report authIdentityCodex=gpt. cc-meta running-project list
contained only this successor; machine-job reported jobs:[]. No old threads
were messaged or awakened. Reviewer independently reported the same runtime
account home in its kickoff. This records account selection, not a billing invoice.

Interrupted reservation becd5dcc-15fa-4a5e-803f-6f875df1167f (wrapper PID95197)
is NOT acceptance. Its dependency stage failed when its browser closed at
2026-10-10T10:23:02.257Z; log ends during x11-server installation. No codec or
later GTK foundation build report/export exists from this reservation. Original
profile/logs remain intact; exact configuration, failed report and logs are copied
with hashes under docs/research/package-migration/account-transition.
A new serial reservation is completing the already-published Ed/jq public gates.
Recovered HEAD360e444 records27 live-accepted additions (split package entries,
not canonical rows); Ed/jq public acceptance and GTK closure remain pending.

## Ed and jq publicly accepted on gpt successor

Serial reservation0746803b-61bd-4c2e-bb83-3aa9df738767 passed fresh public
installation from reviewed catalogf12e232, installed Ed suite/edit/red wrapper
and jq query/named-regex consumers, and reload verification of all6 payload
hashes and parsed manifests on runtime61a87f88. Exact evidence is retained under
batch-07/public-live. Live-accepted additions now total29 package entries;
canonical migration completeness is still tracked separately in the queue.
The interrupted GTK profile is resuming with distinct gpt-resume report/log names
under reservationc47e3870-ab86-41ef-b0b9-dae8f09302d0; original evidence preserved.

## Interrupted-profile recovery remains blocked

The successor retry c47e3870 refused `unfinished publication; run gucman recover`.
Normal recovery in reservation4ccd1644 then refused `incomplete preparation;
inspect pending journal before recovery`. Both failure logs are preserved under
account-transition; no journal or package state was manually removed. This is
an interruption/recovery limitation, not successful GTK/codec acceptance.
New clean private run gtk-foundations-gpt-clean-61a87f88 freezes the same
528ceb04 inputs and61a runtime; reservationadc8ecb8 runs dependency installation
then codecs and small GTK foundations serially. Interrupted profile is preserved.

Prepared libevent2.1.12 and libuv1.51.0 adapters at ec043c5. All507 archived blobs
match pinned historical Git; static/shared timer/buffer and pipe/poll consumers
are prepared. No networking or full upstream-suite claim. Independent source
review and actual guest execution are pending.

## Reviewed successor candidates

Independent gpt reviewer cleared libevent source ec043c5 and libuv68d6ec8 after
removing obsolete extracted ptsname stub and adding both libc/libuv header orders.
It verified Ed/jq public evidence6d9e9d4 and approved stale-queue correction68d6ec8.
Reviewed/pushed chain preserves baseline19 and all existing catalog references.
Reviewer also cleared pigz/nyancat723edcc, SQLite/QuickJS1ab42b9 and PCRE2 CLIs
0153944 for source preparation. Each remains unpublished without guest acceptance.
Exact archives, recipe flags and scoped tests are in apps; queue retains per-item
review IDs. No original compatibility gates were repeated. No default threads
were awakened. GTK GUI harnessbbfe249 is prepared and pending source review/run.

The fresh GTK source stage has passed JPEG, Turbo and GdkPixbuf build/test/install
and export; MiniHB build/test/install also passed, its grouped export still pending.
These observations are not binary-install or public acceptance. The browser run
remains serial and bounded by the scheduler.

## Six GTK foundation candidates accepted

JPEG, Turbo, GdkPixbuf, MiniHB, Cairo GObject and GTK schemas passed fresh
exact-binary installation, installed consumers and reload integrity for all97
outputs plus parsed manifests on61a. Evidence batch-06/binary-install and
source-clean-gpt; exact exports retained under apps. Independent artifact and
publication review requested next. GTK schemas is data, not a compiled app.
Full HarfBuzz/Pango/GTK composition and GUI acceptance are still open.

## Successor CLI and event-library execution

Reservation781bfb5c completed fresh libevent/libuv binary installation, installed
static/shared consumers and reload integrity (batch-08/binary-install), then
source build/test/install/export for pigz/nyancat (batch-09) and SQLite/QuickJS
(batch-10). No public acceptance is claimed yet. QJS selected upstream suites
and SQLite retained database checks ran in the guest. Original archives retained.

Reviewer approved GTK GUI harness a1e91fb including partial-startup cleanup and
all public X/Cairo providers; execution remains pending. GNU m4's skip allowlist
was restored before source approval. Tcl d1b6e59 has174 historical compilation
units (163 Tcl/LibTomMath/Unix plus11 embedded zlib), not163 total; reviewer
verified844 outputs and static embed test. Tcl and m4 guest execution pending.
HarfBuzz retained generated-C source compilation now runs serially in bounded
reservation44a1daff; translation reproducibility limitation remains unchanged.

## Reviewed publications and remaining live gates

Independent reviewer approved six GTK-foundation artifactsfb93177 (97 outputs)
and final catalog7803895 (prior48 entries unchanged); exact commit was pushed.
Libevent/libuv artifacts46134c9 (54 outputs:31+23) and catalog0c83242 (prior54
entries unchanged) also passed independent review and were pushed. Public catalog
now has56 entries, but these8 additions are not yet public-live accepted.
Fresh public profiles and exact input checks are prepared; the serial HarfBuzz
source reservation precedes those browser runs. Recorded live additions remain29.

Added reviewed source candidates libxfce4util8e6a7a9 and xmag/bitmapb37e3d9.
The latter await GUI magnification/invert/save/keyboard checks. Added SDL3_gfx,
SDL3_image and SDL3_mixer candidates against core-owned SDL platform features;
source/media-harness review is pending. No republished core SDL shim or X/GPU
broker. The preparation helper4a4253c passed review and checks private/public
input identity; GTK closure freezer was exercised locally on Cairo GObject's
16-manifest/857-payload dependency closure, not as a new browser acceptance.

## HarfBuzz source acceptance and archive-size boundary

Reservation44a1daff passed full retained generated-C compilation, static/shared
shaping/subset/FreeType consumers, install52 outputs and export on61a. Raw guest
archive3dd540e8 is153147392 bytes; it remains intact under test-results and its
receipt plus52 payload hashes are durable under batch-11/source. No overlarge
blob was added to Git. The92,323,788-byte static archive and56,817,066-byte DSO
account for most of the size. Core guc-unpack reads uncompressed ustar directly;
gzip transport is not supported by this binary install path. A reviewed external
transport or component partition is needed before public publication. No core or
hosting edits are authorized or made. Fresh private binary acceptance is prepared;
Pango/GTK source work can proceed with the accepted private HarfBuzz installation.
The historical translator-adapter hash mismatch remains unchanged and explicit.

## Eight additional public-live acceptances

Reservation4e7afd06 completed public immutable install, installed consumers and
reload integrity on61a for six GTK foundations (97 outputs) and libevent/libuv
(54 outputs). Exact reports, logs, manifests and hashes are retained in batch-06
and batch-08/public-live. These eight entries advance recorded live additions
from29 to37; they are split package entries, not canonical historical row counts.
Full GTK GUI remains open. Baseline19 artifacts and references remain unchanged.
SDL text sourcee6df784 and xmore harnessfdcc11c passed independent gpt review;
their execution gates remain pending.

## Four CLI binary acceptances

Reservation89da365e passed fresh binary installation, retained installed consumers
and reload integrity for pigz, nyancat, SQLite and QuickJS on61a. Batch-09 and
batch-10/binary-install retain exact reports, inputs and hashes. No public-live
claim yet. Pango then GTK source builds now run in the existing clean private
profile with accepted full HarfBuzz, bounded and serial.

## Four CLI publication and dependency profile reviews

Reviewer approved87329be four CLI artifacts,336f3fb manifests and dd6175b
catalog; exact publication pushed with60 entries. Public live gates remain
pending and live additions remain37. HarfBuzz partition5bdbba1 was source-approved:
static component executes original complete generated build; main relinks DSO
from its objects. All original52 payload paths remain, plus two license paths.
Split guest export sizes and source/binary/public gates remain pending.

Pango sourceabc8a5b passed review; it still needs final split-HarfBuzz closure
acceptance. Lua/LPeg dependency review found baseline Lua5.4 lacks dynamic-module
support. Corrected with reviewed0ccac81 historical Lua5.5 profile (32 units,
original LUA_USE_DLOPEN) in separate lua55 paths. Baseline Lua is untouched.
Ncurses fba7362 review cleared2928 outputs after removing historical generated
NOTICE; actual upstream COPYING remains. SDL source/harness reviews and2048
logic source are recorded in queue. All new execution claims remain pending.
