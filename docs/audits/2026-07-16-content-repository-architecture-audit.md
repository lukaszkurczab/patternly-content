# CONTENT-ARCH-AUDIT-01 — manual content publishing architecture

**Repository:** `lukaszkurczab/patternly-content`  
**Audited branch:** `master`  
**Input SHA:** `ec562888170d41456dd9a1576ac71543f4bc7e5c`  
**Audit date:** 2026-07-16  
**Scope:** architecture only. No question wording, options, answers, feedback, content-owned taxonomy mapping, approval decision, item activation, or publication subset was inspected or changed.

## Decision and boundary

This is the source and publishing repository. A human author owns question creation, correction, paste-in, and approval records. Tooling owns folder conventions, schemas, registry/configuration, validators, artifact building, deterministic reports, development tooling, and CI.

The target is a **manual, track-scoped, immutable** publishing pipeline. The mobile application consumes only build-time generated artifact bytes. It must not fetch this repository, its dev server, or any content HTTP endpoint at runtime.

The current repository validates successfully, but this is not evidence that it satisfies the application consumer contract. It only proves the current v1 root/track/bank format is internally consistent.

## Confirmed repository map

| Path | Confirmed owner / behaviour |
| --- | --- |
| `manifest.json` | One v1 root manifest lists Algorithms and Cloud Certification together. |
| `tracks/<track>/banks/*.json` | Checked-in published bank bytes; no distinct manual source ingress or artifact-output boundary exists. |
| `tracks/<track>/manifest.json` | Per-track v1 pointer with content version, count, relative bank path, and SHA-256. |
| `schemas/*.schema.json` | JSON Schema files express shallow v1 envelopes but are not imported by the runtime validator. |
| `scripts/validate.mjs` | Canonical executable validator; reads root → track manifest → bank and contains family branches. |
| `scripts/publish.mjs` | Copies an arbitrary candidate bank into `tracks/<track>/banks`, changes the track manifest, then validates after rename. |
| `scripts/checksum.mjs` | SHA-256 helper over file bytes. |
| `scripts/serve.mjs` | Local HTTP file server for the whole repository root, default host `0.0.0.0`. |
| `tests/publication.test.mjs` | Two tests: whole publication validates and current manifest counts equal literal values. |
| `.github/` | Absent: no repository CI workflow is tracked. |

The file-level import graph is small and direct: `publish → validate + checksum`; `tests → validate`; `serve` is standalone. Schemas are orphaned from this executable graph. No production application module, package, generated app-import module, approval record, fixture directory, taxonomy configuration module, or CI configuration exists.

## Status audit

**Source documents reviewed:** `README.md` (current but limited to the legacy publishing flow).  
**Repository evidence reviewed:** manifests, all executable scripts, schemas, tests, tracked-file inventory, import search, `npm run validate`, and `npm test`.  
**Optional graph evidence:** none found; direct source inspection is the evidence base.

| Area | Status | Evidence / consequence |
| --- | --- | --- |
| Existing v1 publication validator and SHA-256 check | done | `npm run validate` passed at the input SHA. It validates the legacy root/track/bank format only. |
| Existing per-track physical bank layout | partial | Separate bank directories exist, but release, approvals, output, and app handoff are not track-scoped contracts. |
| Schema ownership | partial | Schema files exist but are not used by executable validation and lack consumer fields. |
| Manual publishing controls | partial | `publish.mjs` accepts a local candidate, but no manual ingress/approval/output boundary or rollback protection exists. |
| Runtime HTTP separation | blocking | The app contract forbids HTTP, while this repo still documents and provides a broad HTTP root server. |
| Approval coverage identity | blocking | No manual approval-record contract or coverage resolver exists. |
| Immutable app-consumable artifacts | planned | No artifact/release/export locations or builders exist. |
| Test fixture isolation and consumer compatibility | planned | Tests use production bytes; no mechanical fixture or joint contract test exists. |
| CI and drift controls | planned | `.github/` is absent. |
| Canonical taxonomy/mode requirements | unknown / needs evidence | This repo has no explicit owner/configuration; the product owner must provide identities and 10/20/40 requirements. |

No completed work is removed from an active plan because this repository had no existing plan, backlog, acceptance packet, or execution report. The legacy README claim of immutable publication is only **partial** evidence: filename collision protection exists, but the publication transaction and release assembly do not enforce the required immutable artifact model.

## Architecture findings

All items below are architecture findings. `MANUAL ONLY` means an implementation may expose a failed contract but must not change the named question data to make it pass.

| ID | Path / symbol | Confirmed behaviour | Contract mismatch | Required architecture change | Questions | Required tests | Dependency / blocker |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A-01 | `manifest.json`; `scripts/validate.mjs#validatePublication` | The root manifest is the only release index and contains both tracks. | It is not the versioned consumer release envelope and encourages a global release gate. | Add a typed release registry with `envelopeVersion`, release identity/source commit, and independently addressable track artifact references. A missing Certification reference must not invalidate Algorithms. | No | Mechanical one-valid/one-missing track projection; duplicate-reference rejection. | Consumer envelope must be frozen with the app contract. |
| A-02 | `schemas/root-manifest.schema.json`, `schemas/track-manifest.schema.json` | Schemas define only v1 root/track fields and are not executed. | Missing `taxonomyVersion`, artifact schema identity, approval-coverage identity, declared modes, source commit, and exact artifact-byte checksum semantics. | Replace or supersede with one executable schema/type source for release, track reference, artifact envelope, and approval-coverage reference; validator imports it. | No | Unknown-field, version, source-commit, checksum, and approval-identity tests. | A-01. |
| A-03 | `tracks/algorithms/manifest.json`, `tracks/cloud-certification/manifest.json` | Track identity is local manifest data; taxonomy ownership is only implicit in bank payload fields. | No explicit family/track/taxonomy configuration owner or taxonomy version exists. | Introduce declarative `config/families`, `config/tracks`, and versioned taxonomy reference configuration. Validators verify references without editing mappings. | `MANUAL ONLY` if existing mappings fail | Valid/unknown track-family pair, valid/unknown taxonomy reference, version mismatch. | Product-owned taxonomy/version definitions. |
| A-04 | `scripts/validate.mjs#validateAlgorithms`, `#validateCertification`, `#responseIsValid` | One handwritten script branches by two literal track IDs and inspects every bank item. | Validation ownership is mixed with content shape handling; schemas are dead; no reusable artifact contract boundary exists. | Split structural envelope validator, track/family adapter registry, immutable-byte validator, approval-coverage validator, and mode-pool validator. Keep report output aggregate-only. | `MANUAL ONLY` for structural failures | Family adapter completeness, unsupported interaction, no unknown family/track, report determinism. | A-02 and A-03. |
| A-05 | `scripts/publish.mjs` | Any CLI candidate path is copied into a production bank path; manifest is renamed before `validatePublication()` completes. | No approved-source ingress, no pre-commit transaction, no approval linkage, and failure can leave changed bytes/manifest behind. | Replace with a builder that reads only canonical manual source ingress, validates before emission, writes a release into a new immutable output directory, and never edits an existing artifact. | No | Failed validation leaves no output; existing artifact write rejection; source path allow-list. | Approval record schema and A-08 output policy. |
| A-06 | `scripts/checksum.mjs`; track manifests | SHA-256 is calculated over a bank file only. | Consumer verifies exact encoded artifact bytes and needs per-track artifact reference checksums plus release provenance. | Hash the final encoded artifact bytes; emit the checksum in the track reference; verify by rereading output bytes. | No | Byte mutation checksum failure; deterministic byte/hash result. | A-02 and canonical JSON encoding rule. |
| A-07 | repository-wide | No approval-record location, schema, reference, or validation exists. | Consumer requires approval-coverage identity; tooling cannot prove coverage without inventing approvals. | Add manual approval-record ingress schema and a coverage resolver that only verifies explicitly supplied records. Never create records or infer approval from content. | No | Missing approval, duplicate approval identity, incomplete item identity coverage. | Human-owned approval policy. |
| A-08 | `tracks/*/banks`; no `artifacts/` or `exports/` | Source-like banks and published files share one tracked location. | Generated immutable output, manual ingress, and application build input are indistinguishable; drift cannot be detected. | Add separate manual source, approval, generated artifact, release, and app-import export locations. Do not move existing banks in Prompt 03. | No | Generated-output cleanliness, source/output import boundary, byte-for-byte drift detection. | Build layout decision in this audit. |
| A-09 | `scripts/serve.mjs`, `README.md` | A server exposes arbitrary files below repository root on `0.0.0.0`, with `no-store`. | The application must not use runtime HTTP; serving the root is broader than artifact preview and creates a misleading path. | Restrict or remove the server from publishing; if retained, make it an explicit local artifact-preview tool bound to loopback and output-only. No application dependency. | No | Loopback-only/output-only route test; static application-boundary check belongs in app repo. | A-08. |
| A-10 | repository-wide | No app-facing generated release module or export contract exists. | App consumer accepts only a generated immutable bundle; current JSON manifests cannot be imported as that contract without an ad hoc bridge. | Builder emits a deterministic app-import artifact module from release output, or a deliberately versioned handoff package; the app imports only that output. | No | Export shape compatibility fixture against consumer contract; no `tests/` import in export graph. | Joint contract test with `gcp-ace-trainer`. |
| A-11 | `.github/` absent; `package.json` | Validation and tests run only by a developer command. | No protected reproducible build, no output/drift check, no CI evidence. | Add CI jobs for clean checkout, install, structural validation, mechanical contract tests, artifact build, and clean-tree/drift assertion. | No | CI command smoke test and generated-output drift failure. | A-05, A-08. |
| A-12 | `tests/publication.test.mjs` | Tests assert current production counts and validate production bytes directly. | Production data is the test fixture; there are no mechanical fixtures for invalid consumer contract cases. | Add mechanical fixtures outside production ingress, with test-only import boundaries; replace literal current-count assertions with contract assertions. | No | Fixture exclusion, per-track build, malformed reference, checksum/version/approval/fixed-pool cases. | A-08. |
| A-13 | `scripts/validate.mjs` | Minimum counts are generic (`>= 1` in schemas/manifests); mode thresholds are not centrally declared. | The pipeline cannot prove 10/20/40 requirements or reject a lowered fixed-40 pool from a configuration owner. | Add family mode requirements configuration and validate declared modes/pool capacity. Do not lower any existing threshold. | `MANUAL ONLY` if a real bank is insufficient | 10/20/40 boundary tests and fixed-40 failure. | Product-owned mode contract. |
| A-14 | `scripts/publish.mjs`; `README.md` | Immutability is described, and name collisions are rejected, but no release-level policy blocks partial publication or changes to a root selection. | A user can publish one track manifest independently without an audited release artifact or approval coverage. | Model independent track artifacts and explicit release assembly; a release may contain Algorithms without Certification, but it must not silently substitute or select a partial item subset. | No | Algorithms-only release; Certification-only release; release does not alter another track. | A-01, A-07, A-08. |
| A-15 | `scripts/validate.mjs`; repository-wide | No code generates questions, repairs questions, hides items, filters subsets, or adds fallbacks. The publish command can still ingest any candidate file. | The absence of automation is good, but ingress is not technically constrained and reports could later become editorial tools. | Preserve manual-only content ingress; restrict reports to structural aggregate/identity status and ban generation, repair, filtering, fallback, or automatic activation paths. | No | Static forbidden-path test; report snapshot contains no prompt/option/answer/feedback text. | A-05 and report specification. |
| A-16 | `tracks/algorithms`, `tracks/cloud-certification`; `validatePublication` loop | Banks are physically track-local, and validation loops each root entry, so separate bank files are technically possible. | Build/publish is still coupled to one root validation and lacks independent artifact output/approval scopes. | Make `build --track algorithms` and `build --track cloud-certification` explicit, each producing only its own immutable artifact; release assembly remains a separate step. | No | Algorithms build succeeds when Certification ingress is absent; converse test; no cross-track output. | A-01, A-08. |
| A-17 | `scripts/validate.mjs`; `tests/` | Test code imports the production validator; no fixtures/output isolation exists. | Future fixtures can accidentally become production ingress and production imports cannot be mechanically prohibited. | Establish `tests/fixtures` outside manual source/output roots and add static import/path checks for production builder and generated export. | No | Production fixture exclusion and forbidden `tests/` import checks. | A-08. |

## Target directory map for Prompt 03

This is a target map, not a migration instruction. Prompt 03 creates only architecture/tooling files needed for the pipeline; it does **not** move, rename, copy, split, merge, or edit any existing question bank.

```text
config/
  families/                         # family-owned modes and interaction registry
  tracks/                           # track → family and versioned taxonomy references
  taxonomy/                         # declarative taxonomy identities, not content edits
schemas/
  publishing/                       # executable release/reference/artifact/approval schemas
manual/
  source/<trackId>/                 # human-authored ingress; initially no bank migration
  approvals/<trackId>/              # human-authored approval records; initially empty
artifacts/
  tracks/<trackId>/<contentVersion>/ # immutable builder output: artifact bytes + reference
  releases/<releaseId>/             # immutable release assembly
exports/
  app/                              # generated immutable app-import module only
reports/
  publishing/                       # structural aggregate reports, no question text
scripts/
  build/                            # pure track builder and release assembler
  validate/                         # schema/identity/byte/approval/mode validators
  dev/                              # optional loopback artifact preview only
tests/
  fixtures/                         # mechanical, test-only malformed/valid contracts
  contract/                         # pipeline and consumer compatibility tests
```

`tracks/` remains the current published-bank location during Prompt 03. It is intentionally not reclassified as a source, approval, fixture, or generated-output directory until a separately approved migration provides a manual artifact and exact provenance.

## Bounded Prompt 03 scope

Prompt 03 may implement the following, and nothing content-editorial:

1. Create the target architecture folders and executable schema/type ownership without moving existing questions.
2. Add track/family/taxonomy/mode configuration contracts, release and track-reference envelopes, manual approval-record schema, and immutable artifact envelope schema.
3. Build a deterministic per-track builder from an allow-listed manual source root, an independent release assembler, SHA-256 byte verification, and a generated app-import export.
4. Add structural validators and aggregate reports only: identity, schema, checksum, source commit, approval coverage, declared modes, taxonomy/reference validity, interaction support, and fixed 10/20/40 pool requirements.
5. Add mechanical test fixtures strictly under `tests/fixtures`, production-ingress/import boundaries, output drift checks, and CI.
6. Replace broad root HTTP serving with a loopback-only artifact preview or remove it; do not add an app runtime client.
7. Provide a migration decision report for existing `tracks/` banks. If any validation identifies a question-data defect, report the affected class/count only and stop with `MANUAL ONLY`; do not edit, select, hide, or repair questions.

Prompt 03 must not create question content, approval records, an approval status, a publishable subset, a synthetic bank, a fallback artifact, or a green real-content claim. It must not lower the fixed 10/20/40 requirements.

### Prompt 03 execution packets

#### P03-1 — publishing contracts and boundaries

- **Goal:** establish executable ownership for track/family/taxonomy/mode configuration and the versioned manual-source, approval, artifact, release, and app-export envelopes.
- **Scope:** directories and non-content schemas/types; source/approval/output path guards; no migration of `tracks/`.
- **Non-goals:** question edits, taxonomy mapping edits, approval creation, artifact activation, builder implementation.
- **Inputs:** app consumer contract; product-owned taxonomy and mode identities where available.
- **Acceptance criteria:** all envelope fields from A-01/A-02 exist; schema files are executed by a validator; production ingress excludes `tests/`; current banks remain byte-identical.
- **Verification:** mechanical unknown-field/version/path tests; `git diff -- tracks` is empty.
- **Required evidence:** contract report naming all unresolved human inputs.
- **Risks:** guessing taxonomy/mode identities; if unavailable, preserve them as explicit blockers.
- **Report target:** `docs/reports/p03-1-publishing-contract-boundaries.md`.
- **Ready for implementation loop:** Yes.

#### P03-2 — deterministic per-track artifact builder and release assembler

- **Goal:** build immutable Algorithms and Certification artifacts independently and assemble an explicit release without editing existing artifact paths.
- **Scope:** byte encoder/checksum, approval-coverage resolver, per-track builder, release assembler, app-export emitter, aggregate structural report.
- **Non-goals:** any question/approval creation or repair; content selection; app runtime HTTP; migration of existing banks.
- **Inputs:** P03-1 contracts; manually supplied source/approval inputs only.
- **Acceptance criteria:** failed build emits no artifact; repeat build is byte-identical; an Algorithms artifact can build while Certification is absent and vice versa; 10/20/40 requirements are enforced from config.
- **Verification:** mechanical valid/invalid fixtures, checksum mutation, incomplete approval, insufficient fixed-40, and cross-track isolation tests.
- **Required evidence:** artifact/release manifest examples generated only from mechanical fixtures, plus a clean-tree drift result.
- **Risks:** a real input fails structural validation. Stop `MANUAL ONLY`; do not change content to pass.
- **Report target:** `docs/reports/p03-2-track-artifact-builder.md`.
- **Ready for implementation loop:** Yes, after P03-1.

#### P03-3 — development, CI, and joint consumer compatibility

- **Goal:** prevent drift and prohibit the legacy HTTP/import paths from becoming the application content route.
- **Scope:** loopback/output-only preview or removal of `serve.mjs`; CI; static fixture/import boundaries; a mechanical compatibility test against the app consumer envelope.
- **Non-goals:** app UI activation, real artifact activation, question quality review, approval decision.
- **Inputs:** P03-1/P03-2 outputs and a version-pinned consumer contract fixture from `gcp-ace-trainer`.
- **Acceptance criteria:** CI runs validate/test/build/drift; generated app export has no test import; preview cannot expose source/approval roots; no runtime HTTP contract is introduced.
- **Verification:** clean-checkout CI command, forbidden-import test, route boundary test, consumer compatibility test.
- **Required evidence:** CI log and compatibility report with only structural identities/counts.
- **Risks:** app consumer contract changes concurrently; pin and compare its version before release handoff.
- **Report target:** `docs/reports/p03-3-ci-consumer-compatibility.md`.
- **Ready for implementation loop:** Yes, after P03-2.

## Recorded current verification

At the input SHA:

- `npm run validate` — passed (`Published content is valid.`)
- `npm test` — passed (2 tests)

These commands were run solely to record the current implementation state. They did not assess question quality or authorize publication.

## Blockers and next decision

The architecture can be implemented without a real artifact, but release activation is blocked by human-owned inputs:

- manually prepared source bank(s);
- manually created approval records and approval policy;
- canonical taxonomy and mode-requirement identities;
- an explicit decision for the app-import handoff format and the joint consumer compatibility test.

No current result authorizes an Algorithms or Certification artifact for the application.
