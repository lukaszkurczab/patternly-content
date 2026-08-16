# AWS SAA-C03 N08 checkpoint

Date: 2026-08-16

Node: `microservices_containers_serverless_and_purpose_built_services`

This is candidate content for human review. It is not runtime-admitted or exam-certified.

| Batch | Mental unit | Questions |
| --- | --- | ---: |
| B01 | Microservice boundaries and state ownership | 18 |
| B02 | ECS and EKS orchestration decisions | 18 |
| B03 | Fargate and managed node capacity | 18 |
| B04 | Lambda and serverless architecture patterns | 18 |
| B05 | Container migration and hybrid placement | 18 |
| B06 | Multi-tier and purpose-built managed service selection | 18 |
| B07 | Managed ML, media, and specialized service use cases | 18 |
| **Total** |  | **126** |

Validation performed:

- `npm run audit:aws-workbook-source` — PASS.
- Candidate items have one accepted option, complete distractor explanations, explicit constraints, first-party AWS source bindings, and `approvalStatus: unapproved`.
- The workbook estimate is not used as a filler target; all 126 items are scenario-shaped and mapped to one primary mental unit.

Known review boundary: B01 owns bounded-context decomposition, state ownership, service contracts, and synchronization boundaries; B02 owns ECS/EKS operating-model selection, task and workload boundaries, and orchestration trade-offs; B03 owns Fargate versus managed-node capacity, networking, scaling, and operational ownership; B04 owns Lambda invocation, concurrency, event sources, packaging, and serverless composition; B05 owns legacy containerization, image supply chain, hybrid placement, migration sequencing, and operational constraints; B06 owns relational, key-value, cache, search, object, file, streaming, and managed-service contract selection; B07 owns purpose-built ML, generative AI, document, speech, language, media, edge, graph, time-series, and custom-model lifecycle decisions.

Runtime publishing remains separate from this candidate source. These items are intentionally not runtime-admitted until human review and the repository's publishing prerequisites are satisfied.
