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
