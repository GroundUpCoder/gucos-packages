#!/bin/sh
set -eu
cat > consumer.c <<'C'
#include <cjson/cJSON.h>
#include <stdlib.h>
#include <string.h>
int main(void) {
 cJSON *j=cJSON_Parse("{\"answer\":42,\"items\":[true,null,\"hello\"]}");
 if (!j) return 1;
 cJSON *a=cJSON_GetObjectItemCaseSensitive(j,"answer");
 if (!cJSON_IsNumber(a) || a->valueint != 42) return 2;
 cJSON *items=cJSON_GetObjectItemCaseSensitive(j,"items");
 if (!cJSON_IsArray(items) || cJSON_GetArraySize(items)!=3) return 3;
 char *s=cJSON_PrintUnformatted(j);
 if (!s || strcmp(s,"{\"answer\":42,\"items\":[true,null,\"hello\"]}")) return 4;
 cJSON_free(s); cJSON_Delete(j);
 if (cJSON_Parse("{bad")) return 5;
 return 0;
}
C
cc consumer.c -I"$DESTDIR/include" "$DESTDIR/lib/libcjson.a" -lm -o cjson-static-test
./cjson-static-test
cc consumer.c -I"$DESTDIR/include" -L"$DESTDIR/lib" -lcjson -lm -o cjson-shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./cjson-shared-test
echo CJSON-CONSUMERS-PASS
