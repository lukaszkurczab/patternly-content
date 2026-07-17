import { buildTrack, emitTechnicalEvidence, inspectTrack, PublishingFailure, publishRelease, validateTrack, verifyArtifact } from "./pipeline.mjs";
const [command, ...args] = process.argv.slice(2); const value = (flag) => args[args.indexOf(flag) + 1];
try {
  if (command === "inspect-source") console.log(JSON.stringify(await inspectTrack({ trackId: value("--track") }), null, 2));
  else if (command === "emit-technical-evidence") console.log(JSON.stringify(await emitTechnicalEvidence({ trackId: value("--track") }), null, 2));
  else if (command === "validate-track") console.log(JSON.stringify(await validateTrack({ trackId: value("--track") }), null, 2));
  else if (command === "build-track") console.log(JSON.stringify(await buildTrack({ trackId: value("--track") }), null, 2));
  else if (command === "verify-artifact") console.log(JSON.stringify(await verifyArtifact(value("--artifact")), null, 2));
  else if (command === "publish-release") console.log(JSON.stringify(await publishRelease({ releaseId: value("--release"), artifactPaths: args.filter((arg, index) => args[index - 1] === "--artifact") }), null, 2));
  else throw new PublishingFailure("USAGE", "Use inspect-source, emit-technical-evidence, validate-track, build-track, verify-artifact, or publish-release.");
} catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
