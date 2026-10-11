# sdl3-mixer

Unpublished historical library candidate using core-owned SDL3 via the sdl3-vt
platform feature. Original wrappers and configuration preserved.
Retained static/shared tests cover deterministic offline mixing, track state,
gain/seek/pause, WAV/Ogg/MP3/FLAC decoding and missing-file errors. Browser
WebAudio PCM delivery from the retained hello example remains required before
publication; offline tests alone do not establish audible playback.
Guest build, fresh binary/relink/reload and publication acceptance pending.

Core platform SDL symbols are supplied by libc. The package adapter omits the
historical standalone -lSDL3 link flag and sdl3 pkg-config requirement; the
original helper sources and consumer checks remain unchanged. Required core
SDL features remain declared in recipe metadata.
