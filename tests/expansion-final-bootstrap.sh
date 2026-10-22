set -eu
gucman repo remove groundupcoder
gucman repo add expansion https://packages.test/catalog.json
gucman install expansion:x11-widgets
echo FINAL-DEPENDENCY-INSTALL-PASS
