#!/bin/sh
set -eu
links='-lSDL3 -lharfbuzz -lharfbuzz-runtime -lglib-2.0 -lpcre2-8 -lintl -liconv -lz -lfreetype -lm -lpthread'
cc source/port/check.c -I"$DESTDIR/include" -L"$DESTDIR/lib" -lSDL3_ttf $links -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib:/usr/local/lib" ./shared-test source/port/fonts/NotoSans-Regular.ttf
cc source/port/check.c -I"$DESTDIR/include" "$DESTDIR/lib/libSDL3_ttf.a" $links -o static-test
./static-test source/port/fonts/NotoSans-Regular.ttf
cc source/port/font-performance.c -I"$DESTDIR/include" -L"$DESTDIR/lib" -lSDL3_ttf $links -o font-performance
LD_LIBRARY_PATH="$DESTDIR/lib:/usr/local/lib" ./font-performance source/port/fonts/NotoSans-Regular.ttf > font-performance.log
cat font-performance.log
grep '^TTF-FONT-HASH ' font-performance.log > actual-hashes
cat > expected-hashes <<'EOF'
TTF-FONT-HASH 99 1 469 135 1717412826
TTF-FONT-HASH 99 128 469 135 3645098871
TTF-FONT-HASH 99 255 469 135 1661761607
TTF-FONT-HASH 100 1 474 137 3111033474
TTF-FONT-HASH 100 128 474 137 1174286984
TTF-FONT-HASH 100 255 474 137 4265778157
EOF
cmp expected-hashes actual-hashes
grep -F TTF-FONT-PIXELS-PASS font-performance.log
grep -F TTF-FONT-WARM font-performance.log
# Retain the historical median file-vs-memory font cost gate.
awk -F '[,:}]' '
/^TTF-FONT-BENCH / {
 mode=$2; gsub(/"/, "", mode)
 cost=$8+$10
 if (mode=="file") file[++nf]=cost
 else if (mode=="memory") memory[++nm]=cost
 else exit 1
}
END {
 if(nf!=7 || nm!=7) exit 1
 for(i=1;i<=7;i++) for(j=i+1;j<=7;j++) {
  if(file[i]>file[j]) {t=file[i];file[i]=file[j];file[j]=t}
  if(memory[i]>memory[j]) {t=memory[i];memory[i]=memory[j];memory[j]=t}
 }
 limit=14*memory[4]; if(limit<2) limit=2
 if(file[4]>limit) exit 1
}' font-performance.log
echo SDL3-TTF-PACKAGE-PASS
