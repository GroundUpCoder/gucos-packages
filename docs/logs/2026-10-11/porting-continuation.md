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
