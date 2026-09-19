# Multi-Agent Coordination Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install the repository-native coordination system for Neureon, Ricardo, Mario, Brancaforte, Germinator and Gonza, including roles, round lifecycle, active forum, locks, tasks, handoffs, archive and recovery rules.

**Architecture:** The coordination layer lives entirely under `coordination/` plus one root `AGENTS.md` integration rule. It is documentation/state only and must never be imported by the browser game runtime. Static contract tests verify that required files, role identities, lifecycle tokens and collaboration rules cannot silently disappear.

**Tech Stack:** Markdown repository state, GitHub, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-18-multi-agent-coordination-design.md`

## Global Constraints

- The repository is authoritative over chat memory.
- The forum is an active conversation mechanism, not a changelog.
- Required agents remain part of a round until Neureon posts `ROUND_COMPLETE`.
- A round cannot enter ACTIVE until all required agents have posted `PRESENT`.
- Neureon alone controls global round transitions and `ROUND_COMPLETE`.
- Germinator independently audits implementation, coordination and verification.
- Gonza integrates/releases only accepted and verified work.
- Coordination files must never be imported, bundled into or executed by the game runtime.
- Initial installed state is `IDLE`, with no active tasks, locks or forum threads.

## Review Focus

- A replacement chat must be able to recover any role from repository files without relying on prior conversation memory.
- The active forum must explicitly support two-way cross-agent conversation, mentions, requests, answers, blockers and discoveries rather than only progress logging.
- An individual task becoming complete must not permit an agent to leave an unfinished round.
- Missing/unresponsive required agents must prevent `ROUND_COMPLETE` and produce a recoverable PAUSED state.
- Old round instructions must not remain in active surfaces after archival and accidentally affect the next round.

---

### Task 1: Add coordination contract tests

**Files:**
- Create: `tests/coordination-contract.test.mjs`

**Interfaces:**
- Consumes: repository files under `coordination/` and root `AGENTS.md`.
- Produces: static regression coverage proving the coordination infrastructure and its critical tokens exist.

- [ ] **Step 1: Write the failing contract test**

Create `tests/coordination-contract.test.mjs` with Node's built-in test runner. The test must:
- assert these files exist:
  - `coordination/README.md`
  - `coordination/PROTOCOL.md`
  - `coordination/CURRENT_ROUND.md`
  - `coordination/STATUS.md`
  - `coordination/LOCKS.md`
  - all six files under `coordination/agents/`
  - `coordination/forum/README.md`
  - `coordination/forum/active/README.md`
  - `coordination/tasks/README.md`
  - `coordination/handoffs/README.md`
  - all four templates
  - `coordination/archive/README.md`
- assert `PROTOCOL.md` contains `CHECK_IN`, `START_ROUND`, `ROUND_COMPLETE`, `PAUSED`, `PRESENT`, `WAITING_FOR_TEAM`, `UNRESPONSIVE`, `QUESTION`, `ANSWER`, `BLOCKER`, `DISCOVERY`.
- assert the six role files contain their exact names and role titles.
- assert `CURRENT_ROUND.md` starts installed in `IDLE`.
- assert `STATUS.md` lists all six agents as `OFF_ROUND`.
- assert root `AGENTS.md` points participants to `coordination/PROTOCOL.md` and `coordination/CURRENT_ROUND.md`.

Representative test structure:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

test('multi-agent coordination infrastructure is complete', () => {
  const required = [
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

  for (const path of required) {
    assert.equal(existsSync(path), true, `missing ${path}`);
  }

  const protocol = read('coordination/PROTOCOL.md');
  for (const token of [
    'CHECK_IN', 'START_ROUND', 'ROUND_COMPLETE', 'PAUSED',
    'PRESENT', 'WAITING_FOR_TEAM', 'UNRESPONSIVE',
    'QUESTION', 'ANSWER', 'BLOCKER', 'DISCOVERY',
  ]) {
    assert.match(protocol, new RegExp(token));
  }
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```bash
npm run build && node --test tests/coordination-contract.test.mjs
```

Expected: FAIL because `coordination/` does not exist yet.

- [ ] **Step 3: Commit only the failing test**

```bash
git add tests/coordination-contract.test.mjs
git commit -m "test: define coordination infrastructure contract"
```

---

### Task 2: Create core coordination state and protocol

**Files:**
- Create: `coordination/README.md`
- Create: `coordination/PROTOCOL.md`
- Create: `coordination/CURRENT_ROUND.md`
- Create: `coordination/STATUS.md`
- Create: `coordination/LOCKS.md`

**Interfaces:**
- Consumes: lifecycle and collaboration rules from the approved spec.
- Produces: the canonical runtime-independent coordination state every agent reads before working.

- [ ] **Step 1: Create `coordination/README.md`**

It must explain:
- this folder is shared agent coordination state, not game runtime;
- repository state outranks chat memory;
- where to find protocol, current round, status, locks, roles, forum, tasks, handoffs and archives;
- new/replacement chats must recover from these files.

- [ ] **Step 2: Create `coordination/PROTOCOL.md`**

Include the exact lifecycle:

```text
IDLE
CHECK_IN
ACTIVE
VALIDATION
RELEASE
ROUND_COMPLETE
PAUSED
```

Define:
- Neureon's exclusive authority over global transitions;
- `PRESENT` check-in and `START_ROUND`;
- no agent leaves before `ROUND_COMPLETE`;
- per-agent states;
- activation synchronization sequence;
- forum message types and behavior;
- locks;
- task scope control;
- handoffs;
- verification requirements;
- unresponsive recovery;
- Germinator audit authority;
- Gonza release blocking;
- archival/reset.

- [ ] **Step 3: Create installed idle state**

`CURRENT_ROUND.md`:

```markdown
# Current Round

Status: IDLE
Round: none
Goal: none
Required agents: none
Start token: not issued
Completion token: not issued

Waiting for user direction.
```

`LOCKS.md`:

```markdown
# Active Locks

No active locks.
```

`STATUS.md` must list all six agents with `OFF_ROUND`, no tasks, no blockers and no checkpoints.

- [ ] **Step 4: Run contract test**

Run:

```bash
node --test tests/coordination-contract.test.mjs
```

Expected: still FAIL because role/template/support files are not yet present, but failures for core state files should disappear.

- [ ] **Step 5: Commit core coordination state**

```bash
git add coordination/README.md coordination/PROTOCOL.md coordination/CURRENT_ROUND.md coordination/STATUS.md coordination/LOCKS.md
git commit -m "feat: add multi-agent coordination core"
```

---

### Task 3: Add six recoverable agent identities

**Files:**
- Create: `coordination/agents/neureon.md`
- Create: `coordination/agents/ricardo.md`
- Create: `coordination/agents/mario.md`
- Create: `coordination/agents/brancaforte.md`
- Create: `coordination/agents/germinator.md`
- Create: `coordination/agents/gonza.md`

**Interfaces:**
- Consumes: `PROTOCOL.md`, `CURRENT_ROUND.md`, project architecture docs.
- Produces: deterministic role recovery for any replacement chat.

- [ ] **Step 1: Create common identity structure**

Every role file must explicitly contain:
- Name
- Role
- Mission
- Owned subsystems
- Allowed changes
- Changes requiring coordination
- Prohibited responsibilities
- Mandatory reads on activation
- Check-in behavior
- Forum obligations
- Lock behavior
- Working behavior
- Verification evidence
- Handoff behavior
- What to do after own task finishes
- What to do on `.`
- What to do if repository state conflicts with chat memory
- Conditions that require BLOCKED/WAITING/ALERT
- explicit statement that only `ROUND_COMPLETE` ends participation.

- [ ] **Step 2: Define Neureon**

Title: `Lead / Coordinator`.

Must own:
- round creation;
- task decomposition;
- required-agent selection;
- dependency graph;
- forum conflict resolution;
- status review;
- promotion of durable decisions;
- detection of unresponsive agents;
- transitions to VALIDATION/RELEASE/PAUSED;
- sole authority to issue `START_ROUND` and `ROUND_COMPLETE`;
- user-facing round summary.

Neureon must have its own replacement/recovery instructions so another chat can take over the coordinator role.

- [ ] **Step 3: Define Ricardo**

Title: `Gameplay Engineer`.

Own:
- `src/game/simulation/`;
- combat data/moves and gameplay balance;
- combat-facing parts of shared types when coordinated.

Must never move combat truth into renderer/UI.

- [ ] **Step 4: Define Mario**

Title: `Character / Rendering Engineer`.

Own:
- procedural rigs;
- fighter rendering;
- stage/effects/particles;
- visual readability.

Must consume gameplay state rather than invent gameplay rules.

- [ ] **Step 5: Define Brancaforte**

Title: `UI / Input / UX Engineer`.

Own:
- HUD;
- menus;
- touch/keyboard UI/input plumbing;
- onboarding/help;
- responsive mobile landscape.

Must not redefine simulation behavior to make UI easier.

- [ ] **Step 6: Define Germinator**

Title: `Auditor / QA`.

Own:
- adversarial review;
- regression tests;
- balance scenarios;
- coordination audit;
- release-blocking findings.

Must explicitly be independent of implementation roles and empowered to challenge insufficient evidence.

- [ ] **Step 7: Define Gonza**

Title: `Integration / Release`.

Own:
- accepted-work integration;
- conflict resolution;
- full verification;
- standalone artifact generation;
- publication.

Must support `BLOCK_RELEASE` when prerequisites are missing.

- [ ] **Step 8: Run contract test**

Run:

```bash
node --test tests/coordination-contract.test.mjs
```

Expected: role assertions pass; support/template files may still fail.

- [ ] **Step 9: Commit identities**

```bash
git add coordination/agents
git commit -m "feat: define multi-agent team identities"
```

---

### Task 4: Build active forum, task and handoff surfaces

**Files:**
- Create: `coordination/forum/README.md`
- Create: `coordination/forum/active/README.md`
- Create: `coordination/tasks/README.md`
- Create: `coordination/handoffs/README.md`
- Create: `coordination/templates/forum-thread.md`
- Create: `coordination/templates/task.md`
- Create: `coordination/templates/handoff.md`
- Create: `coordination/templates/round-archive.md`
- Create: `coordination/archive/README.md`

**Interfaces:**
- Consumes: active-round metadata and agent identities.
- Produces: structured cross-agent conversation and durable task/handoff/archive records.

- [ ] **Step 1: Create forum rules**

`coordination/forum/README.md` must state explicitly:

> The forum is for agents to talk to each other while they work. It is not a progress diary or changelog.

Define:
- one thread per shared problem/topic;
- `@agent` and `@all`;
- chronological append-only conversation during a round;
- open requests must receive an answer or explicit deferral;
- agents re-read relevant threads before commits/handoffs;
- active threads move into the round archive at closure.

- [ ] **Step 2: Create active-forum idle marker**

`coordination/forum/active/README.md` must state no active threads exist while `CURRENT_ROUND` is IDLE and instruct Neureon to create threads from the template only for active rounds.

- [ ] **Step 3: Create forum thread template**

Include:

```markdown
# Thread: <topic>

Round:
Related tasks:
Participants:
Status: OPEN

## Conversation

### <sequence> — <agent>
To:
Type: QUESTION | PROPOSAL | ANSWER | REQUEST | DISCOVERY | BUG | BLOCKER | REVIEW | DECISION_REQUEST | ALERT
Task:
Status: OPEN | RESOLVED | ACKNOWLEDGED
Message:
Requested action:
```

- [ ] **Step 4: Create task template**

Include ID, owner, round, goal, dependencies, files/subsystems, prohibited scope, collaborators, acceptance criteria, tests/evidence, status and forum threads.

- [ ] **Step 5: Create handoff template**

Include sender, recipient, task, commit SHA, changed files, behavioral contract, verification evidence, known risks, unresolved questions and requested next action. State that handoff does not end sender participation.

- [ ] **Step 6: Create archive template and archive rules**

The archive record must capture:
- goal;
- required agents;
- tasks;
- key forum conclusions;
- promoted decisions;
- commits/handoffs;
- QA verdict;
- release result;
- deferred items;
- closure token.

- [ ] **Step 7: Run contract test and verify GREEN**

Run:

```bash
node --test tests/coordination-contract.test.mjs
```

Expected: PASS.

- [ ] **Step 8: Commit collaboration surfaces**

```bash
git add coordination/forum coordination/tasks coordination/handoffs coordination/templates coordination/archive
git commit -m "feat: add agent forum and handoff workflow"
```

---

### Task 5: Integrate coordination discovery into root agent rules

**Files:**
- Modify: `AGENTS.md`
- Test: `tests/coordination-contract.test.mjs`

**Interfaces:**
- Consumes: installed coordination system.
- Produces: automatic discovery path for any participating agent entering the repository.

- [ ] **Step 1: Extend the existing contract test**

Add an assertion that root `AGENTS.md` contains instructions equivalent to:

```text
If participating in the multi-agent workflow, before modifying the project read:
- coordination/PROTOCOL.md
- coordination/CURRENT_ROUND.md
- coordination/STATUS.md
- your coordination/agents/<name>.md
- relevant active forum/task files
```

Also assert that root gameplay/art rules remain present, including fixed 60 Hz simulation and visual-reference-only fighter assets.

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test tests/coordination-contract.test.mjs
```

Expected: FAIL because root `AGENTS.md` does not yet advertise the coordination workflow.

- [ ] **Step 3: Modify root `AGENTS.md` minimally**

Preserve every existing game rule and append a `Multi-Agent Coordination` section with:
- discovery reads;
- repository-over-chat authority;
- no work before required round check-in/`START_ROUND`;
- no agent departure before `ROUND_COMPLETE`;
- coordination files never enter runtime.

- [ ] **Step 4: Run the test and verify GREEN**

Run:

```bash
node --test tests/coordination-contract.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit root discovery**

```bash
git add AGENTS.md tests/coordination-contract.test.mjs
git commit -m "docs: wire agent coordination into repository rules"
```

---

### Task 6: Full verification and initial idle-state audit

**Files:**
- Verify all files from Tasks 1–5.
- No new behavior unless verification exposes a defect.

**Interfaces:**
- Consumes: completed coordination infrastructure.
- Produces: evidence that the infrastructure is installed without changing game behavior.

- [ ] **Step 1: Run coordination contract**

```bash
node --test tests/coordination-contract.test.mjs
```

Expected: all coordination tests PASS.

- [ ] **Step 2: Run full project test suite**

```bash
npm test
```

Expected: 0 failures.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: exit code 0.

- [ ] **Step 4: Audit initial state manually**

Confirm:
- `CURRENT_ROUND.md` is `IDLE`;
- all agents are `OFF_ROUND`;
- no task file for a real round exists;
- no active forum conversation exists;
- no lock exists;
- no runtime source file imports anything under `coordination/`.

- [ ] **Step 5: Record infrastructure installation**

Update `docs/CURRENT_MILESTONE.md` only if needed to note that multi-agent coordination infrastructure is installed and idle; do not overwrite the gameplay milestone definition.

- [ ] **Step 6: Final commit**

```bash
git add coordination AGENTS.md tests/coordination-contract.test.mjs docs/CURRENT_MILESTONE.md
git commit -m "chore: install multi-agent coordination infrastructure"
```

- [ ] **Step 7: Final review**

Re-read:
- the approved spec;
- every role file;
- `PROTOCOL.md`;
- root `AGENTS.md`;
- contract-test output.

Verify every spec requirement has a concrete repository surface and no active-round instructions were accidentally installed.

## Self-Review

- **Spec coverage:** Team identities, source-of-truth rules, lifecycle, check-in, forum conversation, locks, tasks, handoffs, continuous participation, verification, unresponsive-agent recovery, audit/release authority and archive/reset all map to Tasks 2–5.
- **Placeholder scan:** Implementation files use explicit templates and exact required tokens; no implementation step depends on undefined behavior.
- **Type/name consistency:** Agent names are exactly Neureon, Ricardo, Mario, Brancaforte, Germinator and Gonza across all tasks.
- **Review-focus coverage:** Replacement recovery, conversational forum behavior, continued participation, unresponsive blocking and archive isolation are each asserted directly or manually audited.
- **Runtime isolation:** No plan step modifies gameplay/runtime source except root agent documentation and tests.
