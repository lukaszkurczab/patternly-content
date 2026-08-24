import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { createContentReviewConsole, startContentReviewConsole, CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION, LAUNCH_TRACK_IDS } from "../scripts/review/content-review-console.mjs";

test("review console exposes exactly eight launch tracks, navigable coverage, and advisory signals", async () => {
  const service = await createContentReviewConsole({ reviewPath: join(await mkdtemp("patternly-review-console-"), "outcomes.json") });
  const catalog = service.catalog();
  assert.equal(catalog.launchTrackCount, 8);
  assert.deepEqual(catalog.tracks.map((track) => track.trackId), LAUNCH_TRACK_IDS);
  assert.ok(catalog.tracks.every((track) => track.itemCount > 0 && track.nodes.length > 0));
  const items = service.listItems({ trackId: LAUNCH_TRACK_IDS[0] });
  assert.ok(items.length > 0);
  assert.ok(items[0].coverage.nodeItemCount > 0);
  assert.equal(service.listItems({ trackId: LAUNCH_TRACK_IDS[0], riskOnly: true }).every((item) => item.riskFlags.length > 0), true);
});

test("review console records one current explicit outcome and invalidates it when source identity changes", async () => {
  const directory = await mkdtemp("patternly-review-console-");
  const reviewPath = join(directory, "outcomes.json");
  const service = await createContentReviewConsole({ reviewPath, now: () => "2026-08-24T12:00:00.000Z" });
  const item = service.listItems({ trackId: "google-cloud-associate-cloud-engineer" })[0];
  const reviewed = await service.recordOutcome({ trackId: item.trackId, itemId: item.itemId, outcome: "needs_change", note: "Clarify the boundary between the two alternatives.", reviewerId: "owner-local" });
  assert.equal(reviewed.review.status, "needs_change");
  assert.match(await readFile(reviewPath, "utf8"), new RegExp(CONTENT_REVIEW_OUTCOME_SCHEMA_VERSION));
  const current = service.getItem(item.trackId, item.itemId);
  assert.equal(current.review.status, "needs_change");
  assert.equal(current.review.changedFields.length, 0);
  const second = await service.recordOutcome({ trackId: item.trackId, itemId: item.itemId, outcome: "approved", note: "Rechecked the current source item.", reviewerId: "owner-local" });
  assert.equal(second.review.status, "approved");
  const store = JSON.parse(await readFile(reviewPath, "utf8"));
  assert.equal(store.reviews.length, 1);
  await rm(directory, { recursive: true, force: true });
});

test("review console serves a local UI and bounded JSON API without fabricating approval", async () => {
  const directory = await mkdtemp("patternly-review-console-");
  const running = await startContentReviewConsole({ reviewPath: join(directory, "outcomes.json"), port: 0 });
  const address = running.server.address();
  const page = await fetch(`http://127.0.0.1:${address.port}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Patternly Content Review Console/);
  const catalog = await fetch(`http://127.0.0.1:${address.port}/api/catalog`);
  assert.equal(catalog.status, 200);
  assert.equal((await catalog.json()).launchTrackCount, 8);
  const response = await fetch(`http://127.0.0.1:${address.port}/api/reviews/batch`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: [], outcome: "approved", note: "No-op", reviewerId: "owner-local" }) });
  assert.equal(response.status, 400);
  await new Promise((resolve) => running.server.close(resolve));
  await rm(directory, { recursive: true, force: true });
});
