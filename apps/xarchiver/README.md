# Xarchiver

Unpublished 0.5.4.22 source candidate from the exact historical tree recorded in
provenance.json. The guest recipe compiles the 37 historical C translation units
with the migrated GTK3/X11 dependency closure. The launcher uses gtk3-x11-run and
the package owns its JWM desktop entry. The declared main-no-gnu-tar.c overlay disables unverified gtar/tar discovery;
tar-provider.patch records its exact diff. The source archive is unchanged.

The archive includes the original GPL text and all XDG MIME source notices.
The installed license directory also includes the historical GLib LGPL 2.1 text
and the XDG MIME source/header files, preserving their dual-license notices.

The source test checks staged files and GTK linkage only. Real menu launch,
archive operations, relaunch and browser reload remain pending. Archive formats
require external guest programs; their upstream UI entries are not a claim that
those providers or all formats work. This package does not provide compressors.

The initial functional gate targets single-file bzip2 with the exact declared
bzip2 dependency. Its row name derives from the .bz2 basename; listing alone is
not an integrity proof. Genuine GUI creation, explicit Test and exact extracted
bytes, normal quit/reopen and browser reload remain required. No TAR, ZIP or
other detected-format acceptance is claimed. Upstream alternative TAR providers
remain available if separately installed; core BusyBox tar is not selected.
