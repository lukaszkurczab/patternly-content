# Patternly manual content publishing

The canonical pipeline is manual source → read-only validation → immutable track artifact → immutable release. Runtime applications import generated artifact bytes at build time; they never use this repository or a content HTTP endpoint at runtime.

Legacy `tracks/` files are not pipeline ingress and are never scanned as a fallback. Moving or pasting any existing question into `manual/source/` is **MANUAL ONLY**.

Run `npm test` for architecture fixtures. Human authors use `npm run validate:track -- --track <trackId>`, then `npm run build:track -- --track <trackId>`. See `docs/manual-publishing-handoff.md` before adding any manual source or approval record.
