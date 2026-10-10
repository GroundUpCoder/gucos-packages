# Historical package completeness audit — 2026-10-10

The current public catalog has **19 packages, 18 with binary archives**; `twm`
is source-only. This is a substantial subset of the historical environment,
not restoration of everything previously built.

Read-only audit by the package author (cc thread
`01a12401-30cf-7004-a932-af576a939e08`, actual metadata Codex / `gpt-6-astra`).
No builds, browser jobs, installations, ports, core edits or hosting edits ran.
The historical execution below was performed by earlier authors/reviewers;
this audit inspected their records and did not repeat their tests.

## Scope and accounting

Historical checkout: `wasm-posix-old` commit
`0b9b3245fe11a3bc677d81113cba90cd0ae80446`. Current package baseline:
`f256627a317a97c9950ac058b70ae5cda70b541e`. Catalog SHA-256:
`8d7c4cbf0b2110f66aadabf766f0aad93563d090adb46861d31b3869bbba25fd`.

Independent enumeration of tracked `wasm-package.json` files found **110 canonical
historical names**, exactly matching the final historical coverage inventory.
Each has positive historical build/package acceptance evidence in the inspected
records. Some are data or desktop/SDK bundles; this is **not 110 independently
compiled applications**, nor one simultaneously accepted release. Evidence spans
versions, platforms and local experimental publications. A successful older
version remains historical success even if a later refresh failed. Historical
`stable` labels, source directories and test scripts alone were not counted.

| Disposition of the 110 historical names | Count | Names/scope |
| --- | ---: | --- |
| Current package with same canonical name | 5 | jwm, lua, twm, x11-server, zstd; profiles can differ |
| Now fixed core bootstrap | 6 | ar, ash, busybox, cc, libc, make |
| Partial/reorganized functionality | 5 | x11-apps, x11-apps-more, jwm-desktop, sdl3, sdk |
| Absent as a current installable package | **94** | Exact list below and per-row evidence table |

The current catalog has additional split package names and jsmn, so `19 / 110`
is not a meaningful completeness percentage. “Absent” means no standalone
package/SDK in the current catalog; it does not assert that no code from a
library is statically embedded in another program. Core bootstrap presence
likewise does not establish feature equivalence with every historical version.

[All 110 rows](catalog-rows.md) identify the historical manifest and concrete
success record. [Machine-readable inventory](inventory.json) includes record
selectors, file hashes, recorded artifact hashes where available, historical
dependency lists and all current output paths. Historical manifest versions
are HEAD versions; individual success evidence may concern an earlier version.
`collect.py` reads only Git blobs and tree listings at the two pinned commits
to regenerate the comparison without browsers or builds. Mutable checkout
contents and later commits are not collection inputs.
It covers tracked HEAD manifests and the named additional experiments below,
not every upstream source nested inside vendored trees, deleted branch or
unrecorded experiment. Archive payloads were not rehashed in this audit.

## Exact missing historical catalog names

`2048`, `atk`, `autoconf`, `automake`, `awk`, `bison`, `bitmap`, `bzip2`, `bzip2recover`, `cairo`, `cairo-gobject`, `cpython`,
`cpython-idle`, `cpython-tkinter`, `doom`, `ed`, `expat`, `feh`, `flex`, `fltk`, `fontconfig`, `freetype`, `fribidi`, `galculator`,
`gameboy`, `gdk-pixbuf`, `gdk3`, `gettext`, `gio-core`, `gio-listmodel`, `glib`, `gobject`, `gtk-desk`, `gtk-desktop`, `gtk-sdk`, `gtk3`,
`gtk3-demo`, `gtk3-schemas`, `gtk3-x11`, `harfbuzz`, `hush`, `imlib2`, `jq`, `l3afpad`, `libevent`, `libffi`, `libfm`, `libgedit-amtk`,
`libiconv`, `libintl`, `libjpeg`, `libjpeg-turbo`, `libpng`, `libtool`, `libuv`, `libxfce4util`, `m4`, `mgba`, `micropython`, `minihb`,
`ncurses`, `nyancat`, `pango`, `pcmanfm`, `pcre2`, `pcre2grep`, `pcre2test`, `perl`, `pigz`, `pixman`, `pkgconf`, `punes`,
`puzzles`, `pygame-ce`, `pygame-games`, `pyspacewar`, `qjs`, `quake`, `scintilla`, `sdl3-gfx`, `sdl3-image`, `sdl3-mixer`, `sdl3-ttf`, `solarwolf`,
`sqlite3`, `tcl`, `tinyxml2`, `tk`, `vim`, `x11-shared`, `xarchiver`, `xmag`, `xmahjongg`, `zlib`.

## Missing parts hidden by renamed bundles

- Historical `x11-apps` is mostly split into `x11-toolkit`, `x11-widgets`,
  `xterm`, `xev`, `xprop`, `xmessage`. Xt/Xmu/SM/ICE/Xrandr and Xaw/Xpm static
  libraries are present. **libXft and the historical Xft/Source Code Pro/ncurses
  xterm profile are absent**. Current xterm uses core fonts and GNU termcap.
  Historical scope: `apps/x11-apps/wasm-package.json` and
  `docs/logs/2026-10-03/desktop-ports.md` in old.
- Historical `x11-apps-more` had twelve executables. Seven are now individual
  packages: xclock, xcalc, xeyes, xlogo, xlsfonts, xkill, xrefresh.
  **Missing: xedit, xfontsel, xclipboard, oclock, xcutsel**. Their actual old
  source/binary run is `x11-apps-more-AU8pxm`, documented in
  `docs/logs/2026-10-03/x11-apps-more.md`; see its manifest's `requiredFiles`.
- `jwm-desktop`'s `start-jwm` function and display helper now belong to `jwm`.
  This does not restore the former application's full desktop/menu dependency
  set. JWM itself is published and live-tested; it is not being replaced by twm.
- The SDL3-compatible VT shim and C toolchain are core-owned. Neither the old
  `sdl3` package profile nor the old `sdk`/host-prepared C++ pipeline is implied
  by those names. SDL_image/ttf/mixer/gfx remain missing packages.
- Current Lua is portable ISO C: no `io.popen` or dynamic C modules. Historical
  Lua supported LPeg dynamic loading. Thus a present package name is not proof
  of historical feature completeness.

## Additional real builds outside the 110-package catalog

All paths in this section are relative to old unless explicitly labeled otherwise.
These do not inflate the 110-row count or imply current compatibility.

| Item | Historical evidence and exact scope | Current gap |
| --- | --- | --- |
| GNU binutils 2.44 | `docs/PORTABILITY.md`, “Package trial results (2026-09-23)”: all-binutils completed; readelf, nm, objdump, objcopy, strip, ar, ranlib, size, strings, c++filt runtime checks passed. Recipe `tools/port-recipes/binutils.sh`. DejaGNU not run; documentation tool failures remained. | No GNU binutils package; core ar is a different tool. |
| cJSON 1.7.19 | `docs/logs/2026-10-03/libc-wchar-fork.md` records Projects whole/archive and cJSON checks passing; workload described in `docs/PROJECT-WORKLOADS.md`. Source `vendor/cjson`. | No package; jsmn is a different library. |
| LPeg 1.1.0 | `docs/CORRECTNESS-ROADMAP.md` explicitly records upstream-suite pass; `docs/PORTABILITY.md` records Lua loader scope; `tests/application-plugins.mjs` supplies the concrete build/run. Source `vendor/lpeg`. | No package; current Lua disables dynamic modules. |
| SQLite generate_series extension | `docs/PORTABILITY.md` records application-loader demonstration; `tests/application-plugins.mjs` builds and loads the upstream extension. This is journal-level evidence, not a retained package result. | SQLite and extension absent. |
| pcg32 | `docs/logs/2026-10-03/cpp-llvm-pcg32.md` and `docs/research/cpp-llvm-to-c/pcg32-acceptance.json`: 488 differential outputs across whole/object/archive and two backends. Host C++ preparation plus actual destination execution; not an installable package. | No package. |
| libc++ / libc++abi support | `apps/libcxxabi/README.md` and `docs/logs/2026-10-05/scintilla-exception-execution.md`: pinned translated native-tag exception profile and real Wasm scenarios. Also embedded support for historical C++ applications. | No standalone general C++ SDK/runtime package; do not count source trees as full upstream-library ports. |

Bundled components are not extra canonical packages: jq includes Oniguruma;
libfm includes menu-cache (real daemon/generator/library boundaries). Both owner
packages are absent. Puzzles contains forty games; their version/generator checks
and selected GUI interactions passed, not forty complete interactive test suites.
Historical pygame-games is likewise a collection, not one independently tested
engine per filename. See old `docs/logs/2026-10-03/desktop-ports.md`,
`more-desktop-apps.md`, and `2026-09-30/pygame-games.md`.

## Source/recipe-only or unsuccessful trials — not completed ports

| Item | Recorded state and evidence path in old |
| --- | --- |
| libarchive / bsdtar | `apps/libarchive/PORT.md`: last retry interrupted before complete build; no bsdtar result, no installable package. |
| GNU coreutils 9.7 | `docs/PORTABILITY.md`: stopped in gnulib mountlist; no validated executables. BusyBox commands are not GNU coreutils. |
| GNU diffutils 3.12 | Same file: getprogname module port missing; runtime tests not reached. |
| GNU sed 4.9 | Same file: gnulib fwriting failure; no runtime success established. |
| GNU grep / patch | `tools/port-recipes/grep.sh`, `patch.sh`, and `docs/PORTABILITY.md`: exploratory recipes; successful build evidence not found in this audit. |
| Netpbm | `docs/logs/2026-10-04/thread-consolidation.md`: P_tmpdir build failure, correction untested, no candidate. Retained branch package/netpbm-4dcc6cf6. |
| XPaint | Same journal: source/dependency intake only, needs Netpbm/toolkit/recipe and GUI acceptance. Retained branch package/xpaint-19e911a5. |
| xfconf | Same journal: daemon fork correction untested, retry cancelled, no passing candidate; automatic bus activation unsupported historically. |
| libxfce4ui / full XFCE | Same journal: draft excludes private keyboard library; no usable artifact or complete desktop claimed. |
| NumPy | `docs/logs/2026-09-30/pygame-expansion.md`: no built/installed/accepted package. Approach choice remained unresolved in October 10 journals. |
| Guest-native C++ compiler (GCC / Open Watcom) | `docs/BUILD-ROADMAP.md`: avenues for research, not built/validated guest compilers. Historical host translator is distinct. |

## Blockers, with dates and applicability

The immediate common gap is **package migration and new-platform acceptance**:
94 historical names have no current recipe/manifest/publication here. This is
not evidence that all 94 require core changes. Historical format-1/format-2
archives and their baselines cannot simply be advertised as new supported
packages. The current core contract admits the verified `2a9cca…` legacy baseline;
other historical runtimes have not been accepted by this package audit.
Future publications must follow `docs/package-publication.md` and current core
`docs/PLATFORM.md` (platform/minVersion/ABI/features/dependency requirements).
No new platform metadata or old artifact retagging occurred.

Concrete retained failures in old, **not rerun on live c4411d72**:

- GTK3-X11: `docs/logs/2026-10-10/gtk3-source-composition-blocker.md` records
  rejection of conflicting `libcairo.so` providers in its old runtime-record
  closure. Retained manual execution succeeded, publication composition did not.
  This is an old package/metadata conflict, not proof that core 1.0 rejects GTK.
- Scintilla: `docs/logs/2026-10-10/scintilla-source-blocker.md` records missing
  public GTK3-X11 dependency; original prepared generated sources are required.
  Host C++ preparation is not a guest-native C++ build.
- TinyXML2: `docs/logs/2026-10-10/tinyxml2-retained-blocker.md`: retained archive
  traps with guest exit 139 on old target `2ec2182f`; first xmltest failed,
  later checks never ran. Cause unknown. Earlier 517-test acceptance remains
  valid historical evidence, not proof for the later target.
- FLTK: `docs/logs/2026-10-10/fltk-retained-checkpoint.md`: old target replay
  passes installed consumers and initial input, then times out opening Message.
  Possible coordinate/harness issue, cause unknown; later tests not reached.
- Imlib2 1.12.6: `docs/logs/2026-10-03/more-desktop-apps.md`: built but image
  loading failed on read-only shared mmap (errno 95). Imlib2 1.6.1 passed.
  Do not count the failing newer profile as accepted or the older port as absent
  historical success.
- Current Lua's portable profile was chosen after `_setjmp`/`_longjmp`
  declaration failures on **2a9cca**, as recorded in this repo's
  `docs/logs/2026-10-10/package-expansion.md`. Unchanged binaries passed c441;
  no POSIX-profile rebuild was attempted, so that source failure is not a
  demonstrated current core blocker.

Resolved historical failures (PCRE CLI recursion, libxfce4util missing pkgconf,
GTK painting, Amtk test dependency, Xarchiver ignored config header) are not
listed as open blockers: later successful records supersede them. The inventory
preserves actual success evidence instead of treating a failed refresh as “never built.”

## Current deployment and verification limits

**Core 1.0 is deployed at https://os.groundupcoder.net/** with runtime
`c4411d720bede49ead5c1de69bfe7b1247656a146b72d991d209883606e300fb`.
User/core author performed guarded deployment and browser acceptance. The
existing package journal `docs/logs/2026-10-10/platform-1.0-package-acceptance.md`
records the independently inspected evidence: candidate **14 stages / 803 output
hashes**, then live **6 stages / 722 hashes**, including JWM/xterm keyboard/PTY
and reload, all using unchanged original public binaries. Candidate scope was
17 expansion/desktop binary packages; live smoke installed five desktop packages.
This is not a claim of fresh c441 acceptance for source-only twm or jsmn, nor
installation of every catalog entry on every user's persistent disk.

During this audit, ordinary HTTP GETs (no browser) confirmed the live root HTML
is byte-identical to the accepted immutable candidate index and public GitHub
catalog is byte-identical to the local 19-package catalog. See
[HTTP receipts](http-receipts.json). The root HTML check alone is not a new
runtime/asset/browser acceptance. `/build.json` is not publicly served; the
initial urllib/curl attempts failed and supply no identity evidence.

Core local release tag `v1.0.0` resolves to `7cf44cb8b39044767f6ca3d446713a06c976e6ca`;
remote annotated tag object observed `6b2d58c638fc6473637ca9390fcab8dbd8a0b635`.
Historical `/os2`, old disks, old repositories and hosting were untouched.
The historical 34-record os2 channel and older 59/63-artifact localhost
publications are **not** today's new public package catalog.
