# Installed consumer attempt 1

Both binary installations passed. The installed LibFM consumer exited1 without
a diagnostic before its success markers. PCManFM consumer and desktop dependency
stages were not reached. Source tests contain early non-symlink and stat checks
that may conflict with gucman's managed installed symlinks; this is a source-level
lead, not yet a traced failing command. Preserve the original report/profile.
No installed, GUI, reload or public acceptance follows.
