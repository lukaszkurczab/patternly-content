# Manual Algorithms ingress

Paste manually authored JSON source batches here. The builder reads only `.json` files in this directory, sorted by relative path. It never reads `tracks/algorithms` as a fallback.

Every batch must satisfy `schemas/publishing/manual-source.schema.json`; it must carry its own provenance, content/taxonomy versions, declared modes, groups, and items. This directory intentionally contains no question bank.
