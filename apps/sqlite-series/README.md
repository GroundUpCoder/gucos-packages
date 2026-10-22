# SQLite generate_series extension

Previously noncatalog workload from historical tests/application-plugins.mjs.
Uses the exact retained SQLite3.53.1 series.c/header inputs and original shared
PIC compilation. Requires the separately accepted SQLite CLI. Retains aggregate,
step and repeated-load consumers, adds descending/empty bounds, and enables
.bail to make load/SQL failures fatal. Installs the original public-domain
source notice alongside the module. Fresh source/binary/public gates pending.
