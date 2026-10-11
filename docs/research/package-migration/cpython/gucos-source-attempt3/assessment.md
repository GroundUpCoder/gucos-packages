# Instrumented CPython source attempt 3

The full subprocess suite again failed the first PATH-dot child launch; the
other fifteen tests passed. The diagnostic records PATH as a present single
dot and cwd as the expected temporary directory. The candidate passed to the
original stat predicate is `.spawn-python`, lacking the separator expected in
`./spawn-python`. Both original and absolute-spelling stat probes return
ENOENT; readlink also returns ENOENT. Executable selection remains empty and
initialization fails importing encodings. These are observed diagnostic values;
the source of malformed candidate construction still requires analysis.

No fallback, PATH rewrite or stdlib seeding was performed. No export or
installed/reload/public acceptance is claimed. Earlier attempts remain intact.
