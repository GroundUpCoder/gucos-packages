# Snake responsiveness correction

User requested restoration of Snake responsiveness and republication without
interfering with ongoing package ports. Work is isolated in the
`snake-responsiveness` worktree/branch; no core or porting-worktree edits.

Compared `apps/snake/main.c` with the original
`~/git/c-compiler/vendor/snake/main.c`. The packaged game changed the 100 ms
input-wake movement loop to fixed 150 ms movement and overwritable pending
turns. The correction restores 100 ms idle movement and immediate movement
for each complete legal direction key, including same-direction repeats.
Multiple keys delivered in a single read are applied sequentially. Existing
fragmented-arrow, terminal cleanup, EOF, quit/restart, food/collision and board
bounds fixes remain. Game-over now blocks indefinitely in select; no busy loop
or SDL conversion is needed.

Source commit: 6fce7403d036597cd794b2cda8dd41725e8469d3.
Follow-up acceptance tests: 28b53d4 (full identity retained by Git).
External independent reviewer: cc thread
01a1295c-cd38-7a14-89f4-8228462542d8, metadata verified executor `codex`,
model `gpt-6-astra`. Source/upgrade plan approved; artifact review pending.

Native logic checks passed through the shared general build lane, including
actual pipe-batched input. These are supplementary: guest compilation, fresh
binary gameplay/timing, upgrade and reload acceptance remain required.
Browser acceptance uses the scheduler without interrupting or reordering any
other thread's jobs. The initial source-only queued job was cancelled before
execution because the pipe regression test was added; a replacement sequential
source/binary/upgrade job uses the updated frozen inputs.

The core input is an explicit read-only distribution from `~/git/gucos/dist`,
runtime 19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441.
All package builds execute inside the browser guest. No sibling package
repository is consumed by a core build or deployment.

Reviewer follow-up approved fixture corrections at
`d4e4a2b0f88da5be20e1118439b1dcf1e9041724`: latency samples now require a
perpendicular turn and unchanged other axis, and upgrade cleanup always closes
the browser even if evidence writing fails. Native pipe-batched regression
also passed after addition, scheduler job 4be451c3-8e17-49c4-aed9-750881a4832b.

The isolated branch merges ongoing published work rather than rewriting it.
The upgrade plan was aligned with accepted MicroPython baseline 4395482;
Snake's old catalog identity and output inventory remain unchanged.

At the first scheduled continuation, the original queued process no longer
existed and no guest execution had begun. The attempted durable scheduler
parent then exited with the scheduler's explicit queue-full refusal (four
waiting jobs); it did not start a build or browser. No other job was cancelled
or reprioritized. Publication remains pending actual acceptance.

## Private acceptance completed

Scheduler job 345a6afc-4952-497b-b5b7-2f62b6f0f278 completed all stages
successfully on 2026-10-11: guest source compilation/logic tests, fresh binary
installation, keyboard gameplay/timing, reload, old-to-new upgrade and reload.
Exact reports, logs, manifests, receipts, checksums and screenshot are retained
under docs/research/snake-responsiveness/{source,binary,upgrade}, with evidence
hash inventories. The archive is 40448 bytes, SHA-256
0b8d91f8dfe9da464a391629a2d4f8b2693a6b5150fac8493e7c3d8bf0813f0d.

Observed idle intervals were 105.72, 111.20, 111.51 and 111.65 ms. Five
perpendicular key responses were 3.355, 1.995, 2.365, 5.045 and 2.105 ms.
These measure the automated bootstrap terminal path to head-output receipt,
not physical-key latency or Xterm/JWM desktop latency. Functional checks also
verified collision/restart, board rendering, single-q/Ctrl-C exit and termios
restoration. Upgrade 1.0.0-1 to 1.0.0-2 retained the exact expected files across
reload. Native checks were supplementary; guest results are now verified.

## Published and accepted live

Independent artifact approval covered 28074d45e70ab5353de8df7998f9972157b17191.
Immutable selection review approved manifest fe7234e26d5913fdeede1266220e3bf79409f434
and catalog b0d5005fcf592090ef65dbef41a93de20b53e7cc. Publication was a normal
fast-forward push to main, preserving the other 75 entries and all concurrent
published work. Anonymous HTTP retrieval verified the main catalog entry and
every Snake source, manifest and binary hash/size.

Live scheduler job b7bc2da3-b13e-4031-90e7-324a87139e85 passed fresh installation,
keyboard gameplay/timing, reload, 1.0.0-1 to 1.0.0-2 upgrade and post-upgrade
reload on https://os.groundupcoder.com/ using the actual main catalog URL.
Live idle intervals: 108.085, 108.48, 111.98, 112.31 ms. Live perpendicular-key
responses: 4.40, 4.92, 2.875, 2.495, 2.305 ms. This is automated terminal-path
measurement, not physical keyboard/Xterm latency. Exact installed checksums
survived reload in both fresh-install and upgrade profiles.

Evidence is retained under public/ and public-upgrade/ with hash inventories.
The publication baseline advances to the accepted catalog only after these
live checks. Existing installations can use `gucman upgrade snake` (or
`gucman install snake`, as exercised by the upgrade acceptance fixture).
No core deployment, user-profile access, other worktree edits, other job
cancellation or scheduling-priority changes were performed.
