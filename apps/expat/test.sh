#!/bin/sh
set -eu
cat > consumer.c <<'C'
#include <expat.h>
#include <string.h>
static int count;
static void start(void *context, const XML_Char *name, const XML_Char **attrs) {
 (void)context; (void)attrs;
 if (!strcmp(name,"item")) ++count;
}
int main(void) {
 XML_Parser p=XML_ParserCreate(0);
 if(!p) return 1;
 XML_SetElementHandler(p,start,0);
 const char *xml="<root><item/><item>text</item></root>";
 int ok=XML_Parse(p,xml,(int)strlen(xml),1)==XML_STATUS_OK && count==2;
 XML_ParserFree(p);
 if(!ok) return 2;
 p=XML_ParserCreate(0);
 if(!p) return 3;
 ok=XML_Parse(p,"<bad>",5,1)==XML_STATUS_ERROR;
 XML_ParserFree(p);
 return ok?0:4;
}
C
cc consumer.c -I"$DESTDIR/include" "$DESTDIR/lib/libexpat.a" -lm -o expat-static-test
./expat-static-test
cc consumer.c -I"$DESTDIR/include" -L"$DESTDIR/lib" -lexpat -lm -o expat-shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./expat-shared-test
echo EXPAT-CONSUMERS-PASS
