#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
cd source
mkdir -p "$stage/lib" "$stage/include/SDL3_mixer" "$stage/lib/pkgconfig" "$stage/objects"
objects=
for unit in SDL_mixer SDL_mixer_metadata_tags SDL_mixer_spatialization decoder_raw decoder_sinewave decoder_wav decoder_stb_vorbis decoder_drmp3 decoder_drflac; do
 cc -Iupstream/include -DDECODER_WAV -DDECODER_OGGVORBIS_STB -DDECODER_MP3_DRMP3 -DDECODER_FLAC_DRFLAC -DSDL_MIXER_FORCE_SCALAR_FALLBACK=1 -c "port/wrappers/$unit.c" -o "$stage/objects/$unit.o"
 objects="$objects $stage/objects/$unit.o"
done
ar rcs "$stage/lib/libSDL3_mixer.a" $objects
cc -shared $objects -lm -lpthread -Wl,-soname,libSDL3_mixer.so -o "$stage/lib/libSDL3_mixer.so"
cp upstream/include/SDL3_mixer/*.h "$stage/include/SDL3_mixer/"
sed '/^Requires: sdl3$/d' port/sdl3-mixer.pc > "$stage/lib/pkgconfig/sdl3-mixer.pc"
rm -r "$stage/objects"

mkdir -p "$stage/share/licenses/sdl3-mixer"
cp upstream/LICENSE.txt "$stage/share/licenses/sdl3-mixer/LICENSE.txt"
