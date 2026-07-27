# Algorithms authoring workflow

This directory is a readable projection of the canonical structural taxonomy in `config/taxonomy/algorithms.json`. IDs and metadata are rendered from that SOT; do not use these files as a second taxonomy registry.

1. Choose a node plan.
2. Set target item counts for its mental units.
3. Work one mental unit at a time.
4. Copy the matching stub into the authoring session.
5. Generate questions manually and substantively review them.
6. Create canonical source JSON only when it contains at least one real item.
7. Run inspection and validation.
8. Correct substantive issues manually.
9. Commit technical inputs.
10. Emit and commit technical evidence.
11. Commit the final release candidate.
12. Build the artifact.

Codex may scaffold and validate. Codex must not author or repair production questions.
