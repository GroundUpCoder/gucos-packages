# Imlib2

Unpublished historical 1.6.1 profile, preserving the exact tracked source and
ximage/grab overlays from the commit in provenance.json. The recipe builds the
shared image library and nine dynamic image loaders. Dependencies use the owned
X11 library provider, FreeType, PNG and JPEG packages; no toolkit is required.

The new headless consumer derives its operations and thresholds from the retained
source/tests/consumer.c: PNG exact roundtrip, 4x4 to 16x16 scaling, JPEG roundtrip
and missing-file failure. It points loader discovery at the staged payload.
No execution has run. The original consumer remains intact in source.tar and its
X11 rendering/pixel checks must run separately before publication acceptance.
