# Next task: materialize authoring briefs

Work from a clean current `master` and do not repeat the curriculum analysis.

1. Run `npm ci`.
2. Run `npm run authoring:validate`. If the input fingerprint differs from `574d20f34528b3a02cfd08fa354ab716d992450ae0b7abfbac8ad502f5d85cd5`, regenerate the plan and review the changed evidence before continuing.
3. Run `npm run authoring:plan`.
4. Run `npm run authoring:scaffold -- --write`. This creates only track/node directories, README files, and `.authoring.md` briefs. It must not create empty JSON, approval records, artifacts, or releases.
5. Verify a second scaffold run is idempotent and commit the generated folder/README/brief structure.
6. Report the first bounded real authoring batches in this deterministic order: existing Coding source preservation; source-ready Certification blocks by canonical track/node/block order; then Design Interview blocks by the current exact-direct roster and canonical track/node/block order.

Learner-item creation belongs to the following bounded batch task unless the owner explicitly includes it.

Expected gate: `READY_FOR_SCAFFOLDING_WITH_EXPLICIT_BLOCKS`.
