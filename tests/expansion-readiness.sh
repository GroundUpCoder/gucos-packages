set -eu
cat > /tmp/stall-x.c <<'C'
#include <sys/socket.h>
#include <sys/un.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <assert.h>
int main(void){int s=socket(AF_UNIX,SOCK_STREAM,0);assert(s>=0);struct sockaddr_un a={0};a.sun_family=AF_UNIX;strcpy(a.sun_path,"/tmp/.X11-unix/X63");unlink(a.sun_path);assert(!bind(s,(void*)&a,sizeof a));assert(!listen(s,1));FILE*f=fopen("/tmp/stall-x-ready","w");assert(f);fclose(f);int c=accept(s,0,0);assert(c>=0);char data[12];read(c,data,sizeof data);for(;;)sleep(30);}
C
cc /tmp/stall-x.c -o /tmp/stall-x
mkdir -p /tmp/.X11-unix
rm -f /tmp/stall-x-ready
/tmp/stall-x &
server=$!
trap 'kill "$server" 2>/dev/null; wait "$server" 2>/dev/null' EXIT
count=0
while [ ! -f /tmp/stall-x-ready ]; do count=$((count+1)); test "$count" -lt 50; sleep 0.1; done
start=$(date +%s)
if DISPLAY=:63 /usr/local/libexec/jwm/wait-display; then exit 1; fi
elapsed=$(($(date +%s)-start))
test "$elapsed" -ge 10
test "$elapsed" -lt 22
echo JWM-READINESS-BOUNDED-PASS
kill "$server"
wait "$server" || true
trap - EXIT
