import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, realpath, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { sha256 } from '../../scripts/build.mjs';
import { verifyGcpAttributionHistory, verifyGcpCurrentAttributionParity } from '../../scripts/content/verify-gcp-attribution-history.mjs';

const GCP_TRACK_ID = 'google-cloud-associate-cloud-engineer';

/** Adapt only producer metadata; the admitted source and emitted artifact stay exact. */
async function adaptHistoricalGcpProfile(root) {
  const historicalBuilder = await import(pathToFileURL(path.join(root, 'scripts/build.mjs')).href);
  const { track, questions } = await historicalBuilder.validateTrack({ rootDirectory: root, trackId: GCP_TRACK_ID });
  const historical = await verifyGcpAttributionHistory({ rootDirectory: root });
  const configPath = path.join(root, 'config/tracks', `${GCP_TRACK_ID}.json`);
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const crosswalk = questions.map(question => ({
    questionId: question.questionId, nodeId: question.nodeId, domain: config.profile.nodeDomainMap[question.nodeId]
  })).sort((left, right) => left.questionId < right.questionId ? -1 : left.questionId > right.questionId ? 1 : 0);
  config.profile.currentAttribution = {
    schemaVersion: 'gcp-current-attribution-v1',
    contentVersion: track.contentVersion,
    itemCount: questions.length,
    inventorySha256: sha256(questions.map(question => question.questionId).sort()),
    crosswalkSha256: sha256(crosswalk),
    historicalArtifactSha256: historical.historicalArtifactSha256,
    historicalCrosswalkSha256: historical.crosswalkSha256
  };
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
  await verifyGcpCurrentAttributionParity({ rootDirectory: root, track, questions });
}

/** Historical release/provenance proofs stay bound to their exact admitted producer. */
export async function createPreQleProducerFixture(repositoryRoot, { currentBuilder = false } = {}) {
  const parent = await realpath(await mkdtemp(path.join(tmpdir(), 'patternly-pre-qle-proof-')));
  const root = path.join(parent, 'repo');
  try {
    execFileSync('git', ['clone', '--shared', '--no-checkout', '--quiet', repositoryRoot, root], { stdio: 'pipe' });
    execFileSync('git', ['checkout', '--quiet', '--detach', '58d7e8b918590abfe3cfa4da2594f1c12653f547'], { cwd: root, stdio: 'pipe' });
    // Provenance-only consumers hash the original config; candidate tests opt in.
    if (currentBuilder) await adaptHistoricalGcpProfile(root);
    return { root, cleanup: () => rm(parent, { recursive: true, force: true }) };
  } catch (error) { await rm(parent, {recursive:true, force:true}); throw error; }
}
