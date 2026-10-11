# tmux 3.5a candidate

Pinned upstream release; exact input identity is in provenance.json. No publication or catalog entry.

Dependencies: libevent 2.1.12 poll port and ncurses 6.5 terminfo. The package uses
upstream configure probes and bundled compatibility implementations. Guest builds
must use an explicitly supplied gucOS candidate distribution and expected runtime
identity. All build and execution work runs on SSH agentone inside
`/home/ubuntu/.local/bin/machine-job` reservations.

Accepted in integrated11 on explicit runtime e1a1d35a: clean recipe build,
interactive attach, two panes, terminal input/erase, resize, detach with continued
process activity, reconnect to the same shell PIDs, pane exit and final session
exit. Evidence is under docs/research/tmux-ipc/integrated-11. `test.sh` alone
checks only the executable version; the separate lifecycle driver supplies
interactive acceptance. No publication or deployment was performed.

Package adaptations currently reuse upstream POSIX forkpty code, supply BSD
unsigned aliases and timeval helpers, and use bundled base64 without resolver
headers. The current core exposes no disabled-control-character sentinel and
its line discipline compares all control-character bytes literally. The port
therefore treats VERASE literally; disabling VERASE via _POSIX_VDISABLE is not
supported or claimed. This does not assert full terminal/POSIX conformance.

Malformed bundled-imsg buffer errors use EINVAL when EBADMSG is unavailable.
ONLRET/ECHOCTL/ECHOKE are omitted only from raw-mode masks that clear flags;
this does not add those terminal features. Bundled base64 function definitions
are rewritten from K&R to typed C declarations without changing the algorithm.

The recipe requires configure to detect core closefrom and fails before make
otherwise. It does not use upstream bounded descriptor scanning. For the
documented gucOS unlimited-descriptor model, the bundled imsg finite-capacity
preflight is removed; allocation and recvmsg errors, EINTR retry, and received-fd
cleanup remain intact. No descriptor count or finite limit is fabricated. This
adaptation must be revisited if core introduces enforced descriptor quotas.

These descriptor adaptations passed actual guest execution on the reviewed
e1a1d35a candidate; the earlier baae3b75 runtime did not provide closefrom.

The recipe enables the compiler fork contract with --enable-fork for tmux
server/pane process creation. Integrated09 reached linking and exposed this
missing recipe flag; that failed attempt remains retained.

Dependency selection uses -Wl,-Bstatic so libevent/ncurses archive code is
lowered with the new fork-enabled consumer. Core libc remains the dynamic
fork runtime; execution-contract validation stays enabled. This linkage path
passed the clean build and lifecycle run on e1a1d35a. This does not imply that
old nonfork shared libraries are compatible with fork-enabled consumers.

Final1.0.2 acceptance also passed via actual gucman install on be3a9ce7, using
unchanged retained artifacts and corrected platform/dependency eligibility.
All2963 installed files across tmux/libevent/ncurses matched expected hashes;
the full lifecycle replay passed. See docs/research/tmux-ipc/final-install-02.
Original build identities remain unchanged. No package publication performed.
