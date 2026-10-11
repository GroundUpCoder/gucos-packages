set -eu
gucman repo remove groundupcoder || true
gucman repo remove expansion || true
gucman repo add expansion https://packages.test/catalog.json
gucman install expansion:x11-server
gucman build expansion:x11-toolkit
echo EXPANSION-DEPENDENCIES-PASS
