import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

export const TASK_STATES = [
  'WAITING_DEPENDENCY',
  'READY',
  'CLAIMED',
  'HANDOFF_READY',
  'VERIFIED',
  'ARCHIVED',
  'BLOCKED',
];

export const INSTANCE_STATES = ['UNASSIGNED', 'ACTIVE', 'RELEASED'];

const TASK_TRANSITIONS = new Map([
  ['WAITING_DEPENDENCY', new Set(['READY', 'BLOCKED'])],
  ['READY', new Set(['CLAIMED', 'BLOCKED'])],
  ['CLAIMED', new Set(['HANDOFF_READY', 'BLOCKED'])],
  ['HANDOFF_READY', new Set(['VERIFIED', 'BLOCKED'])],
  ['VERIFIED', new Set(['ARCHIVED'])],
  ['ARCHIVED', new Set()],
  ['BLOCKED', new Set(['READY'])],
]);

function json(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function jsonFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => ({ path: join(dir, name), value: json(join(dir, name)) }));
}

function byId(entries, label, errors) {
  const map = new Map();
  for (const entry of entries) {
    const id = entry.value?.id;
    if (!id || typeof id !== 'string') {
      errors.push(`${label} missing id: ${entry.path}`);
      continue;
    }
    if (map.has(id)) errors.push(`duplicate ${label} id ${id}`);
    else map.set(id, entry.value);
  }
  return map;
}

function sha(value) {
  return typeof value === 'string' && /^[0-9a-f]{40}$/i.test(value);
}

function normalizeOwnedPath(value) {
  return String(value ?? '').replace(/\/\*\*$/, '').replace(/\/$/, '');
}

function ownedPathsOverlap(a, b) {
  const left = normalizeOwnedPath(a);
  const right = normalizeOwnedPath(b);
  if (!left || !right) return false;
  return left === right || left.startsWith(right + '/') || right.startsWith(left + '/');
}

function parseLegacyRound(root) {
  const content = readFileSync(join(root, 'coordination/CURRENT_ROUND.md'), 'utf8');
  const state = content.match(/^Status:\s*([A-Z_]+)/m)?.[1] ?? null;
  const roundId = content.match(/^Round:\s*([^\n]+)$/m)?.[1]?.trim() ?? null;
  return {
    roundId,
    roundState: state,
    source: 'coordination/CURRENT_ROUND.md',
    mode: 'read-only-compatibility',
  };
}

function currentHandoffForTask(taskId, handoffs, errors) {
  const taskHandoffs = [...handoffs.values()].filter((h) => h.taskId === taskId);
  if (!taskHandoffs.length) return null;

  const superseded = new Set(taskHandoffs.map((h) => h.supersedes).filter(Boolean));
  const leaves = taskHandoffs.filter((h) => !superseded.has(h.id));
  if (leaves.length !== 1) {
    errors.push(`task ${taskId} must have exactly one current handoff leaf, found ${leaves.length}`);
    return null;
  }
  return leaves[0];
}

function qaForHandoff(handoff, qaReceipts, errors) {
  if (!handoff) return null;
  const matches = [...qaReceipts.values()].filter((q) => q.handoffId === handoff.id);
  if (matches.length > 1) {
    errors.push(`handoff ${handoff.id} has multiple authoritative QA receipts`);
    return null;
  }
  const qa = matches[0] ?? null;
  if (!qa) return null;
  if (qa.taskId !== handoff.taskId || qa.candidateSha !== handoff.candidateSha) {
    return null;
  }
  return qa;
}

export function loadV2Model(root = '.') {
  return {
    root,
    rolesDoc: json(join(root, 'coordination/v2/roles.json')),
    tasksEntries: jsonFiles(join(root, 'coordination/v2/tasks')),
    slotsEntries: jsonFiles(join(root, 'coordination/v2/slots')),
    instancesEntries: jsonFiles(join(root, 'coordination/v2/instances')),
    claimsEntries: jsonFiles(join(root, 'coordination/v2/claims')),
    handoffsEntries: jsonFiles(join(root, 'coordination/v2/handoffs')),
    qaEntries: jsonFiles(join(root, 'coordination/v2/qa')),
    transitionsEntries: jsonFiles(join(root, 'coordination/v2/transitions')),
    releasesEntries: jsonFiles(join(root, 'coordination/v2/releases')),
  };
}

export function cloneModel(model) {
  return structuredClone(model);
}

export function validateTaskTransition(from, to, receipt = {}) {
  if (!TASK_STATES.includes(from)) return `invalid task transition source ${from}`;
  if (!TASK_STATES.includes(to)) return `invalid task transition target ${to}`;
  if (!TASK_TRANSITIONS.get(from)?.has(to)) return `invalid task transition ${from} -> ${to}`;
  if (from === 'BLOCKED' && to === 'READY' && !receipt.repairRef) {
    return 'BLOCKED -> READY requires repairRef';
  }
  return null;
}

function verifyGitObject(root, commit, errors, warnings, strictGit, label) {
  if (!sha(commit)) {
    errors.push(`${label} is not a 40-char SHA: ${commit}`);
    return false;
  }
  try {
    execFileSync('git', ['cat-file', '-e', `${commit}^{commit}`], { cwd: root, stdio: 'ignore' });
    return true;
  } catch {
    const message = `${label} commit is unavailable in current checkout: ${commit}`;
    if (strictGit) errors.push(message);
    else warnings.push(message);
    return false;
  }
}

function verifyAncestor(root, base, head, errors, warnings, strictGit, label) {
  if (!verifyGitObject(root, base, errors, warnings, strictGit, `${label} base`)) return;
  if (!verifyGitObject(root, head, errors, warnings, strictGit, `${label} head`)) return;
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', base, head], { cwd: root, stdio: 'ignore' });
  } catch {
    errors.push(`${label} wrong lineage: ${head} is not descendant of ${base}`);
  }
}

export function validateLoadedModel(model, options = {}) {
  const root = options.root ?? model.root ?? '.';
  const strictGit = Boolean(options.strictGit);
  const errors = [];
  const warnings = [];

  const roleEntries = (model.rolesDoc?.roles ?? []).map((value, index) => ({
    path: `coordination/v2/roles.json#${index}`,
    value,
  }));
  const roles = byId(roleEntries, 'role', errors);
  const tasks = byId(model.tasksEntries, 'task', errors);
  const slots = byId(model.slotsEntries, 'slot', errors);
  const instances = byId(model.instancesEntries, 'instance', errors);
  const claims = byId(model.claimsEntries, 'claim', errors);
  const handoffs = byId(model.handoffsEntries, 'handoff', errors);
  const qaReceipts = byId(model.qaEntries, 'qa', errors);
  const releases = byId(model.releasesEntries, 'release', errors);

  for (const role of roles.values()) {
    if (!role.identityPath || !existsSync(join(root, role.identityPath))) {
      errors.push(`role ${role.id} identityPath missing: ${role.identityPath}`);
    }
  }

  for (const task of tasks.values()) {
    if ('state' in task) errors.push(`task ${task.id} stores mutable state; state must be derived`);
    if (!roles.has(task.roleId)) errors.push(`task ${task.id} references unknown role ${task.roleId}`);
    if (!Array.isArray(task.slotIds) || !task.slotIds.length) errors.push(`task ${task.id} has no slots`);
    if (!Array.isArray(task.dependencies)) errors.push(`task ${task.id} dependencies must be an array`);
    verifyGitObject(root, task.baseSha, errors, warnings, strictGit, `task ${task.id} baseSha`);
    if (task.lineageBaseSha) verifyGitObject(root, task.lineageBaseSha, errors, warnings, strictGit, `task ${task.id} lineageBaseSha`);
    for (const dep of task.dependencies ?? []) {
      const depId = typeof dep === 'string' ? dep : dep.taskId;
      if (!tasks.has(depId)) errors.push(`task ${task.id} references unknown dependency ${depId}`);
      if (depId === task.id) errors.push(`task ${task.id} depends on itself`);
    }
    for (const slotId of task.slotIds ?? []) {
      if (!slots.has(slotId)) errors.push(`task ${task.id} references unknown slot ${slotId}`);
    }
  }

  for (const slot of slots.values()) {
    if ('state' in slot || 'instanceId' in slot) errors.push(`slot ${slot.id} stores derived occupancy/state`);
    const task = tasks.get(slot.taskId);
    if (!task) errors.push(`slot ${slot.id} references unknown task ${slot.taskId}`);
    if (!roles.has(slot.roleId)) errors.push(`slot ${slot.id} references unknown role ${slot.roleId}`);
    if (task && task.roleId !== slot.roleId) errors.push(`slot ${slot.id} role does not match task ${slot.taskId}`);
    if (!Array.isArray(slot.ownedPaths) || !slot.ownedPaths.length) errors.push(`slot ${slot.id} has no ownedPaths`);
    if (!String(slot.claimRef ?? '').startsWith('refs/heads/coord-v2-claims/')) errors.push(`slot ${slot.id} has invalid claimRef`);
    if (!String(slot.branchRef ?? '').startsWith('refs/heads/')) errors.push(`slot ${slot.id} has invalid branchRef`);
    if (task && slot.baseSha !== task.baseSha) errors.push(`slot ${slot.id} baseSha differs from task ${task.id}`);
  }

  for (const instance of instances.values()) {
    if ('state' in instance || 'slotId' in instance) errors.push(`instance ${instance.id} stores derived assignment/state`);
    if (!roles.has(instance.roleId)) errors.push(`instance ${instance.id} references unknown role ${instance.roleId}`);
  }

  const claimBySlot = new Map();
  const claimByInstance = new Map();
  for (const claim of claims.values()) {
    const slot = slots.get(claim.slotId);
    const task = tasks.get(claim.taskId);
    const instance = instances.get(claim.instanceId);
    if (!slot) errors.push(`claim ${claim.id} references unknown slot ${claim.slotId}`);
    if (!task) errors.push(`claim ${claim.id} references unknown task ${claim.taskId}`);
    if (!roles.has(claim.roleId)) errors.push(`claim ${claim.id} references unknown role ${claim.roleId}`);
    if (!instance) errors.push(`claim ${claim.id} references unknown instance ${claim.instanceId}`);
    if (claimBySlot.has(claim.slotId)) errors.push(`slot ${claim.slotId} has duplicate active claim owner`);
    else claimBySlot.set(claim.slotId, claim);
    if (claimByInstance.has(claim.instanceId)) errors.push(`instance ${claim.instanceId} occupies multiple slots`);
    else claimByInstance.set(claim.instanceId, claim);
    if (slot && slot.taskId !== claim.taskId) errors.push(`claim ${claim.id} task does not match slot`);
    if (slot && slot.roleId !== claim.roleId) errors.push(`claim ${claim.id} role does not match slot`);
    if (task && task.roleId !== claim.roleId) errors.push(`claim ${claim.id} role does not match task`);
    if (instance && instance.roleId !== claim.roleId) errors.push(`claim ${claim.id} instance role does not match claim role`);
    if (!sha(claim.expectedParentSha)) errors.push(`claim ${claim.id} expectedParentSha is invalid`);
  }

  const adjacency = new Map();
  for (const task of tasks.values()) adjacency.set(task.id, (task.dependencies ?? []).map((d) => typeof d === 'string' ? d : d.taskId));
  const visiting = new Set();
  const visited = new Set();
  function dfs(id) {
    if (visiting.has(id)) {
      errors.push(`dependency cycle detected at ${id}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dep of adjacency.get(id) ?? []) if (tasks.has(dep)) dfs(dep);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of tasks.keys()) dfs(id);

  for (const handoff of handoffs.values()) {
    const task = tasks.get(handoff.taskId);
    if (!task) errors.push(`handoff ${handoff.id} references unknown task ${handoff.taskId}`);
    if (!sha(handoff.candidateSha)) errors.push(`handoff ${handoff.id} candidateSha invalid`);
    if (handoff.supersedes && !handoffs.has(handoff.supersedes)) errors.push(`handoff ${handoff.id} supersedes unknown handoff ${handoff.supersedes}`);
    if (task?.lineageBaseSha && sha(handoff.candidateSha)) {
      verifyAncestor(root, task.lineageBaseSha, handoff.candidateSha, errors, warnings, strictGit, `handoff ${handoff.id}`);
    }
  }

  for (const qa of qaReceipts.values()) {
    const handoff = handoffs.get(qa.handoffId);
    if (!handoff) errors.push(`qa ${qa.id} references unknown handoff ${qa.handoffId}`);
    if (!['APPROVE', 'BLOCK'].includes(qa.verdict)) errors.push(`qa ${qa.id} has invalid verdict ${qa.verdict}`);
    if (handoff && qa.taskId !== handoff.taskId) errors.push(`qa ${qa.id} taskId differs from handoff`);
    if (handoff && qa.candidateSha !== handoff.candidateSha) errors.push(`qa ${qa.id} candidate SHA mismatch`);
  }

  const stateMemo = new Map();
  const deriving = new Set();
  function stateFor(taskId) {
    if (stateMemo.has(taskId)) return stateMemo.get(taskId);
    if (deriving.has(taskId)) return 'BLOCKED';
    deriving.add(taskId);
    const task = tasks.get(taskId);
    if (!task) return 'BLOCKED';

    const depStates = (task.dependencies ?? []).map((d) => stateFor(typeof d === 'string' ? d : d.taskId));
    const dependenciesSatisfied = depStates.every((state) => state === 'VERIFIED' || state === 'ARCHIVED');
    const currentHandoff = currentHandoffForTask(taskId, handoffs, errors);
    const qa = qaForHandoff(currentHandoff, qaReceipts, errors);

    let state;
    if (qa?.verdict === 'BLOCK') state = 'BLOCKED';
    else if (currentHandoff && task.qaRequired && qa?.verdict === 'APPROVE') state = 'VERIFIED';
    else if (currentHandoff && !task.qaRequired) state = 'VERIFIED';
    else if (currentHandoff) state = 'HANDOFF_READY';
    else if (!dependenciesSatisfied) state = 'WAITING_DEPENDENCY';
    else if ([...claimBySlot.values()].some((claim) => claim.taskId === taskId)) state = 'CLAIMED';
    else state = 'READY';

    deriving.delete(taskId);
    stateMemo.set(taskId, state);
    return state;
  }

  for (const taskId of tasks.keys()) stateFor(taskId);

  for (const claim of claims.values()) {
    const task = tasks.get(claim.taskId);
    if (!task) continue;
    for (const dep of task.dependencies ?? []) {
      const depId = typeof dep === 'string' ? dep : dep.taskId;
      const depState = stateFor(depId);
      if (!['VERIFIED', 'ARCHIVED'].includes(depState)) {
        errors.push(`claim ${claim.id} occupies task ${task.id} with unsatisfied dependency ${depId} (${depState})`);
      }
    }
  }

  const activeClaims = [...claims.values()];
  for (let i = 0; i < activeClaims.length; i += 1) {
    const a = slots.get(activeClaims[i].slotId);
    if (!a) continue;
    for (let j = i + 1; j < activeClaims.length; j += 1) {
      const b = slots.get(activeClaims[j].slotId);
      if (!b) continue;
      for (const left of a.ownedPaths ?? []) {
        for (const right of b.ownedPaths ?? []) {
          if (ownedPathsOverlap(left, right)) errors.push(`active slot ownedPaths overlap: ${a.id} <-> ${b.id} (${left} / ${right})`);
        }
      }
    }
  }

  for (const entry of model.transitionsEntries) {
    const t = entry.value;
    if (!tasks.has(t.taskId)) errors.push(`transition ${t.id ?? entry.path} references unknown task ${t.taskId}`);
    const transitionError = validateTaskTransition(t.from, t.to, t);
    if (transitionError) errors.push(`transition ${t.id ?? entry.path}: ${transitionError}`);
  }

  for (const release of releases.values()) {
    const state = stateFor(release.taskId);
    if (release.eligible === true && state !== 'VERIFIED' && state !== 'ARCHIVED') {
      errors.push(`release ${release.id} marks task ${release.taskId} eligible while state is ${state}`);
    }
    if (release.candidateSha) {
      const handoff = currentHandoffForTask(release.taskId, handoffs, errors);
      if (!handoff || handoff.candidateSha !== release.candidateSha) {
        errors.push(`release ${release.id} candidate does not match current handoff`);
      }
    }
  }

  return { errors, warnings, maps: { roles, tasks, slots, instances, claims, handoffs, qaReceipts, releases }, stateFor, claimBySlot, claimByInstance };
}

export function buildProjection(model, validation = validateLoadedModel(model)) {
  const { tasks, slots, instances } = validation.maps;
  const taskRows = [...tasks.values()]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((task) => ({
      id: task.id,
      roleId: task.roleId,
      state: validation.stateFor(task.id),
      slotIds: [...task.slotIds].sort(),
    }));

  const slotRows = [...slots.values()]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((slot) => {
      const claim = validation.claimBySlot.get(slot.id) ?? null;
      return {
        id: slot.id,
        taskId: slot.taskId,
        roleId: slot.roleId,
        state: claim ? 'CLAIMED' : 'READY',
        instanceId: claim?.instanceId ?? null,
        claimRef: slot.claimRef,
      };
    });

  const instanceRows = [...instances.values()]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((instance) => {
      const claim = validation.claimByInstance.get(instance.id) ?? null;
      return {
        id: instance.id,
        roleId: instance.roleId,
        state: claim ? 'ACTIVE' : 'UNASSIGNED',
        slotId: claim?.slotId ?? null,
      };
    });

  return {
    schemaVersion: 1,
    generatedFrom: [
      'coordination/CURRENT_ROUND.md',
      'coordination/v2/roles.json',
      'coordination/v2/tasks/*.json',
      'coordination/v2/slots/*.json',
      'coordination/v2/instances/*.json',
      'coordination/v2/claims/*.json',
      'coordination/v2/handoffs/*.json',
      'coordination/v2/qa/*.json',
    ],
    legacyCompatibility: parseLegacyRound(model.root ?? '.'),
    v2: {
      tasks: taskRows,
      slots: slotRows,
      instances: instanceRows,
    },
  };
}

export function projectionText(projection) {
  return JSON.stringify(projection, null, 2) + '\n';
}

export function checkProjection(model, projectionPath = join(model.root ?? '.', 'coordination/v2/CURRENT.json')) {
  const validation = validateLoadedModel(model);
  const expected = projectionText(buildProjection(model, validation));
  const actual = readFileSync(projectionPath, 'utf8');
  return {
    ...validation,
    projectionMatches: actual === expected,
    expected,
    actual,
    projectionPath: relative(model.root ?? '.', projectionPath),
  };
}

export function writeProjection(model, projectionPath = join(model.root ?? '.', 'coordination/v2/CURRENT.json')) {
  const validation = validateLoadedModel(model);
  if (validation.errors.length) throw new Error(validation.errors.join('\n'));
  const content = projectionText(buildProjection(model, validation));
  writeFileSync(projectionPath, content);
  return content;
}
