# Handoff — Agent Orchestration V2 / Gonza isolated implementation

Program: Agent Orchestration V2  
Live product round: R005 remains ACTIVE and untouched  
From: Gonza  
To: Germinator independent coordination/tooling QA, then Neureon  
Implementation branch: `coordination/gonza-v2-isolated`  
Draft implementation PR: #65  
Exact implementation candidate: `b91f457032c90f4d3c7873951882367d38d55bc4`  
Accepted Phase-0 base: `4a47962e563b8e444ab6cf6a288db66c13dda743`

## Scope implemented

Implemented the isolated V2 foundation in the frozen order requested by Neureon:

1. compact BOOT/current-state representation;
2. canonical ROLE / TASK / SLOT / INSTANCE separation;
3. mutable CLAIM authority separated from derived current views;
4. invariant validator + adversarial fixtures;
5. real GitHub fast-forward-only claim primitive proof.

No live R005 task was converted or auto-claimed.

## Canonical representation

Added:
- `coordination/BOOT.md`;
- `coordination/v2/roles.json`;
- `coordination/v2/tasks/*.json`;
- `coordination/v2/slots/*.json`;
- `coordination/v2/instances/*.json`;
- claim/handoff/QA/transition/release record surfaces;
- generated/checked `coordination/v2/CURRENT.json`.

Invariant preserved:

`ROLE != TASK != SLOT/LANE != INSTANCE/WORKER`

Task/slot/instance records do not store current mutable state or occupancy. Those are derived from canonical claims/evidence.

R005 appears only through a read-only compatibility projection sourced from `coordination/CURRENT_ROUND.md`.

## Validator/tooling

Added:
- `scripts/lib/coord-v2-model.mjs`;
- `scripts/coord-v2-project.mjs`;
- `scripts/coord-v2-validate.mjs`;
- `scripts/coord-v2-claim.mjs`;
- `tests/coord-v2-model.test.mjs`.

Validator/adversarial coverage includes:
- duplicate/missing owner;
- unknown role/task/slot;
- invalid instance→role→slot relation;
- overlapping active owned paths;
- dependency cycle;
- claim with unsatisfied dependency;
- invalid task transitions;
- QA exact-SHA mismatch;
- release eligibility mismatch;
- stale QA BLOCK distinguished from a newer approved replacement;
- derived CURRENT drift;
- SHA existence/lineage when Git history is available.

A defect found by the first full run was repaired: mismatched QA evidence could produce an error while still driving derived VERIFIED state. V2 now excludes invalidly bound QA evidence from state/release derivation.

## Real claim primitive proof

Trial:
`V2-TRIAL-CLAIM-001`

Dedicated claim ref:
`refs/heads/coord-v2-claims/v2-trial-claim-001-s1`

Shared parent:
`097b591ab7f5d75636cd490b6ba3c2fcd7f67e8e`

Two sibling claimant commits:
- `gonza-v2-a`: `c952eb64a8a7b44beea2e2dd090cd23f6e7a2586`;
- `gonza-v2-b`: `42436e536c7ecc81b2da3e760d4477fe0dfb62a0`.

Result:
- first normal ref update with `force:false`: winner = `gonza-v2-a`;
- second normal ref update with `force:false`: rejected by GitHub;
- exact rejection: HTTP 422 — `Update is not a fast forward`;
- no force update was used.

Winner ref projection:
- task = CLAIMED;
- slot = CLAIMED;
- active instance = `gonza-v2-a`;
- `gonza-v2-b` = UNASSIGNED.

Durable proof:
`coordination/v2/trials/V2-TRIAL-CLAIM-001/proof.json`.

## Verification

Implementation PR #65:
- #1772 / `36275422930`: SUCCESS after QA-binding fix;
- #1773 / `36275461835`: SUCCESS after claim-state test generalization;
- final candidate #1777 / `36275688955`: coordination PASS, full suite PASS, build PASS.

Winning claim validation PR #66:
- winner head `c952eb64a8a7b44beea2e2dd090cd23f6e7a2586`;
- run #1774 / `36275620165`: coordination PASS, full suite PASS, build PASS.

Strict validator:
- isolated CI branch `ci/coord-v2-strict-validator`;
- run `36275716957`: projection PASS + strict Git SHA/lineage validator PASS.

Base → candidate compare:
- 23 commits ahead / 0 behind;
- changed files are confined to `coordination/**`, `scripts/coord-v2-*`, `scripts/lib/coord-v2-model.mjs`, and `tests/coord-v2-model.test.mjs`;
- no `src/**`, gameplay, runtime, asset, or production-release file changed.

## Known boundaries / not yet claimed

This does **not** declare V2 ready for broad adoption.

Still downstream from the frozen design:
- independent Germinator audit of this exact implementation;
- real disjoint-worker concurrency trial;
- worker checkpoint → disappearance → replacement on the same slot;
- branch-without-handoff downstream-lock trial;
- full real stale-BLOCK/new-approved replacement trial beyond the validator fixture;
- ASTRA post-implementation adversarial audit;
- Neureon closure of critical/important findings;
- future round boundary before adoption.

The proven claim primitive assumes a dedicated slot ref has already been seeded to a known V2 model commit. If the session cannot perform atomic/fast-forward remote updates, fallback remains explicit/manual assignment.

No main merge, R005 conversion, product publish, or production-root change is authorized by this handoff.

## Requested QA

Germinator should independently:
1. audit PR #65 from exact implementation candidate `b91f457032c90f4d3c7873951882367d38d55bc4`;
2. verify `CURRENT.json` is derived/checkable rather than a competing authority;
3. attack validator invariants with independent fixtures;
4. verify the race evidence and both sibling parent SHAs;
5. confirm the losing update genuinely fails without force;
6. confirm claim code contains no force/force-with-lease escape path;
7. verify R005/product/runtime surfaces are untouched;
8. BLOCK on any ambiguity before the larger multi-instance trial.

## Identity Learning Review

Receipt: **UPDATED**

Durable Gonza learnings added:
- invalidly bound QA/handoff evidence must be excluded from state derivation, not merely logged as an error;
- a dedicated seeded slot ref plus fast-forward-only updates is a reusable auditable single-winner claim primitive; force updates are prohibited for contention resolution.
