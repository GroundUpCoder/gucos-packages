#!/bin/sh
set -eu
rm -f /tmp/migration-sqlite.db /tmp/migration-sqlite.db-journal
sqlite3() { "$DESTDIR/bin/sqlite3" "$@"; }
cat > /tmp/query.sql <<'EOF'
CREATE TABLE item (id INTEGER PRIMARY KEY, label TEXT, value INTEGER);
INSERT INTO item VALUES (1,'alpha',7),(2,'beta',14),(3,'gamma',21);
BEGIN;
UPDATE item SET value=99 WHERE id=1;
ROLLBACK;
SELECT count(*),sum(value),group_concat(label,':') FROM item;
EOF
sqlite3 /tmp/migration-sqlite.db < /tmp/query.sql > /tmp/sqlite-output
test "$(cat /tmp/sqlite-output)" = '3|42|alpha:beta:gamma'
sqlite3 /tmp/migration-sqlite.db 'SELECT value FROM item WHERE id=2;' > /tmp/sqlite-reopened
test "$(cat /tmp/sqlite-reopened)" = 14

test "$(sqlite3 /tmp/migration-sqlite.db 'PRAGMA journal_mode=WAL;')" = delete
sqlite3 /tmp/migration-sqlite.db 'CREATE TABLE payload(id INTEGER PRIMARY KEY, data BLOB); WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<1024) INSERT INTO payload SELECT x,zeroblob(1024) FROM n;'
test "$(sqlite3 /tmp/migration-sqlite.db 'SELECT count(*),sum(length(data)) FROM payload; PRAGMA integrity_check;')" = '1024|1048576
ok'
if sqlite3 /tmp/migration-sqlite.db 'INSERT INTO item VALUES(1,"duplicate",0);' > /tmp/sqlite-error 2>&1; then
  echo 'sqlite3 accepted a duplicate primary key'
  exit 1
fi
grep 'UNIQUE constraint failed' /tmp/sqlite-error
echo SQLITE3-ACCEPTANCE-PASS
