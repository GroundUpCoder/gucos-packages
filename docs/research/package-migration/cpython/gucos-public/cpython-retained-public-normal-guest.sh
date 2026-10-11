set -eu
cd /
test ! -e '/usr/local/lib/python3.14/site-packages/cpython-retained-public.pth'
test ! -L '/usr/local/lib/python3.14/site-packages/cpython-retained-public.pth'
/usr/local/bin/python3.14 -I -B '/home/user/cpython-retained-public/probe.py' '/home/user/cpython-retained-public' excluded
# Only the attempt-owned .pth is temporary. Retained binary/data never change.
owned_pth=
cleanup() { if test "$owned_pth" = yes; then rm -f '/usr/local/lib/python3.14/site-packages/cpython-retained-public.pth'; fi; }
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
set -C
printf '%s\n' '/home/user/cpython-retained-public/site' > '/usr/local/lib/python3.14/site-packages/cpython-retained-public.pth'
owned_pth=yes
set +C
printf '80655661db145052d4bf9102d5a3a84fbbd0103e8aa11d64e851b8a70bf5791a  /usr/local/lib/python3.14/site-packages/cpython-retained-public.pth\n' | sha256sum -c -
/usr/local/bin/python3.14 -I -B '/home/user/cpython-retained-public/probe.py' '/home/user/cpython-retained-public' 'normal'
/usr/local/bin/python3.14 -I -B -S '/home/user/cpython-retained-public/probe.py' '/home/user/cpython-retained-public' excluded
rm '/usr/local/lib/python3.14/site-packages/cpython-retained-public.pth'
owned_pth=
trap - EXIT HUP INT TERM
test ! -e '/usr/local/lib/python3.14/site-packages/cpython-retained-public.pth'
test ! -L '/usr/local/lib/python3.14/site-packages/cpython-retained-public.pth'
/usr/local/bin/python3.14 -I -B '/home/user/cpython-retained-public/probe.py' '/home/user/cpython-retained-public' excluded
echo CPYTHON-RETAINED-PTH-CLEANUP-PASS
