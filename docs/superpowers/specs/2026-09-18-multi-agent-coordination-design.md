# Multi-Agent Repository Coordination — Design

## Intent

The repository will act as the persistent shared workspace for six fixed ChatGPT agents working on Juego-pelea. Chats are not assumed to share memory or to remain alive continuously. Every agent reconstructs its role, current round, team state, open discussion, blockers and handoffs from repository files before acting.

The system is designed for manually pulsed execution: the user can send `.` to an agent chat to wake it, and that agent must synchronize with the repository, respond to team discussion, continue its assigned work and remain part of the round until Neureon explicitly closes it.

The collaboration model is not six isolated workers leaving changelogs. The forum is an active team conversation used while work is in progress so agents can ask questions, challenge decisions, coordinate interfaces, surface bugs and adapt their work together.

## Team

### Neureon — Lead / Coordinator
Owns round definition, task decomposition, dependencies, assignment, coordination, conflict resolution, status review and final round closure. Neureon does not declare a round complete until every required agent has provided the evidence required by this protocol.

### Ricardo — Gameplay Engineer
Owns combat simulation, moves, hitboxes/hurtboxes, damage, guard, mobility, CPU behavior, combat balance and gameplay-facing rules. Ricardo defines gameplay contracts consumed by rendering and UI.

### Mario — Character / Rendering Engineer
Owns procedural fighter presentation, animation poses, visual effects, particles, stage rendering and gameplay readability. Mario must not move combat truth into rendering.

### Brancaforte — UI / Input / UX Engineer
Owns HUD, menus, touch/keyboard input surfaces, onboarding, responsive mobile behavior and player-facing explanation of mechanics. Brancaforte may request gameplay state/contracts but must not independently redefine simulation rules.

### Germinator — Auditor / QA
Owns adversarial review, automated tests, regression scenarios, balance scenarios, coordination audits and release-blocking findings. Germinator is expected to question assumptions and may return work to another agent when evidence is insufficient or behavior is broken.

### Gonza — Integration / Release
Owns integration of approved work, conflict resolution at integration time, full verification, standalone build generation and publication. Gonza must not release unapproved or incompletely verified work.

## Repository structure

The implementation will create:

```text
coordination/
├── README.md
├── PROTOCOL.md
├── CURRENT_ROUND.md
├── STATUS.md
├── LOCKS.md
├── agents/
│   ├── neureon.md
│   ├── ricardo.md
│   ├── mario.md
│   ├── brancaforte.md
│   ├── germinator.md
│   └── gonza.md
├── forum/
│   ├── README.md
│   └── active/
│       └── README.md
├── tasks/
│   └── README.md
├── handoffs/
│   └── README.md
├── templates/
│   ├── forum-thread.md
│   ├── task.md
│   ├── handoff.md
│   └── round-archive.md
└── archive/
    └── README.md
```

Git cannot preserve empty directories, so each persistent directory contains a README or template.

## Source of truth

The repository is authoritative over chat memory.

Every agent must obey this priority order:

1. Direct user instruction for the current task.
2. `coordination/CURRENT_ROUND.md`.
3. `coordination/PROTOCOL.md`.
4. The agent's own identity file in `coordination/agents/`.
5. `coordination/STATUS.md`, `LOCKS.md`, active forum threads and assigned task files.
6. Project architecture documents such as root `AGENTS.md` and `docs/DECISIONS.md`.
7. Conversation memory.

If chat context contradicts repository state, the agent must use repository state and report the discrepancy in the active forum.

## Round lifecycle

A round has one global state:

```text
IDLE
CHECK_IN
ACTIVE
VALIDATION
RELEASE
ROUND_COMPLETE
PAUSED
```

Only Neureon may transition the global round state.

### IDLE
No active work. `CURRENT_ROUND.md` contains no active task beyond waiting for user direction.

### CHECK_IN
Neureon has opened a round and listed required agents. Each required agent must acknowledge presence in the active round thread.

Each required agent posts:

```text
PRESENT
Read: role, protocol, current round, status, locks, assigned tasks, active forum
Readiness: READY | WAITING
Initial blocker: none | description
```

`PRESENT` proves the chat has synchronized. `READY` means it can begin its current assignment. `WAITING` is acceptable when a planned dependency exists.

The round may not enter ACTIVE until all required agents are PRESENT. Neureon posts the explicit start token:

```text
START_ROUND
```

### ACTIVE
Agents execute assigned work, communicate through active forum threads, acquire/release locks, update status and create task-level commits/handoffs.

### VALIDATION
Primary implementation has converged. Germinator runs adversarial QA and regression/balance checks. Other agents remain active members of the round and must answer questions or repair issues.

### RELEASE
Gonza integrates only work accepted by the round, runs full verification, generates the deliverable and publishes when the round requests publication.

### ROUND_COMPLETE
Only Neureon may post:

```text
ROUND_COMPLETE
```

This is the sole terminal signal for the round. An individual agent finishing its own task does not leave the round.

After closure, Neureon archives the round conversation/state and resets `CURRENT_ROUND.md` to IDLE.

### PAUSED
Used when a required agent is unavailable, a blocking inconsistency cannot be resolved, repository state is unsafe, or required verification cannot be completed. Neureon reports the precise missing requirement to the user.

## Agent participation rule

No required agent may treat its participation as finished before `ROUND_COMPLETE`.

After completing an assigned task, an agent transitions to one of:

- `WAITING_FOR_TEAM`
- `REVIEWING`
- `VERIFIED`
- `BLOCKED`

On every later user pulse (`.`) while the round is not complete, the agent must resynchronize and continue any pending conversation, review, fix, integration support or verification relevant to its role.

Agents must not answer a pulse with a generic completion statement if the round is still active. They must first inspect current repository state.

## Status model

`STATUS.md` contains one row per required or available agent.

Allowed per-agent states:

```text
OFF_ROUND
CHECKING_IN
READY
WORKING
WAITING
WAITING_FOR_TEAM
REVIEWING
VERIFIED
BLOCKED
UNRESPONSIVE
```

Each row includes:

- current round
- assigned task IDs
- state
- current dependency/blocker
- last meaningful checkpoint
- current branch/commit when relevant

A checkpoint must describe evidence such as a commit, test result, forum response, review or handoff. A state change without evidence is not sufficient to claim progress.

## Active forum

The forum is a conversation mechanism, not a changelog.

Each cross-agent topic gets its own Markdown thread under `coordination/forum/active/`, usually tied to a task or shared design question.

Example names:

```text
T031-corner-pressure.md
T032-chameleon-tail-spin.md
T033-push-guard-ui-contract.md
```

Agents append concise messages in chronological order.

Each message contains:

```text
Author:
To: @agent | @all
Type:
Task:
Status:
Message:
Requested action:
```

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

A thread exists so agents can actively reason together: ask for contracts, challenge values, coordinate timing, report discoveries, request revisions and agree on interfaces.

Important decisions that affect future work are promoted by Neureon from discussion into the project's decision record. The forum itself is not the permanent architectural authority.

## Synchronization behavior

Whenever an agent is activated, it must:

1. Read its identity file.
2. Read `PROTOCOL.md`.
3. Read `CURRENT_ROUND.md`.
4. Read `STATUS.md`.
5. Read `LOCKS.md`.
6. Read its assigned task files.
7. Read all new messages in active forum threads that mention it, its tasks or its owned subsystem.
8. Respond to open requests before starting unrelated new work.
9. Re-evaluate whether its previous plan is still valid.
10. Work only after synchronization is complete.

Before every commit or handoff, it repeats steps 3–7 to catch team changes made while it was working.

## Locks and overlap prevention

`LOCKS.md` is a coordination lock registry, not an OS-level lock.

Before materially editing a shared file, an agent reserves it with:

- path
- owner
- task
- reason

No other agent may edit a locked file.

If another agent needs a change in that file, it posts a REQUEST in the relevant forum thread to the lock owner. The owner either performs the requested interface change or coordinates a controlled transfer.

Locks are released immediately after the corresponding commit/handoff unless explicitly retained for an active follow-up.

Germinator audits stale locks and conflicting ownership. Neureon resolves disputes.

## Tasks

Every active task has a file in `coordination/tasks/`.

A task defines:

- ID
- owner
- round
- goal
- dependencies
- allowed files/subsystems
- prohibited scope
- required collaborators/reviewers
- acceptance criteria
- required tests/evidence
- current status

Agents may discover new work, but they must not silently expand their scope. A DISCOVERY or BUG is discussed in the forum and Neureon either adds it to the current round, assigns a follow-up task or defers it.

## Handoffs

A handoff is the formal transfer of completed work to another agent or stage.

It includes:

- task ID
- sender
- recipient
- commit SHA
- files changed
- behavioral contract
- tests/evidence
- known risks
- unresolved questions
- explicit next requested action

A handoff does not mean the sender leaves the round.

## Verification

Every agent verifies its own work before claiming its assigned task is complete.

Minimum role-specific evidence:

### Ricardo
- gameplay tests for changed rules
- deterministic behavior preserved
- relevant interaction/balance scenarios checked
- commit SHA and gameplay contract for consumers

### Mario
- visual integration compiles/runs
- renderer remains non-authoritative for combat
- required state/animation cases covered
- screenshots or visual smoke evidence when available

### Brancaforte
- input/UI behavior covered
- mobile-landscape behavior checked
- overlays do not obstruct normal play
- UI does not mutate combat truth

### Germinator
- regression suite
- adversarial scenarios
- identified blockers explicitly resolved or accepted
- final QA verdict with evidence

### Gonza
- integration contains expected commits
- full test/build verification
- published artifact matches integrated source when release is requested
- no unresolved release blocker

### Neureon
- all required agents participated
- required tasks and reviews are satisfied
- blockers are closed
- release evidence is present
- archive/reset performed after closure

## Agent failure and unresponsive chats

Agents cannot run continuously in the background and cannot wake other chats. The repository therefore records recoverable state.

If an agent is expected to respond but, after user activation, leaves no meaningful forum response, checkpoint, commit, test evidence or blocker, Neureon may mark it `UNRESPONSIVE`.

A required unresponsive agent blocks `ROUND_COMPLETE`.

Neureon transitions the round to PAUSED when the missing agent prevents safe progress and reports exactly what the user should reactivate.

A replacement chat can assume the same identity by reading the corresponding agent file and current repository state. No role depends on one specific conversation instance.

## Auditor authority

Germinator is independent from the implementation roles.

Germinator may:

- reject insufficient evidence
- open BUG or ALERT forum messages
- identify duplicated/conflicting work
- flag violations of locks or ownership
- challenge gameplay/UI/rendering contracts
- require regression coverage
- block progression to RELEASE when acceptance criteria are unmet

Germinator does not unilaterally redefine product intent. Product-scope disputes go to Neureon, who may escalate to the user.

## Release authority

Gonza integrates only after the relevant implementation and audit states permit it.

Gonza can issue `BLOCK_RELEASE` in the release thread when:

- required task is missing
- Germinator has unresolved blocking findings
- tests/build fail
- repository branches conflict
- published output would not match approved source

Neureon decides whether to return the round to ACTIVE/VALIDATION or pause for user input.

## Root AGENTS integration

The root `AGENTS.md` will gain a coordination rule instructing any agent participating in this multi-agent workflow to read `coordination/PROTOCOL.md`, its identity file and `CURRENT_ROUND.md` before modifying the project.

Existing gameplay/art constraints remain unchanged.

## Round archive

When a round is complete, Neureon creates one archive record containing:

- round goal
- required agents
- task list
- important forum conclusions
- decisions promoted to permanent docs
- commits/handoffs
- QA result
- release result
- unresolved deferred items

Active task/forum files are then removed or reset so a new round cannot mistake old instructions for current work.

History is preserved in `coordination/archive/`; active surfaces stay clean.

## Initial state after infrastructure installation

The coordination system itself will be installed in an idle state:

```text
CURRENT_ROUND: IDLE
No active tasks
No active locks
No active forum thread
All agents: OFF_ROUND
```

The first real multi-agent round will be created only after a new user-approved gameplay objective is selected.

## Non-goals

- No autonomous background execution.
- No attempt to make chats call or wake other chats.
- No hidden communication outside the repository.
- No agent may merge or release merely because its own task is done.
- No agent may bypass role ownership because another chat is temporarily inactive.
- The coordination system must not be imported by, bundled into or executed by the game runtime.
