#!/bin/sh
set -eu
cat > consumer.c <<'C'
#include <ft2build.h>
#include FT_FREETYPE_H
int main(void) {
 FT_Library lib; FT_Face face;
 if(FT_Init_FreeType(&lib)) return 1;
 if(FT_New_Face(lib,"source/port/fonts/ABeeZee-Regular.ttf",0,&face)) return 2;
 if(FT_Set_Pixel_Sizes(face,0,24) || FT_Load_Char(face,'A',FT_LOAD_RENDER)) return 3;
 if(!face->glyph->bitmap.width || !face->glyph->bitmap.rows) return 4;
 FT_Done_Face(face); FT_Done_FreeType(lib); return 0;
}
C
cc consumer.c -I"$DESTDIR/include/freetype2" "$DESTDIR/lib/libfreetype.a" -lm -o freetype-static-test
./freetype-static-test
cc consumer.c -I"$DESTDIR/include/freetype2" -L"$DESTDIR/lib" -lfreetype -lm -o freetype-shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./freetype-shared-test
