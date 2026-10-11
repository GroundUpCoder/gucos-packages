# CPython source attempt 1: subprocess consumer failure

The guest compiled the interpreter, generated the expected sysconfig basename,
and passed smoke and atomic-width checks. The staged subprocess consumer ran
16 tests, with one error in test_cwd_environment_and_path: the temporary
spawn-python symlink launched under PATH=. and changed cwd returned status 1.
The other 15 subprocess tests passed. Captured child stderr is not included in
the raised CalledProcessError report, so the cause remains unknown.

The source-build gate failed and no package export/acceptance is claimed.
Preserve the failed profile and logs. A diagnostic retry must retain child
stdout/stderr and the original test assertions; do not skip the failing case
or assume a path-resolution or core defect without further evidence.
