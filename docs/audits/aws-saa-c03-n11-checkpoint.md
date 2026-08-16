# AWS SAA-C03 N11 checkpoint

Date: 2026-08-16

Node: `disaster_recovery_data_durability_automation_and_operability`

This is candidate content for human review. It is not runtime-admitted or exam-certified.

| Batch | Mental unit | Questions |
| --- | --- | ---: |
| B01 | RTO, RPO, and recovery requirement translation | 18 |
| B02 | Backup-and-restore, pilot light, warm standby, and active-active | 18 |
| B03 | Data durability, replication, and recovery testing | 18 |
| B04 | CloudFormation and infrastructure integrity automation | 18 |
| B05 | CloudWatch, X-Ray, health, and operational visibility | 18 |
| B06 | Legacy workload reliability and migration constraints | 18 |
| B07 | Standby quotas, runbooks, and recovery operations | 18 |
| **Total** |  | **126** |

Validation performed:

- `npm run audit:aws-workbook-source` — PASS.
- Candidate items have one accepted option, complete distractor explanations, explicit constraints, first-party AWS source bindings, and `approvalStatus: unapproved`.
- The workbook estimate is not used as a filler target; all 126 items are scenario-shaped and mapped to one primary mental unit.

Known review boundary: B01 owns business-impact translation into RTO/RPO, dependency alignment, recovery tiers, degraded service, and objective review; B02 owns backup-and-restore, pilot light, warm standby, active-active, cutover, capacity, data consistency, and recovery pattern trade-offs; B03 owns durability versus availability, replication lag, backup integrity, point-in-time recovery, restore validation, data privacy, failure injection, and recovery evidence; B04 owns infrastructure as code, change sets, drift, stack boundaries, StackSets, regional portability, rollback protection, idempotency, and deployment auditability; B05 owns CloudWatch metrics, alarms, logs, X-Ray traces, health checks, synthetic journeys, regional visibility, sampling, correlation, retention, and recovery observability; B06 owns legacy dependencies, rehost constraints, migration waves, replication lag, cutover, rollback, hybrid coexistence, licensing, ownership, and acceptance; B07 owns standby quotas, preflight, dependency ordering, operators, stop conditions, DNS transition, communication, idempotent runbooks, load shedding, rollback fencing, reconciliation, return-to-normal, and remediation.

Runtime publishing remains separate from this candidate source. These items are intentionally not runtime-admitted until human review and the repository's publishing prerequisites are satisfied.
