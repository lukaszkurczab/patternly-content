import { copyFile, mkdir, rename, stat } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { ROOT, validatePublication } from "./validate.mjs";
import { sha256File } from "./checksum.mjs";

const [trackId, source, contentVersion] = process.argv.slice(2);
if (!trackId || !source || !contentVersion) throw new Error("Usage: node scripts/publish.mjs <track-id> <candidate-bank.json> <new-content-version>");
const trackDir = resolve(ROOT, "tracks", trackId);
const manifestPath = resolve(trackDir, "manifest.json");
const bankName = `${contentVersion}.json`;
const bankPath = resolve(trackDir, "banks", bankName);
try { await stat(bankPath); throw new Error(`Published bank already exists: ${bankName}`); } catch (error) { if (error?.code !== "ENOENT") throw error; }
await mkdir(dirname(bankPath), { recursive: true });
const tempBank = `${bankPath}.tmp`;
await copyFile(source, tempBank);
const checksum = await sha256File(tempBank);
const manifest = JSON.parse(await (await import("node:fs/promises")).readFile(manifestPath, "utf8"));
const nextManifest = { ...manifest, contentVersion, bankPath: `banks/${bankName}`, sha256: checksum };
const tempManifest = `${manifestPath}.tmp`;
await (await import("node:fs/promises")).writeFile(tempManifest, `${JSON.stringify(nextManifest, null, 2)}\n`);
await rename(tempBank, bankPath);
await rename(tempManifest, manifestPath);
await validatePublication();
console.log(`Published ${trackId}/${basename(bankPath)}.`);
