# Handoff — Agent Orchestration V2 Phase 4 setup / Germinator preflight

Program: Agent Orchestration V2  
Live product round: R005 remains ACTIVE and untouched  
From: Germinator  
To: Mario + Ricardo P4-A workers → later Phase-4 scenario chain  
Frozen contract PR: #69  
Frozen contract head: `a6177203b3235589fcbcdeecc0c7c0b562e17763`  
Setup PR: #70  
Audited exact setup PR head: `c40361e709981e4f98bcd7861a6e395e641c74fd`  
Gonza implementation candidate named in handoff: `907da6ee6206eaa0dd25f4bc15423aff317679d2`  
Canonical Phase-4 setup seed: `ef5aac1989fef70fc7c04251e426086fc690e1d6`  
Validation PR: #71  
Independent QA test head: `afa258e9a0d3e54f026e833f702195689769d026`

## Verdict

**APPROVE — PHASE 4 SETUP PREFLIGHT GREEN**

Mario + Ricardo may begin **P4-A only** according to Neureon's frozen execution order.

This approval does not approve any worker result, P4-B race outcome, P4-C replacement outcome, full Phase-4 completion, or broad V2 adoption.

## Exact setup-head audit

PR #70 remained at exact head:
`c40361e709981e4f98bcd7861a6e395e641c74fd`

The implementation candidate `907da6ee...` is one commit behind the PR head. The only later delta is:
- `coordination/handoffs/AGENT-SYSTEM-V2-P4-SETUP-gonza.md`;
- one bounded Gonza durable-role learning.

Therefore the implementation-vs-handoff distinction is coherent.

Base:
`a6177203b3235589fcbcdeecc0c7c0b562e17763`

PR #70 changed only coordination/tooling/test/workflow surfaces. No `src/**`, gameplay, renderer, UI, runtime asset, product release, or R005 task mutation exists.

## Frozen contract materialization

Independent check confirms exactly:

### Tasks — 8
- `P4-A-MARIO`
- `P4-A-RICARDO`
- `P4-B-ONE`
- `P4-B-TWO`
- `P4-C-MARIO`
- `P4-D-U`
- `P4-D-D`
- `P4-E-QA`

### Slots — 8
One persistent slot per task with unique claim/work refs.

### Disposable instances — 8
- `mario-v2-p4-a`
- `ricardo-v2-p4-a`
- `mario-v2-p4-b`
- `mario-v2-p4-c1`
- `mario-v2-p4-c2`
- `ricardo-v2-p4-d-u`
- `ricardo-v2-p4-d-d`
- `ricardo-v2-p4-e`

`mario-v2-p4-c2.replacementOf = mario-v2-p4-c1`.

Every Phase-4 task has:
- `baseSha = a6177203...`;
- `lineageBaseSha = a6177203...`;
- no live product inputs;
- synthetic Phase-4 kind.

## Scenario contract checks

### P4-A — PASS setup
- exact frozen Mario path:
  `coordination/v2/trials/P4-A/mario/**`
- exact frozen Ricardo path:
  `coordination/v2/trials/P4-A/ricardo/**`
- refs are disjoint;
- roles are correct.

### P4-B — PASS setup
- two different Mario-compatible slots;
- two different claim refs;
- two different work refs;
- paths are disjoint;
- shared intended claimant `mario-v2-p4-b` exists.

No P4-B outcome is inferred from setup approval. The adversarial race remains mandatory.

### P4-C — PASS setup
- one persistent slot;
- c1/c2 role-compatible;
- c2 durably identifies c1 as replacement;
- explicit reassignment primitive exists.

Static adversarial inspection confirms reassignment requires:
- globally valid strict remote model;
- currently claimed slot;
- exact current source owner;
- replacement metadata;
- replacement not already active elsewhere;
- exact checkpoint commit;
- checkpoint inside task lineage;
- checkpoint contained by current work ref;
- fast-forward-only claim-ref update;
- post-update global verification that source is inactive and replacement is sole owner.

No force / force-with-lease escape exists.

### P4-D — PASS setup
- upstream `P4-D-U` begins READY;
- downstream `P4-D-D` begins WAITING_DEPENDENCY;
- downstream requires canonical `P4-D-U = VERIFIED`;
- branch existence alone cannot satisfy the model dependency.

### P4-E — PASS setup
- `qaRequired:true`;
- acceptance explicitly preserves H1/C1 BLOCK history;
- H2 must supersede H1;
- APPROVE binds H2/C2 only.

## Live remote ref verification

Germinator directly re-read all authoritative refs before approval.

All eight declared claim refs are exactly:
`ef5aac1989fef70fc7c04251e426086fc690e1d6`

All eight declared work refs were independently verified at the same seed earlier in this preflight, matching setup CI.

At final closeout, all eight claim refs still point to `ef5aac19...`.

Therefore:
- no Phase-4 worker claimed early;
- no P4 claim is active;
- no claim ref drift occurred during QA.

The seed is four commits descendant of the frozen contract head and contains the task/slot/instance materialization plus reassignment primitive.

## Exact CI evidence

PR #70 exact head:
Repository verification #1800 / `36279464439`
- coordination contract: **12/12 PASS**
- full suite: **305/305 PASS**
- build: **PASS**

Global remote projection #15 / `36279464498`
- `GLOBAL_REMOTE_PROJECTION_PASS tasks=9 slots=9 active=0`
- strict global invariants PASS.

Phase-4 setup evidence #3 / `36279464447`
- `PHASE4_SETUP_GLOBAL_READY_PASS`
- `PHASE4_WORK_REFS_SEEDED_PASS`
- 8 P4 tasks;
- 8 P4 slots;
- 8 P4 instances;
- P4-D-D = WAITING_DEPENDENCY;
- every other P4 task = READY;
- every P4 slot = READY/unclaimed;
- every P4 instance = UNASSIGNED.

## Independent Germinator QA

Validation PR #71.

First two QA runs failed only because Germinator's contract-text regex over-constrained the exact prose. No setup assertion failed. The harness was corrected without changing PR #70.

Final independent QA head:
`afa258e9a0d3e54f026e833f702195689769d026`

Repository verification #1803 / `36283050435`:
- coordination contract: **12/12 PASS**
- 12 targeted Phase-4 preflight probes: **12/12 PASS**
- complete suite: **317/317 PASS**
- build: **PASS**

This follows Germinator's durable rule that a failing adversarial test is not automatically a candidate blocker until the assertion itself is verified against the frozen contract.

## Non-blocking metadata finding

PR #70 body still says the 16 refs are seeded at preliminary SHA:
`05b5262a8bf72fdd5ba58fc369c1b876a86c576c`

That is stale descriptive metadata.

Authoritative/current evidence agrees on:
`ef5aac1989fef70fc7c04251e426086fc690e1d6`

Specifically:
- Gonza final setup handoff;
- Phase-4 setup workflow constant;
- all eight claim refs;
- all eight work refs;
- independent Germinator checks.

The stale PR body is not a current authority and does not block P4-A, but it should be corrected by Gonza for human clarity.

## Orphan preliminary refs

Gonza disclosed eight preliminary refs under:
`coord-v2-p4-claims/*`

No slot declares them, they never held a claim, and the global model enumerates declared slot refs rather than arbitrary similarly named branches.

Ruling:
- non-authoritative setup debris;
- not a preflight blocker;
- preserve/archive/delete later when supported;
- do not use them for worker activation or evidence.

## Required next action

Unlock only:

**P4-A — Mario + Ricardo disjoint parallel execution**

Activate separate Mario and Ricardo workers:
- Mario instance `mario-v2-p4-a`;
- Ricardo instance `ricardo-v2-p4-a`.

They must independently reconstruct global remote state, claim only their role-compatible P4-A slots, work only inside their synthetic owned surfaces, commit deterministic checkpoints, and leave exact-SHA handoffs.

Do not start P4-B until P4-A evidence is complete according to the frozen order.

P4-B remains the critical architectural stop test:
if two different claim refs admit the same instance simultaneously and the aggregate model becomes invalid, Phase 4 FAILS immediately. Manual cleanup cannot convert that outcome to PASS.

## Identity Learning Review

Receipt: **UPDATED**

Durable Germinator learning added:

> In ref-backed coordination systems, setup preflight must verify the live remote ref heads immediately before approval and compare them with the declared seed/config. Branch-local tests, handoff prose or PR metadata can remain green or stale while mutable remote refs change out-of-band.
