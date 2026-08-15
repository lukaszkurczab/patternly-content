# Next task: author the first bounded real batch

Work from a clean current `master` and do not repeat the curriculum analysis.

1. Run `npm ci`.
2. Run `npm run authoring:validate`. If the input fingerprint differs from `396df7e9ff2e5ccc932c45fc84fc43cedbe74e6a424b9578cbe0d3a545440377`, regenerate the plan and review the changed evidence before continuing.
3. Run `npm run authoring:plan`.
4. Run `npm run authoring:scaffold -- --write` only if the planning briefs need materialization; it creates no JSON, approval, artifact, or release files.
5. Author exactly one complete batch at the path below, using its `.authoring.md` brief, canonical slot bindings, family schema, and exact human-review handoff:
   - path: `manual/source/frontend-system-design-interview/frontend_architecture_foundations/device_browser_network_and_accessibility_constraints.json`
   - track/family: `frontend-system-design-interview` / `design_interview`
   - node/block: `frontend_architecture_foundations` / `device_browser_network_and_accessibility_constraints`
   - slot IDs: `frontend-system-design-interview:device_browser_network_and_accessibility_constraints:choose_a_client_behavior_that_works_under_constrained_network_and_input_conditions:slot:non-pointer-input-behavior`
   - taxonomy version: `2026.08.11`
   - authoring content version: `frontend-system-design-interview-authoring-v2026.08.11`
6. Before approval, run `npm run authoring:validate` and record factual, technical, and editorial human review. Do not activate, publish, or add release artifacts in that task.

Learner-item creation belongs to the following bounded batch task unless the owner explicitly includes it.

Expected gate: `READY_FOR_FIRST_REAL_BOUNDED_AUTHORING_BATCH`.
