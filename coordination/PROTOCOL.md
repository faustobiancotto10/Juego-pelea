# Multi-Agent Coordination Protocol

## 1. Authority

The repository is authoritative over chat memory.

Priority order:

1. Direct user instruction for the current objective.
2. `coordination/CURRENT_ROUND.md`.
3. This `PROTOCOL.md`.
4. The agent's own identity file in `coordination/agents/`.
5. `STATUS.md`, `LOCKS.md`, assigned task files and active forum threads.
6. Root `AGENTS.md` and `docs/DECISIONS.md`.
7. Conversation memory.

If chat memory contradicts repository state, follow the repository and raise the mismatch in the active forum.

## 2. Team

- **Neureon** — Lead / Coordinator
- **Ricardo** — Gameplay Engineer
- **Mario** — Character / Rendering Engineer
- **Brancaforte** — UI / Input / UX Engineer
- **Germinator** — Auditor / QA
- **Gonza** — Integration / Release

## 3. Global round lifecycle

Exactly one global state is active:

`IDLE → CHECK_IN → ACTIVE → VALIDATION → RELEASE → ROUND_COMPLETE`

`PAUSED` may be entered from any nonterminal state when safe progress is impossible.

Only Neureon may change the global round state.

### IDLE

No active objective. No real task, lock or live forum thread should exist.

### CHECK_IN

Neureon opens a round, identifies the required agents and creates the initial task/thread structure.

Every required agent must post a check-in message in the round's active forum thread:

```text
PRESENT
Readiness: READY | WAITING
Read: role, protocol, current round, status, locks, tasks, active forum
Initial blocker: none | description
```

`PRESENT` proves that the chat is alive and synchronized. `READY` means it can start its current work. `WAITING` is valid when a known dependency exists.

A round cannot become ACTIVE until all required agents have posted `PRESENT`.

When all required agents are present, only Neureon posts:

`START_ROUND`

### ACTIVE

Agents work, talk to each other in the forum, reserve shared files, implement assigned tasks, review each other's contracts and leave recoverable checkpoints.

### VALIDATION

Germinator performs adversarial QA, regression checks and balance scenarios. Implementation agents remain part of the round and must answer questions or repair issues.

### RELEASE

Gonza integrates accepted work, resolves integration conflicts, runs full verification, creates the deliverable and publishes only when the round requires publication.

### ROUND_COMPLETE

Only Neureon may post `ROUND_COMPLETE`.

Only Neureon may declare a round complete with `ROUND_COMPLETE`.

This is the sole signal that ends participation. Finishing an individual task, commit, handoff or review does **not** end an agent's obligation to the round.

After `ROUND_COMPLETE`, Neureon archives the round and resets active surfaces to IDLE.

### PAUSED

Use when:
- a required agent is unavailable or UNRESPONSIVE;
- a blocking inconsistency cannot be resolved;
- repository state is unsafe;
- required verification cannot be completed;
- a user decision is required.

Neureon reports the exact missing requirement instead of pretending progress is complete.

## 4. Per-agent states

Allowed states:

- `OFF_ROUND`
- `CHECKING_IN`
- `READY`
- `WORKING`
- `WAITING`
- `WAITING_FOR_TEAM`
- `REVIEWING`
- `VERIFIED`
- `BLOCKED`
- `UNRESPONSIVE`

An agent that finishes its own assignment moves to WAITING_FOR_TEAM, REVIEWING, VERIFIED or BLOCKED. It does not leave the round before ROUND_COMPLETE.

## 5. Activation / pulse behavior

A user pulse such as `.` means: wake up, synchronize with repository state, respond to team communication and continue the current round.

On every activation, before doing new work, every required agent must:

1. Read its identity file.
2. Read this protocol.
3. Read `CURRENT_ROUND.md`.
4. Read `STATUS.md`.
5. Read `LOCKS.md`.
6. Read assigned task files.
7. Read new forum messages mentioning the agent, its task or its owned subsystem.
8. Answer open team requests before unrelated new work.
9. Re-evaluate whether its previous plan is still valid.
10. Continue only after synchronization.

Before each commit or handoff, repeat steps 3–7.

If the round is not ROUND_COMPLETE, an agent may not answer a pulse with only “done” or “finished.” It must first synchronize and determine whether the team still needs action, review, repair or a response.

## 6. Forum: active team conversation

The forum is a **conversation mechanism** for agents to work together. It is **not a changelog** and not a progress diary.

Agents use threads in `coordination/forum/active/` to:
- ask each other questions;
- propose values/interfaces;
- answer requests;
- challenge assumptions;
- coordinate gameplay/render/UI contracts;
- report discoveries and bugs;
- request changes;
- review another agent's approach;
- resolve blockers before they become integration failures.

Allowed message types:

- `QUESTION`
- `PROPOSAL`
- `ANSWER`
- `REQUEST`
- `DISCOVERY`
- `BUG`
- `BLOCKER`
- `REVIEW`
- `DECISION_REQUEST`
- `ALERT`

Use `@Neureon`, `@Ricardo`, `@Mario`, `@Brancaforte`, `@Germinator`, `@Gonza` or `@all`.

An open request must receive an answer, explicit deferral or escalation. Do not silently ignore a teammate.

Forum discussion is provisional. Neureon promotes durable decisions into the appropriate permanent project document.

## 7. Locks and overlap prevention

`LOCKS.md` is the coordination lock registry.

Before materially editing a shared file, reserve:
- path;
- owner;
- task;
- reason.

No other agent edits a locked file.

If another role needs a change in a locked file, it posts a REQUEST to the owner in the relevant forum thread. The owner performs the interface change or coordinates a controlled transfer.

Release locks after the corresponding commit/handoff unless an active follow-up explicitly requires retention.

Germinator audits stale/conflicting locks. Neureon resolves ownership disputes.

## 8. Tasks and scope

Every real task has a contract under `coordination/tasks/` containing:
- task ID;
- round;
- owner;
- goal;
- dependencies;
- allowed files/subsystems;
- prohibited scope;
- collaborators/reviewers;
- acceptance criteria;
- tests/evidence;
- status;
- related forum threads.

Agents do not silently expand scope. New BUG or DISCOVERY findings go to the forum; Neureon assigns them to the current round, a follow-up round or deferred work.

## 9. Handoffs

A handoff formally transfers completed work or a contract to another agent/stage.

It contains:
- task ID;
- sender;
- recipient;
- commit SHA;
- files changed;
- behavior/interface contract;
- verification evidence;
- known risks;
- unresolved questions;
- requested next action.

A handoff does not end the sender's participation. The sender remains available until ROUND_COMPLETE.

## 10. Verification

Every agent verifies its own work before claiming its assigned work is ready.

### Ricardo
- gameplay tests for changed rules;
- deterministic behavior preserved;
- relevant interaction/balance scenarios checked;
- commit SHA and gameplay contract for consumers.

### Mario
- rendering compiles/runs;
- combat truth stays outside renderer;
- required state/animation cases checked;
- visual smoke/screenshots when available.

### Brancaforte
- input/UI behavior checked;
- mobile landscape checked;
- normal playfield not obstructed;
- UI does not decide combat outcomes.

### Germinator
- regression suite;
- adversarial and balance scenarios;
- coordination audit;
- explicit blocker list;
- final QA verdict with evidence.

### Gonza
- expected commits integrated;
- full test/build verification;
- release blockers cleared;
- published artifact matches approved integrated source when publishing is requested.

### Neureon
- all required agents checked in;
- all required tasks/reviews satisfied;
- blockers closed;
- release evidence present;
- archive/reset completed after closure.

## 11. Unresponsive / failed chat recovery

Chats cannot run continuously in the background and cannot wake each other. The repository therefore carries recoverable state.

If an agent is expected to act after user activation but leaves no meaningful forum response, checkpoint, commit, verification, handoff or blocker, Neureon may mark it `UNRESPONSIVE`.

A required UNRESPONSIVE agent blocks ROUND_COMPLETE.

If its absence prevents safe progress, Neureon changes the round to PAUSED and tells the user exactly which role must be reactivated.

A replacement chat can assume the identity by reading that role file plus current repository state. No role depends on one specific conversation instance.

## 12. Germinator audit authority

Germinator is independent from implementation roles.

Germinator may:
- reject insufficient evidence;
- open BUG, BLOCKER, REVIEW or ALERT messages;
- detect duplicated/conflicting work;
- flag lock/ownership violations;
- challenge gameplay/UI/rendering contracts;
- require regression coverage;
- block progression to RELEASE while acceptance criteria remain unmet.

Germinator does not redefine product intent. Scope/product disputes go to Neureon and, when necessary, the user.

## 13. Gonza release authority

Gonza may issue `BLOCK_RELEASE` when:
- a required task is missing;
- Germinator has unresolved blockers;
- tests/build fail;
- integration conflicts remain;
- a published artifact would not match approved source.

Neureon then returns the round to ACTIVE/VALIDATION or pauses for user input.

## 14. Archive and reset

At closure, Neureon writes a round archive containing:
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

Old active tasks/threads/locks are removed or reset so the next round cannot mistake historical instructions for current work.

## 15. Runtime isolation

Everything under `coordination/` is human/agent coordination data only.

Never import, bundle or execute it from `src/`, `play.html` or other game runtime code.
