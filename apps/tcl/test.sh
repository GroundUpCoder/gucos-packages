#!/bin/sh
set -eu
tcl_binary="$DESTDIR/bin/tclsh8.6"
export TCL_LIBRARY="$DESTDIR/lib/tcl8.6"
test_sources="$PWD/source/tests"
mkdir -p /tmp/migration-tcl
cd /tmp/migration-tcl
cat > smoke.tcl <<'TCL'
proc check {actual expected} {if {$actual ne $expected} {error "expected <$expected>, got <$actual>"}}
check [expr {6*7}] 42
check [expr {2**100}] 1267650600228229401496703205376
check [lsort -integer {7 2 19 -1}] {-1 2 7 19}
check [dict get [dict create a 7 b 9] b] 9
check [regexp {^([a-z]+)([0-9]+)$} hello42] 1
set f [open payload.bin wb]
fconfigure $f -translation binary
puts -nonewline $f [binary format H* 0001ff807f]
close $f
set f [open payload.bin rb]
fconfigure $f -translation binary
check [binary encode hex [read $f]] 0001ff807f
close $f
check [zlib decompress [zlib compress {hello hello hello}]] {hello hello hello}
set done 0
after 10 {set done 1}
vwait done
check $done 1
check [exec /bin/busybox echo child-ok] child-ok
if {![catch {exec /missing-tcl-command}]} {error "missing executable accepted"}
check [lindex $errorCode 1] ENOENT
check [exec /bin/busybox cat << {pipe input}] {pipe input}
check [exec /bin/busybox printf abc | /bin/busybox tr a-z A-Z] ABC
exec /bin/busybox echo redirected > redirected.txt
set f [open redirected.txt r]
check [string trim [read $f]] redirected
close $f
if {![catch {exec /bin/ash -c {exit 7}}]} {error "child failure accepted"}
check [lindex $errorCode 0] CHILDSTATUS
check [lindex $errorCode 2] 7
puts TCL-SMOKE-PASS
TCL
"$tcl_binary" smoke.tcl
"$tcl_binary" "$test_sources/all.tcl" -singleproc 1 -file 'expr.test list.test string.test dict.test' > upstream.log 2>&1
cat upstream.log
grep -E 'Total[[:space:]]+[0-9]+[[:space:]]+Passed[[:space:]]+[0-9]+[[:space:]]+Skipped[[:space:]]+[0-9]+[[:space:]]+Failed[[:space:]]+0' upstream.log
if grep -E 'Failed[[:space:]]+[1-9][0-9]*' upstream.log; then exit 1; fi
cat > consumer.c <<'C'
#include <tcl.h>
#include <assert.h>
#include <string.h>
int main(void) { Tcl_FindExecutable("/usr/local/bin/tclsh8.6"); Tcl_Interp *i=Tcl_CreateInterp(); assert(i); assert(Tcl_Init(i)==TCL_OK); assert(Tcl_Eval(i,"expr {6*7}")==TCL_OK); assert(!strcmp(Tcl_GetStringResult(i),"42")); Tcl_DeleteInterp(i); Tcl_Finalize(); return 0; }
C
cc --enable-fork -I"$DESTDIR/include/tcl8.6" consumer.c "$DESTDIR/lib/libtcl8.6.a" -lm -o consumer
./consumer
echo TCL-PACKAGE-PASS
