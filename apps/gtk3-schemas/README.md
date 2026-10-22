# GTK3 schemas

Unpublished schema/data package, not a separately compiled application. The
recipe compiles the retained GIO schema compiler as a temporary build tool, then
compiles the four original GTK settings schemas. It publishes XML, schema cache
and provenance/license documents only. Exact source archives remain pinned.
The retained GSettings consumer is prepared; actual guest acceptance is pending.

An additional consumer loads all four schema IDs from the staged cache and
checks every key default against its declared GVariant type.
