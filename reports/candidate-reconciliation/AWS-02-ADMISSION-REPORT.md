# AWS-02/ADMISSION — local candidate admission

**Status:** done — independent QA **PASS WITH ISSUES**.  
**Boundary:** local verified artifacts only; no deployment, storage upload, or distribution.

The exact candidate `11d56baa82f897482a6def37d2af6bd90977b855a2fd5ddcb151838c7108a5f1` now has a separate v3 admission record. Candidate readiness v2 remains immutable and continues to describe the earlier readiness-only decision; the release gate requires both that record and the later admission instead of rewriting history.

Publishing admission verifies the bytes, sizes, and SHA-256 values of all nine candidate release artifacts under the explicit `local_verified_artifacts_no_deployment` boundary. Runtime admission binds application commit `1a375c99a9b023a211e92f11a6f5d2b25a4ad81b`, its schema-v3 release lock, bundled content lock, runtime test source, and the exact nine-track set. The application test loads the actual canonical runtime catalog and proves each launch track has a usable mode and non-empty pool.

The active application lock points to the new candidate. The former `patternly-app-content-0024` lock is retained unchanged as historical evidence and is not reused as admission. Application release-manifest/readiness consumers now use the current candidate/readiness/admission contract rather than historical ACC-02.

Verification:

- candidate admission tests: 2/2 PASS;
- candidate release gate tests: 5/5 PASS;
- exact release gate: `RELEASE_READY` for `11d56baa…`;
- full content suite: 70/70 PASS;
- migration verifier: 9 tracks, 117 nodes, 943 mental units, 16,077 questions;
- application candidate-lock tests: 2/2 PASS;
- application runtime admission: 1/1 PASS;
- application release manifest/readiness tests: 28/28 PASS;
- application typecheck and diff check: PASS.

The full application suite passed 1,259/1,262. Its three cross-repository tests intentionally require a separate historical content checkout and an explicit `PATTERNLY_CONTENT_EXPECTED_CURRENT_SHA`; the unparameterized run failed only on those missing inputs. The controlled release-manifest/readiness fixtures covering the changed contracts passed 28/28.

This evidence does not claim cloud publication, backend availability, app deployment, FREEZE, or GO.

The first independent QA found that the validator checked only the format of each per-track `artifactSha256`. The validator now compares every admission hash with the exact release artifact; a negative test proves that a well-formed foreign hash is rejected. Re-QA returned PASS WITH ISSUES. Its only residual note concerned two stale ACC-02 labels in application text/test naming; those labels were removed before closure.
