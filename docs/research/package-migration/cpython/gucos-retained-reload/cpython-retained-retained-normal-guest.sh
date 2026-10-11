set -eu
cd /
test ! -e '/usr/local/lib/python3.14/site-packages/cpython-retained-retained.pth'
test ! -L '/usr/local/lib/python3.14/site-packages/cpython-retained-retained.pth'
/usr/local/bin/python3.14 -I -B '/home/user/cpython-retained-retained/probe.py' '/home/user/cpython-retained-retained' excluded
# Only the attempt-owned .pth is temporary. Retained binary/data never change.
owned_pth=
cleanup() { if test "$owned_pth" = yes; then rm -f '/usr/local/lib/python3.14/site-packages/cpython-retained-retained.pth'; fi; }
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
set -C
printf '%s\n' '/home/user/cpython-retained-retained/site' > '/usr/local/lib/python3.14/site-packages/cpython-retained-retained.pth'
owned_pth=yes
set +C
printf 'eef5e567071343055e58de5d8add9d0dd93afa7c9f2e231301643b6af7ec09d1  /usr/local/lib/python3.14/site-packages/cpython-retained-retained.pth\n' | sha256sum -c -
/usr/local/bin/python3.14 -I -B '/home/user/cpython-retained-retained/probe.py' '/home/user/cpython-retained-retained' 'normal'
/usr/local/bin/python3.14 -I -B -S '/home/user/cpython-retained-retained/probe.py' '/home/user/cpython-retained-retained' excluded
rm '/usr/local/lib/python3.14/site-packages/cpython-retained-retained.pth'
owned_pth=
trap - EXIT HUP INT TERM
test ! -e '/usr/local/lib/python3.14/site-packages/cpython-retained-retained.pth'
test ! -L '/usr/local/lib/python3.14/site-packages/cpython-retained-retained.pth'
/usr/local/bin/python3.14 -I -B '/home/user/cpython-retained-retained/probe.py' '/home/user/cpython-retained-retained' excluded
echo CPYTHON-RETAINED-PTH-CLEANUP-PASS
