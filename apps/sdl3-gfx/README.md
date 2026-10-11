# SDL3_gfx

Unpublished surface-primitive library candidate from the historical pygame fork.
Core owns the SDL3-compatible shim; this package declares the sdl3-vt platform
feature rather than republishing SDL or changing its VT policy. Tests retain
static/shared drawing, clipping, palette, alpha checks and ten positive timing
samples. Timing records do not imply a performance guarantee. No X or GPU
broker is introduced. Guest build/binary/relink/reload/public acceptance pending.

Core platform SDL symbols are supplied by libc. The package adapter omits the
historical standalone -lSDL3 link flag and sdl3 pkg-config requirement; the
original helper sources and consumer checks remain unchanged. Required core
SDL features remain declared in recipe metadata.
