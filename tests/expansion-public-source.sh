set -eu
gucman install groundupcoder:x11-widgets
gucman build groundupcoder:jwm
gucman build groundupcoder:lua
jwm -v
lua -e 'local ok=pcall(function()error("expected")end);assert(not ok);print("PUBLIC-SOURCE-PASS")'
