#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { loadV2Model, validateLoadedModel, writeProjection } from './lib/coord-v2-model.mjs';

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

const slotId = arg('--slot');
const instanceId = arg('--instance');
const remote = arg('--remote') ?? 'origin';
if (!slotId || !instanceId) fail('usage: node scripts/coord-v2-claim.mjs --slot <slot> --instance <instance> [--remote origin]');

const model = loadV2Model(process.cwd());
const initial = validateLoadedModel(model);
if (initial.errors.length) fail(initial.errors.join('\n'));
const slot = initial.maps.slots.get(slotId);
const instance = initial.maps.instances.get(instanceId);
if (!slot) fail(`unknown slot ${slotId}`);
if (!instance) fail(`unknown instance ${instanceId}`);
if (slot.roleId !== instance.roleId) fail(`instance ${instanceId} role ${instance.roleId} cannot occupy slot role ${slot.roleId}`);
const task = initial.maps.tasks.get(slot.taskId);
for (const dep of task.dependencies ?? []) {
  const depId = typeof dep === 'string' ? dep : dep.taskId;
  const state = initial.stateFor(depId);
  if (!['VERIFIED', 'ARCHIVED'].includes(state)) fail(`dependency ${depId} is ${state}`);
}

let expectedParent;
try {
  git(['fetch', remote, slot.claimRef]);
  expectedParent = git(['rev-parse', 'FETCH_HEAD']);
} catch {
  fail(`claim ref ${slot.claimRef} is not seeded; explicit integrator seeding is required`);
}
const head = git(['rev-parse', 'HEAD']);
if (head !== expectedParent) {
  fail(`stale claim checkout: HEAD ${head} != fetched claim ref ${expectedParent}; reread current state first`);
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
writeProjection(loadV2Model(process.cwd()));

git(['add', `coordination/v2/claims/${slotId}.json`, 'coordination/v2/CURRENT.json']);
git(['commit', '-m', `coord-v2: claim ${slotId} with ${instanceId}`]);
const candidate = git(['rev-parse', 'HEAD']);

try {
  git(['push', remote, `${candidate}:${slot.claimRef}`], { stdio: ['ignore', 'pipe', 'pipe'] });
  console.log(JSON.stringify({ result: 'CLAIM_WON', slotId, instanceId, expectedParent, candidate, claimRef: slot.claimRef }));
} catch (error) {
  console.error(JSON.stringify({ result: 'CLAIM_LOST', slotId, instanceId, expectedParent, candidate, claimRef: slot.claimRef }));
  console.error('Remote ref advanced. Reread current state; never force-push a claim.');
  process.exit(2);
}
