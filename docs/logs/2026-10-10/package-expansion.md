# Package-only expansion

User authorized continued package ports, JWM first, modifying only this repository.
No core, hosting or other repository files may be modified. Core blockers must
be reported. Browser/heavy commands use machine-job; browser jobs capped at 300
seconds to share the lane with concurrent startup profiling.

Author actual cc thread 01a12401-30cf-7004-a932-af576a939e08 is Codex gpt-6-astra
(metadata verified). Reusing external implementation reviewer
01a123e0-2fb3-7521-9fa3-e936e0997405. Preliminary architecture review found no
package ownership overlap or core changes needed; required immutable provenance,
a fresh final profile to avoid stale statically linked consumers, and binding the
X11 binary fixture to the actual previous build receipt. These are being addressed.

Prepared candidates: JWM 2.4.6, XPM/Athena libraries, xcalc, xclock, xeyes, xlogo,
xlsfonts, xkill, xrefresh, Zstandard 1.5.7, Lua 5.4.9. Preparation is not acceptance.
Historical sources are from old commit 0b9b3245fe11a3bc677d81113cba90cd0ae80446.
Per-package provenance records bind generated source archives to exact historical
Git blobs; archives themselves are newly generated. Zstd working tree had CRLF
transformations and symlinks, so its importer reads raw Git blob bytes and preserves
symlink types. Lua is the unchanged official tarball with published SHA256 checked.

The initial live-origin fixture harness had two author JavaScript errors, then
persistent setup needed idempotent repository handling. Fixture requests produced
no early progress; rather than treating that as a core blocker, staging now uses
real local HTTP transport serving a package-local copy of the exact deployed core
release b93d001b36a4624c1f093da6021f989dbf63e7ce05923d5f8ba6b26d9e49f7c5.
All 33 release file hashes/sizes are verified before each new session. No core
rebuild occurs. Runtime remains 2a9cca447a35af0d0d8894ea4b50cb254ce20821753af8ae70a1ad5060da2a0f.
Development profile is persisted between bounded jobs; final consumer acceptance
must start with a fresh profile and frozen inputs. X11 dependency binary fixture
must equal prior public guest export SHA256
9cc9c7c53dd4996540f3871b561716a268289ed6ff8eca7611d10aa456b58558,
whose executed receipt is in runtime-x11.md. Public package acceptance remains a
separate required post-publication gate.

Development acceptance so far: dependency bootstrap PASS job f36420b1; JWM guest
build PASS job 17ec1522; actual graphical JWM PASS job 4e390245 (two independent
Xlib clients, decorations, browser drag, hidden progress). Logs are under
this repository's test-results/. JWM launcher/menu additions follow this first
pass and require final reacceptance. The first X-client build found xeyes needed
-lXi; the existing X11 server SDK supplies it, so only the package link changed.

Initial one-off preparation scripts were removed after producing inputs. Durable
source tooling is historical-archive.py (raw Git blobs, including symlinks) and
verify-provenance.py. Build recipes and explicit target overlays are the maintained
package inputs, rather than regenerating them from old working-tree scripts.

All ten X-client candidates built after two package-only corrections: -lXi for
xeyes and upstream reallocarray fallback for xlsfonts. Functional test PASS
job 596db81a-67e3-424e-a5c3-335cd9941242: clock
pixels changed, eyes followed XTest pointer, calculator 1+2 pixel result matched
3, xmessage button returned7, xev observed KeyPress, xlsfonts listed fixed, xprop
round-tripped a root property, xrefresh returned0, xkill terminated the chosen
logo client. No core patch. xterm compiled with core fonts/GNU termcap; first PTY
probe raced unmapped-window focus, so test waits IsViewable before XSetInputFocus.

xterm PTY acceptance passed job 57e1f554: browser keyboard input reached the
spawned guest shell and was checked from its output file. Before this pass, the
focus controller needed IsViewable synchronization; a failed probe also left a
stale X lock in the disposable persisted test disk. Tests now clean only their
own known guest-display paths and wait for X server shutdown. The user-facing
start-jwm launcher instead chooses an unused display when DISPLAY is unset;
it never deletes other displays' lock files.

Lua's POSIX build failed because deployed libc lacks _setjmp/_longjmp declarations.
The package uses upstream portable ISO C handling instead: no io.popen or dynamic
module loading. Portable guest build/interpreter/luac/coroutine/file/system test
passed in test-results/lua-runtime2.log; final pass also includes protected error
handling and a separately compiled embedding program. No core change made.
