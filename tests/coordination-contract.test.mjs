import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

const requiredFiles = [
  'coordination/README.md',
  'coordination/PROTOCOL.md',
  'coordination/CURRENT_ROUND.md',
  'coordination/STATUS.md',
  'coordination/LOCKS.md',
  'coordination/agents/neureon.md',
  'coordination/agents/ricardo.md',
  'coordination/agents/mario.md',
  'coordination/agents/brancaforte.md',
  'coordination/agents/germinator.md',
  'coordination/agents/gonza.md',
  'coordination/forum/README.md',
  'coordination/forum/active/README.md',
  'coordination/tasks/README.md',
  'coordination/handoffs/README.md',
  'coordination/templates/forum-thread.md',
  'coordination/templates/task.md',
  'coordination/templates/handoff.md',
  'coordination/templates/round-archive.md',
  'coordination/archive/README.md',
];

test('multi-agent coordination infrastructure is complete', () => {
  for (const path of requiredFiles) {
    assert.equal(existsSync(path), true, `missing ${path}`);
  }
});

test('protocol preserves round lifecycle and collaboration semantics', () => {
  const protocol = read('coordination/PROTOCOL.md');
  for (const token of [
    'IDLE',
    'ACTIVE',
    'VALIDATION',
    'RELEASE',
    'ROUND_COMPLETE',
    'PAUSED',
    'AUTO_CHAIN',
    'START_ROUND',
    'WAITING_DEPENDENCY',
    'HANDOFF_READY',
    'UNRESPONSIVE',
    'QUESTION',
    'PROPOSAL',
    'ANSWER',
    'REQUEST',
    'DISCOVERY',
    'BUG',
    'BLOCKER',
    'REVIEW',
    'DECISION_REQUEST',
    'ALERT',
  ]) {
    assert.match(protocol, new RegExp(token), `protocol missing ${token}`);
  }

  assert.match(protocol, /forum/i);
  assert.match(protocol, /working communication/i);
  assert.match(protocol, /not a progress diary/i);
  assert.match(protocol, /only Neureon.+ROUND_COMPLETE/i);
});

test('all six identities are recoverable from the repository', () => {
  const expected = [
    ['neureon', 'Neureon', 'Lead / Coordinator'],
    ['ricardo', 'Ricardo', 'Gameplay Engineer'],
    ['mario', 'Mario', 'Character / Rendering Engineer'],
    ['brancaforte', 'Brancaforte', 'UI / Input / UX Engineer'],
    ['germinator', 'Germinator', 'Auditor / QA'],
    ['gonza', 'Gonza', 'Integration / Release'],
  ];

  for (const [file, name, role] of expected) {
    const content = read(`coordination/agents/${file}.md`);
    assert.match(content, new RegExp(name));
    assert.match(content, new RegExp(role.replaceAll('/', '\\/')));
    assert.match(content, /ROUND_COMPLETE/);
    assert.match(content, /repository.+chat memory/i);
  }
});

test('coordination state is internally valid in idle or live rounds', () => {
  const round = read('coordination/CURRENT_ROUND.md');
  const statusMatch = round.match(/Status:\s*([A-Z_]+)/);
  assert.ok(statusMatch, 'missing global round status');

  const globalState = statusMatch[1];
  const allowedGlobalStates = ['IDLE', 'ACTIVE', 'VALIDATION', 'RELEASE', 'ROUND_COMPLETE', 'PAUSED'];
  assert.ok(allowedGlobalStates.includes(globalState), `invalid global state ${globalState}`);

  const status = read('coordination/STATUS.md');
  const agentStates = ['OFF_ROUND', 'READY', 'WORKING', 'WAITING_DEPENDENCY', 'HANDOFF_READY', 'REVIEWING', 'VERIFIED', 'BLOCKED', 'UNRESPONSIVE'];

  for (const name of ['Neureon', 'Ricardo', 'Mario', 'Brancaforte', 'Germinator', 'Gonza']) {
    const line = status.split('\n').find((candidate) => candidate.startsWith(`| ${name} |`));
    assert.ok(line, `missing status row for ${name}`);
    assert.ok(agentStates.some((state) => line.includes(`| ${state} |`)), `invalid state for ${name}`);
  }

  if (globalState === 'IDLE') {
    assert.match(round, /Round:\s*none/);
    assert.match(round, /(Required|Planned) agents:\s*none/);
    for (const name of ['Neureon', 'Ricardo', 'Mario', 'Brancaforte', 'Germinator', 'Gonza']) {
      const line = status.split('\n').find((candidate) => candidate.startsWith(`| ${name} |`));
      assert.match(line, /OFF_ROUND/);
    }
    assert.match(read('coordination/LOCKS.md'), /No active locks/i);
    assert.match(read('coordination/forum/active/README.md'), /no active/i);
  } else {
    assert.doesNotMatch(round, /Round:\s*none/);
    assert.doesNotMatch(round, /(Required|Planned) agents:\s*none/);
  }
});

test('root agent rules advertise the coordination workflow without losing game constraints', () => {
  const agents = read('AGENTS.md');
  assert.match(agents, /coordination\/PROTOCOL\.md/);
  assert.match(agents, /coordination\/CURRENT_ROUND\.md/);
  assert.match(agents, /coordination\/STATUS\.md/);
  assert.match(agents, /coordination\/agents\//);
  assert.match(agents, /60 Hz/);
  assert.match(agents, /visual references only/i);
});

test('forum and handoff templates enforce collaboration rather than isolated logging', () => {
  const forum = read('coordination/forum/README.md');
  const thread = read('coordination/templates/forum-thread.md');
  const handoff = read('coordination/templates/handoff.md');

  assert.match(forum, /talk to each other/i);
  assert.match(forum, /not a progress diary or changelog/i);
  assert.match(thread, /QUESTION \| PROPOSAL \| ANSWER \| REQUEST/);
  assert.match(thread, /Requested action:/);
  assert.match(handoff, /does not end/i);
  assert.match(handoff, /ROUND_COMPLETE/);
});
