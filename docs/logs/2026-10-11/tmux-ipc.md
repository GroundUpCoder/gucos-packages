# tmux additive IPC port

Author: external cc thread 01a129b8-ba13-7d36-b0bb-066591a700b1.
Thread metadata verified executor `codex`, model `gpt-6-astra` via cc-meta thread.
No internal subagents used. Work executes over SSH agentone.

Package base: git archive of gucos-packages b4507a9d9622dad0f48c13cae30fc8a6b5d539a8,
staged into /home/ubuntu/git/gucos-packages-ipc on branch port/tmux-additive-ipc.
This is a standalone snapshot repository, not a linked worktree. No core tree,
worker tree, published manifest or catalog edits are authorized or performed.

Ncurses source/recipe/test inputs copied from the existing port worker commit
1dee6db0aa135c81ef3d62136b5a6e1d2734c2f8, apps/ncurses only. Base already has
its wide/narrow build recipe; consumer include-path fixes differ in test.sh.
Historical libevent 2.1.12 inputs and previous migration evidence remain in base.
Their historical runtime is not acceptance of the new candidate.

Tmux source: official 3.5a release URL and hash in apps/tmux/provenance.json.
Generated cmd-parse.c is retained; recipe avoids regeneration with YACC=true
and touches the supplied parser. This choice remains subject to guest build.
Default unknown-platform upstream osdep is appropriate for an explicit
wasm32-unknown-none configure target; no Linux /proc-specific port is forced.

Parent explicitly supplied the following compilation-only snapshot:
/home/ubuntu/git/gucos-core-snapshots/ipc-bootstrap-19609f47
Expected runtime: 19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441.
It remains version 1.0.1 and is NOT the integrated IPC acceptance candidate.
Every browser run validates this identity before guest commands. Input files
are frozen with SHA-256 in test-results/tmux-ipc/bootstrap-01/dist-files.json.

Pending: guest dependency/tmux compilation; integrated IPC distribution;
interactive attach/detach, panes, terminal input and resize, continued shells,
and reconnect. A version-only test is not lifecycle acceptance.
All builds/tests use /home/ubuntu/.local/bin/machine-job on agentone.
No local tests, deployment, publication, or acceptance claim.

## First execution attempt

Remote browser reservation c034b554-2740-4f34-a3b3-351d0cfa36fc failed before
boot: Chromium 1243 could not load libatk-1.0.so.0. `ldd` also reported missing
AT-SPI, cups, ALSA, GBM, Cairo/Pango and X extension libraries. No guest command
or compilation executed. Playwright 1.63.0 was installed from package.json.
Repair uses remote machine-job build reservation with
`npx playwright install-deps chromium`; full output is retained under the run.
Prepared lifecycle-candidate.mjs is unexecuted and requires an explicit
TMUX_INTEGRATED_IPC=1 flag in addition to the frozen runtime identity.

## Verified progress

Chromium dependencies installed successfully. Retry browser job
c561e8af-f292-4282-a53c-6d84caeb96ff booted the explicitly expected runtime.
Libevent built from source; static and shared consumers both printed
LIBEVENT-PASS. Retained stdout prefix and runtime/input manifests are in
`docs/research/tmux-ipc/bootstrap-compilation/`. Ncurses is still building;
no ncurses or tmux success is claimed at this checkpoint.

Remote scheduler syntax check 459c7bf8-bddb-425e-b5b0-c2657afc3c64 passed
node --check for both one-off probes and sh -n for tmux build/test scripts.
The first live build runner is the version from commit 3948fa5. Later diagnostic
capture additions do not retroactively change that running script.

## Deadline and retained artifacts checkpoint, 07:13 UTC

Existing browser job c561e8af-f292-4282-a53c-6d84caeb96ff remains active.
Its process started at 06:57:51 UTC with --timeout 3600; approximately 45 minutes
remained at this observation. Narrow ncurses was compiling base/lib_slk.c;
wide configure/build and tmux remained. No failure was observed. Completion
inside the remaining deadline is not yet established.

The original persistent profile at test-results/tmux-ipc/bootstrap-01/profile
is retained in place. Do not copy it live or launch a concurrent profile owner.
Prepared export-dependencies.mjs to export declared installed outputs to hashed
tar archives after the existing job releases the browser lane. It has NOT run
or been syntax checked yet. Receipts preserve original source runtime and exact
frozen input identities; reuse must not pretend they were built on a new core.
No duplicate reservation, cancellation, or deadline bypass was performed.

## Integrated candidate supplied, 07:36 UTC

Parent supplied /home/ubuntu/git/gucos-core-snapshots/ipc-integrated-baae3b75,
runtime baae3b7591a51a357d4fba3fc8e96135790025d61a6c98453e28100ea99f1aad.
Remote SHA256 reads matched supplied build.json and index.html hashes; identity
and parent payload manifest retained under integrated-candidate/. No integrated
browser execution yet. Parent reports combined kernel/build gates passed but
browser acceptance pending; those are parent results, not this worker's tests.

Existing bootstrap job remains uninterrupted. At 07:36:42 it had consumed
38m51s and was installing wide ncurses headers. Consumer tests and tmux pending.
Next sequence: preserve completed bootstrap attempt; export dependency artifacts;
then freeze inputs and perform compilation/lifecycle iteration on exact integrated
candidate. Do not relabel bootstrap-built dependency bytes as integrated builds.

## Ncurses source acceptance on bootstrap, 07:39 UTC

Narrow and wide ncurses source builds completed. Consumer tests printed
NCURSES-CONSUMER-PASS, NCURSESW-CONSUMER-PASS and NCURSES-PACKAGE-PASS.
Terminfo tooling reported 256 colors and passed its roundtrip. The runner's
sync completed before moving to tmux configure. Thus libevent and ncurses
outputs are retained in the original persistent profile with original runtime
19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441.
The stdout prefix through ncurses acceptance is committed with SHA256 evidence.

Tmux configure is now running on bootstrap, still with the original frozen
recipe (before forkpty adaptation). At 07:39:33 job elapsed 41m41s; around
18m18s remained. No tmux result yet. No interruption or new reservation.

## First complete bootstrap result, 07:43 UTC

Job ended naturally before deadline. Libevent passed in 30.491 seconds;
ncurses passed in 2369.375 seconds; tmux configure failed after 178.620 seconds
with "curses not found". It found setupterm in -ltinfo but failed both ncurses.h
and curses.h header checks. Full execution and structured result are preserved.
The recipe only searched /usr/local/include; ncurses headers are installed in
/usr/local/include/ncurses. Added that include directory for the next attempt.
This is a package build-path correction, not proof that subsequent checks pass.

The next reservation exports retained dependency artifacts and retrieves the
original guest tmux config.log. No new build or integrated runtime run yet.

## Dependency export and integrated iteration

First exporter reservation failed its Node syntax check before launching browser
because of newline escaping in the new one-off script. Corrected the script;
retry 81604f99-e8c7-41ff-a023-4e9be99ad91a succeeded. Both attempts retained.
Exported libevent archive SHA256:
295f06ac0d3e6e02774eb3f60ba68a136b7f93b00b665e37555a2385e33ee594 (2452480 bytes).
Exported ncurses archive SHA256:
4771ab00e7086c2be9815c4be1181551ec4ed455489b0ff4256effaad4570617 (12741120 bytes).
Receipts, bytes and original config.log are retained under bootstrap-compilation.
Recovered config.log confirms compiler could not find ncurses.h with only
-I/usr/local/include. The new recipe adds -I/usr/local/include/ncurses.

Prepared a fresh profile and frozen integrated-01 site from the explicitly supplied
baae3b75 candidate. The next single browser reservation imports original dependency
bytes, recompiles/runs their consumers on the integrated runtime, compiles tmux,
and only on success runs lifecycle checks sequentially. No dependency source
rebuild. No inherited historical disks or implicit sibling discovery. Original
bootstrap results and profile remain intact. Integrated results are still pending.

## Integrated-01 harness correction

Boot matched baae3b75 exactly. Dependency import began and consumer compilation
ran, but libevent test.sh also references source/port/test.c, omitted from staged
inputs by this worker. It failed with "No such source" before completing libevent
acceptance. This is a staging defect, not evidence of core incompatibility.
Preserved observed runtime, full log, and structured failure in integrated-01.
Integrated-02 uses a new frozen site and fresh profile, adding the pinned libevent
source.tar and extracting it solely for consumer fixtures. Dependency artifacts
are reused unchanged. The retry is scheduled; results pending.

## Integrated-02 dependency compatibility passed; compile gap

Reused libevent static/shared and ncurses narrow/wide artifacts passed consumers
and terminfo/tool tests on exact baae3b75 runtime. Tmux configure completed:
flock and CMSG_DATA detected, SO_PEERCRED declared, unknown platform selected.
First C compilation failed in compat.h:384: unknown type name u_char.
Preserved full log, configure diagnostics, Makefile and structured report.
Added package-local BSD unsigned type aliases via generated gucos-types.h,
included from upstream compat.h. Core is unchanged. Integrated-03 freezes this
recipe correction with the same explicit core and reused dependencies; pending.

## Integrated-03/04 compilation progress

Integrated-03 cleared BSD typedef errors, then failed alerts.c:149 on undeclared
timerclear. Source/header inspection shows timersub also absent and used by tmux.
Added package-local timerclear/timersub macros; retained existing core timercmp.

Integrated-04 resumes a COPY of the completed integrated-03 profile with the same
baae3b75 runtime and origin. Dependency acceptance remains from integrated-02/03;
no cross-runtime configure reuse. Its one-off driver records executed-resume-build.sh,
reapplies frozen package source/patches, skips only the previously successful
configure stanza, removes all tmux objects, and recompiles. This is explicitly
a configured-source development build, not a fresh configure/package acceptance.
The durable package build.sh retains its ordinary configure invocation.
At first progress check it reached cmd-list-sessions.c; no new failure yet.

## Integrated-04/05 resolver-header portability

Integrated-04 compiled through command modules and failed input.c:24 because
resolv.h is absent. These tmux includes are used for b64_ntop/b64_pton, whose
fallback declarations and implementation ship with upstream. Removed resolver
includes from input.c, tty-keys.c, tty.c and compat/base64.c, plus unused
nameser.h from base64.c. Added only the package BSD type header to base64.c.
No DNS behavior is being implemented or stubbed. Upstream base64 code retained.
Integrated-05 reuses the same-runtime configured profile, rebuilds all objects,
and records the exact transformed script. Result pending; prior failure retained.

## Integrated-05/06 full compilation audit

Integrated-05 progressed through most main objects to tty-keys.c, then failed
because _POSIX_VDISABLE is undeclared. This is not resolved by inventing a
constant: inspected kernel line discipline compares bytes directly against cc
entries with no disabled-sentinel guard. Package removes the two disabled-erase
predicates and retains literal VERASE matching, explicitly documenting disabled
control characters as unsupported. This matches the existing behavior rather
than pretending to implement POSIX disable semantics. Parent informed.

Integrated-06 rebuilds all objects with make -k -j1 to collect remaining actual
compile failures across translation units in one bounded remote browser job.
It preserves configured source/runtime provenance. Previous job ended; no
concurrent duplicate reservation was launched. Result pending.

## Integrated-06 grouped audit results

make -k -j1 collected all failed translation units: tty.c lacks ONLRET/ECHOCTL/
ECHOKE; imsg-buffer.c/imsg.c lack EBADMSG and caddr_t; base64.c rejects K&R
parameter syntax. Other translation units completed compilation; no link was
possible with these failures. Exact failed report and command log retained.

Integrated-07 applies grouped package changes: caddr_t=char*; EBADMSG fallback
maps malformed-message errors to EINVAL (negative return preserved); unsupported
terminal bits are removed only from clearing masks; two bundled base64 function
signatures converted to typed C without algorithm changes. Original source.tar
remains pinned and unmodified. Same core, full object recompilation, no new core
claims. Source-local compatibility changes documented in package README.

## Integrated-07 link result and descriptor-cleanup blocker

All C translation units compiled in the remote scheduled make -k run. Linking
failed with undefined getdtablesize from compat/closefrom.o. The failed report,
complete execution log, exact transformed recipe and hashes are retained under
docs/research/tmux-ipc/integrated-07. No executable or lifecycle pass is claimed.
Scheduler status after completion showed no active jobs; nothing was interrupted.

Read-only inspection of the integrated core source explains why merely supplying
a constant would be incorrect: sysconf(_SC_OPEN_MAX) returns -1, getrlimit reports
RLIM_INFINITY, allocFd searches the descriptor map without a fixed bound, and
/proc/<pid> exposes stat/status/cmdline/comm but not fd enumeration. Standalone
closefrom, close_range and F_CLOSEM are absent. Tmux uses closefrom(3) in client,
spawn, job and pipe-pane paths. Existing posix_spawn closefrom file action correctly
walks the kernel descriptor map, but is not callable as standalone fork-child
cleanup. A fabricated 256-descriptor bound risks leaking inherited descriptors.
Bundled imsg also uses getdtablesize and a /proc fd-count fallback that cannot
measure this runtime. Its capacity preflight can be adapted to explicit unlimited
semantics, but reliable descriptor cleanup needs a real runtime primitive.

Coordinator message delivered 01a12a0d-f453-78a0-aba6-92e2d11f917f requesting
core-owner guidance/support. No core files edited and no new candidate inferred.
Current runtime remains explicitly pinned baae3b7591a51a357d4fba3fc8e96135790025d61a6c98453e28100ea99f1aad.
Author identity reverified via cc-meta thread: codex / gpt-6-astra, thread
01a129b8-ba13-7d36-b0bb-066591a700b1. Reusable bootstrap dependency exports and
integrated consumer evidence remain intact. Final clean build and interactive
attach/detach/panes/input/resize/continued-shell/reconnect acceptance are pending.

## Real-closefrom package preparation

Coordinator assigned actual descriptor-map closefrom to services worker; a new
reviewed distribution and hash are still pending. No guest rebuild was launched
on baae3b75. Recipe now requires configure-detected HAVE_CLOSEFROM and fails
before make if absent, preserving honest feature detection. The imsg finite
capacity preflight alone is removed for the explicitly documented unlimited
model. No count/limit stub is supplied; calloc, recvmsg, EINTR handling and all
received-descriptor cleanup remain unchanged. Future enforced quotas require
revisiting this adaptation. Unreferenced bundled getdtablesize/getdtablecount
fallback sources are not advertised as working runtime APIs.

Clean compile driver explicitly deletes the prior tmux source directory before
extraction/configure and now captures config.log, config.h and Makefile for
successes as well as failures. Reusable libevent/ncurses artifacts remain
unchanged; their consumers will be rebuilt and executed on the new identity.

Executed remote machine-job build ce17f4d0-f31f-464c-8a64-ae303b9e4e34:
host shell/JS syntax and an isolated extraction/transformation audit passed.
The audit compares transformed imsg.c byte-for-byte against upstream with only
the intended preflight block replaced. This is not a guest compilation or
lifecycle result. Exact script, result and scheduler log are retained under
docs/research/tmux-ipc/closefrom-preparation. Integrated07 failure remains intact.

## Integrated-08 explicit closefrom candidate

Parent supplied reviewed snapshot ipc-closefrom-e1a1d35a, runtime
e1a1d35aab446d25eb19126cec01e17e5508b672bc16f73b4cbb5e0a01f3b8a8.
Verified both supplied build.json/index.html hashes and every SHA256SUMS entry
before staging. Copy inherited read-only directory mode; adding inputs initially
failed permission denied. Corrected only the copied site root mode, leaving
original snapshot unchanged. No build/browser had started at that point.
Fresh profile, frozen inputs, original dependency identities retained. Lifecycle
driver now also checks real Backspace erase, single-pane exit with surviving
shell, and final shell exit ending the session. Results pending.

## Integrated-08 gate error and clean retry

All dependency consumers passed on e1a1d35a. Configure detected closefrom=yes
and emitted -DHAVE_CLOSEFROM=1 in Makefile DEFS, omitting closefrom from LIBOBJS.
Our new gate incorrectly assumed config.h exists; tmux uses command-line defines.
The recipe stopped before compilation. This is a package gate bug, not core
failure. Full log/configure evidence retained. Corrected gate reads actual
Makefile DEFS without overriding detection. Integrated09 is another fresh profile
and full clean configure/build against the identical explicitly supplied core.

## Integrated-09 fork compiler contract

Clean configure, real closefrom detection and all C compilation completed.
Linking failed: process cloning requires --enable-fork. This required compiler
flag was missing from the recipe; compiler-driver/trampoline source inspection
confirms it selects fork-capable libc and continuation code. Added to CFLAGS
so compile and link consistently opt into required tmux process cloning.
No core defect inferred. Integrated10 uses another fresh profile and full
clean recipe; prior failure/configure evidence preserved. Lifecycle pending.

## Integrated-10 execution-contract result

Clean --enable-fork build linked 2682 functions / 6899762 bytes, but tmux -V
failed loading with JSPI execution contract mismatch: fprintf (status127).
Lifecycle did not execute. Nonfork baseline dependency consumers had passed.
This is a newly fork-enabled consumer linking an old nonfork DSO, not evidence
that previously published nonfork binaries lost compatibility. Full result
and configure evidence retained; core owner is investigating in parallel.

Integrated11 tests -Wl,-Bstatic dependency selection using existing archives.
Read-only compiler-driver inspection confirms this does not force static libc:
--enable-fork still selects libc-fork.so.1, and ABI validation stays enabled.
This path is an experiment pending actual execution, not assumed successful.
Fresh profile/full clean recipe; no core changes or reservation interruption.

## Integrated11 completed flagship acceptance

Clean build and version smoke passed with static dependency archives and dynamic
fork libc. Full actual lifecycle passed: attach/input/erase/two panes/resize/
detach with continued process activity/reconnect same shell PIDs/pane exit/
final session exit. Run ended normally09:14:03 UTC; no jobs remained. Installed
tmux outputs exported in separate scheduled reservation fa32ca46, archive
SHA25608efddf8191d41b41299ce8df494c981bb1e0bf216152dfccdc618f0190bd879.
Complete provenance, limits and machine-readable results under integrated11.
No source/catalog publication, core edit or deployment. Parent integration pending.

## Final-candidate replay preparation and integration assessment

Prepared install-retained-artifacts.mjs and final-artifact-plan.json: exact
libevent/ncurses bootstrap archives plus tmux08efddf8, SHA256/size verification,
fresh-profile install/version smoke followed by unchanged actual lifecycle.
No final core identity guessed and no guest run launched. Compilation is absent
from this runner. Original b8178c0 export bytes and evidence remain preserved.

Read-only destination assessment: main d966694 clean, porting-continuation
d7d1bfb has unrelated untracked app work. Seven new apps/tmux files plus dedicated
tmux documentation/evidence are the integration scope. Existing ncurses test
fix and compatibility helper already match destination main, so do not overwrite.
Remote history is standalone snapshot; prefer path-scoped import on isolated
branch after coordinator identifies destination. No catalog/publication changes.

## Explicit recipe eligibility correction

User authorized metadata-only recipe minimum1.0.2 and declared requirements
unix-stream/unix-rights/flock/closefrom, retaining posix-core/pthreads and the
existing target/runtimeAbi5/objectAbi3. No datagram/seqpacket/eventfd/semaphore
requirement added: this tmux acceptance does not establish those dependencies.
No source/payload rebuild, binary change, or artifact receipt relabeling.
Final candidate and destination integration branch still await parent handoff.

## Package-client dependency eligibility correction

Independent reviewer found direct-extraction acceptance bypassed missing
dependencyRequirements. Added checker-supported exact version equality:
libevent2.1.12-1 and ncurses6.5.0-2. Read tools/guest-repository/json.c: version
uses string equality; range comparisons accept only strict stable X.Y.Z and
reject these packaging revision suffixes. Its sha256 constraint means dependency
MANIFEST hash, not artifact hash. Do not fabricate or put exported tar hashes
there. The isolated install fixture will pin real manifest hashes in its catalog
and exact retained binary hashes in manifests, preserving original receipts.
No payload rebuild. Actual gucman install acceptance still pending final candidate.

## Actual package-client fixture prepared

prepare-install-fixture.py will create only a private per-run catalog under
the explicitly supplied final site, pinning unchanged original archive hashes,
original runtime identities, output inventories, and actual manifest hashes.
install-through-client.mjs invokes gucman repo add/install, validates installed
manifests and every installed payload byte against archived output hashes,
checks tmux-V, then the unchanged lifecycle runner can execute. It invokes
the actual guc-json compatible checker with version1.0.1 and requires the
platform-version rejection; this is not an old-runtime boot claim. No final
execution yet. No archive repacking or source rebuild is planned; actual
client unpack compatibility remains part of the pending acceptance.

Remote syntax checks for client installer JS and fixture Python passed in
machine-job595911bd-b136-4e0b-8f3a-63af3b6c0a7b; no final guest test executed.

## Final1.0.2 actual package install run

Parent explicitly supplied ipc-1.0.2-be3a9ce7, runtime
be3a9ce7817c876e8d9bc900556fea1fbaeb4f0d5d4e03003ab24a7ad3b600bb.
Verified supplied build.json/index.html/SHA256SUMS hashes and every payload entry.
Observed platform1.0.2, runtime0.5.9, unchanged ABI5/3. Private fixture generation
and actual gucman install/lifecycle started in browser reservation01954c42,
20-minute deadline. Exact archive identities retained, no recompilation/repack.
Real guc-json check already rejected1.0.1 metadata with platform version mismatch;
install and lifecycle result pending at this checkpoint.

## Final install deadline and fresh retry

01954c42 expired at09:47:42 UTC after1200seconds with ncurses1175/2928 files;
client-install.json records browser closed, not success. Scheduler empty was
verified before retry. Original log/profile/result preserved. Source inspection
shows session command awaits page.evaluate and shell.command without a shorter
command timer; default250-second page waits affect readiness/locators, not the
long install evaluation. Retry sets installer page default90minutes explicitly,
keeps250-second navigation readiness, and reserves5400seconds at machine-job.
Lifecycle's bounded readiness/input waits stay unchanged. No scheduler bypass.
Final-install02 uses a fresh profile and identical finalbe3a9ce7 core/payloads.

## Final actual package-client acceptance PASS

Fresh final-install02 joba4001b8a completed normally10:34:27 UTC. Actual gucman
recursive dependency installation passed, installed manifests matched, and all
2963 file hashes matched unchanged retained artifacts. Real checker rejected
1.0.1 metadata. Tmux-V and full attach/input/erase/panes/resize/detach-continuation/
reconnect-same-PIDs/pane-exit/final-exit replay passed on explicit finalbe3a9ce7.
No compile/repack, no artifact provenance relabeling. Exact evidence and acceptance
report committed under final-install02; earlier timeout preserved. Parent still
owns isolated destination designation, independent review and overall release.
