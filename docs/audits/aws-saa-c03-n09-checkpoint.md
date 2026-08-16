# AWS SAA-C03 N09 checkpoint

Date: 2026-08-16

Node: `multi_tier_scaling_load_balancing_and_cache_patterns`

This is candidate content for human review. It is not runtime-admitted or exam-certified.

| Batch | Mental unit | Questions |
| --- | --- | ---: |
| B01 | Multi-tier architecture boundaries | 18 |
| B02 | Stateless application tiers and session state | 18 |
| B03 | Horizontal versus vertical scaling | 18 |
| B04 | Auto Scaling policies and component independence | 18 |
| B05 | ALB, NLB, and Gateway Load Balancer selection | 18 |
| B06 | Edge acceleration and CDN placement | 18 |
| B07 | Caching and read-scaling patterns | 18 |
| **Total** |  | **126** |

Validation performed:

- `npm run audit:aws-workbook-source` — PASS.
- Candidate items have one accepted option, complete distractor explanations, explicit constraints, first-party AWS source bindings, and `approvalStatus: unapproved`.
- The workbook estimate is not used as a filler target; all 126 items are scenario-shaped and mapped to one primary mental unit.

Known review boundary: B01 owns tier boundaries, trust, data ownership, deployment contracts, dependency capacity, and failure containment; B02 owns stateless request processing, externalized session state, tokens, idempotency, worker checkpoints, and stateful-boundary review; B03 owns horizontal versus vertical scaling, demand signals, warm-up, headroom, scale-in, cost, and dependency protection; B04 owns Auto Scaling groups, policy selection, launch templates, health, lifecycle, mixed capacity, and independent component policies; B05 owns ALB/NLB/GWLB protocol and routing selection, TLS, PrivateLink, appliance insertion, target health, draining, and source boundaries; B06 owns CloudFront, cache keys, OAC, private content, invalidation, origin failover, edge security, and origin placement; B07 owns cache-aside, invalidation, stampede protection, TTL, hot keys, read replicas, DAX, cache failure, and evidence for read scaling.

Runtime publishing remains separate from this candidate source. These items are intentionally not runtime-admitted until human review and the repository's publishing prerequisites are satisfied.
