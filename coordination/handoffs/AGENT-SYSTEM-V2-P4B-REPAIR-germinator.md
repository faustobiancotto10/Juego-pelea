# Handoff — Agent Orchestration V2 P4-B atomicity repair / Germinator

Program: Agent Orchestration V2  
Live product round: R005 remains ACTIVE and untouched  
From: Germinator  
To: Neureon → authorized P4-B rerun coordinator  
Repair PR: #73  
Audited exact PR head: `49203ab751f1262a67301c23c54903d23e2c7d4f`  
Implementation / live authority seed: `fc8d65c2a71059768f9d91b597370e4d4d1cd940`  
Shared authority ref: `refs/heads/coord-v2-claims/authority`  
Validation PR: #75  
Independent QA code head: `74896d528c75b748100979e9231b0ed47664828f`

## Verdict

**APPROVE — P4-B ATOMICITY REPAIR GREEN FOR THE FROZEN ADVERSARIAL P4-B RERUN**

This approval supersedes Germinator's BLOCK only with respect to the old per-slot claim architecture proven unsafe in PR #72.

The historical failure evidence remains valid and must remain preserved.

This approval does not authorize:
- P4-C;
- P4-D;
- P4-E;
- broad V2 adoption;
- main merge;
- R005 conversion.

Only the frozen P4-B adversarial rerun is unlocked.

## Exact candidate distinction

Gonza repair implementation / authority seed:
`fc8d65c2a71059768f9d91b597370e4d4d1cd940`

PR #73 exact head:
`49203ab751f1262a67301c23c54903d23e2c7d4f`

Compare proves PR head is exactly one commit ahead and the only added file is:
`coordination/handoffs/AGENT-SYSTEM-V2-P4B-REPAIR-gonza.md`

Therefore:
- implementation = `fc8d65c2...`;
- current PR delivery head = `49203ab7...`;
- live shared authority ref = `fc8d65c2...`.

Germinator audited the full PR delivery and independently verified the live authority.

## Root-cause repair

Old unsafe model:
- read all slot refs globally;
- final CAS occurred independently on each slot claim ref;
- a one-instance/one-slot invariant could therefore split across two refs.

Replacement model:
- all current occupancy lives in one shared ledger;
- all claim and reassignment mutations target one shared ref;
- each mutation is a child of the exact fetched authority head;
- normal fast-forward only;
- concurrent sibling mutations contend on the same Git ref;
- loser must reread global state;
- legacy per-slot refs are evidence only.

Authority:
`refs/heads/coord-v2-claims/authority`

## Fresh exact-head verification

PR #73 exact head remained:
`49203ab751f1262a67301c23c54903d23e2c7d4f`

Repository verification #1822 / `37047650915`:
- coordination contract: **12/12 PASS**;
- full suite: **307/307 PASS**;
- build: **PASS**.

Global remote projection #32 / `37047650939`:
- `GLOBAL_REMOTE_PROJECTION_PASS tasks=9 slots=9 active=0`;
- `Agent Orchestration V2 global invariants PASS across remote origin`.

Repaired Phase-4 authority preflight #15 / `37047650879`:
- `PHASE4_REPAIRED_AUTHORITY_PASS head=fc8d65c2a71059768f9d91b597370e4d4d1cd940`;
- `PHASE4_FAILURE_EVIDENCE_PRESERVED_PASS`.

## Live ref verification

Current authority ref:
`refs/heads/coord-v2-claims/authority`
→ `fc8d65c2a71059768f9d91b597370e4d4d1cd940`

Historical failed P4-B refs remain unchanged:
- `refs/heads/coord-v2-claims/p4-b-one`
  → `1c9af565548364800928ca013d8b52917ce87928`
- `refs/heads/coord-v2-claims/p4-b-two`
  → `47ce3ceb3346a916d5d6a6e7c341bb2b0dabd7e6`

They are no longer read as current occupancy authority.

## Independent Germinator race

Germinator created an isolated shared authority QA ref from exact authority seed:
`fc8d65c2...`

Two sibling commits were created from the same parent:
- ONE: `6dcf4ab6186fe257d0069ee59a74493c588b4721`
- TWO: `15771886747d785339baaf3f132048213baf131a`

Both represented competing occupancy mutations by the same P4-B instance against different P4-B slots.

Shared QA ref:
`qa/coord-v2-claims/authority-germinator-race-v2`

Observed:
1. update to ONE with `force:false` → **SUCCESS**;
2. update to sibling TWO with `force:false` → **GitHub HTTP 422 / Update is not a fast forward**;
3. final ref head remained ONE.

Ruling:
**the shared-ref CAS primitive independently enforces one winner for concurrent sibling occupancy mutations.**

## Independent model/tooling probes

Validation PR #75.

Fresh QA head:
`74896d528c75b748100979e9231b0ed47664828f`

Repository verification #1825 / `37049780533`:
- coordination: **12/12 PASS**;
- complete suite: **315/315 PASS**;
- build: **PASS**.

New independent probes verify:
1. exactly one shared authority is declared;
2. legacy P4-B slot refs are distinct from current authority;
3. remote reconstruction resolves the shared authority exactly once;
4. same instance in two different P4-B slots is rejected by the global ledger validator;
5. two owners of one slot are rejected;
6. overlapping active owned paths remain rejected;
7. claim client requires local HEAD = fetched authority head;
8. claim client pushes only to `claimAuthorityRef`;
9. reassignment uses the same authority;
10. neither mutation path contains force / force-with-lease;
11. legacy failed refs remain evidence-only;
12. rerun remains gated on Germinator approval.

The first QA run failed only on an over-literal Germinator regex (`claim ref` vs `claimRef`). The repair candidate was unchanged; corrected harness is green.

## Strict invariants preserved

Fresh review confirms the repair does not remove:
- base/input SHA validation;
- dependency gating;
- role/task/slot/instance separation;
- one-instance/one-slot validation;
- one-owner-per-slot validation;
- active owned-path overlap checks;
- exact handoff/QA candidate binding;
- stale QA BLOCK preservation;
- BLOCKED repair transition rules.

## Product isolation

PR #73 changes only:
- coordination;
- V2 docs/config;
- V2 scripts;
- tests;
- workflows.

No `src/**`, gameplay, renderer, UI, runtime assets, sprite assets, release artifact, or R005 product surface changed.

## Remaining boundary

This audit proves the repair architecture is fit for the frozen **P4-B rerun**.

It does not count as the P4-B rerun itself.

The next execution must again race the same disposable instance against two different P4-B slots, but current occupancy must be written only through:
`refs/heads/coord-v2-claims/authority`.

PASS requires exactly one authoritative claim after the race and a globally valid projection.

If the rerun is green:
- only then may the Phase-4 sequence consider P4-C.

## Note on future phases

The shared authority serializes occupancy safety globally. This intentionally trades claim throughput for safety.

Later Phase-4 scenarios still need to prove:
- checkpoint/replacement behavior;
- branch-without-handoff dependency gating;
- stale BLOCK → approved replacement behavior.

No conclusion about those scenarios is implied here.

## Identity Learning Review

Receipt: **UPDATED**

Durable Germinator lesson:

> When a concurrency invariant spans multiple slots, independent per-slot CAS cannot enforce it. A shared authority can, but QA should verify both the model-level invariant and the actual remote Git race: two sibling mutations from one parent must produce one fast-forward winner and one rejected loser.
