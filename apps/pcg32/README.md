# PCG32 bounded scalar adapter SDK

Upstream70099ead is retained unchanged with Apache2.0 license and the original
samples/shuffle adapters. Version0.1.0-1 identifies this package adapter, not an
upstream release. It exports the two C adapter functions and a488-value checker;
it does not claim general guest C++ or SIMD support.

Fresh host preparation retains the pinned translator, real WASI SDK30 headers,
four seeds, O0/O2 agreement, published golden values and19 generated definitions.
Guest tests require all488 results under whole-program, object and installed
archive links with both compiler backends. The checker converts any failing
index to exit1 and prints the full index, avoiding exit-code truncation.
Source/binary/public acceptance is pending. This is a formerly noncatalog
workload, not a retroactive historical package publication.
