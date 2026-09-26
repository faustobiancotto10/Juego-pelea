# Agent Orchestration V2 — Neureon frozen design

Status: **FROZEN DESIGN / NOT YET OPERATIONAL**  
Date: 2026-09-26  
Owner: Neureon  
Inputs: ASTRA draft audits PR #61 and PR #62.  
Operational migration: separate future work; this document does not authorize production/gameplay changes or a second live round.

## Objective

Make repo-first ChatGPT agents safe to activate, replace, and parallelize without relying on prior chat memory and without turning Neureon into a manual scheduler.

The target must support multiple temporary workers of the same durable role while preserving exact-SHA QA, explicit ownership, R005 history, and user gates.

## Frozen conceptual model

These four concepts are distinct and MUST NOT share identifiers by implication:

1. **ROLE** — durable identity and authority boundary, e.g. `mario`, `ricardo`.
2. **TASK** — a verifiable result with dependencies, base/input SHAs, acceptance evidence, and downstream target.
3. **SLOT / LANE** — a persistent execution surface for a task: branch, owned paths/subsystem, integration target and conflict boundary. The slot survives worker replacement.
4. **INSTANCE / WORKER** — one disposable ChatGPT execution instance currently occupying a slot. It may disappear and be replaced without redefining the task or slot.

Example only:

- role: `mario`
- task: `M-104`
- slot: `M-104-S1`
- instance: `mario-02`

If `mario-02` disappears, a replacement may occupy `M-104-S1`; the slot/task do not change.

## Additional entities

- **CLAIM** — mutable ownership record binding one instance to one eligible slot.
- **HANDOFF** — exact-SHA output/evidence receipt.
- **DEPENDENCY** — task edge plus required evidence/verdict.
- **LOCK** — current reservation derived from an active claim/slot ownership, not historical prose.
- **STATUS** — current projection derived from canonical task/claim/evidence state; it must not become an independent competing source of truth.
- **ROUND** — objective, dependency graph, frozen contracts and human gates.
- **ARCHIVE** — immutable historical narrative/evidence, separate from current projections.

## State separation

Do not use one state vocabulary to describe unrelated concepts.

### Task state

Minimum target vocabulary for new-model tasks:

`WAITING_DEPENDENCY → READY → CLAIMED → HANDOFF_READY → VERIFIED → ARCHIVED`

`BLOCKED` may interrupt an active task and return only through an explicit repair/revision path.

A checkpoint is evidence, not necessarily a task state.

### Instance state

`UNASSIGNED → ACTIVE → RELEASED`

Optional explicit exceptional states: `PAUSED`, `REASSIGNED`.

`UNRESPONSIVE` is diagnostic and MUST NOT auto-release ownership by time alone.

### Round state

Preserve the current round lifecycle:

`IDLE → ACTIVE → VALIDATION → RELEASE → ROUND_COMPLETE`

with `PAUSED` only for a real external/decision blocker.

### Orthogonal events

The following are events/evidence, NOT task or worker states:

- handoff consumed;
- QA approve/block;
- user gate accepted/rejected;
- lock released;
- checkpoint published.

This is the durable resolution of the `HANDOFF_CONSUMED` drift found by ASTRA.

## Authority and current-state rule

There must be one canonical mutable representation for each fact.

Target rule:

- task definition owns immutable task contract;
- claim owns current worker occupancy;
- accepted handoff/QA receipt owns completion evidence;
- current STATUS/queue/lock views are generated from, or mechanically checked against, those canonical records;
- history never determines current state by paragraph ordering.

Do NOT create multiple editable JSON/Markdown copies of the same owner/state/lock.

## Boot target

A newly activated chat should normally read:

1. `AGENTS.md`;
2. one compact `coordination/BOOT.md`;
3. durable role identity;
4. current round projection;
5. role queue / eligible slot projection;
6. claimed task + exact dependency handoff(s);
7. only the technical contracts needed for that task.

Historical forum/round logs are followed by links only when needed.

The boot target is deterministic reconstruction, not minimal line count at the cost of missing authority.

## Claiming rule

Auto-claim is NOT considered safe merely because Markdown says it is.

Before generic auto-claim becomes operational:

- claims must reject occupied slots;
- active owned paths may not overlap;
- dependencies and base/input SHAs must be revalidated at claim time;
- two workers racing for the same slot must yield exactly one winner;
- the loser must reread current state and choose another eligible slot or stop.

ASTRA's compare-and-swap / fast-forward-ref mechanism is a **candidate implementation**, not a frozen mechanism. Gonza must prove the actual GitHub primitive in an isolated trial before adoption. No force-push claiming.

If atomic claim support is unavailable in a session, fallback is explicit/manual slot assignment; never concurrent unverified claims.

## Checkpoint / replacement rule

Significant recoverable progress is committed to the worker branch and referenced by the claim/handoff.

If a worker disappears:

- uncommitted chat-local work is considered lost;
- the slot remains owned until explicit release/reassignment;
- a replacement reads the last durable checkpoint, branch, task and dependencies;
- replacement revalidates before continuing;
- no replacement self-declares a VERIFIED state from an abandoned branch.

## QA and integration

Preserve the strongest existing behavior:

- implementers hand off exact SHAs;
- Germinator independently validates exact candidates;
- a QA BLOCK remains attached to the rejected SHA;
- a replacement candidate requires fresh evidence;
- Gonza consumes only accepted exact SHAs and verifies the integrated/served tree;
- adding unrelated content after QA invalidates release-level approval until revalidated.

Parallel Germinator workers may audit disjoint tasks, but each final QA gate has one authoritative verdict for one exact candidate.

## Neureon authority

Neureon retains:

- round creation/closure;
- dependency graph and cross-role contracts;
- ownership conflict resolution;
- scope/replan decisions requested by the user;
- promotion of durable system decisions.

Neureon must NOT be required to manually approve normal green handoffs or assign every available worker. Eligible tasks should advance from repository evidence once the claiming model is proven.

## R005 compatibility

R005 remains the only live round.

This design does NOT:

- convert existing R005 tasks to the new data model;
- reinterpret old product SHAs;
- change Sprite Pilot product acceptance;
- waive physical-device/user gates;
- promote production root;
- erase old handoffs/locks/history.

Phase 0 may reconcile invalid tokens and current-vs-history presentation only.

The new structured model should first become operational in an isolated migration/trial surface, then a future round should be the first round born natively on V2.

## Migration order and owners

### Phase 0 — current-state reconciliation
Owner: Neureon.  
Independent gate: Germinator.  
Scope: state tokens, current projections, historical labeling, coordination tests only.  
No product/runtime mutation.

### Phase 1 — minimal V2 representation
Contract owner: Neureon.  
Implementation/tooling owner: Gonza.  
QA: Germinator.

Deliver:
- compact BOOT index;
- canonical task/slot/claim representation for NEW trial tasks;
- derived/validated current views;
- compatibility reader/reporting for R005 without rewriting its history.

### Phase 2 — durable roles / replaceable workers
Contract owner: Neureon.  
Role owners review authority boundaries.  
Tooling: Gonza.  
QA: Germinator.

Deliver replacement-safe instance records and deduplicated boot rules. Durable role identity must not absorb round-specific state.

### Phase 3 — invariant validator
Implementation: Gonza.  
Adversarial fixtures and gate: Germinator.  
Contract arbitration: Neureon.

Must detect at minimum:
- invalid states/transitions;
- missing/duplicate owner;
- overlapping active paths;
- unknown role/slot/task;
- dependency cycles or unsatisfied dependencies;
- nonexistent/wrong-lineage SHA where verifiable;
- handoff/QA SHA mismatch;
- release eligibility mismatch;
- invalid instance→role→slot relationship.

### Phase 4 — isolated multi-instance trial
Neureon defines synthetic/disjoint trial tasks.  
Mario/Ricardo workers exercise claims and replacement.  
Germinator observes independently.  
Gonza verifies claim/integration mechanics.

Required scenarios:
- two workers race for one slot → exactly one winner;
- two disjoint workers progress concurrently;
- worker disappears after checkpoint → replacement resumes same slot;
- branch exists without handoff → cannot unlock downstream;
- stale QA BLOCK + newer approved replacement remain distinguishable.

Do not start with 10–20 workers. Prove 2–4 first.

### Phase 5 — adoption/archive
Only after a successful trial and an appropriate round boundary.

Retire duplicate legacy current-state surfaces gradually; preserve immutable R005 evidence.

## Explicit non-goals

Do not build now:

- scheduler service;
- database;
- event bus;
- automatic chat spawning/wakeup;
- time-expiring locks/heartbeats;
- arbitrary workflow language;
- permanent `Mario-A` / `Mario-B` identities;
- integrator worker per role by default.

## Acceptance for V2 readiness

The system is not ready for “open ten chats and tell each one only its role” until:

1. current coordination is green;
2. canonical ownership/state model exists for trial tasks;
3. invariants are automatically checked;
4. contested claim has a proven single-winner mechanism;
5. replacement from durable checkpoint succeeds;
6. exact-SHA QA/integration still works;
7. ASTRA performs a post-implementation adversarial audit;
8. Neureon closes any critical/important findings.

