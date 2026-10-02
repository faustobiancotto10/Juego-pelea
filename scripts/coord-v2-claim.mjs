#!/usr/bin/env node
import { existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import {
  buildProjection,
  loadRemoteV2Model,
  loadV2Model,
  projectionText,
  validateLoadedModel,
} from './lib/coord-v2-model.mjs';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}
function git(args, options = {}) {
  return execFileSync('git', args, { cwd: process.cwd(), encoding: 'utf8', stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'] }).trim();
}
function fail(message) {
  console.error(message);
  process.exit(1);
}
function maybeFetchCommit(remote, value) {
  if (typeof value !== 'string' || !/^[0-9a-f]{40}$/i.test(value)) return;
  try {
    git(['cat-file', '-e', `${value}^{commit}`], { stdio: 'ignore' });
  } catch {
    git(['fetch', '--no-tags', remote, value], { stdio: 'ignore' });
  }
}

const slotId = arg('--slot');
const instanceId = arg('--instance');
const remote = arg('--remote') ?? 'origin';
if (!slotId || !instanceId) fail('usage: node scripts/coord-v2-claim.mjs --slot <slot> --instance <instance> [--remote origin]');

const localModel = loadV2Model(process.cwd());
for (const entry of localModel.tasksEntries) {
  const task = entry.value;
  maybeFetchCommit(remote, task.baseSha);
  maybeFetchCommit(remote, task.lineageBaseSha);
  for (const inputSha of task.inputShas ?? []) maybeFetchCommit(remote, inputSha);
}
for (const entry of localModel.handoffsEntries) maybeFetchCommit(remote, entry.value.candidateSha);

const model = loadRemoteV2Model(process.cwd(), remote);
const initial = validateLoadedModel(model, { strictGit: true });
if (initial.errors.length) fail(initial.errors.join('\n'));

const slot = initial.maps.slots.get(slotId);
const instance = initial.maps.instances.get(instanceId);
if (!slot) fail(`unknown slot ${slotId}`);
if (!instance) fail(`unknown instance ${instanceId}`);
if (slot.roleId !== instance.roleId) fail(`instance ${instanceId} role ${instance.roleId} cannot occupy slot role ${slot.roleId}`);
if (initial.claimBySlot.has(slotId)) fail(`slot ${slotId} is already claimed by ${initial.claimBySlot.get(slotId).instanceId}`);
if (initial.claimByInstance.has(instanceId)) fail(`instance ${instanceId} already occupies slot ${initial.claimByInstance.get(instanceId).slotId}`);

const task = initial.maps.tasks.get(slot.taskId);
for (const dep of task.dependencies ?? []) {
  const depId = typeof dep === 'string' ? dep : dep.taskId;
  const state = initial.stateFor(depId);
  if (!['VERIFIED', 'ARCHIVED'].includes(state)) fail(`dependency ${depId} is ${state}`);
}

const claimAuthorityRef = model.configDoc?.claimAuthorityRef;
const expectedParent = model.remoteClaimAuthorityHead;
if (!claimAuthorityRef || !expectedParent) fail('claim authority ref has no globally reconstructed head');

const head = git(['rev-parse', 'HEAD']);
if (head !== expectedParent) {
  fail(`stale claim checkout: HEAD ${head} != fetched claim authority head ${expectedParent}; checkout the authority ref head and reread global current state first`);
}

const claimDir = join(process.cwd(), 'coordination/v2/claims');
const claimPath = join(claimDir, `${slotId}.json`);
if (existsSync(claimPath)) fail(`slot ${slotId} is already claimed in this checkout`);

const claimRecord = {
  schemaVersion: 1,
  id: `claim:${slotId}`,
  slotId,
  taskId: slot.taskId,
  roleId: slot.roleId,
  instanceId,
  expectedParentSha: expectedParent,
};
writeFileSync(claimPath, JSON.stringify(claimRecord, null, 2) + '\n');

const candidateModel = loadV2Model(process.cwd());
candidateModel.claimsEntries = [
  ...model.claimsEntries.filter((entry) => entry.value.slotId !== slotId),
  {
    path: `coordination/v2/claims/${slotId}.json`,
    value: claimRecord,
  },
];
const candidateValidation = validateLoadedModel(candidateModel, { strictGit: true });
if (candidateValidation.errors.length) fail(candidateValidation.errors.join('\n'));

git(['add', `coordination/v2/claims/${slotId}.json`]);
git(['commit', '-m', `coord-v2: claim ${slotId} with ${instanceId}`]);
const candidate = git(['rev-parse', 'HEAD']);

try {
  git(['push', remote, `${candidate}:${claimAuthorityRef}`], { stdio: ['ignore', 'pipe', 'pipe'] });
  const globalAfter = loadRemoteV2Model(process.cwd(), remote);
  const afterValidation = validateLoadedModel(globalAfter, { strictGit: true });
  if (afterValidation.errors.length) fail(afterValidation.errors.join('\n'));
  console.log(JSON.stringify({
    result: 'CLAIM_WON',
    slotId,
    instanceId,
    expectedParent,
    candidate,
    claimAuthorityRef,
    globalProjection: buildProjection(globalAfter, afterValidation),
  }));
} catch {
  console.error(JSON.stringify({ result: 'CLAIM_LOST', slotId, instanceId, expectedParent, candidate, claimAuthorityRef }));
  console.error('Claim authority ref advanced. Reread global current state; never force-push a claim.');
  process.exit(2);
}
