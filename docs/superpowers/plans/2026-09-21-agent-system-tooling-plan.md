# Agent System + Tooling Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make durable identity learning, scalable same-role multi-instancing, truthful tool capability routing, and post-R005 sprite direction part of the repository's enforceable coordination contract without changing active R005 runtime behavior.

**Architecture:** Coordination rules live in `AGENTS.md`, `coordination/PROTOCOL.md`, role identities, templates, and a new `coordination/TOOLING.md`. Tests enforce the new policy mechanically. R005 product/runtime files and the active release gate remain untouched.

**Tech Stack:** Markdown coordination contracts, Node.js built-in test runner, existing repository verification scripts.

**Spec:** `docs/superpowers/specs/2026-09-21-sprite-scale-agent-architecture-design.md`

## Global Constraints

- R005 / V0.7 production runtime remains procedural until that round closes.
- Do not change `coordination/CURRENT_ROUND.md`, `coordination/STATUS.md`, `coordination/LOCKS.md`, or product runtime behavior in this plan.
- Repository state remains authoritative over chat memory.
- Every meaningful task/session closeout performs an Identity Learning Review.
- Handoffs record exactly one of `UPDATED`, `PROPOSAL`, or `NO_CHANGE`.
- Multi-instance workers share a durable identity but use isolated lanes/branches and exact-SHA handoffs.
- Repository policy may route plugins/tools but cannot claim to install/enable host capabilities.
- Missing required tooling must be reported truthfully as `TOOL_UNAVAILABLE`.
- Existing TypeScript + Canvas2D architecture remains; no Phaser migration is implied.
- Simulation remains the sole owner of combat truth at fixed 60 Hz.

## Review Focus

- A new/replacement agent must be able to discover the identity-learning law without relying on chat memory.
- Four simultaneous instances of one role must not be instructed to race-edit one shared identity file.
- A host without Game Development Studio must not be told to pretend the tool was used.
- Current R005 release state must remain byte-for-byte outside this plan's coordination/docs/test files.
- Existing coordination tests must still validate IDLE/live round behavior and six durable roles.

---

### Task 1: Pin the new coordination contract with failing tests

**Files:**
- Modify: `tests/coordination-contract.test.mjs`

**Interfaces:**
- Consumes: existing repository coordination files.
- Produces: executable assertions for the new durable identity, squad, tooling, and future-art-policy contract.

- [ ] **Step 1: Add failing infrastructure assertions**

Extend `requiredFiles` with:

```js
'coordination/TOOLING.md',
'coordination/templates/squad-lane.md',
```

Add a test:

```js
test('identity learning is mandatory and leaves an explicit receipt', () => {
  const protocol = read('coordination/PROTOCOL.md');
  const handoff = read('coordination/templates/handoff.md');
  const task = read('coordination/templates/task.md');

  assert.match(protocol, /Identity Learning Review/);
  assert.match(protocol, /UPDATED/);
  assert.match(protocol, /PROPOSAL/);
  assert.match(protocol, /NO_CHANGE/);
  assert.match(protocol, /skipping.+review.+not/i);

  assert.match(handoff, /Identity Learning Receipt/);
  assert.match(handoff, /UPDATED \| PROPOSAL \| NO_CHANGE/);
  assert.match(task, /identity-learning review/i);
});
```

Add a test:

```js
test('all durable identities advertise reusable closeout learning', () => {
  for (const file of ['neureon', 'ricardo', 'mario', 'brancaforte', 'germinator', 'gonza']) {
    const content = read(`coordination/agents/${file}.md`);
    assert.match(content, /Identity Learning Review/);
    assert.match(content, /Durable role learnings/);
  }
});
```

Add a test:

```js
test('same-role squads are generic and safe to scale horizontally', () => {
  const protocol = read('coordination/PROTOCOL.md');
  const template = read('coordination/templates/squad-lane.md');

  assert.match(protocol, /identity is not an instance/i);
  assert.match(protocol, /same-role/i);
  assert.match(protocol, /exact-SHA/i);
  assert.match(protocol, /integrator/i);
  assert.match(protocol, /do not.+race/i);

  assert.match(template, /Durable identity/);
  assert.match(template, /Instance label/);
  assert.match(template, /Owned files/);
  assert.match(template, /Integration target/);
});
```

Add a test:

```js
test('tooling contract routes capabilities without pretending availability', () => {
  const tooling = read('coordination/TOOLING.md');

  assert.match(tooling, /Superpowers/);
  assert.match(tooling, /Game Studio/);
  assert.match(tooling, /Game Development Studio/);
  assert.match(tooling, /sprite-pipeline/);
  assert.match(tooling, /game-dev --version/);
  assert.match(tooling, /TOOL_UNAVAILABLE/);
  assert.match(tooling, /cannot.+install|cannot.+enable/i);
});
```

Replace the old art-policy check in the root-rules test with assertions that both source-reference isolation and the accepted future sprite direction are represented:

```js
assert.match(agents, /authoring references only/i);
assert.match(agents, /derived.+sprite/i);
assert.match(agents, /60 Hz/);
```

- [ ] **Step 2: Run the coordination contract test and verify RED**

Run:

```bash
node --test tests/coordination-contract.test.mjs
```

Expected: FAIL because `coordination/TOOLING.md`, `coordination/templates/squad-lane.md`, receipt text, and generalized squad/tool rules do not yet exist.

- [ ] **Step 3: Commit the failing tests**

```bash
git add tests/coordination-contract.test.mjs
git commit -m "test: pin scalable agent coordination contract"
```

---

### Task 2: Create the durable tooling contract

**Files:**
- Create: `coordination/TOOLING.md`
- Modify: `coordination/README.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: approved spec Section 12.
- Produces: one repository-readable capability-routing source for all replacement agent chats.

- [ ] **Step 1: Create `coordination/TOOLING.md`**

Use this structure and normative content:

```markdown
# Tool Capability Contract

Repository instructions may route capabilities but cannot install or enable a ChatGPT plugin, connector, local CLI, credential, or host feature inside another chat. Availability is session/host-specific.

## Universal rule

Before claiming a named tool/plugin was used, the agent must have actual access to it in the current session.

When a required capability is unavailable:
1. record `TOOL_UNAVAILABLE: <capability>`;
2. do not fabricate tool output;
3. continue with repository-native alternatives only if acceptance remains provable;
4. block/escalate when the missing capability is required evidence.

## Superpowers

When exposed by the host, use applicable process skills before mutation:
- brainstorming for architecture/behavior design;
- writing-plans for approved multi-step implementation;
- test-driven-development for feature/bugfix implementation;
- systematic-debugging for unexpected failures;
- dispatching-parallel-agents / subagent-driven-development when real subagent capability exists and work is safely separable;
- verification-before-completion before success claims.

## Game Studio

For this browser game, prefer the specific capability:
- `web-game-foundations` for simulation/render/input/asset boundaries;
- `sprite-pipeline` for 2D sprite generation/normalization/preview workflow;
- `game-playtest` for browser smoke/visual QA;
- `game-ui-frontend` for HUD/menu surfaces.

Do not migrate this existing TypeScript/Canvas2D game to Phaser merely because Phaser is the plugin's default for new 2D projects.

## Game Development Studio

When exposed by the host, use it only for workflows it actually supports:
- game asset production/inspection/normalization;
- asset vendoring;
- deterministic visual debugging/capture;
- bounded measurable performance optimization.

Its local durable interface is `game-dev`. Environment checks:
- `game-dev --version`
- `game-dev capabilities --json`
- `game-dev doctor --json`

Never request, reveal, store or copy provider credentials into chat/repository arguments.

## Repository vs host

Repository authorization means an agent may use the capability when present. It does not prove that a later chat has the plugin/CLI installed.
```

- [ ] **Step 2: Link tooling from `coordination/README.md`**

Add `TOOLING.md` to the startup reading order immediately after `PROTOCOL.md`, and add it to the surfaces list.

- [ ] **Step 3: Update root `AGENTS.md` startup rules**

Add `coordination/TOOLING.md` to the required pre-work read sequence.

Replace the absolute procedural-only fighter rules with the accepted two-phase art policy:

```markdown
- Supplied/source fighter images and general concept sheets are authoring references only; never load/crop them directly as runtime fighter textures.
- During active R005/V0.7, procedural articulated body rigs remain the production runtime.
- After R005 closes, the approved sprite migration may produce derived, normalized runtime sprite assets under the approved sprite architecture; final production cutover requires every currently playable fighter to use the accepted sprite-body backend.
```

Preserve the rules that simulation owns combat truth, 60 Hz is fixed, mobile landscape is primary, and animations must communicate their actions.

- [ ] **Step 4: Run the tooling-related contract test**

Run:

```bash
node --test tests/coordination-contract.test.mjs
```

Expected: still FAIL only on identity receipt/squad-template requirements not yet implemented; tooling assertions PASS.

- [ ] **Step 5: Commit**

```bash
git add coordination/TOOLING.md coordination/README.md AGENTS.md
git commit -m "docs: add agent tool capability contract"
```

---

### Task 3: Make Identity Learning Review a hard closeout law

**Files:**
- Modify: `coordination/PROTOCOL.md`
- Modify: `coordination/templates/handoff.md`
- Modify: `coordination/templates/task.md`
- Modify: `coordination/agents/neureon.md`
- Modify: `coordination/agents/ricardo.md`
- Modify: `coordination/agents/mario.md`
- Modify: `coordination/agents/brancaforte.md`
- Modify: `coordination/agents/germinator.md`
- Modify: `coordination/agents/gonza.md`

**Interfaces:**
- Consumes: existing durable-role-memory model.
- Produces: mandatory review receipt and safe same-role consolidation semantics.

- [ ] **Step 1: Strengthen Protocol Section 17**

Rewrite the opening to explicitly state:

```markdown
Every meaningful task/session closeout MUST perform an Identity Learning Review before the handoff is complete. The review is mandatory; adding text is not.

The closeout records exactly one receipt:
- UPDATED — one or more stable reusable lessons were consolidated into the durable identity;
- PROPOSAL — a stable lesson exists, but this instance must not edit the shared identity directly (for example, a multi-instance squad lane); the proposal travels to the designated consolidator;
- NO_CHANGE — the review was performed and no candidate passed the durability filter.

Skipping the review is not a valid closeout.
```

Keep the current durability filter and prohibited-content list.

For multi-instance squads, state:

```markdown
Lane instances do not race-edit the shared role identity. They emit PROPOSAL/NO_CHANGE receipts. The designated same-role integrator/consolidator deduplicates proposals and makes at most one coherent durable-role update after the squad converges.
```

- [ ] **Step 2: Add the receipt to `handoff.md`**

Insert:

```markdown
## Identity Learning Receipt

Result: UPDATED | PROPOSAL | NO_CHANGE

Reusable lesson / proposal:
- <concise reusable lesson, or "none">

Identity file update:
- <path + commit if UPDATED, consolidator target if PROPOSAL, or "none" if NO_CHANGE>
```

- [ ] **Step 3: Add closeout acceptance to `task.md`**

Add under acceptance criteria:

```markdown
- [ ] Identity-learning review completed and receipt recorded in handoff.
```

- [ ] **Step 4: Update all six identity files**

In each identity's `After own task finishes` section, insert before handoff completion:

```markdown
Perform the mandatory Identity Learning Review from PROTOCOL and record UPDATED, PROPOSAL or NO_CHANGE in the handoff. A task is not fully closed without this receipt.
```

Preserve each role's existing role-specific `Durable role learnings` guidance.

- [ ] **Step 5: Run coordination test**

```bash
node --test tests/coordination-contract.test.mjs
```

Expected: identity-learning assertions PASS; squad-template test remains FAIL until Task 4.

- [ ] **Step 6: Commit**

```bash
git add coordination/PROTOCOL.md coordination/templates/handoff.md coordination/templates/task.md coordination/agents
git commit -m "coordination: require identity learning receipts"
```

---

### Task 4: Generalize multi-instance squads beyond Mario

**Files:**
- Create: `coordination/templates/squad-lane.md`
- Modify: `coordination/PROTOCOL.md`
- Modify: `coordination/agents/neureon.md`
- Modify: `coordination/agents/mario.md`
- Modify: `coordination/agents/ricardo.md`
- Modify: `coordination/agents/brancaforte.md`
- Modify: `coordination/agents/germinator.md`
- Modify: `coordination/agents/gonza.md`

**Interfaces:**
- Consumes: current Mario A/B/C/D experiment and Protocol Section 18.
- Produces: generic role×N execution model with explicit lane registration and consolidation.

- [ ] **Step 1: Add the identity/instance axiom to Protocol Section 18**

Use explicit text:

```markdown
A durable identity is not a chat instance. Any durable role may be executed by N temporary instances when the round explicitly authorizes safely separable lanes.

Temporary labels such as Ricardo-A or Mario-D exist only for coordination. They inherit the role's mission, ownership boundaries, prohibitions and durable learnings; they do not become new durable roles.
```

Also state there is no repository-defined numeric maximum; decomposition safety is the limit.

Require:
- lane registration;
- branch/base;
- owned files/subsystems;
- dependencies;
- integration target;
- exact-SHA handoff;
- identity-learning receipt;
- one integrated candidate before cross-role QA;
- stop-and-resolve on overlapping mutable ownership.

- [ ] **Step 2: Create `coordination/templates/squad-lane.md`**

```markdown
# Same-Role Squad Lane — <task-id>

Round: <round-id>
Durable identity: <role>
Instance label: <Role-A>
Lane owner: <chat instance>
Branch: <branch>
Base SHA: <sha>
Status: READY | WORKING | WAITING_DEPENDENCY | HANDOFF_READY | BLOCKED

## Goal

<one independently reviewable outcome>

## Dependencies

- <exact task/SHA or none>

## Owned files / subsystem

- <exclusive write surface>

## Shared interfaces consumed

- <interface/contracts>

## Prohibited overlap

- <files/subsystems owned by sibling lanes>

## Integration target

- <designated same-role integrator + branch/task>

## Required evidence

- <tests/captures/artifacts>

## Identity Learning Receipt

Result at closeout: UPDATED | PROPOSAL | NO_CHANGE

For non-integrator lanes, use PROPOSAL or NO_CHANGE unless the round explicitly grants safe identity-file consolidation authority.
```

- [ ] **Step 3: Update Neureon identity**

Add a reusable coordination rule: Neureon chooses instance count from separability/load, not from a fixed team size, and must define the squad integrator plus write boundaries before activation.

- [ ] **Step 4: Update specialist identities generically**

Add a short `Multi-instance execution` section to Ricardo, Brancaforte, Germinator and Gonza matching the existing Mario concept, but scoped to each role.

For Mario, replace the current R005-specific framing with a generic rule plus a note that current R005 A/B/C/D labels are round state, not permanent identity semantics.

- [ ] **Step 5: Run coordination test**

```bash
node --test tests/coordination-contract.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add coordination/PROTOCOL.md coordination/templates/squad-lane.md coordination/agents
git commit -m "coordination: generalize same-role multi-instance squads"
```

---

### Task 5: Encode scalable content and sprite direction as durable decisions

**Files:**
- Modify: `docs/DECISIONS.md`
- Modify: `docs/CURRENT_MILESTONE.md`

**Interfaces:**
- Consumes: approved design spec.
- Produces: durable architectural decision history without modifying R005 execution state.

- [ ] **Step 1: Append accepted decisions**

Append dated decisions that state:

```markdown
- 2026-09-21: After R005/V0.7 closes, fighter body presentation is approved to migrate from procedural articulated rigs to derived sprite animation packages. Source/reference sheets remain authoring-only; production sprites are normalized derived assets.
- 2026-09-21: The sprite renderer remains strictly presentation-only. Existing deterministic 60 Hz simulation owns all hitboxes, damage, move legality, stun, projectiles, CPU and Clash truth.
- 2026-09-21: Temporary procedural/sprite dual rendering is allowed only as a migration mechanism. Final production cutover requires all currently playable fighters to pass the sprite-body acceptance contract; no permanent mixed-art roster is intended.
- 2026-09-21: Character/content growth should extend declarative character packages and reusable bounded gameplay primitives rather than central fighter-ID conditionals.
- 2026-09-21: Durable agent identity is separate from temporary chat instances. Any role may scale to multiple isolated lanes when work is safely separable, with one integrated candidate before downstream QA.
- 2026-09-21: Identity Learning Review is a mandatory closeout step for every meaningful agent task/session. The review may validly yield NO_CHANGE; skipping the review is invalid.
- 2026-09-21: Repository tool policy can route Superpowers, Game Studio and Game Development Studio when available, but cannot assert host capability availability. Missing required capability is reported as TOOL_UNAVAILABLE.
```

- [ ] **Step 2: Add a non-disruptive next-architecture note to `CURRENT_MILESTONE.md`**

Append a section named `Approved post-R005 architecture` that:
- links the approved design;
- states no current R005 runtime/gate is changed;
- states the next sprite/scalability implementation round opens only after R005 closure unless the user explicitly reopens scope.

Do not alter current R005 status, SHAs, task eligibility or phone acceptance language.

- [ ] **Step 3: Run coordination test**

```bash
node --test tests/coordination-contract.test.mjs
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add docs/DECISIONS.md docs/CURRENT_MILESTONE.md
git commit -m "docs: record post-V07 sprite and scaling decisions"
```

---

### Task 6: Verify the repository-wide coordination change

**Files:**
- No new product files.
- Review all files changed by Tasks 1–5.

**Interfaces:**
- Consumes: completed coordination/tooling changes.
- Produces: evidence that policy changes did not break repository verification.

- [ ] **Step 1: Run focused coordination test**

```bash
node --test tests/coordination-contract.test.mjs
```

Expected: PASS, 0 failures.

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: exit 0.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: exit 0.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 5: Verify active-round isolation**

Run:

```bash
git diff --name-only 61d22bd345068407bb16789a55e4acafe857f392...HEAD
```

Expected: no files under `src/`, no active R005 task/status/lock/forum/handoff mutation, and no release artifact mutation. Only approved spec/plan/docs/coordination policy/templates/identity/test files are present.

- [ ] **Step 6: Commit any verification-only test adjustments only if required**

No code/doc mutation should be needed if all previous tasks were correct.

