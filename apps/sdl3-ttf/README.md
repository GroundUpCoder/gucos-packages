# SDL3_ttf

Unpublished historical software-text port. Core supplies SDL; public package
requirements describe FreeType and full HarfBuzz, preserving the original SSE2
flag and disabling MiniHB/PlutoSVG. Tests retain static/shared text consumers,
six exact historical pixel hashes and fourteen timing samples with the median
file/memory cost bound. This does not add GPU text or change VT ownership.
Guest build and fresh binary/relink/reload/public gates remain pending; HarfBuzz
translation reproducibility limitation applies to its dependency unchanged.

Core platform SDL symbols are supplied by libc. The package adapter omits the
historical standalone -lSDL3 link flag and sdl3 pkg-config requirement; the
original helper sources and consumer checks remain unchanged. Required core
SDL features remain declared in recipe metadata.
