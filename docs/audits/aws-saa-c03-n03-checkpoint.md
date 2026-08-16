# AWS SAA-C03 N03 checkpoint

Date: 2026-08-15

Node: `vpc_security_segmentation_and_private_service_access`

This is candidate content for human review. It is not runtime-admitted or exam-certified.

| Batch | Mental unit | Questions |
| --- | --- | ---: |
| B01 | Public/private subnet segmentation | 16 |
| B02 | Security groups and network ACLs | 16 |
| B03 | Route tables, internet gateways, and NAT boundaries | 14 |
| B04 | VPC endpoints and PrivateLink | 16 |
| B05 | Network Firewall and centralized firewall management | 14 |
| B06 | Hybrid connection security with VPN and Direct Connect | 16 |
| B07 | Private DNS, ingress, and egress architecture | 16 |
| B08 | Private DNS, ingress, and egress architecture — repeated batch | 16 |
| **Total** |  | **124** |

Validation performed:

- `npm run audit:aws-workbook-source` — PASS.
- Candidate items have one accepted option, complete distractor explanations, explicit constraints, first-party AWS source bindings, and `approvalStatus: unapproved`.
- The workbook estimate is not used as a filler target; all 124 items are scenario-shaped and mapped to one primary mental unit.

Known boundary for later review: B01 contains a few basic endpoint/private-DNS edge cases needed to explain subnet isolation. B04 and B07/B08 own the deeper endpoint and DNS mental models; reviewers should preserve that distinction when admitting content.

The repository-wide authoring validator remains blocked by pre-existing malformed unrelated GCP curriculum JSON and unrelated count reconciliation failures. Runtime publishing remains separately blocked because this dirty source repository has no available technical input commit.
