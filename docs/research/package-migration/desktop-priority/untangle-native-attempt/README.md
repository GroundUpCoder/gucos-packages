# Untangle native repeat-drag failure

The first drag changed the board and undo exactly restored the initial board. The repeat drag reached a different committed vertex position, so the exact repeat oracle correctly failed before save/load. Independent source and screenshot diagnosis found the first committed position near motion step seven of eight; Untangle releases commit the last processed motion rather than the release coordinate. This supports a timing explanation but does not prove the precise event-delivery cause.

Candidate correction d49e5ff paces physical motion, holds at the endpoint before release, retains held-state observations and preserves every exact undo/repeat/save/load/reload oracle. Retry and independent review are required.
