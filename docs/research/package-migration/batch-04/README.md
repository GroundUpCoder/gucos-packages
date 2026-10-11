# Graphics foundation migration acceptance

The first source run built and installed Pixman, libpng and FreeType, then
Fontconfig was rejected for an etc/fonts output outside allowed package prefixes.
The stage aborted before exporting its successful predecessors.

The corrected frozen run copied only that task-owned closed private profile,
using the same origin/runtime. Fontconfig installed config under share/fontconfig;
it and x11-shared and Cairo built/tested/installed/exported successfully. A separate
build stage for the earlier three reused their same-input installed builds and
exported them. Original archive bytes are unchanged; no source rebuild is claimed
for those skipped predecessors in the corrected run.

Installed functional checks found both packaged fonts and rendered FreeType text
through Cairo Xlib, verifying767 changed glyph pixels and X extension negotiation.
Fresh binary installation, installed static/shared consumer relinks, installed
font/X-extension/Cairo rendering checks and reload integrity passed in a new
private profile. Independent artifact/publication review and public-live
acceptance remain pending.
