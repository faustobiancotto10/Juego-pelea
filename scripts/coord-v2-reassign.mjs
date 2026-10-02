#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { loadRemoteV2Model, validateLoadedModel } from './lib/coord-v2-model.mjs';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}
function git(args, options = {}) {
  return execFileSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  }).trim();
}
function fail(message) {
  console.error(message);
  process.exit(1);
}
function requireCommit(remote, sha, label) {
  if (!/^[0-9a-f]{40}$/i.test(sha ?? '')) fail(`${label} must be a 40-char SHA`);
  try {
    git(['cat-file', '-e', `${sha}^{commit}`], { stdio: 'ignore' });
  } catch {
    try {
      git(['fetch', '--no-tags', remote, sha], { stdio: 'ignore' });
      git(['cat-file', '-e', `${sha}^{commit}`], { stdio: 'ignore' });
    } catch {
      fail(`${label} commit unavailable: ${sha}`);
    }
  }
}
function isAncestor(base, head) {
  try {
    git(['merge-base', '--is-ancestor', base, head], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const slotId = arg('--slot');
const fromInstanceId = arg('--from');
const toInstanceId = arg('--to');
const checkpointSha = arg('--checkpoint');
const remote = arg('--remote') ?? 'origin';

if (!slotId || !fromInstanceId || !toInstanceId || !checkpointSha) {
  fail('usage: node scripts/coord-v2-reassign.mjs --slot <slot> --from <instance> --to <replacement> --checkpoint <sha> [--remote origin]');
}

requireCommit(remote, checkpointSha, 'checkpoint');

const model = loadRemoteV2Model(process.cwd(), remote);
const initial = validateLoadedModel(model, { strictGit: true });
if (initial.errors.length) fail(initial.errors.join('\n'));

const slot = initial.maps.slots.get(slotId);
if (!slot) fail(`unknown slot ${slotId}`);
const task = initial.maps.tasks.get(slot.taskId);
const fromInstance = initial.maps.instances.get(fromInstanceId);
const toInstance = initial.maps.instances.get(toInstanceId);
if (!fromInstance || !toInstance) fail('unknown source or replacement instance');
if (fromInstance.roleId !== slot.roleId || toInstance.roleId !== slot.roleId) fail('source/replacement role does not match slot');
if (toInstance.replacementOf !== fromInstanceId) fail(`replacement ${toInstanceId} must declare replacementOf=${fromInstanceId}`);

const currentClaim = initial.claimBySlot.get(slotId);
if (!currentClaim) fail(`slot ${slotId} is not currently claimed`);
if (currentClaim.instanceId !== fromInstanceId) fail(`slot ${slotId} is owned by ${currentClaim.instanceId}, not ${fromInstanceId}`);
if (initial.claimByInstance.has(toInstanceId)) fail(`replacement instance ${toInstanceId} already occupies another slot`);

const claimAuthorityRef = model.configDoc?.claimAuthorityRef;
const claimHead = model.remoteClaimAuthorityHead;
if (!claimAuthorityRef || !claimHead) fail('missing global claim authority head');
const localHead = git(['rev-parse', 'HEAD']);
if (localHead !== claimHead) fail(`stale reassignment checkout: HEAD ${localHead} != claim authority head ${claimHead}`);

const lineageBase = task.lineageBaseSha ?? task.baseSha;
requireCommit(remote, lineageBase, 'lineage base');
if (!isAncestor(lineageBase, checkpointSha)) fail(`checkpoint ${checkpointSha} is outside task lineage ${lineageBase}`);

const workRef = slot.branchRef.replace(/^refs\/heads\//, '');
const workLs = git(['ls-remote', '--heads', remote, slot.branchRef]);
if (!workLs) fail(`work ref ${slot.branchRef} is not seeded`);
const workHead = workLs.split(/\s+/)[0];
requireCommit(remote, workHead, 'work head');
if (!isAncestor(checkpointSha, workHead)) fail(`checkpoint ${checkpointSha} is not contained by current work ref ${workHead}`);

const eventDir = join(process.cwd(), 'coordination/v2/claim-events', slotId);
mkdirSync(eventDir, { recursive: true });
const eventPath = join(eventDir, `reassign-from-${claimHead}.json`);
const event = {
  schemaVersion: 1,
  id: `reassign:${slotId}:${claimHead}`,
  slotId,
  taskId: slot.taskId,
  roleId: slot.roleId,
  fromInstanceId,
  toInstanceId,
  priorClaimHeadSha: claimHead,
  checkpointSha,
  workRef: slot.branchRef,
  workHeadSha: workHead,
};
writeFileSync(eventPath, JSON.stringify(event, null, 2) + '\n');

const claimPath = join(process.cwd(), 'coordination/v2/claims', `${slotId}.json`);
const replacementClaim = {
  schemaVersion: 1,
  id: `claim:${slotId}`,
  slotId,
  taskId: slot.taskId,
  roleId: slot.roleId,
  instanceId: toInstanceId,
  expectedParentSha: claimHead,
};
writeFileSync(claimPath, JSON.stringify(replacementClaim, null, 2) + '\n');

git(['add', `coordination/v2/claims/${slotId}.json`, `coordination/v2/claim-events/${slotId}/reassign-from-${claimHead}.json`]);
git(['commit', '-m', `coord-v2: reassign ${slotId} from ${fromInstanceId} to ${toInstanceId}`]);
const candidate = git(['rev-parse', 'HEAD']);

try {
  git(['push', remote, `${candidate}:${claimAuthorityRef}`], { stdio: ['ignore', 'pipe', 'pipe'] });
} catch {
  console.error(JSON.stringify({ result: 'REASSIGN_LOST', slotId, fromInstanceId, toInstanceId, claimHead, candidate }));
  console.error('Claim authority ref advanced. Reconstruct global state; never force a reassignment.');
  process.exit(2);
}

const after = loadRemoteV2Model(process.cwd(), remote);
const verified = validateLoadedModel(after, { strictGit: true });
if (verified.errors.length) fail(verified.errors.join('\n'));
const afterClaim = verified.claimBySlot.get(slotId);
if (!afterClaim || afterClaim.instanceId !== toInstanceId) fail('post-reassignment global owner mismatch');
if (verified.claimByInstance.has(fromInstanceId)) fail('source instance remains active after reassignment');

console.log(JSON.stringify({
  result: 'REASSIGN_WON',
  slotId,
  fromInstanceId,
  toInstanceId,
  checkpointSha,
  priorClaimHeadSha: claimHead,
  candidate,
  claimAuthorityRef,
  workRef: slot.branchRef,
  workHeadSha: workHead,
}));
