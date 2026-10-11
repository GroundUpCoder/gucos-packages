# Xarchiver

Unpublished 0.5.4.22 source candidate from the exact historical tree recorded in
provenance.json. The guest recipe compiles the 37 historical C translation units
with the migrated GTK3/X11 dependency closure. The launcher uses gtk3-x11-run and
the package owns its JWM desktop entry. No application source modifications.

The archive includes the original GPL text and all XDG MIME source notices.
The installed license directory also includes the historical GLib LGPL 2.1 text
and the XDG MIME source/header files, preserving their dual-license notices.

The source test checks staged files and GTK linkage only. Real menu launch,
archive operations, relaunch and browser reload remain pending. Archive formats
require external guest programs; their upstream UI entries are not a claim that
those providers or all formats work. This package does not provide compressors.
