# AWS SAA-C03 N04 checkpoint

Date: 2026-08-16

Node: `application_edge_threat_and_credential_security`

This is candidate content for human review. It is not runtime-admitted or exam-certified.

| Batch | Mental unit | Questions |
| --- | --- | ---: |
| B01 | Application authentication and Cognito | 18 |
| B02 | Application secrets and configuration protection | 18 |
| B03 | WAF controls and web-attack mitigation | 18 |
| B04 | Shield and DDoS protection | 18 |
| B05 | CloudFront and edge security | 18 |
| B06 | GuardDuty, Inspector, Detective, and Security Hub service boundaries | 18 |
| B07 | Macie and threat-detection service selection | 18 |
| **Total** |  | **126** |

Validation performed:

- `npm run audit:aws-workbook-source` — PASS.
- Candidate items have one accepted option, complete distractor explanations, explicit constraints, first-party AWS source bindings, and `approvalStatus: unapproved`.
- The workbook estimate is not used as a filler target; all 126 items are scenario-shaped and mapped to one primary mental unit.

Known review boundary: B06 owns the operational distinction between GuardDuty threat detection, Inspector vulnerability assessment, Detective investigation context, and Security Hub aggregation. B07 owns Macie S3 sensitive-data discovery, identifier selection, scope/cost tradeoffs, and correlation with the other services. Reviewers should preserve that distinction when admitting content.

The repository-wide authoring validator remains blocked by pre-existing malformed unrelated GCP curriculum JSON and unrelated count reconciliation failures. Runtime publishing remains separately blocked because this dirty source repository has no available technical input commit.
