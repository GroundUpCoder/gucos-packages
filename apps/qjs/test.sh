#!/bin/sh
set -eu
qjs_binary="$DESTDIR/bin/qjs"
qjs() { "$qjs_binary" "$@"; }
cat > /tmp/closure.js <<'EOF'
function counter(n) { return delta => n += delta; }
const c = counter(10);
if(c(2)!==12 || c(30)!==42) throw Error('closure state');
if(JSON.stringify([1,2,3].map(x=>x*x))!=='[1,4,9]') throw Error('array map');
print('QJS-CLOSURE-42');
EOF
qjs /tmp/closure.js > /tmp/qjs-output
grep '^QJS-CLOSURE-42$' /tmp/qjs-output

cd source/port/upstream-tests
for test in test_closure test_language test_builtin test_loop test_bigint test_std test_worker; do
  echo "QJS-UPSTREAM: $test"
  qjs --std "$test.js"
done
qjs --std -e 'const f=std.open("/tmp/qjs-io.txt","w"); if(!f) throw Error("open"); f.puts("qjs-file\n"); f.close();'
test "$(cat /tmp/qjs-io.txt)" = qjs-file
if qjs -e 'throw Error("intentional rejection")' > /tmp/qjs-negative 2>&1; then
  echo 'qjs accepted a throwing program'
  exit 1
fi
grep 'intentional rejection' /tmp/qjs-negative
echo QJS-ACCEPTANCE-PASS
