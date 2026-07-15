# Patternly published content

This repository publishes immutable, versioned JSON question banks for Patternly.

Run `npm run validate` before publishing. Run `npm run serve` to expose the root manifest at `http://127.0.0.1:4173/manifest.json` for local development.

Published bank files are immutable. A content update must use a new bank version and atomically update its manifest only after validation succeeds.
