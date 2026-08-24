import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION = "patternly-content-review-outcome-v1";
export const CONTENT_REVIEW_OUTCOMES = Object.freeze(["approved", "needs_change", "rejected"]);
export const CONTENT_REVIEW_OUTCOMES_PATH = "evidence/content-reviews/outcomes.json";
export const LAUNCH_TRACK_IDS = Object.freeze([
  "coding-interview-dsa-problem-solving",
  "backend-system-design-interview",
  "object-oriented-design-interview",
  "frontend-system-design-interview",
  "google-cloud-associate-cloud-engineer",
  "aws-certified-solutions-architect-associate",
  "microsoft-azure-administrator-associate-az-104",
  "microsoft-azure-ai-fundamentals-ai-901",
]);
export const LAUNCH_TRACK_FAMILIES = Object.freeze({
  "coding-interview-dsa-problem-solving": "coding_interview",
  "backend-system-design-interview": "design_interview",
  "object-oriented-design-interview": "design_interview",
  "frontend-system-design-interview": "design_interview",
  "google-cloud-associate-cloud-engineer": "certification",
  "aws-certified-solutions-architect-associate": "certification",
  "microsoft-azure-administrator-associate-az-104": "certification",
  "microsoft-azure-ai-fundamentals-ai-901": "certification",
});

const ROOT = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const MAX_BATCH_SIZE = 50;
const DETAIL_KEYS = ["mechanismOrProperty", "scenarioApplication", "errorCorrection", "boundaryOrTradeoff", "transfer"];

export const canonicalJson = (value) => {
  if (value === null || ["boolean", "number", "string"].includes(typeof value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
};
export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

async function walkJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => entry.isDirectory()
      ? walkJsonFiles(join(directory, entry.name))
      : entry.name.endsWith(".json") ? [join(directory, entry.name)] : []));
  return nested.flat().sort();
}

function firstDefined(...values) {
  return values.find((value) => typeof value === "string" && value.trim()) ?? null;
}

function sourceItemFingerprint(item) {
  return typeof item.itemFingerprint === "string" && /^[a-f0-9]{64}$/.test(item.itemFingerprint)
    ? item.itemFingerprint
    : sha256(canonicalJson(item));
}

function itemId(item) {
  return firstDefined(item.itemId, item.id, item.slotId);
}

function riskFlags(item, itemIdentity) {
  const flags = [];
  if (!itemIdentity) flags.push("missing_identity");
  if (!firstDefined(item.prompt, item.question)) flags.push("missing_prompt");
  if (!item.interaction || typeof item.interaction !== "object") flags.push("missing_interaction");
  if (!item.feedback || typeof item.feedback !== "object") flags.push("missing_feedback");
  if (!firstDefined(item.feedback?.Reason, item.feedback?.reason)) flags.push("missing_reason");
  if (!item.feedback?.Details || typeof item.feedback.Details !== "object") flags.push("missing_details");
  else if (DETAIL_KEYS.some((key) => !firstDefined(item.feedback.Details[key]))) flags.push("incomplete_details");
  if (!item.sourceBinding && !item.authoringProvenance) flags.push("missing_source_identity");
  return flags;
}

function itemText(item) {
  return [
    item.prompt,
    item.question,
    item.taxonomy?.nodeId,
    item.taxonomy?.mentalUnitId,
    item.taxonomy?.topicId,
    item.taxonomy?.skillAtomId,
    item.authoringIntent?.primaryMentalModel,
  ].filter((value) => typeof value === "string").join(" ").toLowerCase();
}

function itemKey(record) {
  return `${record.trackId}:${record.itemId ?? record.sourceFile + "#" + record.sourceIndex}`;
}

function sourceRecord({ trackId, sourceFile, sourceFileSha256, batch, item, sourceIndex }) {
  const itemIdentity = itemId(item);
  return {
    trackId,
    itemId: itemIdentity,
    itemKey: itemKey({ trackId, itemId: itemIdentity, sourceFile, sourceIndex }),
    sourceFile,
    sourceFileSha256,
    sourceIndex,
    nodeId: firstDefined(item.nodeId, batch.nodeId, sourceFile.split("/")[2]) ?? "unassigned",
    learningBlockId: firstDefined(item.learningBlockId, item.mentalUnitId, batch.learningBlockId, batch.mentalUnitId) ?? "unassigned",
    prompt: firstDefined(item.prompt, item.question) ?? "",
    taxonomy: item.taxonomy ?? {},
    itemFingerprint: sourceItemFingerprint(item),
    item,
    riskFlags: riskFlags(item, itemIdentity),
  };
}

async function readSourceRecords(root) {
  const records = [];
  for (const trackId of LAUNCH_TRACK_IDS) {
    const sourceRoot = join(root, "manual", "source", trackId);
    const files = await walkJsonFiles(sourceRoot);
    for (const file of files) {
      const bytes = await readFile(file);
      const batch = JSON.parse(bytes);
      if (!Array.isArray(batch.items)) continue;
      const sourceFile = relative(root, file);
      const sourceFileSha256 = sha256(bytes);
      for (const [sourceIndex, item] of batch.items.entries()) {
        records.push(sourceRecord({ trackId, sourceFile, sourceFileSha256, batch, item, sourceIndex }));
      }
    }
  }
  const identities = new Set();
  for (const record of records) {
    if (!record.itemId) continue;
    const identity = `${record.trackId}:${record.itemId}`;
    if (identities.has(identity)) record.riskFlags.push("duplicate_identity");
    identities.add(identity);
  }
  return records.sort((left, right) => left.itemKey.localeCompare(right.itemKey));
}

async function readReviewStore(reviewPath) {
  try {
    const value = JSON.parse(await readFile(reviewPath, "utf8"));
    if (value.schemaVersion !== CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION || !Array.isArray(value.reviews)) throw new Error("Review outcomes have an invalid schema.");
    const seen = new Set();
    for (const review of value.reviews) {
      if (!review.trackId || !review.itemId || !CONTENT_REVIEW_OUTCOMES.includes(review.outcome) || !review.itemFingerprint || !review.sourceFileSha256 || !review.note || !review.reviewerId) throw new Error("Review outcomes must contain current identity, fingerprint, outcome, note, and reviewer.");
      const identity = `${review.trackId}:${review.itemId}`;
      if (seen.has(identity)) throw new Error(`Duplicate current review outcome for ${identity}.`);
      seen.add(identity);
    }
    return value;
  } catch (error) {
    if (error?.code === "ENOENT") return { schemaVersion: CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION, reviews: [] };
    throw error;
  }
}

async function writeReviewStore(reviewPath, reviews) {
  await mkdir(resolve(reviewPath, ".."), { recursive: true });
  const value = {
    schemaVersion: CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION,
    reviews: [...reviews].sort((left, right) => `${left.trackId}:${left.itemId}`.localeCompare(`${right.trackId}:${right.itemId}`)),
  };
  await writeFile(reviewPath, `${canonicalJson(value)}\n`);
  return value;
}

function changedFields(previousSnapshot, currentItem) {
  if (!previousSnapshot || !currentItem) return [];
  return [...new Set([...Object.keys(previousSnapshot), ...Object.keys(currentItem)])]
    .filter((key) => canonicalJson(previousSnapshot[key]) !== canonicalJson(currentItem[key]))
    .sort();
}

function reviewProjection(record, review) {
  if (!review) return { status: "unreviewed", outcome: null, note: null, reviewerId: null, reviewedAt: null, changedFields: [] };
  const current = review.itemFingerprint === record.itemFingerprint && review.sourceFileSha256 === record.sourceFileSha256;
  return {
    status: current ? review.outcome : "stale",
    outcome: review.outcome,
    note: review.note,
    reviewerId: review.reviewerId,
    reviewedAt: review.reviewedAt,
    changedFields: current ? [] : changedFields(review.itemSnapshot, record.item),
    previousFingerprint: review.itemFingerprint,
  };
}

function toItemProjection(record, review) {
  return {
    itemKey: record.itemKey,
    trackId: record.trackId,
    nodeId: record.nodeId,
    learningBlockId: record.learningBlockId,
    itemId: record.itemId,
    prompt: record.prompt,
    sourceFile: record.sourceFile,
    sourceFileSha256: record.sourceFileSha256,
    itemFingerprint: record.itemFingerprint,
    taxonomy: record.taxonomy,
    riskFlags: [...record.riskFlags],
    review: reviewProjection(record, review),
    item: record.item,
  };
}

function buildCoverageIndex(records) {
  const nodeCounts = new Map();
  const unitCounts = new Map();
  for (const record of records) {
    const nodeKey = `${record.trackId}:${record.nodeId}`;
    const unitKey = `${nodeKey}:${record.learningBlockId}`;
    nodeCounts.set(nodeKey, (nodeCounts.get(nodeKey) ?? 0) + 1);
    unitCounts.set(unitKey, (unitCounts.get(unitKey) ?? 0) + 1);
  }
  return { nodeCounts, unitCounts };
}

function withCoverage(record, reviews, coverageIndex) {
  const { nodeCounts, unitCounts } = coverageIndex;
  return {
    ...toItemProjection(record, reviews.get(`${record.trackId}:${record.itemId}`)),
    coverage: {
      nodeItemCount: nodeCounts.get(`${record.trackId}:${record.nodeId}`) ?? 0,
      learningUnitItemCount: unitCounts.get(`${record.trackId}:${record.nodeId}:${record.learningBlockId}`) ?? 0,
    },
  };
}

export async function createContentReviewConsole({ root = ROOT, reviewPath = join(root, CONTENT_REVIEW_OUTCOMES_PATH), now = () => new Date().toISOString() } = {}) {
  const records = await readSourceRecords(root);
  const coverageIndex = buildCoverageIndex(records);
  const store = await readReviewStore(reviewPath);
  const reviews = new Map(store.reviews.map((review) => [`${review.trackId}:${review.itemId}`, review]));

  function findRecord(trackId, itemIdValue) {
    const record = records.find((candidate) => candidate.trackId === trackId && candidate.itemId === itemIdValue);
    if (!record) throw new Error(`Unknown launch item ${trackId}:${itemIdValue}.`);
    return record;
  }

  function listItems({ trackId, nodeId, learningBlockId, query, riskOnly = false, outcome } = {}) {
    const normalizedQuery = query?.trim().toLowerCase();
    return records
      .filter((record) => !trackId || record.trackId === trackId)
      .filter((record) => !nodeId || record.nodeId === nodeId)
      .filter((record) => !learningBlockId || record.learningBlockId === learningBlockId)
      .filter((record) => !normalizedQuery || itemText(record.item).includes(normalizedQuery))
      .filter((record) => !riskOnly || record.riskFlags.length > 0)
      .filter((record) => !outcome || reviewProjection(record, reviews.get(`${record.trackId}:${record.itemId}`)).status === outcome)
      .map((record) => withCoverage(record, reviews, coverageIndex));
  }

  function catalog() {
    const items = listItems();
    const tracks = LAUNCH_TRACK_IDS.map((trackId) => {
      const trackItems = items.filter((item) => item.trackId === trackId);
      const nodeMap = new Map();
      for (const item of trackItems) {
        const node = nodeMap.get(item.nodeId) ?? { nodeId: item.nodeId, itemCount: 0, riskCount: 0, units: new Map() };
        node.itemCount += 1;
        node.riskCount += item.riskFlags.length > 0 ? 1 : 0;
        const unit = node.units.get(item.learningBlockId) ?? { learningBlockId: item.learningBlockId, itemCount: 0 };
        unit.itemCount += 1;
        node.units.set(item.learningBlockId, unit);
        nodeMap.set(item.nodeId, node);
      }
      return {
        trackId,
        familyId: LAUNCH_TRACK_FAMILIES[trackId],
        itemCount: trackItems.length,
        riskCount: trackItems.filter((item) => item.riskFlags.length > 0).length,
        reviewCounts: Object.fromEntries(["unreviewed", "approved", "needs_change", "rejected", "stale"].map((status) => [status, trackItems.filter((item) => item.review.status === status).length])),
        nodes: [...nodeMap.values()].sort((left, right) => left.nodeId.localeCompare(right.nodeId)).map((node) => ({ ...node, units: [...node.units.values()].sort((left, right) => left.learningBlockId.localeCompare(right.learningBlockId)) })),
      };
    });
    return { schemaVersion: CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION, launchTrackCount: tracks.length, tracks };
  }

  function getItem(trackId, itemIdValue) {
    const record = findRecord(trackId, itemIdValue);
    return withCoverage(record, reviews, coverageIndex);
  }

  async function recordOutcome({ trackId, itemId: itemIdValue, outcome, note, reviewerId }) {
    if (!CONTENT_REVIEW_OUTCOMES.includes(outcome)) throw new Error(`Outcome must be one of ${CONTENT_REVIEW_OUTCOMES.join(", ")}.`);
    if (typeof note !== "string" || !note.trim()) throw new Error("A review note is required.");
    if (typeof reviewerId !== "string" || !reviewerId.trim()) throw new Error("A reviewer ID is required.");
    const record = findRecord(trackId, itemIdValue);
    const next = {
      trackId,
      itemId: record.itemId,
      nodeId: record.nodeId,
      learningBlockId: record.learningBlockId,
      sourceFile: record.sourceFile,
      sourceFileSha256: record.sourceFileSha256,
      itemFingerprint: record.itemFingerprint,
      itemSnapshot: record.item,
      outcome,
      note: note.trim(),
      reviewerId: reviewerId.trim(),
      reviewedAt: now(),
    };
    reviews.set(`${trackId}:${record.itemId}`, next);
    await writeReviewStore(reviewPath, [...reviews.values()]);
    return withCoverage(record, reviews, coverageIndex);
  }

  async function recordBatchOutcomes({ items, outcome, note, reviewerId }) {
    if (!Array.isArray(items) || items.length === 0 || items.length > MAX_BATCH_SIZE) throw new Error(`A review batch must contain 1-${MAX_BATCH_SIZE} items.`);
    const resolved = items.map((entry) => findRecord(entry.trackId, entry.itemId));
    const results = [];
    for (const record of resolved) results.push(await recordOutcome({ trackId: record.trackId, itemId: record.itemId, outcome, note, reviewerId }));
    return results;
  }

  return Object.freeze({
    catalog,
    listItems,
    getItem,
    recordOutcome,
    recordBatchOutcomes,
    reviewPath,
    launchTrackIds: LAUNCH_TRACK_IDS,
  });
}

function html() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Patternly Content Review Console</title>
<style>body{font:15px system-ui,sans-serif;margin:0;color:#17202a;background:#f6f7f9}header{padding:20px;background:#17202a;color:white}main{display:grid;grid-template-columns:minmax(260px,35%) 1fr;gap:16px;padding:16px;max-width:1400px;margin:auto}section,article{background:white;border:1px solid #d7dce2;border-radius:8px;padding:14px}input,select,button,textarea{font:inherit;padding:8px;margin:4px 0}input,select,textarea{width:100%;box-sizing:border-box}button{cursor:pointer}.item{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid #edf0f2;background:white;padding:10px}.risk{color:#9b1c1c}.muted{color:#5d6873}pre{white-space:pre-wrap;overflow:auto;background:#f1f3f5;padding:10px;border-radius:4px}.field{margin:10px 0}label{display:block;font-weight:600}.status{padding:4px 7px;border-radius:10px;background:#e8edf2;display:inline-block}.stale{background:#ffe3a3}.approved{background:#d5f5dc}.needs_change{background:#fff0c2}.rejected{background:#ffd6d6}</style></head>
<body><header><h1>Patternly Content Review Console</h1><p>Local/internal review aid. Source files remain authoritative; signals are advisory.</p></header>
<main><section><form id="filters"><label for="track">Track</label><select id="track"><option value="">All launch tracks</option></select><label for="node">Node</label><input id="node" placeholder="node id"><label for="unit">Mental unit</label><input id="unit" placeholder="mental unit id"><label for="query">Search</label><input id="query" placeholder="prompt, taxonomy, source"><label><input id="risk" type="checkbox" style="width:auto"> advisory risks only</label><button>Refresh items</button></form><p id="count" class="muted"></p><div id="items"></div></section><article><div id="detail" class="muted">Select an item to inspect its decision, feedback, provenance, coverage, and review state.</div></article></main>
<script>
const $=id=>document.getElementById(id); let current=null;
async function api(path,options){const response=await fetch(path,options);const body=await response.json();if(!response.ok)throw new Error(body.error||'Request failed');return body;}
async function refresh(){const params=new URLSearchParams();for(const [id,key] of [['track','trackId'],['node','nodeId'],['unit','learningBlockId'],['query','query']])if($(id).value)params.set(key,$(id).value);if($('risk').checked)params.set('riskOnly','true');const body=await api('/api/items?'+params);$('count').textContent=body.items.length+' items';$('items').replaceChildren(...body.items.map(item=>{const button=document.createElement('button');button.className='item';button.onclick=()=>show(item.trackId,item.itemId);button.innerHTML='<strong>'+escapeHtml(item.itemId||item.itemKey)+'</strong><br><span class="muted">'+escapeHtml(item.nodeId)+' / '+escapeHtml(item.learningBlockId)+'</span><br>'+escapeHtml(item.prompt.slice(0,180))+'<br><span class="status '+item.review.status+'">'+item.review.status+'</span> '+(item.riskFlags.length?'<span class="risk">'+item.riskFlags.join(', ')+'</span>':'');return button;}));}
async function show(trackId,itemId){current=await api('/api/items/'+encodeURIComponent(trackId)+'/'+encodeURIComponent(itemId));const detail=$('detail');detail.replaceChildren();const title=document.createElement('h2');title.textContent=current.itemId;detail.append(title);const meta=document.createElement('p');meta.innerHTML='<span class="status '+current.review.status+'">'+current.review.status+'</span> '+escapeHtml(current.sourceFile);detail.append(meta);for(const [label,value] of [['Prompt',current.prompt],['Taxonomy',JSON.stringify(current.taxonomy,null,2)],['Interaction',JSON.stringify(current.item.interaction||{},null,2)],['Feedback',JSON.stringify(current.item.feedback||{},null,2)],['Provenance',JSON.stringify(current.item.sourceBinding||current.item.authoringProvenance||{},null,2)],['Coverage',JSON.stringify(current.coverage,null,2)],['Advisory risks',current.riskFlags.join(', ')||'none'],['Changed fields',current.review.changedFields.join(', ')||'none']]){const block=document.createElement('div');block.className='field';const labelNode=document.createElement('label');labelNode.textContent=label;const pre=document.createElement('pre');pre.textContent=value;block.append(labelNode,pre);detail.append(block);}const form=document.createElement('form');form.innerHTML='<label>Outcome<select id="outcome"><option>approved</option><option>needs_change</option><option>rejected</option></select></label><label>Reviewer ID<input id="reviewer" required></label><label>Note<textarea id="note" required></textarea></label><button>Record current outcome</button>';form.onsubmit=async event=>{event.preventDefault();try{await api('/api/reviews',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({trackId:current.trackId,itemId:current.itemId,outcome:$('outcome').value,reviewerId:$('reviewer').value,note:$('note').value})});await refresh();await show(current.trackId,current.itemId);}catch(error){alert(error.message);}};detail.append(form);}
function escapeHtml(value){return String(value).replace(/[&<>\"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[character]));}
async function init(){const catalog=await api('/api/catalog');for(const track of catalog.tracks){const option=document.createElement('option');option.value=track.trackId;option.textContent=track.trackId+' ('+track.itemCount+')';$('track').append(option);}await refresh();} $('filters').onsubmit=event=>{event.preventDefault();refresh().catch(error=>alert(error.message));};init().catch(error=>alert(error.message));
</script></body></html>`;
}

async function requestBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error("Request body is too large.");
  }
  return JSON.parse(body || "{}");
}

function json(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(value));
}

export async function startContentReviewConsole({ root = ROOT, reviewPath = join(root, CONTENT_REVIEW_OUTCOMES_PATH), host = "127.0.0.1", port = 4173 } = {}) {
  const service = await createContentReviewConsole({ root, reviewPath });
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", `http://${host}`);
      if (request.method === "GET" && url.pathname === "/") {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        response.end(html());
        return;
      }
      if (request.method === "GET" && url.pathname === "/api/catalog") {
        json(response, 200, service.catalog());
        return;
      }
      if (request.method === "GET" && url.pathname === "/api/items") {
        json(response, 200, { items: service.listItems({
          trackId: url.searchParams.get("trackId") || undefined,
          nodeId: url.searchParams.get("nodeId") || undefined,
          learningBlockId: url.searchParams.get("learningBlockId") || undefined,
          query: url.searchParams.get("query") || undefined,
          riskOnly: url.searchParams.get("riskOnly") === "true",
          outcome: url.searchParams.get("outcome") || undefined,
        }) });
        return;
      }
      const itemMatch = url.pathname.match(/^\/api\/items\/([^/]+)\/([^/]+)$/);
      if (request.method === "GET" && itemMatch) {
        json(response, 200, service.getItem(decodeURIComponent(itemMatch[1]), decodeURIComponent(itemMatch[2])));
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/reviews") {
        json(response, 200, await service.recordOutcome(await requestBody(request)));
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/reviews/batch") {
        json(response, 200, { items: await service.recordBatchOutcomes(await requestBody(request)) });
        return;
      }
      json(response, 404, { error: "Not found." });
    } catch (error) {
      json(response, 400, { error: error instanceof Error ? error.message : "Request failed." });
    }
  });
  await new Promise((resolveServer, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolveServer);
  });
  return { server, service, address: server.address() };
}

function parseArguments(argumentsList) {
  const values = {};
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (!argument.startsWith("--")) continue;
    values[argument.slice(2)] = argumentsList[index + 1]?.startsWith("--") ? true : argumentsList[++index];
  }
  return values;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command = "serve", ...argumentsList] = process.argv.slice(2);
  const values = parseArguments(argumentsList);
  if (command === "serve") {
    const running = await startContentReviewConsole({ port: Number(values.port ?? 4173) });
    process.stdout.write(`Patternly Content Review Console: http://${running.address.address}:${running.address.port}/\n`);
  } else {
    const service = await createContentReviewConsole();
    if (command === "catalog") process.stdout.write(`${JSON.stringify(service.catalog(), null, 2)}\n`);
    else if (command === "list") process.stdout.write(`${JSON.stringify(service.listItems({ trackId: values.track, nodeId: values.node, learningBlockId: values.unit, query: values.query, riskOnly: values.riskOnly === true, outcome: values.outcome }), null, 2)}\n`);
    else if (command === "item") process.stdout.write(`${JSON.stringify(service.getItem(values.track, values.item), null, 2)}\n`);
    else if (command === "review") process.stdout.write(`${JSON.stringify(await service.recordOutcome({ trackId: values.track, itemId: values.item, outcome: values.outcome, note: values.note, reviewerId: values.reviewer }), null, 2)}\n`);
    else throw new Error("Usage: content-review-console [serve|catalog|list|item|review].");
  }
}
