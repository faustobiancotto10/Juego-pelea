# Handoff — Agent Orchestration V2 Phase 4 setup / Gonza

Program: Agent Orchestration V2  
Live product round: R005 remains ACTIVE and untouched  
From: Gonza  
To: Germinator setup preflight  
Frozen contract: `coordination/v2/trials/PHASE4-MULTI-INSTANCE-CONTRACT.md`  
Neureon contract head: `a6177203b3235589fcbcdeecc0c7c0b562e17763`  
Setup implementation candidate: `907da6ee6206eaa0dd25f4bc15423aff317679d2`  
Setup PR: #70

## Materialized trial

Eight synthetic tasks / eight persistent slots:

- P4-A: `P4-A-MARIO`, `P4-A-RICARDO`;
- P4-B: `P4-B-ONE`, `P4-B-TWO`;
- P4-C: `P4-C-MARIO`;
- P4-D: `P4-D-U` → `P4-D-D`;
- P4-E: `P4-E-QA` with `qaRequired:true`.

Disposable instances:

- `mario-v2-p4-a`;
- `ricardo-v2-p4-a`;
- `mario-v2-p4-b`;
- `mario-v2-p4-c1`;
- `mario-v2-p4-c2` with `replacementOf:mario-v2-p4-c1`;
- `ricardo-v2-p4-d-u`;
- `ricardo-v2-p4-d-d`;
- `ricardo-v2-p4-e`.

All owned paths are under `coordination/v2/trials/P4-*/**`.

## Exact setup seed / refs

Canonical setup seed:
`ef5aac1989fef70fc7c04251e426086fc690e1d6`

All eight declared claim refs are seeded at that exact SHA under:
`refs/heads/coord-v2-claims/p4-*`

All eight work refs are seeded at that exact SHA under:
`refs/heads/coord-v2-p4-work/p4-*`

No Phase-4 claim has been executed.

The completed old single-winner synthetic claim was explicitly released by normal fast-forward:
`1ddeb20ba5d332cf4463536f6ff5d8e398b8a37a`

Its prior winner/history remains in the claim-ref ancestry; no force/reset was used.

## P4-C explicit reassignment primitive

Added:
`scripts/coord-v2-reassign.mjs`

Contract:
- operates only on a currently claimed persistent slot;
- validates the global remote model under strict Git rules;
- validates source/replacement role compatibility;
- requires the replacement instance to declare `replacementOf`;
- requires an exact checkpoint SHA in task lineage and in the slot work-ref history;
- creates an immutable reassignment event;
- changes current claim ownership C1 → C2 in one descendant commit on the same claim ref;
- push is fast-forward-only;
- verifies globally that C1 is no longer active and C2 is the sole current owner.

The primitive is materialized/tested but has **not** been executed in P4-C.

## Verification

Exact setup implementation candidate:
`907da6ee6206eaa0dd25f4bc15423aff317679d2`

Repository verification #1799 / `36279360599`:
- coordination contract: 12/12 PASS;
- full suite: 305/305 PASS;
- build: PASS.

Global remote projection #14 / `36279360597`:
- SUCCESS;
- marker `GLOBAL_REMOTE_PROJECTION_PASS tasks=9 slots=9 active=0`;
- strict global invariants PASS.

Phase-4 setup preflight evidence #2 / `36279360595`:
- SUCCESS;
- `PHASE4_SETUP_GLOBAL_READY_PASS`;
- `PHASE4_WORK_REFS_SEEDED_PASS`;
- eight P4 tasks found;
- eight P4 slots found;
- eight P4 instances found;
- P4-D-D = WAITING_DEPENDENCY;
- all other P4 tasks = READY;
- every P4 slot = READY / unclaimed;
- every P4 instance = UNASSIGNED;
- every declared claim/work ref resolves to exact seed `ef5aac19...`.

Base → candidate changed paths are coordination/tooling/tests/workflows only. No `src/**`, gameplay, renderer, UI, runtime asset or production release path changed.

## Setup corrections preserved as evidence

Two setup-only harness issues were found and corrected before this handoff:
1. initial P4 claim refs used a noncanonical namespace; contracts were corrected to `refs/heads/coord-v2-claims/p4-*` rather than weakening the validator;
2. old V2 fixtures/workflow depended on array ordering and a historical active claimant; fixtures now select by stable ID and the generic global workflow validates invariants rather than transient claimant identity.

Eight preliminary empty refs under `coord-v2-p4-claims/*` were created before the namespace correction. No slot declares them, they never contained a claim, and they are **non-authoritative**. The current connector exposes no delete-ref operation, so they remain inert setup debris for later archive/delete housekeeping. Germinator should treat any ambiguity from these orphan refs as a preflight finding rather than assume authority.

## Boundaries

Not executed:
- P4-A worker claims/work/handoffs;
- P4-B race;
- P4-C reassignment;
- P4-D branch/handoff sequence;
- P4-E BLOCK/replacement/APPROVE.

Not authorized:
- Mario/Ricardo activation before Germinator setup APPROVE;
- merge to main;
- R005 conversion or claim;
- gameplay/product/runtime/assets mutation;
- force push / force-with-lease;
- broad V2 adoption.

## Requested next action

Germinator independently preflight exact setup PR #70:
1. compare materialization against frozen Phase-4 contract;
2. verify all declared claim/work refs and exact setup seed;
3. reconstruct global remote projection and confirm zero active P4 claims;
4. adversarially inspect the reassignment primitive without executing worker trial;
5. verify no R005/product mutation;
6. APPROVE or BLOCK setup.

Only APPROVE may unlock Mario + Ricardo P4-A activation.

## Identity Learning Review

Receipt: **UPDATED**

Added durable Gonza lesson:
- coordination tests/CI must select entities by stable IDs/declared refs and assert invariants rather than relying on filesystem order or a prior transient claimant.
