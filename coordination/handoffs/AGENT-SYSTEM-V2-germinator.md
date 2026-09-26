# Handoff — Agent Orchestration V2 / Germinator independent QA

Program: Agent Orchestration V2  
Live product round: R005 remains ACTIVE and untouched  
From: Germinator  
To: Gonza repair → Germinator fresh audit → Neureon  
Audited implementation PR: #65  
Audited exact PR head: `d6804e5a05adb4263a741115352320d7b722fbf9`  
Implementation candidate named by Gonza: `b91f457032c90f4d3c7873951882367d38d55bc4`  
Accepted Phase-0 base: `4a47962e563b8e444ab6cf6a288db66c13dda743`  
Validation PR: #67  
Adversarial QA head: `3d39d1ef74433f3124fd78f3a8905d76740df842`

## Verdict

**BLOCK — V2 foundation is not yet safe for the larger multi-instance trial.**

This BLOCK does not reject the per-slot fast-forward race primitive and does not affect R005 product state.

## What is green

### Exact-head baseline

PR #65 exact head:
`d6804e5a05adb4263a741115352320d7b722fbf9`

Repository verification #1778 / `36275773674`:
- coordination contract: 12/12 PASS;
- full suite: 292/292 PASS;
- build: PASS.

The Gonza implementation candidate `b91f4570...` is one commit behind the PR head. GitHub compare proves the only later delta is:
- `coordination/handoffs/AGENT-SYSTEM-V2-gonza.md`.

Therefore Germinator audited the full PR delivery head while preserving the candidate/handoff distinction.

### Product/runtime isolation

Base → PR head:
- 24 commits ahead / 0 behind;
- changed files are confined to `coordination/**`, `scripts/coord-v2-*`, `scripts/lib/coord-v2-model.mjs`, and V2 tests;
- no `src/**`, gameplay, runtime, sprite asset, or production-release path changed.

R005 product gates remain untouched.

### Per-slot fast-forward race primitive

Gonza's recorded race is structurally valid:
- seed: `097b591ab7f5d75636cd490b6ba3c2fcd7f67e8e`;
- winner: `c952eb64a8a7b44beea2e2dd090cd23f6e7a2586`;
- loser: `42436e536c7ecc81b2da3e760d4477fe0dfb62a0`;
- both winner and loser are exactly one commit ahead of the same seed;
- winner/loser compare is diverged 1 ahead / 1 behind with merge base = seed;
- live dedicated claim ref points to the winner.

Germinator independently reproduced the primitive on an isolated QA ref:
- QA seed/head: `d6804e5a...`;
- claimant A: `2cd53707151ecaa6df8bc4bc26e371c9d0c948fd`;
- claimant B: `b69d1601acbb61ee771e62b5251888808967401c`;
- first `force:false` ref update: SUCCESS;
- second sibling `force:false` ref update: rejected by GitHub HTTP 422, `Update is not a fast forward`.

Ruling:
**single-winner fast-forward behavior for one dedicated slot ref is independently proven.**

The claim client contains no `--force` or `force-with-lease` path.

## BLOCKER 1 — task input SHAs are not validated at claim time

Frozen V2 design requires, before generic auto-claim becomes operational:

> dependencies and base/input SHAs must be revalidated at claim time.

Current task schema contains:
`inputShas`

but `validateLoadedModel()` never validates or even inspects task `inputShas`.

The claim client calls:
`validateLoadedModel(model)`

before claiming, so malformed or unavailable `inputShas` are silently ignored.

### Independent reproduction

Germinator fixture:
- clone the exact V2 model;
- set task `inputShas = ['not-a-git-sha']`;
- add an otherwise-valid claim;
- run `validateLoadedModel(model)`.

Actual:
- validator errors = `[]`;
- malformed input SHA does not block claim eligibility.

Validation PR #67 / run #1779 `36276819371`:
- coordination contract: 12/12 PASS;
- full suite: **293/294 PASS, 1 FAIL**;
- failing adversarial test:
  `V2 claim eligibility rejects malformed inputShas instead of ignoring them`;
- failure evidence:
  `claim-time validation ignored malformed inputShas: []`;
- build skipped after the intentional QA failure.

This is a frozen-contract failure, not a harness-only failure.

### Required repair

At minimum:
1. validate `inputShas` shape and existence;
2. define and enforce the required lineage relation for each input SHA;
3. run that validation in the claim-time path, not only in an optional offline validator;
4. add RED→GREEN coverage proving a claim cannot proceed with malformed, missing, or wrong-lineage required inputs.

## BLOCKER 2 — no global current projection across dedicated claim refs

The current model stores a claim on the slot's dedicated Git ref.

That provides per-slot CAS, but `loadV2Model()` only reads:
`coordination/v2/claims/*.json`
from the **current checkout**.

It does not enumerate/fetch all slot claim refs and aggregate their canonical claim records.

### Concrete current mismatch

At PR #65 head `d6804e5a...`:
- task = `READY`;
- slot = `READY`;
- `instanceId = null`;
- both instances = `UNASSIGNED`.

At the live authoritative claim ref head `c952eb64...`:
- task = `CLAIMED`;
- slot = `CLAIMED`;
- active instance = `gonza-v2-a`;
- loser remains `UNASSIGNED`.

Both projections individually match their local checkout, but there is no single global derived view that represents all live claim refs.

### Why this blocks the larger multi-instance trial

With two or more simultaneously claimed slots on different dedicated refs:
- one checkout can see claim S1 but not claim S2;
- another can see claim S2 but not claim S1;
- cross-slot `ownedPaths` overlap detection cannot see both active claims;
- duplicate-instance-across-slots detection cannot see both active claims;
- BOOT / `CURRENT.json` can advertise a slot as READY even while its remote claim ref is already CLAIMED.

The current claim client safely loses a same-slot race because Git itself rejects the second non-fast-forward push. That does **not** solve global multi-slot invariants.

### Required repair / clarification

Before the larger multi-instance trial, V2 needs one mechanically checkable way to reconstruct all active claims together.

Examples of acceptable direction:
- a canonical aggregate claim ref/state commit updated atomically; or
- deterministic remote-ref aggregation that fetches every declared slot claim ref before projection/validation; or
- another Neureon-approved model that provides equivalent single-source visibility.

Do not solve this by making `CURRENT.json` an independently editable authority.

The global projection must remain derived/checkable from canonical claims.

## Other audit results

PASS:
- ROLE / TASK / SLOT / INSTANCE remain structurally distinct;
- task/slot/instance files do not store mutable current state;
- invalid QA candidate binding is excluded from state derivation;
- current V2 design remains isolated from live R005;
- no main merge/product publish/root cutover is authorized;
- strict validator evidence exists and is green for the current single-claim checkout.

NOT YET PROVEN, consistent with Gonza's own boundaries:
- real disjoint-worker concurrency with global invariant checking;
- checkpoint → disappearance → replacement;
- branch-without-handoff downstream lock;
- full real stale BLOCK → approved replacement trial;
- ASTRA post-implementation audit.

## Downstream ruling

Do **not** start the larger multi-instance trial from exact PR #65 head `d6804e5a...`.

Repair owner:
**Gonza / V2 tooling implementation**

Required loop:
**Gonza repairs claim-time SHA validation + global active-claim projection → Germinator fresh audit of one replacement exact head → only then proceed to larger V2 trial.**

R005 product flow remains independent and unchanged.

## Identity Learning Review

Receipt: **PROPOSAL**

Reusable Germinator lesson proposed for later consolidation:

> In ref-distributed coordination systems, proving atomic ownership per ref is not enough. QA must verify that every global invariant is evaluated over a projection containing all simultaneously active claims; otherwise cross-slot overlap and duplicate-worker conflicts can be invisible even when each individual ref validates green.
