# CNT-02 — publishing input preflight

Date: 2026-08-21

Result: partial; no artifact or release admission was generated.

## Scope

This read-only preflight checks the three tracks currently named by the
application content lock. It does not change the lock, emit durable technical
evidence, build an artifact, publish a release, or create an approval.

## Current repository facts

- Content repository HEAD is `12b99c78e03ec6c58964d7f83d11d1b50af08467` and the
  worktree has 23 changed or untracked paths from the current approval/evidence
  work.
- The canonical source and configuration inputs for these tracks are
  byte-identical to the owner-reviewed source commit
  `e73c7314eee7b2cd3f53b04c952b6af6526d3685`.
- The application lock still names the older Coding/GCP source commit
  `4db6020429a1da67387eec2bcfe4fad80af15dfd` and the older AZ-104 source
  commit `67437fa377b4021fb1a4764095fa16e6048641a2`.

The current GCP input surface is materially different from the historical
runtime contract. The current source contains 152 JSON batches and 2,981
items with IDs in the `gcp-ace-gcpace-*` family. All items declare the six
currently supported certification modes, while no item declares
`certification-scenario-practice`. The current curriculum names
`organization_projects_policies_services_quotas_and_assets` as the Free node
and has 136 items in that node; all 136 are diagnostic-eligible. Its
`admission` object still reports `learnerFacingContentIncluded: false`,
`runtimeAdmission: not_admitted`, `publishingAdmission: not_admitted`, and
`questionsAuthored: 0`.

Git history explains why the old configuration is absent. Commit
`c5ef48385cade05d5ce2e1f8c6db578419fca870` (`feat(curriculum): freeze
corrective coverage model`) removed the GCP runtime track configuration, Free
node profile, bundled Free-node registration, and inventory pin while
recutting the GCP curriculum. The historical configuration used the old
`setup_environment` Free node, `ace-q-*` item IDs, and scenario-mode
eligibility. Those inputs do not describe the current GCP source and cannot
be restored as a compatible launch configuration.

## Validator results

| Track | Command result | Derived technical input | Interpretation |
| --- | --- | --- | --- |
| `coding-interview-dsa-problem-solving` | PASS | `a050e8a2417a0f88877c020c9d4142279f38d855` | Existing durable technical evidence matches the current canonical input surface. |
| `google-cloud-associate-cloud-engineer` | FAIL: `SOURCE_COMMIT_UNAVAILABLE` | none | No canonical `config/tracks` runtime configuration is installed for this track. |
| `microsoft-azure-administrator-associate-az-104` | PASS | `a050e8a2417a0f88877c020c9d4142279f38d855` | Existing durable technical evidence matches the current canonical input surface. |

The Coding and AZ-104 passes are validation results, not fresh release
evidence: the publisher was not allowed to build while the worktree is dirty,
and the app lock was not changed. The GCP failure is a real missing canonical
input, not a reason to copy another track's configuration or to restore the
deleted historical contract.

## Decision and next action

Keep the current lock frozen. A valid CNT-02 release must be built from one
clean, owner-authorized publication commit, with a current GCP runtime
configuration and authoring contract supplied before GCP can enter the same
release contract. The resulting artifacts, technical evidence, Free-node
packages, and approval manifest must be generated and reviewed as one
exact-input release; historical lock entries must not be relabeled.

Physical-device testing is not part of this preflight or the launch blocker.
