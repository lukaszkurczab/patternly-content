# AWS SAA-C03 N19 checkpoint

## Database cost optimization, capacity, retention and migration

Node: `database_cost_optimization_engine_capacity_retention_and_migration`

All source items remain `unapproved` candidate content pending human review.

| Learning block | Items |
| --- | ---: |
| Database engine and service selection economics | 22 |
| Provisioned, serverless capacity, and scaling | 22 |
| Read replicas, caching, and connection cost | 22 |
| Backup, snapshot, and retention cost | 22 |
| Connection pooling, proxy, and multitenancy | 22 |
| DMS schema and data-movement cost | 22 |
| **Total** | **132** |

Verification:

- `npm run audit:aws-workbook-source` — PASS
- All six blocks use canonical N19 node and block ownership.
- Items cover engine fit, provisioned and serverless capacity, DynamoDB modes, replicas, ElastiCache and DAX, connection pooling, RDS Proxy, backup economics, retention, PITR, DMS full-load/CDC, schema conversion, validation, cutover, and first-party AWS source bindings.
