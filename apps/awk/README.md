# GNU Awk

Source candidate from historical GNU Awk 5.4.1. The archive retains every
historical Git blob. The recipe retains its configure flags and generated-file
ordering, builds with one make worker, and requires the enabled upstream check
suite to pass without an expected-failure allowlist. Loadable extensions,
MPFR arithmetic and readline remain disabled.

Publishes gawk and the awk command alias, the Info manual, man page and GPL
license. Installed fixtures cover field aggregation, arrays, GNU asorti and
gensub plus the awk alias. Source, binary and public guest gates remain pending.
