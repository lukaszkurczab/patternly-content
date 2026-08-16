# AWS SAA-C03 N06 checkpoint

Date: 2026-08-16

Node: `data_governance_classification_backup_and_compliance`

This is candidate content for human review. It is not runtime-admitted or exam-certified.

| Batch | Mental unit | Questions |
| --- | --- | ---: |
| B01 | Data classification and discovery | 18 |
| B02 | Data access governance and protection policies | 18 |
| B03 | Retention and lifecycle requirements | 18 |
| B04 | Backup and replication controls | 18 |
| B05 | Cross-account and cross-Region recovery copies | 18 |
| B06 | Compliance evidence and audit services | 18 |
| B07 | Recovery, deletion protection, and governance trade-offs | 18 |
| **Total** |  | **126** |

Validation performed:

- `npm run audit:aws-workbook-source` — PASS.
- Candidate items have one accepted option, complete distractor explanations, explicit constraints, first-party AWS source bindings, and `approvalStatus: unapproved`.
- The workbook estimate is not used as a filler target; all 126 items are scenario-shaped and mapped to one primary mental unit.

Known review boundary: B01 owns classification and discovery service selection; B02 owns data-resource authorization across S3, Lake Formation, IAM, KMS, and service-native controls; B03 owns retention, lifecycle, WORM, legal hold, and RPO/RTO distinctions; B04 owns backup versus replication and restore testing; B05 owns independent cross-account and cross-Region recovery copies; B06 owns CloudTrail, Config, Security Hub, Audit Manager, Artifact, and evidence-retention boundaries; B07 owns deletion safeguards, retirement sequencing, legal release, and visible governance exceptions.

The repository-wide authoring validator remains blocked by pre-existing malformed unrelated GCP curriculum JSON and unrelated count reconciliation failures. Runtime publishing remains separately blocked because this dirty source repository has no available technical input commit.
