# sdl3-image

Unpublished historical library candidate using core-owned SDL3 via the sdl3-vt
platform feature. Original wrappers and configuration preserved.
Retained static/shared tests cover PNG/JPEG/BMP load/save, file/memory IO,
alpha pixels, malformed inputs and unsupported SVG/animation errors. Independent
PNG pixel decoding remains required in browser acceptance.
Guest build, fresh binary/relink/reload and publication acceptance pending.

Core platform SDL symbols are supplied by libc. The package adapter omits the
historical standalone -lSDL3 link flag and sdl3 pkg-config requirement; the
original helper sources and consumer checks remain unchanged. Required core
SDL features remain declared in recipe metadata.
