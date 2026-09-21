# Multi-Agent Coordination Protocol

## 1. Authority

Repository state is authoritative over chat memory.

Priority:
1. Direct user instruction for the current objective.
2. `coordination/CURRENT_ROUND.md`.
3. This protocol.
4. Agent identity file.
5. STATUS / LOCKS / assigned task / active forum.
6. Root AGENTS and durable decisions.
7. Conversation memory.

If chat and repository disagree, follow repository state and report the mismatch.

## 2. Team

- Neureon — Lead / Coordinator
- Ricardo — Gameplay Engineer
- Mario — Character / Rendering Engineer
- Brancaforte — UI / Input / UX Engineer
- Germinator — Auditor / QA
- Gonza — Integration / Release

## 3. Round model

Exactly one global round exists.

Normal lifecycle:

`IDLE → ACTIVE → VALIDATION → RELEASE → ROUND_COMPLETE`

`PAUSED` is used only when safe progress requires a user decision, unavailable evidence, unresolved conflict or a blocking failure.

Neureon opens a round once. A round may declare:

`Execution mode: AUTO_CHAIN`

When AUTO_CHAIN is active, the single round start token preauthorizes every listed task according to its written dependency graph. There is **no per-stage PRESENT/check-in and no Neureon gate between normal handoffs**.

Round start token:

`START_ROUND — AUTO_CHAIN`

## 4. AUTO_CHAIN execution

Every task contains:
- owner and branch;
- exact dependencies;
- owned files/subsystems;
- prohibited scope;
- acceptance evidence;
- downstream handoff target.

An agent may start immediately when:
1. the round is ACTIVE;
2. its task is listed in CURRENT_ROUND;
3. every declared dependency is satisfied by a repository handoff/status with required evidence;
4. no open blocker applies to its subsystem.

The agent synchronizes repository state and begins. It does **not** post PRESENT and does **not** wait for Neureon to issue another token.

When a task finishes normally:
1. run the task's required verification;
2. commit product work on the assigned branch;
3. write/update the handoff with exact SHA and evidence;
4. update task/status to HANDOFF_READY / VERIFIED as appropriate;
5. release locks;
6. the downstream task becomes automatically eligible.

A valid green handoff is the normal progression signal. Neureon does not need to approve every step.

Independent lanes may run in parallel when their dependencies are satisfied. AUTO_CHAIN is a dependency graph, not a rule that only one human may work at once.

## 5. Deviation / escalation path

Agents must **stop the affected dependency chain and tell the user directly** when they find:
- a reproducible regression;
- a blocker;
- a contract contradiction;
- a required scope change;
- an unsafe shared-interface change;
- missing authoritative input;
- evidence that a frozen design assumption is wrong.

The agent must:
1. write a BUG / BLOCKER / DECISION_REQUEST in the active findings thread;
2. update its task/status to BLOCKED;
3. avoid speculative fixes outside its owned contract;
4. tell the user what failed, evidence, affected tasks and the smallest decision needed.

Do **not** automatically summon Neureon for every defect. The user decides whether to send Neureon to audit/re-plan. Downstream tasks that depend on the blocked contract do not proceed.

A local implementation bug fully inside an already-authorized task may be repaired by its owner without user escalation if it does not alter frozen behavior, interfaces, scope or acceptance criteria.

## 6. Activation / pulse behavior

A user pulse such as `.` means: synchronize with repository state and continue the highest-priority eligible task already assigned to that agent.

Before product work:
1. read PROTOCOL;
2. read CURRENT_ROUND;
3. read STATUS;
4. read LOCKS;
5. read own identity;
6. read assigned task(s);
7. read relevant active forum and handoffs;
8. verify dependencies and branch/base;
9. answer blocking team requests;
10. start/continue immediately if eligible.

Before each commit/handoff, re-read CURRENT_ROUND, STATUS, LOCKS and relevant findings/contracts.

Chats cannot wake one another. AUTO_CHAIN means **no new authorization is needed**; the user can simply activate the next agent chat and it starts from repository state.

## 7. States

Allowed task/agent states:
- OFF_ROUND
- READY
- WORKING
- WAITING_DEPENDENCY
- HANDOFF_READY
- REVIEWING
- VERIFIED
- BLOCKED
- UNRESPONSIVE

READY means its dependencies are satisfied and it may work immediately.
WAITING_DEPENDENCY means preauthorized but not yet eligible.
BLOCKED means normal auto-chain progression stops for affected dependents.

## 8. Forum

Active forum is working communication, not a progress diary.

Allowed message types:
- QUESTION
- PROPOSAL
- ANSWER
- REQUEST
- DISCOVERY
- BUG
- BLOCKER
- REVIEW
- DECISION_REQUEST
- ALERT

Normal green handoffs belong in task/handoff files. Use the findings thread for meaningful defects, uncertainties and cross-role decisions.

## 9. Locks

Before materially editing a shared file, reserve it in LOCKS with path, owner, task and reason.

No other agent edits a live locked file. Requests go to the owner. Release locks at handoff unless a written follow-up requires them.

## 10. Branch policy

Unless CURRENT_ROUND says otherwise:
- live coordination under `coordination/` is authoritative on `main`;
- product work occurs only on the assigned feature branch;
- branches start from the exact product base recorded in CURRENT_ROUND;
- agents never merge stale coordination from feature branches into main;
- Gonza integrates explicit accepted SHAs/deltas, not ambiguous moving heads.

## 11. Task scope

Every real task under `coordination/tasks/` defines:
- ID / round / owner / branch / status;
- dependency condition;
- goal;
- allowed ownership;
- prohibited scope;
- acceptance evidence;
- handoff target.

Agents may not silently broaden scope.

## 12. Handoffs

A handoff contains:
- task ID;
- sender / recipient;
- exact commit SHA;
- files changed;
- interface/behavior contract;
- tests/evidence;
- known risks;
- unresolved questions;
- downstream eligibility statement.

If evidence is complete and no blocker is open, the downstream task may start immediately.

## 13. Validation

Germinator remains independent and may block release.

A Germinator APPROVE satisfies the QA dependency declared by CURRENT_ROUND, but does not skip later dependencies. The round's explicit dependency graph controls whether Mario/Brancaforte work follows QA before Gonza becomes eligible. No extra Neureon RELEASE token is required in AUTO_CHAIN when all written release dependencies are satisfied.

Germinator does not redefine product intent. Product/scope disputes use the deviation path and go to the user.

## 14. Release

Gonza may publish only when:
- all required integration inputs are exact accepted SHAs;
- Germinator has APPROVE, not BLOCK;
- full tests/build/parity checks pass;
- served artifact matches approved source;
- CURRENT_ROUND explicitly includes a release task.

If any condition fails, Gonza issues BLOCK_RELEASE, records evidence and tells the user.

## 15. Neureon

Neureon owns:
- round creation;
- dependency graph and frozen contracts;
- cross-role audit/re-plan when the user requests it;
- durable decision promotion;
- final round archive/reset.

Neureon is **not** a per-step approval service in AUTO_CHAIN.

Only Neureon issues ROUND_COMPLETE after final evidence exists. This final closure does not imply intermediate gates.

## 16. Recovery

If an agent is re-opened or replaced, it reconstructs state from repository files. No role depends on one chat instance.

If an expected agent is unavailable, mark UNRESPONSIVE only when its missing work actually blocks the dependency graph. Tell the user exactly which task cannot progress.

## 17. Durable role memory / identity evolution

Agent chats are disposable execution instances. The durable role identity lives in the repository.

After completing a meaningful task, and before considering its handoff fully complete, every agent must perform an **identity-learning review**:

1. ask whether the task revealed a stable lesson that would materially improve a future replacement chat performing the same role;
2. if not, make no identity change;
3. if yes, update only its own file under `coordination/agents/<agent>.md` on authoritative `main`, inside that file's **Durable role learnings** section;
4. keep the learning concise, evidence-based and reusable across future rounds;
5. prefer refining/merging an existing learning over endlessly appending bullets.

A valid durable role learning is:
- role-specific;
- expected to remain useful across multiple future tasks/rounds;
- supported by actual repository/task experience;
- operational enough to change future behavior for the better.

Do **not** store in identity:
- current round/task/status/branch/commit details;
- temporary blockers or one-off bugs;
- product decisions that belong in specs/DECISIONS;
- implementation details already discoverable from current code unless they encode a durable operating lesson;
- guesses, preferences or unverified conclusions;
- user secrets or unrelated conversation context.

Self-maintenance is intentionally bounded:
- an agent may edit only its own **Durable role learnings** section;
- it may not alter its Mission, ownership, prohibited responsibilities, authority, activation rules or this protocol through self-learning;
- it may not grant itself new scope or override another agent;
- cross-role/system-wide lessons go to Neureon for possible promotion into `AGENTS.md`, `docs/DECISIONS.md` or this protocol;
- if a proposed learning conflicts with higher authority, do not write it.

The identity-learning review must never delay downstream AUTO_CHAIN work merely because no useful learning exists. A no-op is a valid result.

Replacement chats inherit accumulated role experience by reading the identity file during normal activation.

## 18. Runtime isolation

Everything under `coordination/` is coordination data only. Never import, bundle or execute it from the game runtime.
