import { buildTrack, emitTechnicalEvidence, inspectTrack, PublishingFailure, publishRelease, validateTrack, verifyArtifact } from "./pipeline.mjs";
const [command, ...args] = process.argv.slice(2);
const usage = "Use inspect-source, emit-technical-evidence, validate-track, build-track, verify-artifact, or publish-release. Each command accepts --help.";
function options({ required = [], repeated = [] }) {
  if (args.includes("--help")) return undefined;
  const allowed = new Set([...required, ...repeated]); const result = new Map();
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (!allowed.has(flag)) throw new PublishingFailure("USAGE", `Unsupported argument: ${flag}`);
    const value = args[index + 1];
    if (!value || value.startsWith("-")) throw new PublishingFailure("USAGE", `${flag} requires a value.`);
    if (!repeated.includes(flag) && result.has(flag)) throw new PublishingFailure("USAGE", `${flag} may only be supplied once.`);
    result.set(flag, repeated.includes(flag) ? [...(result.get(flag) ?? []), value] : value); index += 1;
  }
  for (const flag of required) if (!result.has(flag)) throw new PublishingFailure("USAGE", `${flag} is required.`);
  return result;
}
try {
  if (!command || command === "--help") console.log(usage);
  else if (command === "inspect-source") { const parsed = options({ required: ["--track"] }); if (!parsed) console.log(usage); else console.log(JSON.stringify(await inspectTrack({ trackId: parsed.get("--track") }), null, 2)); }
  else if (command === "emit-technical-evidence") { const parsed = options({ required: ["--track"] }); if (!parsed) console.log(usage); else console.log(JSON.stringify(await emitTechnicalEvidence({ trackId: parsed.get("--track") }), null, 2)); }
  else if (command === "validate-track") { const parsed = options({ required: ["--track"] }); if (!parsed) console.log(usage); else console.log(JSON.stringify(await validateTrack({ trackId: parsed.get("--track") }), null, 2)); }
  else if (command === "build-track") { const parsed = options({ required: ["--track"] }); if (!parsed) console.log(usage); else console.log(JSON.stringify(await buildTrack({ trackId: parsed.get("--track") }), null, 2)); }
  else if (command === "verify-artifact") { const parsed = options({ required: ["--artifact"] }); if (!parsed) console.log(usage); else console.log(JSON.stringify(await verifyArtifact(parsed.get("--artifact")), null, 2)); }
  else if (command === "publish-release") { const parsed = options({ required: ["--release"], repeated: ["--artifact"] }); if (!parsed) console.log(usage); else console.log(JSON.stringify(await publishRelease({ releaseId: parsed.get("--release"), artifactPaths: parsed.get("--artifact") ?? [] }), null, 2)); }
  else throw new PublishingFailure("USAGE", usage);
} catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
