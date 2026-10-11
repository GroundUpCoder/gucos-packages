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
