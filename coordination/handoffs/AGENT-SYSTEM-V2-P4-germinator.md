# Handoff — Agent Orchestration V2 Phase 4 / Germinator

Program: Agent Orchestration V2  
Live product round: R005 remains ACTIVE and untouched  
From: Germinator  
To: Gonza architecture repair → Germinator fresh audit → Neureon  
Frozen Phase-4 contract: PR #69 / `a6177203b3235589fcbcdeecc0c7c0b562e17763`  
Approved setup: PR #70 / `c40361e709981e4f98bcd7861a6e395e641c74fd`  
P4-A/P4-B evidence aggregation PR: #72  
Audited exact PR #72 head: `6757f40edb08ef3f258147221291a6a9fdf38070`

## Verdict

**BLOCK — PHASE 4 FAILS AT P4-B CROSS-REF CONFLICT SAFETY**

The failure condition in the frozen contract was reproduced exactly.

Manual cleanup or resetting the losing claim ref cannot convert this trial into PASS.

P4-C, P4-D and P4-E remain stopped.

## Scenario P4-A — PASS

Mario and Ricardo completed the disjoint parallel scenario correctly.

### Mario

Claim ref:
`refs/heads/coord-v2-claims/p4-a-mario`

Live claim head:
`f57adeee55eb745f66a58446142e041307a60266`

Claim:
- task: `P4-A-MARIO`
- slot: `P4-A-MARIO-S1`
- instance: `mario-v2-p4-a`
- expected parent: `ef5aac1989fef70fc7c04251e426086fc690e1d6`

Candidate checkpoint:
`644ccf6cd9058c8e6efa7843af3a859f4602e880`

Candidate changes exactly:
`coordination/v2/trials/P4-A/mario/checkpoint.json`

Work ref:
`refs/heads/coord-v2-p4-work/p4-a-mario`

Work-ref head:
`854f13a4e55f59655e748a8b88f3eb49f034df4b`

Canonical handoff:
`P4-A-MARIO-H1`

The handoff binds the exact candidate and exact claim SHA.

### Ricardo

Claim ref:
`refs/heads/coord-v2-claims/p4-a-ricardo`

Live claim head:
`142668763c1ccd60f1f7cd58889efc5d6c6150f2`

Claim:
- task: `P4-A-RICARDO`
- slot: `P4-A-RICARDO-S1`
- instance: `ricardo-v2-p4-a`
- expected parent: `ef5aac1989fef70fc7c04251e426086fc690e1d6`

Candidate checkpoint:
`d94917972b4244d03525e6a6ddfcbef42f37bbfc`

Candidate changes exactly:
`coordination/v2/trials/P4-A/ricardo/checkpoint.json`

Work ref:
`refs/heads/coord-v2-p4-work/p4-a-ricardo`

Work-ref head:
`be32bea5de19e0f0366bb5a3876badae7cd3f4ed`

Canonical handoff:
`P4-A-RICARDO-H1`

The handoff binds the exact candidate and exact claim SHA.

### P4-A ruling

PASS because:
- both role-compatible claims coexist;
- instances are distinct;
- owned paths are disjoint;
- candidate commits touch only their declared synthetic surfaces;
- exact-SHA handoffs exist;
- no product/runtime/R005 path was touched.

## Scenario P4-B — FAIL

Frozen contract requirement:

The same disposable instance must not become authoritative owner of two different slots across two different claim refs.

If both refs accept the claim and the aggregate model becomes invalid, Phase 4 fails immediately.

That is exactly what happened.

### Claim ONE

Ref:
`refs/heads/coord-v2-claims/p4-b-one`

Head:
`1c9af565548364800928ca013d8b52917ce87928`

Claim:
- slot: `P4-B-ONE-S1`
- task: `P4-B-ONE`
- role: `mario`
- instance: `mario-v2-p4-b`
- expected parent: `ef5aac1989fef70fc7c04251e426086fc690e1d6`

Commit time:
2026-09-29T00:05:42Z

### Claim TWO

Ref:
`refs/heads/coord-v2-claims/p4-b-two`

Head:
`47ce3ceb3346a916d5d6a6e7c341bb2b0dabd7e6`

Claim:
- slot: `P4-B-TWO-S1`
- task: `P4-B-TWO`
- role: `mario`
- instance: `mario-v2-p4-b`
- expected parent: `ef5aac1989fef70fc7c04251e426086fc690e1d6`

Commit time:
2026-09-29T00:05:46Z

Both claims are independent fast-forward descendants of the same globally-unassigned setup snapshot and both remote refs accepted them.

P4-B work refs remain at the original setup seed:
- `coord-v2-p4-work/p4-b-one` = `ef5aac1989fef70fc7c04251e426086fc690e1d6`
- `coord-v2-p4-work/p4-b-two` = `ef5aac1989fef70fc7c04251e426086fc690e1d6`

No worker output should proceed.

## Independent global validation

PR #72 global remote workflow:
- run: `36501641298`
- conclusion: **FAILURE**

Exact validator error:

`ERROR: instance mario-v2-p4-b occupies multiple slots`

This is the intended architectural stop test, not incidental CI noise.

Repository verification on PR #72 remains green because branch-local representation itself is structurally valid. The remote aggregate is what reveals the split-brain.

## Stop-condition verification

The frozen Phase-4 contract says to STOP immediately if two conflicting claims become simultaneously authoritative or the aggregate global projection becomes invalid.

Germinator independently verified no later scenario advanced after the failure.

All of the following claim refs remain at the setup seed `ef5aac19...`:
- P4-C Mario
- P4-D upstream
- P4-D downstream
- P4-E QA

All corresponding work refs also remain at the setup seed.

Therefore:
- P4-C was not executed;
- P4-D was not executed;
- P4-E was not executed;
- STOP behavior was respected after the failure.

## Architectural finding

The R1 repair correctly solved stale global visibility before a claim attempt, but it did not create atomic exclusion across two independent claim refs.

Two actors can:
1. reconstruct the same globally-unassigned instance;
2. target different refs;
3. both pass preflight;
4. both push normal fast-forward descendants;
5. leave the aggregate model invalid.

Per-ref Git CAS is not sufficient for a global invariant that spans multiple refs.

## Required repair

Owner:
**Gonza / V2 coordination architecture**

Before any retry:
1. introduce an atomic reservation/ownership authority for instance occupancy, or equivalent architecture that serializes the global invariant;
2. preserve the existing raw P4-B failure refs and history;
3. do not reset/delete them to manufacture a green trial;
4. add adversarial automated coverage reproducing this exact two-ref race;
5. prove at most one claim can become authoritative for one instance across different slot refs;
6. ensure the losing attempt remains a normal, reconstructible event;
7. return one replacement exact implementation head to Germinator.

After repair:
**Germinator fresh architecture audit → Neureon authorizes a new P4-B retry only if green.**

P4-C/D/E remain blocked until a replacement P4-B passes.

## R005 boundary

R005 product flow is unaffected.

No product, gameplay, runtime, sprite asset, release-root, or user/device gate is modified by this failure.

## Identity Learning Review

Receipt: **UPDATED**

Durable QA lesson:

> Fast-forward-only CAS is atomic only per ref. Any invariant that spans multiple independently mutable refs needs its own shared atomic authority or reservation mechanism; global preflight plus post-facto validation can detect split-brain but cannot prevent it.
