# AWS SAA-C03 N10 checkpoint

Date: 2026-08-16

Node: `availability_fault_isolation_failover_and_quota_design`

This is candidate content for human review. It is not runtime-admitted or exam-certified.

| Batch | Mental unit | Questions |
| --- | --- | ---: |
| B01 | Availability Zone and Region failure domains | 18 |
| B02 | Single-point-of-failure elimination | 18 |
| B03 | Load-balanced multi-AZ architectures | 18 |
| B04 | Route 53 health checks and failover | 18 |
| B05 | Distributed and immutable application patterns | 18 |
| B06 | Service quotas, throttling, and capacity headroom | 18 |
| B07 | Proxies, connection protection, and availability metrics | 18 |
| **Total** |  | **126** |

Validation performed:

- `npm run audit:aws-workbook-source` — PASS.
- Candidate items have one accepted option, complete distractor explanations, explicit constraints, first-party AWS source bindings, and `approvalStatus: unapproved`.
- The workbook estimate is not used as a filler target; all 126 items are scenario-shaped and mapped to one primary mental unit.

Known review boundary: B01 owns AZ and Region failure-domain selection, regional versus zonal dependencies, blast radius, and placement evidence; B02 owns SPOF identification and removal across compute, network, storage, control-plane, and operational paths; B03 owns multi-AZ load balancing, target registration, draining, health, and capacity distribution; B04 owns Route 53 health checks, routing policies, DNS failover, TTL, and dependency-aware traffic decisions; B05 owns immutable artifacts, blue/green replacement, idempotency, schema compatibility, event replay, rollback artifacts, and automated recovery; B06 owns quota inventory, quota requests, throttling, backoff, load shedding, service-specific capacity, failover headroom, and quota validation; B07 owns RDS Proxy, connection pooling, session pinning, bounded waits, proxy dependencies, customer-facing availability SLIs, synthetic journeys, SLOs, tail latency, and recovery evidence.

Runtime publishing remains separate from this candidate source. These items are intentionally not runtime-admitted until human review and the repository's publishing prerequisites are satisfied.
