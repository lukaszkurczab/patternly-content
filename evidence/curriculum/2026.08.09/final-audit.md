# Curriculum coverage specification

Machine-readable source: `config/curricula/*.json`. Catalogue fingerprint: `420b7429999ef000b51418e2ceebd72c4600d0474175ab4c1447ac682dcf19c9`.

## Release tracks

| Track | Family | Nodes | Blocks | Total target | Verified existing | New authoring | Free | Premium | Mode state |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| aws-certified-solutions-architect-associate | certification | 4 | 12 | 480 | 0 | 480 | 120 | 360 | planned_coverage_sufficient |
| backend-system-design-interview | design_interview | 5 | 15 | 600 | 0 | 600 | 120 | 480 | blocked_by_contract |
| coding-interview-dsa-problem-solving | coding_interview | 26 | 78 | 3404 | 2375 | 1029 | 158 | 3246 | planned_coverage_sufficient |
| frontend-system-design-interview | design_interview | 5 | 15 | 600 | 0 | 600 | 120 | 480 | blocked_by_contract |
| google-cloud-associate-cloud-engineer | certification | 5 | 15 | 600 | 0 | 600 | 120 | 480 | planned_coverage_sufficient |
| hashicorp-terraform-associate-004 | certification | 5 | 15 | 600 | 0 | 600 | 120 | 480 | planned_coverage_sufficient |
| kubernetes-cloud-native-associate-kcna | certification | 4 | 12 | 480 | 0 | 480 | 120 | 360 | planned_coverage_sufficient |
| microsoft-azure-administrator-associate-az-104 | certification | 5 | 15 | 600 | 0 | 600 | 120 | 480 | planned_coverage_sufficient |
| microsoft-azure-ai-fundamentals-ai-901 | certification | 5 | 15 | 600 | 0 | 600 | 120 | 480 | planned_coverage_sufficient |
| object-oriented-design-interview | design_interview | 5 | 15 | 600 | 0 | 600 | 120 | 480 | blocked_by_contract |

## Contract gaps

Design Interview authoring remains blocked by the application-owned selection/scoring interaction contract. Certification and Coding figures are planning coverage, not shipping admission or authored-item readiness.

## Audit

Second-pass audit: curriculum_frozen_with_recorded_runtime_boundary. Resolved defects: CURR-001, CURR-002.

Completion boundary: The curriculum model is frozen for authoring. The active GCP source is intentionally not deleted until the first replacement instructional source has independently passed immutable release and package evidence; the frozen curriculum retains zero old item identities and no fallback. Design Interview source authoring cannot enter active modes until its application-owned selection/scoring contract exists.
