import { auditExplanationQuality } from "./explanationQualityAudit.mjs";

const args = process.argv.slice(2);
const allowed = new Set(["--track", "--format"]);
let trackId = "all";
let format = "summary";

for (let index = 0; index < args.length; index += 1) {
  const flag = args[index];
  if (!allowed.has(flag)) throw new Error(`Unsupported argument: ${flag}.`);
  const value = args[index + 1];
  if (!value || value.startsWith("-")) throw new Error(`${flag} requires a value.`);
  if (flag === "--track") trackId = value;
  else format = value;
  index += 1;
}

if (!["summary", "full"].includes(format)) {
  throw new Error(`Unsupported explanation-audit format: ${format}.`);
}

const result = await auditExplanationQuality({ trackId });
console.log(JSON.stringify(
  format === "full"
    ? result
    : {
        schemaVersion: result.schemaVersion,
        scope: result.scope,
        summary: result.summary,
        interpretation: result.interpretation,
        fullOutputCommand: `npm run audit:explanations -- --track ${trackId} --format full`,
      },
  null,
  2,
));
