# kubernetes-cloud-native-associate-kcna / cloud_native_state_security_delivery_and_reliability / authn_authz_rbac_serviceaccounts

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 7
- Authoring-admitted slots: 7
- Blocked slots: 0
- Future source path: manual/source/kubernetes-cloud-native-associate-kcna/cloud_native_state_security_delivery_and_reliability/authn_authz_rbac_serviceaccounts.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### kubernetes-cloud-native-associate-kcna:authn_authz_rbac_serviceaccounts:classify_authn_authz_rbac_serviceaccounts_evidence:slot:choose-role-vs-clusterrole-scope

- Status: authoring-admitted
- Objective: Select the documented outcome “choose role vs clusterrole scope” using credential result, authenticated principal, verb, resource, namespace, Role or ClusterRole, binding, and ServiceAccount; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose role vs clusterrole scope”; it preserves API identity and authorization, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “choose role vs clusterrole scope” only when credential result, authenticated principal, verb, resource, namespace, Role or ClusterRole, binding, and ServiceAccount makes that result materially different and the result remains within API identity and authorization.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:authn_authz_rbac_serviceaccounts:classify_authn_authz_rbac_serviceaccounts_evidence:slot:choose-rolebinding-vs-clusterrolebinding-scope

- Status: authoring-admitted
- Objective: Select the documented outcome “choose rolebinding vs clusterrolebinding scope” using credential result, authenticated principal, verb, resource, namespace, Role or ClusterRole, binding, and ServiceAccount; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose rolebinding vs clusterrolebinding scope”; it preserves API identity and authorization, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “choose rolebinding vs clusterrolebinding scope” only when credential result, authenticated principal, verb, resource, namespace, Role or ClusterRole, binding, and ServiceAccount makes that result materially different and the result remains within API identity and authorization.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:authn_authz_rbac_serviceaccounts:classify_authn_authz_rbac_serviceaccounts_evidence:slot:choose-serviceaccount-for-workload-identity

- Status: authoring-admitted
- Objective: Select the documented outcome “choose serviceaccount for workload identity” using credential result, authenticated principal, verb, resource, namespace, Role or ClusterRole, binding, and ServiceAccount; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose serviceaccount for workload identity”; it preserves API identity and authorization, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “choose serviceaccount for workload identity” only when credential result, authenticated principal, verb, resource, namespace, Role or ClusterRole, binding, and ServiceAccount makes that result materially different and the result remains within API identity and authorization.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:authn_authz_rbac_serviceaccounts:classify_authn_authz_rbac_serviceaccounts_evidence:slot:classify-authentication-identity

- Status: authoring-admitted
- Objective: Assess the material classification “classify authentication identity” from documented evidence that authentication establishes identity, authorization permits actions, RBAC bindings set scope, and ServiceAccounts identify workloads.
- Expected decision: The intended resolution is “classify authentication identity”; it preserves API identity and authorization, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:authn_authz_rbac_serviceaccounts:classify_authn_authz_rbac_serviceaccounts_evidence:slot:classify-authorization-decision

- Status: authoring-admitted
- Objective: Assess the material classification “classify authorization decision” from documented evidence that authentication establishes identity, authorization permits actions, RBAC bindings set scope, and ServiceAccounts identify workloads.
- Expected decision: The intended resolution is “classify authorization decision”; it preserves API identity and authorization, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:authn_authz_rbac_serviceaccounts:classify_authn_authz_rbac_serviceaccounts_evidence:slot:diagnose-forbidden-vs-unauthenticated-response

- Status: authoring-admitted
- Objective: Test the failure hypothesis “forbidden vs unauthenticated response” against credential result, authenticated principal, verb, resource, namespace, Role or ClusterRole, binding, and ServiceAccount before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose forbidden vs unauthenticated response”; it preserves API identity and authorization, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:authn_authz_rbac_serviceaccounts:classify_authn_authz_rbac_serviceaccounts_evidence:slot:distinguish-user-identity-from-serviceaccount-identity

- Status: authoring-admitted
- Objective: Test the material boundary “user identity from serviceaccount identity” using credential result, authenticated principal, verb, resource, namespace, Role or ClusterRole, binding, and ServiceAccount; reject a surface-only restatement.
- Expected decision: The intended resolution is “distinguish user identity from serviceaccount identity”; it preserves API identity and authorization, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “distinguish user identity from serviceaccount identity” only when credential result, authenticated principal, verb, resource, namespace, Role or ClusterRole, binding, and ServiceAccount makes that result materially different and the result remains within API identity and authorization.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
