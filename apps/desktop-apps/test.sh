#!/bin/sh
set -eu
# Payload validation is performed by gucman; interactive acceptance is separate.
test -x /usr/local/bin/desktop-menu
test -x /usr/local/bin/xterm
echo DESKTOP-APPS-STAGED
