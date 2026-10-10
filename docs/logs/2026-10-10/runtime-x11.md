# Runtime X11 package preparation

Author source provenance: preserved wasm-posix-old commit
0b9b3245fe11a3bc677d81113cba90cd0ae80446, apps/x11-server/source,
apps/x11-apps/source and apps/twm/source. Deterministic USTAR snapshots preserve
file bytes; uid/gid/mtime are normalized. Old checkout is unchanged.

X11 server author guest build/install/independent Xlib acceptance passed with
runtime 4cb8ccdd6b0c1e5a6dc923fb6a7c64a7fdcce4ea4c3780bf5aa05add9479e389,
scheduler job e7da3dd6-9b9a-481b-84ee-6a03ef2cba63. Test used an explicit local
HTTP runtime repository fixture; core assembly did not read package inputs.
Guest archive 25956864 bytes, SHA256
dfc87dcad5c43db99015c88caee0db11a5ed91e93e3bd3a82737c6eaac0fe695.
This historical-runtime binary is test output, not a current-runtime publication.

X11-toolkit builds ICE, SM, Xt, Xmu and Xrandr using a subset of the historical
x11-apps compiler/archive commands. Headers already owned by x11-server are not
republished. It does not build xterm/Xft or claim that full x11-apps acceptance.
Real twm 1.0.13.1 is the window manager. Its config includes an optional xterm
menu entry; xterm is not currently in this catalog. Source licenses are installed
in each package-owned share/licenses subtree.

Current-runtime twm/X11 guest acceptance, public catalog publication, public
binary install and independent final review remain pending. No deployment claim.

Current-runtime fixture acceptance completed on runtime 2a9cca447a35af0d0d8894ea4b50cb254ce20821753af8ae70a1ad5060da2a0f:
X11, toolkit and real twm built entirely in the guest; two independent Xlib
connections received decorated frames, browser pointer drag moved a frame, and
clients progressed with the terminal VT selected. Log: /tmp/wasm-posix-x11-twm.log.
The reviewer found historical twm used shared /tmp/twm-build; the recipe now
redirects object files into its private source/objects directory. Recording-compiler
regression passed; public acceptance seeds a poison object at the old path.
Historical source archive bytes are unchanged. Public mode uses the published
catalog and immutable inputs, and will be executed after publication approval.

## Public acceptance completed

Independent reviewer 01a123e0-2fb3-7521-9fa3-e936e0997405 approved exact package
tip d68be1f751090a2fdaaff3f9040ac76cbb3d188a, which was pushed to public main.
Author then executed:

- Fresh public pinned jsmn binary install and reload: PASS, browser job
  91b48d6e-508a-4e8e-93f9-a47a200ce02a, /tmp/wasm-posix-public-binary.log.
- PUBLIC_PACKAGE_TEST=1 tests/x11-runtime.mjs: PASS, browser job
  be2d7afa-6585-4420-8847-7e62b98e21a5, /tmp/wasm-posix-public-x11.log.
  Fresh guest discovered published catalog, downloaded immutable public inputs,
  compiled and installed X11 server/toolkit/twm, ignored planted
  /tmp/twm-build/stale.o, then passed TWM-DECORATED, TWM-MOVED,
  TWM-HIDDEN-PROGRESS-PASS and X11-TWM-RUNTIME-PASS.
  Exported X11 tar was 25956864 bytes, SHA256
  9cc9c7c53dd4996540f3871b561716a268289ed6ff8eca7611d10aa456b58558.
  This X11 export is test output, not a published binary package.

Both public tests used runtime
2a9cca447a35af0d0d8894ea4b50cb254ce20821753af8ae70a1ad5060da2a0f served locally
from the reviewed core dist. Actual production acceptance is recorded in core's
completion journal. No host compiler built these applications.
