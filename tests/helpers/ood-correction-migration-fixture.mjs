import { copyCurrentMigrationFixture } from "./current-migration-fixture.mjs";

/** Current OOD successor against fixed unrelated historical banks. */
export async function copyOodCorrectionMigrationFixture(repositoryRoot, fixtureRoot) {
  await copyCurrentMigrationFixture(repositoryRoot, fixtureRoot);
}
