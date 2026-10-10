set -eu
gucman build expansion:zstd
printf 'compression in the guest\n' > /tmp/input
zstd -q -f /tmp/input -o /tmp/data.zst
zstd -q -d -f /tmp/data.zst -o /tmp/output
cmp /tmp/input /tmp/output
zstd -t /tmp/data.zst
cat > /tmp/zstd-test.c <<'C'
#include <zstd.h>
#include <string.h>
int main(void){char a[128],b[128];const char*s="library round trip";size_t n=ZSTD_compress(a,sizeof a,s,strlen(s)+1,1);if(ZSTD_isError(n))return 1;size_t m=ZSTD_decompress(b,sizeof b,a,n);return ZSTD_isError(m)||strcmp(s,b);}
C
cc /tmp/zstd-test.c -I/usr/local/include -L/usr/local/lib -lzstd -o /tmp/zstd-test
/tmp/zstd-test
echo ZSTD-CLI-LIBRARY-PASS
dd if=/dev/zero of=/tmp/zeros bs=1024 count=1024
zstd -q -T2 -f /tmp/zeros -o /tmp/zeros.zst
zstd -q -d -f /tmp/zeros.zst -o /tmp/zeros.restored
cmp /tmp/zeros /tmp/zeros.restored
printf invalid > /tmp/invalid.zst
if zstd -q -d -f /tmp/invalid.zst -o /tmp/invalid.out; then exit 1; fi
echo ZSTD-THREADS-ERROR-PASS
