import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/** Historical release/provenance proofs stay bound to their exact admitted producer. */
export async function createPreQleProducerFixture(repositoryRoot) {
  const parent = await realpath(await mkdtemp(path.join(tmpdir(), 'patternly-pre-qle-proof-')));
  const root = path.join(parent, 'repo');
  try {
    execFileSync('git', ['clone', '--shared', '--no-checkout', '--quiet', repositoryRoot, root], { stdio: 'pipe' });
    execFileSync('git', ['checkout', '--quiet', '--detach', '58d7e8b918590abfe3cfa4da2594f1c12653f547'], { cwd: root, stdio: 'pipe' });
    return { root, cleanup: () => rm(parent, { recursive: true, force: true }) };
  } catch (error) { await rm(parent, {recursive:true, force:true}); throw error; }
}
