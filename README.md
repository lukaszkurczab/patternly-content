# Patternly manual content publishing and authoring

The canonical flow is family-specific manual source → read-only validation → human review → immutable track artifact → immutable release. Authoring readiness is a planning gate; it is separate from human approval, runtime publication, and release activation. Runtime applications import generated artifact bytes at build time; they never use this repository or a content HTTP endpoint at runtime.

Only `manual/source/<trackId>/` is learner-item ingress. Certification and Design Interview future source files use `manual/source/<trackId>/<nodeId>/<learningBlockId>.json`; Coding Interview keeps its existing source layout. Generated manifests and authoring briefs live in evidence and sidecar paths, never as learner source. Empty or placeholder JSON is forbidden.

Run `npm test` for architecture fixtures. Run `npm run authoring:validate` to validate the registry, contracts, current catalogue, slot mapping, and existing Coding source. `npm run authoring:plan` writes the deterministic manifest; `npm run authoring:scaffold` is dry-run by default and requires `--write` to create only README and `.authoring.md` planning files. See `docs/manual-publishing-handoff.md` before adding manual source or emitting a release artifact.

The current three authoring families are `coding_interview`, `certification`, and `design_interview`. Certification and Design source schemas are authoring contracts only; they do not create runtime registrations or claim unsupported case, simulation, package, or release behavior. Every authored batch remains unapproved until a human technical/editorial review record exists.
