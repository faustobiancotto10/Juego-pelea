# Agent Orchestration V2 — Phase 4 isolated multi-instance trial contract

Status: **FROZEN TRIAL CONTRACT / NOT YET EXECUTED**  
Owner: Neureon  
Base implementation: `083d4715223bb041b59e97b10b6bb973ed3fa665`  
Prerequisite QA: Germinator APPROVE on V2 R1 / PR #68, exact audit head `31935176dff9cac5886d9269b908ed0888d20abe`.

R005 remains the only live product round. This trial is coordination/tooling-only and MUST NOT claim or mutate any R005 product task, product branch, runtime path, asset path, release path or user/device gate.

## Purpose

Prove the behaviors that remain unproven after the V2 R1 gate:

1. real parallel work by distinct roles/instances on disjoint slots;
2. cross-ref safety when two conflicting claims race on different claim refs;
3. checkpoint → worker disappearance → explicit replacement/resume on the same persistent slot;
4. branch existence without a handoff does not unlock downstream work;
5. stale QA BLOCK remains bound to the rejected candidate while a newer replacement can be independently APPROVED.

The trial is successful only if every scenario is evidenced from exact refs/SHAs and the global remote projection remains truthful. A manual cleanup that hides an unsafe intermediate state is not a PASS.

## Global rules

- Use only dedicated synthetic V2 task/slot/claim/work refs created for this trial.
- Every slot has a unique claim ref and work branch.
- No force push, force-with-lease, or manual rewriting of a losing claim is allowed.
- Workers must reconstruct all remote claim refs before claim attempts.
- Every meaningful checkpoint is a Git commit on the slot work branch.
- Slot identity survives worker replacement. Instance identity does not.
- A branch commit alone is never completion evidence; only a canonical V2 handoff can unlock a dependency.
- QA verdicts bind one exact handoff/candidate SHA and never float to replacements.
- If any scenario leaves the aggregate remote model invalid, stop the trial, preserve evidence, and return to Gonza repair. Do not continue to later scenarios.
- All trial refs/files must be clearly namespaced so they can be archived or removed later without touching R005.

## Scenario P4-A — disjoint parallel execution

Goal: prove two independently activated role workers can claim and work simultaneously without Neureon manually assigning each mutation.

Synthetic roles/workers:
- Mario worker: temporary instance `mario-v2-p4-a`;
- Ricardo worker: temporary instance `ricardo-v2-p4-a`.

Create two independent tasks with one slot each.

Mario slot owned surface:
`coordination/v2/trials/P4-A/mario/**`

Ricardo slot owned surface:
`coordination/v2/trials/P4-A/ricardo/**`

Required execution:
1. both tasks begin READY;
2. Mario and Ricardo reconstruct the same global remote state independently;
3. each claims only its own role-compatible slot;
4. both claims may coexist;
5. each worker writes a small deterministic checkpoint artifact only inside its owned path and commits it to its work branch;
6. each leaves an exact-SHA handoff.

PASS:
- both active claims are visible simultaneously in one global projection;
- no owned-path overlap;
- no duplicate instance;
- each branch contains only its allowed synthetic path plus required handoff/evidence surfaces;
- both handoffs point to exact existing candidate SHAs;
- after handoffs, both tasks derive the expected handoff/verified state according to their QA policy.

## Scenario P4-B — conflicting different-ref race

Goal: prove that global preflight plus the claim mechanism cannot silently admit an unsafe split-brain when the conflict is across two different claim refs.

Create two distinct Mario-compatible slots with different claim refs and disjoint owned paths.

Use **one and the same disposable instance ID** as the claimant in two concurrent attempts, one against each slot, both starting from a snapshot where that instance is globally unassigned.

This specifically tests the race between global preflight and two independent ref updates.

PASS requires:
- at no externally consumable checkpoint may the same instance remain authoritative owner of both slots;
- global validation must remain green after the race;
- exactly one slot may be admitted to downstream work for that instance.

If both independent fast-forward ref updates can succeed and the resulting aggregate model becomes invalid, this scenario is **FAIL**, even if a later manual reset restores green. Preserve both winning raw ref updates as evidence and return to Gonza for an architectural repair before any further trial/adoption.

No “last writer wins” semantics are permitted.

## Scenario P4-C — checkpoint and replacement

Goal: prove SLOT persists while INSTANCE is disposable.

Create one Mario task/slot and two compatible instances:
- `mario-v2-p4-c1`;
- `mario-v2-p4-c2`, with durable metadata identifying it as replacement of c1.

Required execution:
1. c1 claims the slot;
2. c1 writes and commits a deterministic checkpoint on the slot work branch;
3. c1 does **not** create the final handoff;
4. simulate c1 becoming unavailable;
5. perform an explicit durable release/reassignment procedure—never timeout-based;
6. c2 reconstructs the task, slot, branch, claim history and checkpoint without using c1 chat memory;
7. c2 continues from the exact checkpoint SHA and creates the final handoff.

PASS:
- task ID and slot ID remain unchanged across replacement;
- checkpoint commit remains ancestor of final candidate;
- c1 is no longer active after explicit reassignment;
- c2 is the only active/replacement worker for the slot;
- no history is deleted or rewritten to pretend c1 never existed;
- replacement requires no prior-chat information.

If V2 lacks an explicit safe release/reassignment primitive, record this as a trial BLOCK and return to Gonza; do not improvise deletion of claim history.

## Scenario P4-D — branch without handoff cannot unlock dependency

Create upstream synthetic task U and downstream task D where D depends on U.

Required execution:
1. U is claimed and its worker commits a valid branch result;
2. intentionally stop before creating U handoff;
3. reconstruct global state;
4. attempt to claim D;
5. only after proving D is still WAITING_DEPENDENCY, create U canonical handoff;
6. reconstruct again and prove D becomes eligible under the declared QA policy.

PASS:
- existence of U branch/head alone never changes D to READY;
- claim attempt for D before U evidence is rejected;
- downstream eligibility changes only from canonical handoff/QA evidence.

## Scenario P4-E — stale QA BLOCK and approved replacement

Create one QA-required synthetic task.

Revision 1:
- worker produces handoff H1 for candidate C1;
- Germinator issues QA `BLOCK` bound to H1/C1.

Revision 2:
- worker produces H2 for candidate C2;
- H2 explicitly supersedes H1;
- C2 must be a distinct exact SHA in the valid task lineage;
- Germinator issues `APPROVE` bound only to H2/C2.

PASS:
- C1 remains permanently represented as BLOCKED historical evidence;
- H1/QA-BLOCK is not mutated or deleted;
- H2 is the sole current handoff leaf;
- QA APPROVE references C2 exactly;
- task derives VERIFIED from H2/C2 only;
- no release/consumer can accidentally use C1 based on the newer APPROVE.

## Execution order

1. **Gonza — trial materialization**
   - translate this frozen contract into V2 task/slot/instance records;
   - seed all dedicated claim refs safely;
   - add only the minimum tooling needed for explicit release/reassignment or trial evidence;
   - return one exact setup head with global validator green before any worker claims.

2. **Germinator — setup preflight**
   - verify the materialized trial matches this contract and contains no R005/product mutation;
   - verify all claim refs are seeded and global projection is green.

3. **Mario + Ricardo — P4-A**
   - activate separate chats/workers and execute disjoint parallel tasks.

4. **Mario instances — P4-B and P4-C**
   - run the conflicting different-ref race;
   - if P4-B passes, run checkpoint/replacement;
   - if P4-B fails, stop the whole trial and return to Gonza.

5. **Ricardo / downstream-compatible worker — P4-D**
   - prove branch-without-handoff cannot unlock dependency.

6. **Germinator + implementation worker — P4-E**
   - produce stale BLOCK then approved replacement evidence.

7. **Germinator — independent full trial audit**
   - audit exact refs/SHAs, global projection, histories and invariants;
   - issue APPROVE or BLOCK for Phase 4.

8. **Gonza — integration/archive proof**
   - verify accepted exact evidence bundle and ensure no synthetic trial ref can be mistaken for production/release state.

9. **ASTRA — post-implementation architecture audit**
   - only after Phase 4 is independently green;
   - attempt to find remaining scaling/recovery/authority weaknesses before broad adoption.

10. **Neureon — adoption decision**
    - resolve any ASTRA Critical/Important findings;
    - only then decide whether a future round may be born natively on V2.

## Stop conditions

Immediate STOP/BLOCK if:
- two conflicting claims become simultaneously authoritative;
- aggregate global projection becomes invalid;
- replacement requires prior chat memory;
- downstream unlocks from a branch without handoff/required QA;
- stale QA verdict applies to a replacement candidate;
- a worker touches R005/product/runtime/assets;
- force push is used;
- any exact evidence SHA/ref cannot be reconstructed independently.

## Required evidence bundle

Final Phase-4 handoff must include:
- exact implementation/setup head;
- exact claim-ref heads before/after each race;
- exact work-branch checkpoint/candidate SHAs;
- global projection/validator output for every critical transition;
- P4-A simultaneous-claim evidence;
- P4-B race outcome;
- P4-C replacement lineage;
- P4-D pre/post-handoff dependency state;
- P4-E H1/C1 BLOCK + H2/C2 APPROVE evidence;
- complete test/build runs;
- all known limitations and any manual intervention used.

No Phase-5 adoption is authorized by this contract.
