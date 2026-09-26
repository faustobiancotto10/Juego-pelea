import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cloneModel,
  loadV2Model,
  validateLoadedModel,
} from '../scripts/lib/coord-v2-model.mjs';

const entry = (value, path='fixture.json') => ({ path, value });
const CLAIM_SLOT='V2-TRIAL-CLAIM-001-S1';
const CLAIM_TASK='V2-TRIAL-CLAIM-001';
const CLAIM_ROLE='gonza';
const CLAIM_INSTANCE='gonza-v2-a';

function addClaim(model, expectedParentSha) {
  model.claimsEntries.push(entry({
    schemaVersion: 1,
    id: 'claim:qa-adversarial',
    slotId: CLAIM_SLOT,
    taskId: CLAIM_TASK,
    roleId: CLAIM_ROLE,
    instanceId: CLAIM_INSTANCE,
    expectedParentSha,
  }, 'qa-claim.json'));
}

test('V2 claim eligibility rejects malformed inputShas instead of ignoring them', () => {
  const model=cloneModel(loadV2Model(process.cwd()));
  model.tasksEntries[0].value.inputShas=['not-a-git-sha'];
  addClaim(model, '097b591ab7f5d75636cd490b6ba3c2fcd7f67e8e');
  const result=validateLoadedModel(model);
  assert.ok(
    result.errors.some((error)=>/input.*sha|sha.*input/i.test(error)),
    `claim-time validation ignored malformed inputShas: ${JSON.stringify(result.errors)}`
  );
});

test('V2 claim eligibility rejects an expected parent outside the task base lineage', () => {
  const model=cloneModel(loadV2Model(process.cwd()));
  // This is the older frozen R005 base and therefore predates the V2 task base.
  const olderAncestor='378a991d55bed03e6237a03fdf6dfe96653fae72';
  addClaim(model, olderAncestor);
  const result=validateLoadedModel(model, { strictGit: true });
  assert.ok(
    result.errors.some((error)=>/claim.*(parent|lineage)|expectedParentSha.*(base|lineage)/i.test(error)),
    `claim expectedParentSha was not checked against task base lineage: ${JSON.stringify(result.errors)}`
  );
});
