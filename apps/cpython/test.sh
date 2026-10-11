#!/bin/sh
set -eu
# Inputs are supplied by the source recipe or the frozen installed consumer.
src="$PWD/source"
diagnostic="$PWD/subprocess-diagnostic.py"
printf '%s  source/port/subprocess-smoke.py\n' 4c478ccdbc535da62c0709d51143b23ee7944d6e03a0dcc094a300c771e78bdf | sha256sum -c -
python="$DESTDIR/bin/python3.14"
work=$(mktemp -d /tmp/cpython-consumer.XXXXXX)
test -s "$DESTDIR/share/licenses/cpython/LICENSE"
cc -static -I"$DESTDIR/include/python3.14/cpython" -I"$src/Python" "$src/port/atomic-smoke.c" -o "$work/atomic-smoke"
"$work/atomic-smoke"
cd "$work"
"$python" "$src/port/smoke.py"
"$python" "$diagnostic"
"$python" "$src/port/benchmark.py"
"$python" "$src/port/benchmark-checked.py"
"$python" -c 'import os,sys,sysconfig,zlib; assert sys.implementation.name == "cpython"; assert sys.prefix == sys.exec_prefix; assert os.path.isfile(sysconfig.get_makefile_filename()); assert zlib.decompress(zlib.compress(b"installed Python")) == b"installed Python"; assert "--enable-fork" not in sysconfig.get_config_var("LDSHARED"); print("CPYTHON-LAYOUT-PASS",sys.executable,sys.prefix,sysconfig.get_config_var("LDSHARED"))'
cc -shared -fPIC -I"$DESTDIR/include/python3.14" -D__unix__ -D__inline=inline -D_POSIX_THREADS=200809L -Dthread_local=_Thread_local -D__USE_SYSTEM_ENDIAN_H__=1 "$src/Modules/xxlimited.c" -o "$work/xxlimited.so"
"$python" -c 'import xxlimited; assert xxlimited.foo(20,22) == 42; x=xxlimited.new(); x.answer=42; assert x.answer == 42; assert len(memoryview(x)) == 10; print("CPYTHON-EXTENSION-PASS",xxlimited.__file__)'
if test "$DESTDIR" = /usr/local; then
 # Persistent fixture owned by this test directory, linked by a temporary .pth.
 # Refuse to overwrite another consumer's path; remove the .pth on every exit.
 site=/usr/local/lib/python3.14/site-packages
 mkdir -p "$site" "$work/site"
 pth="$site/$(basename "$work").pth"
 test ! -e "$pth"
 trap 'rm -f "$pth"' EXIT
 trap 'exit 1' HUP INT TERM
 cp "$work/xxlimited.so" "$work/site/xxlimited.so"
 printf '%s\n' 'answer = 42' > "$work/site/cpython_site_probe.py"
 printf '%s\n' "$work/site" > "$pth"
 cd /
 "$python" -I -c 'import cpython_site_probe,xxlimited; assert cpython_site_probe.answer == 42; assert xxlimited.foo(20,22) == 42; print("CPYTHON-PUBLIC-SITE-PASS",xxlimited.__file__)'
 "$python" -I -S -c 'import sys; assert not any("site-packages" in p for p in sys.path); import importlib.util; assert importlib.util.find_spec("cpython_site_probe") is None'
 python3 -I -c 'import sys; assert sys.version_info[:3] == (3,14,7)'
 cpython -I -c 'import sys; assert sys.implementation.name == "cpython"'
 rm "$pth"
 trap - EXIT HUP INT TERM
else
 echo CPYTHON-INSTALLED-PUBLIC-SITE-PENDING
fi
printf 'CPYTHON-CONSUMER-PASS evidence=%s\n' "$work"
