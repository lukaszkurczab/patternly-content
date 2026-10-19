import { fileURLToPath } from "node:url";
import path from "node:path";

import { computeCurrentSourceIdentity } from "./current-source-identity.mjs";

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const identity = await computeCurrentSourceIdentity();
    const questionCount = identity.tracks.reduce((total, track) => total + track.questionCount, 0);
    process.stdout.write(`CURRENT_SOURCE_VERIFIED fingerprint=${identity.sourceInputFingerprint}; tracks=${identity.tracks.length}; questions=${questionCount}; sourceTree=${identity.sourceTree}; semanticReview=${identity.claims.semanticReview}; publication=${identity.claims.publication}; deployment=${identity.claims.deployment}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
