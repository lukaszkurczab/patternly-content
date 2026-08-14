# Manual Coding Interview ingress

Paste manually authored JSON source batches here. This directory currently contains the canonical Coding Interview question bank: 213 real JSON source batches with verified content. The builder reads only `.json` files in this directory, sorted by relative path. It never reads `tracks/coding_interview` as a fallback.

Every batch must satisfy `schemas/publishing/coding-interview-manual-source.schema.json`; it carries its own provenance, content/taxonomy versions, declared modes, mode structures, and items. Existing files and bytes are preserved by the multi-family authoring gate.
