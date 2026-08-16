# AWS SAA-C03 N05 checkpoint

Date: 2026-08-16

Node: `encryption_keys_certificates_and_secrets`

This is candidate content for human review. It is not runtime-admitted or exam-certified.

| Batch | Mental unit | Questions |
| --- | --- | ---: |
| B01 | KMS keys, policies, grants, and ownership | 21 |
| B02 | Envelope encryption and service-integrated encryption | 20 |
| B03 | CloudHSM decision boundaries | 20 |
| B04 | TLS, ACM certificates, and renewal | 20 |
| B05 | Encryption in transit and endpoint protection | 20 |
| B06 | Key and secret rotation | 20 |
| **Total** |  | **121** |

Validation performed:

- `npm run audit:aws-workbook-source` — PASS.
- Candidate items have one accepted option, complete distractor explanations, explicit constraints, first-party AWS source bindings, and `approvalStatus: unapproved`.
- The workbook estimate is not used as a filler target; all 121 items are scenario-shaped and mapped to one primary mental unit.

Known review boundary: B01 owns KMS authorization and ownership; B02 owns envelope mechanics and service-integrated encryption; B03 owns CloudHSM versus KMS and HSM operational responsibility; B04 owns certificate trust and renewal; B05 owns transport encryption and private endpoint boundaries; B06 owns key-material, secret-value, certificate, and application-cache rotation distinctions.

The repository-wide authoring validator remains blocked by pre-existing malformed unrelated GCP curriculum JSON and unrelated count reconciliation failures. Runtime publishing remains separately blocked because this dirty source repository has no available technical input commit.
