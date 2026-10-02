import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  buildProjection,
  cloneModel,
  loadV2Model,
  validateLoadedModel,
  validateTaskTransition,
  withResolvedRemoteClaims,
} from '../scripts/lib/coord-v2-model.mjs';

const BASE = '4a47962e563b8e444ab6cf6a288db66c13dda743';
const entry = (value, path = 'fixture.json') => ({ path, value });
const validTask = (id, roleId, slotId) => ({
  schemaVersion: 1,
  id,
  roleId,
  kind: 'synthetic',
  baseSha: BASE,
  lineageBaseSha: BASE,
  inputShas: [],
  dependencies: [],
  slotIds: [slotId],
  qaRequired: false,
  acceptance: ['fixture'],
  downstreamTaskId: null,
});
const validSlot = (id, taskId, roleId, ownedPaths) => ({
  schemaVersion: 1,
  id,
  taskId,
  roleId,
  branchRef: `refs/heads/coord-v2-work/${id.toLowerCase()}`,
  claimRef: `refs/heads/coord-v2-claims/${id.toLowerCase()}`,
  baseSha: BASE,
  ownedPaths,
  integrationTarget: null,
});
const validInstance = (id, roleId) => ({
  schemaVersion: 1,
  id,
  roleId,
  label: id,
  replacementOf: null,
});
const byIdEntry = (entries, id) => {
  const found = entries.find((entry) => entry.value.id === id);
  assert.ok(found, `missing fixture entry ${id}`);
  return found;
};
const trialTaskEntry = (model) => byIdEntry(model.tasksEntries, 'V2-TRIAL-CLAIM-001');
const trialSlotEntry = (model) => byIdEntry(model.slotsEntries, 'V2-TRIAL-CLAIM-001-S1');
const trialInstanceEntry = (model) => byIdEntry(model.instancesEntries, 'gonza-v2-a');

const validClaim = (id, slotId, taskId, roleId, instanceId) => ({
  schemaVersion: 1,
  id,
  slotId,
  taskId,
  roleId,
  instanceId,
  expectedParentSha: BASE,
});

test('baseline V2 trial model validates and committed CURRENT is derived exactly', () => {
  const model = loadV2Model(process.cwd());
  const result = validateLoadedModel(model);
  assert.deepEqual(result.errors, []);
  assert.equal(result.stateFor('V2-TRIAL-CLAIM-001'), 'READY');

  const projection = buildProjection(model, result);
  assert.equal(projection.legacyCompatibility.roundId, 'R005-V07-GAMEPLAY-PRESENTATION-EXPANSION');
  assert.equal(projection.legacyCompatibility.roundState, 'ACTIVE');
  assert.equal(projection.legacyCompatibility.mode, 'read-only-compatibility');
  assert.equal(projection.v2.instances.every((instance) => instance.state === 'UNASSIGNED'), true);
});

test('BOOT is compact and explicitly keeps V2 isolated from live R005', () => {
  const boot = readFileSync('coordination/BOOT.md', 'utf8');
  assert.match(boot, /ROLE != TASK != SLOT\/LANE != INSTANCE\/WORKER/);
  assert.match(boot, /not converted to V2/i);
  assert.match(boot, /--remote origin/);
  assert.match(boot, /claim authority ref/i);
  assert.match(boot, /legacy per-slot claim ref/i);
  assert.match(boot, /No force-push claiming/i);
});


test('V2 claim eligibility rejects malformed inputShas instead of ignoring them', () => {
  const model = cloneModel(loadV2Model(process.cwd()));
  trialTaskEntry(model).value.inputShas = ['not-a-git-sha'];
  const result = validateLoadedModel(model);
  assert.ok(result.errors.some((error) => /inputSha is not a 40-char SHA/.test(error)), `claim-time validation ignored malformed inputShas: ${JSON.stringify(result.errors)}`);
});

test('strict V2 validation rejects missing required input commits', () => {
  const model = cloneModel(loadV2Model(process.cwd()));
  trialTaskEntry(model).value.inputShas = ['1111111111111111111111111111111111111111'];
  const result = validateLoadedModel(model, { strictGit: true });
  assert.ok(result.errors.some((error) => /inputSha .* unavailable in current checkout/.test(error)));
});

test('strict V2 validation rejects required input commits outside task lineage', () => {
  const model = cloneModel(loadV2Model(process.cwd()));
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const tree = execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { encoding: 'utf8' }).trim();
  const orphan = execFileSync('git', ['commit-tree', tree], {
    input: 'orphan fixture\n',
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'coord-v2-test',
      GIT_AUTHOR_EMAIL: 'coord-v2-test@example.invalid',
      GIT_COMMITTER_NAME: 'coord-v2-test',
      GIT_COMMITTER_EMAIL: 'coord-v2-test@example.invalid',
    },
  }).trim();
  trialTaskEntry(model).value.baseSha = head;
  trialTaskEntry(model).value.lineageBaseSha = head;
  trialSlotEntry(model).value.baseSha = head;
  trialTaskEntry(model).value.inputShas = [orphan];
  const result = validateLoadedModel(model, { strictGit: true });
  assert.ok(result.errors.some((error) => /wrong lineage/.test(error)), `expected wrong-lineage error, got ${JSON.stringify(result.errors)}`);
});

test('remote claim aggregation overrides branch-local readiness and evaluates global conflicts together', () => {
  const model = cloneModel(loadV2Model(process.cwd()));
  model.tasksEntries = model.tasksEntries.filter((entry) => entry.value.id === 'V2-TRIAL-CLAIM-001');
  model.slotsEntries = model.slotsEntries.filter((entry) => entry.value.id === 'V2-TRIAL-CLAIM-001-S1');
  model.instancesEntries = model.instancesEntries.filter((entry) => ['gonza-v2-a', 'gonza-v2-b'].includes(entry.value.id));
  model.tasksEntries.push(entry(validTask('T2', 'gonza', 'T2-S1'), 't2.json'));
  model.slotsEntries.push(entry(validSlot('T2-S1', 'T2', 'gonza', ['coordination/v2/trials/V2-TRIAL-CLAIM-001/sub/**']), 't2s1.json'));
  model.instancesEntries.push(entry(validInstance('gonza-v2-c', 'gonza'), 'c.json'));

  const parentA = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const parentC = 'cccccccccccccccccccccccccccccccccccccccc';
  const authorityHead = 'dddddddddddddddddddddddddddddddddddddddd';
  let resolverCalls = 0;

  const remote = withResolvedRemoteClaims(model, (authorityRef) => {
    resolverCalls += 1;
    assert.equal(authorityRef, 'refs/heads/coord-v2-claims/authority');
    return {
      headSha: authorityHead,
      claims: [
        {
          path: `${authorityRef}:coordination/v2/claims/V2-TRIAL-CLAIM-001-S1.json`,
          value: {
            ...validClaim('claim:a', 'V2-TRIAL-CLAIM-001-S1', 'V2-TRIAL-CLAIM-001', 'gonza', 'gonza-v2-a'),
            expectedParentSha: parentA,
          },
          sourceRef: authorityRef,
          sourceHeadSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          sourceParentSha: parentA,
        },
        {
          path: `${authorityRef}:coordination/v2/claims/T2-S1.json`,
          value: {
            ...validClaim('claim:c', 'T2-S1', 'T2', 'gonza', 'gonza-v2-a'),
            expectedParentSha: parentC,
          },
          sourceRef: authorityRef,
          sourceHeadSha: authorityHead,
          sourceParentSha: parentC,
        },
      ],
    };
  });

  assert.equal(resolverCalls, 1);
  assert.equal(remote.remoteClaimAuthorityHead, authorityHead);

  const localResult = validateLoadedModel(model);
  assert.equal(localResult.stateFor('V2-TRIAL-CLAIM-001'), 'READY');

  const globalResult = validateLoadedModel(remote);
  assert.equal(globalResult.stateFor('V2-TRIAL-CLAIM-001'), 'CLAIMED');
  assert.ok(globalResult.errors.some((error) => /instance gonza-v2-a occupies multiple slots/.test(error)));
  assert.ok(globalResult.errors.some((error) => /ownedPaths overlap/.test(error)));
});

test('validator rejects mutable state copied into canonical task/slot/instance records', () => {
  const model = cloneModel(loadV2Model(process.cwd()));
  trialTaskEntry(model).value.state = 'READY';
  trialSlotEntry(model).value.instanceId = 'gonza-v2-a';
  trialInstanceEntry(model).value.state = 'ACTIVE';
  const result = validateLoadedModel(model);
  assert.ok(result.errors.some((error) => /stores mutable state/.test(error)));
  assert.ok(result.errors.some((error) => /stores derived occupancy\/state/.test(error)));
  assert.ok(result.errors.some((error) => /stores derived assignment\/state/.test(error)));
});

test('validator rejects unknown and role-incompatible instance claims', () => {
  const model = cloneModel(loadV2Model(process.cwd()));
  model.instancesEntries.push(entry(validInstance('mario-v2-a', 'mario'), 'mario.json'));
  model.claimsEntries.push(entry(
    validClaim('claim:bad-role', 'V2-TRIAL-CLAIM-001-S1', 'V2-TRIAL-CLAIM-001', 'gonza', 'mario-v2-a'),
    'bad-role.json',
  ));
  const result = validateLoadedModel(model);
  assert.ok(result.errors.some((error) => /instance role does not match claim role/.test(error)));
});

test('validator rejects duplicate slot owner and one instance occupying multiple slots', () => {
  const model = cloneModel(loadV2Model(process.cwd()));
  model.claimsEntries.push(entry(
    validClaim('claim:a', 'V2-TRIAL-CLAIM-001-S1', 'V2-TRIAL-CLAIM-001', 'gonza', 'gonza-v2-a'),
    'a.json',
  ));
  model.claimsEntries.push(entry(
    validClaim('claim:b', 'V2-TRIAL-CLAIM-001-S1', 'V2-TRIAL-CLAIM-001', 'gonza', 'gonza-v2-b'),
    'b.json',
  ));
  const result = validateLoadedModel(model);
  assert.ok(result.errors.some((error) => /duplicate active claim owner/.test(error)));
});

test('validator rejects overlapping active owned paths', () => {
  const model = cloneModel(loadV2Model(process.cwd()));
  model.tasksEntries.push(entry(validTask('T2', 'gonza', 'T2-S1'), 't2.json'));
  model.slotsEntries.push(entry(validSlot('T2-S1', 'T2', 'gonza', ['coordination/v2/trials/V2-TRIAL-CLAIM-001/sub/**']), 't2s1.json'));
  model.instancesEntries.push(entry(validInstance('gonza-v2-c', 'gonza'), 'c.json'));
  model.claimsEntries.push(entry(validClaim('claim:a', 'V2-TRIAL-CLAIM-001-S1', 'V2-TRIAL-CLAIM-001', 'gonza', 'gonza-v2-a'), 'ca.json'));
  model.claimsEntries.push(entry(validClaim('claim:c', 'T2-S1', 'T2', 'gonza', 'gonza-v2-c'), 'cc.json'));
  const result = validateLoadedModel(model);
  assert.ok(result.errors.some((error) => /ownedPaths overlap/.test(error)));
});

test('validator rejects dependency cycles and a claim made before dependencies verify', () => {
  const cycle = cloneModel(loadV2Model(process.cwd()));
  byIdEntry(cycle.tasksEntries, 'V2-TRIAL-CLAIM-001').value.dependencies = [{ taskId: 'V2-TRIAL-CLAIM-001', requires: 'VERIFIED' }];
  const cycleResult = validateLoadedModel(cycle);
  assert.ok(cycleResult.errors.some((error) => /depends on itself|dependency cycle/.test(error)));

  const model = cloneModel(loadV2Model(process.cwd()));
  model.tasksEntries.push(entry(validTask('DEP', 'gonza', 'DEP-S1'), 'dep.json'));
  model.slotsEntries.push(entry(validSlot('DEP-S1', 'DEP', 'gonza', ['coordination/v2/trials/dep/**']), 'depslot.json'));
  trialTaskEntry(model).value.dependencies = [{ taskId: 'DEP', requires: 'VERIFIED' }];
  model.claimsEntries.push(entry(validClaim('claim:a', 'V2-TRIAL-CLAIM-001-S1', 'V2-TRIAL-CLAIM-001', 'gonza', 'gonza-v2-a'), 'claim.json'));
  const result = validateLoadedModel(model);
  assert.equal(result.stateFor('V2-TRIAL-CLAIM-001'), 'WAITING_DEPENDENCY');
  assert.ok(result.errors.some((error) => /unsatisfied dependency DEP/.test(error)));
});

test('stale QA BLOCK remains attached to rejected SHA while approved replacement becomes current', () => {
  const model = cloneModel(loadV2Model(process.cwd()));
  trialTaskEntry(model).value.qaRequired = true;
  const rejected = '1111111111111111111111111111111111111111';
  const approved = '2222222222222222222222222222222222222222';
  model.handoffsEntries.push(entry({
    schemaVersion: 1,
    id: 'H1',
    taskId: 'V2-TRIAL-CLAIM-001',
    candidateSha: rejected,
    supersedes: null,
  }, 'h1.json'));
  model.handoffsEntries.push(entry({
    schemaVersion: 1,
    id: 'H2',
    taskId: 'V2-TRIAL-CLAIM-001',
    candidateSha: approved,
    supersedes: 'H1',
  }, 'h2.json'));
  model.qaEntries.push(entry({
    schemaVersion: 1,
    id: 'Q1',
    taskId: 'V2-TRIAL-CLAIM-001',
    handoffId: 'H1',
    candidateSha: rejected,
    verdict: 'BLOCK',
  }, 'q1.json'));
  model.qaEntries.push(entry({
    schemaVersion: 1,
    id: 'Q2',
    taskId: 'V2-TRIAL-CLAIM-001',
    handoffId: 'H2',
    candidateSha: approved,
    verdict: 'APPROVE',
  }, 'q2.json'));

  const result = validateLoadedModel(model);
  assert.equal(result.stateFor('V2-TRIAL-CLAIM-001'), 'VERIFIED');
  assert.equal(result.maps.qaReceipts.get('Q1').verdict, 'BLOCK');
  assert.equal(result.maps.qaReceipts.get('Q1').candidateSha, rejected);
  assert.equal(result.maps.qaReceipts.get('Q2').candidateSha, approved);
});

test('validator rejects QA candidate mismatch and release eligibility mismatch', () => {
  const model = cloneModel(loadV2Model(process.cwd()));
  trialTaskEntry(model).value.qaRequired = true;
  model.handoffsEntries.push(entry({
    schemaVersion: 1,
    id: 'H1',
    taskId: 'V2-TRIAL-CLAIM-001',
    candidateSha: '1111111111111111111111111111111111111111',
    supersedes: null,
  }, 'h1.json'));
  model.qaEntries.push(entry({
    schemaVersion: 1,
    id: 'Q1',
    taskId: 'V2-TRIAL-CLAIM-001',
    handoffId: 'H1',
    candidateSha: '2222222222222222222222222222222222222222',
    verdict: 'APPROVE',
  }, 'q1.json'));
  model.releasesEntries.push(entry({
    schemaVersion: 1,
    id: 'R1',
    taskId: 'V2-TRIAL-CLAIM-001',
    candidateSha: '3333333333333333333333333333333333333333',
    eligible: true,
  }, 'r1.json'));
  const result = validateLoadedModel(model);
  assert.ok(result.errors.some((error) => /candidate SHA mismatch/.test(error)));
  assert.ok(result.errors.some((error) => /marks task .* eligible while state/.test(error)));
  assert.ok(result.errors.some((error) => /candidate does not match current handoff/.test(error)));
});

test('task transition validator rejects shortcuts and requires explicit BLOCKED repair', () => {
  assert.equal(validateTaskTransition('READY', 'CLAIMED'), null);
  assert.match(validateTaskTransition('READY', 'VERIFIED'), /invalid task transition/);
  assert.match(validateTaskTransition('BLOCKED', 'READY'), /requires repairRef/);
  assert.equal(validateTaskTransition('BLOCKED', 'READY', { repairRef: 'repair:H2' }), null);
});

test('claim client contains no force-push escape hatch', () => {
  const source = readFileSync('scripts/coord-v2-claim.mjs', 'utf8');
  assert.doesNotMatch(source, /--force|force-with-lease/);
  assert.match(source, /loadRemoteV2Model/);
  assert.match(source, /strictGit:\s*true/);
  assert.doesNotMatch(source, /CURRENT\.json/);
  assert.match(source, /CLAIM_WON/);
  assert.match(source, /CLAIM_LOST/);
  assert.match(source, /Reread global current state|reread global current state/i);
});


test('remote claim reconstruction uses one globally serialized authority snapshot', () => {
  const model = cloneModel(loadV2Model(process.cwd()));
  assert.equal(model.configDoc?.claimAuthorityRef, 'refs/heads/coord-v2-claims/authority');

  let calls = 0;
  const authorityHead = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const remote = withResolvedRemoteClaims(model, () => {
    calls += 1;
    return {
      headSha: authorityHead,
      claims: [],
    };
  });

  assert.equal(calls, 1, 'remote claim authority must be resolved exactly once');
  assert.equal(remote.remoteClaimAuthorityHead, authorityHead);
  assert.deepEqual(remote.claimsEntries, []);
});

test('claim and reassignment clients mutate the shared claim authority ref, never a slot ref', () => {
  const claimSource = readFileSync('scripts/coord-v2-claim.mjs', 'utf8');
  const reassignSource = readFileSync('scripts/coord-v2-reassign.mjs', 'utf8');

  assert.match(claimSource, /claimAuthorityRef/);
  assert.match(reassignSource, /claimAuthorityRef/);
  assert.doesNotMatch(claimSource, /\$\{candidate\}:\$\{slot\.claimRef\}/);
  assert.doesNotMatch(reassignSource, /\$\{candidate\}:\$\{slot\.claimRef\}/);
});
