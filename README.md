# Patternly manual content publishing

The canonical pipeline is manual source → read-only validation → immutable track artifact → immutable release. Runtime applications import generated artifact bytes at build time; they never use this repository or a content HTTP endpoint at runtime.

Only `manual/source/` is repository content ingress. Moving or pasting any existing question into it is **MANUAL ONLY**.

Run `npm test` for architecture fixtures. Human authors use `npm run validate:track -- --track <trackId>`, then `npm run build:track -- --track <trackId>`. See `docs/manual-publishing-handoff.md` before adding manual source or emitting a release artifact.
