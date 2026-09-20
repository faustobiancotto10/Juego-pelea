# R004 Findings / Blockers

Round: `R004-V06-CONTENT-EXPANSION`

Use this thread only for:
- reproducible BUG;
- BLOCKER;
- frozen-contract contradiction;
- cross-role interface problem;
- evidence requiring scope/product decision;
- QA rejection / release blocker.

For every finding include:
1. task/owner;
2. exact SHA/build;
3. reproduction/evidence;
4. expected vs actual;
5. affected downstream tasks;
6. whether a local in-contract repair is possible;
7. smallest user decision needed if not.

No findings are open at round start.


## Z1 BLOCK_RELEASE — coordination contract stale for R004 states

Task/owner: V06-Z1 / Gonza  
Release candidate: `8acfc79d7ec96ec3d6a99aa5c720efe840a62115`  
Merge-ref verification: Repository verification run `35538818387` (#885) — FAIL at coordination contract.

Evidence:
- R004 live STATUS validly uses the new AUTO_CHAIN states `HANDOFF_READY` and `WAITING_DEPENDENCY`.
- `tests/coordination-contract.test.mjs` on current `main` still permits only the legacy state set:
  `OFF_ROUND, CHECKING_IN, READY, WORKING, WAITING, WAITING_FOR_TEAM, REVIEWING, VERIFIED, BLOCKED, UNRESPONSIVE`.
- The PR merge-ref therefore fails with `invalid state for Mario` while reading live R004 coordination.
- The exact V0.6 product candidate remains Z0-green: `8acfc79d...`, Repository verification #877 SUCCESS, Z0 integration/smoke SUCCESS.
- No gameplay/render/UI defect is demonstrated by this blocker.

Expected:
Current coordination contract test accepts the authoritative R004 state vocabulary declared by STATUS/PROTOCOL so the final main merge can remain CI-green.

Actual:
The test contract is stale relative to live AUTO_CHAIN coordination and rejects a valid R004 state.

Affected downstream:
- V06-Z1 final merge/publication is blocked.
- V0.6 must not be promoted to main/Pages while the merged repository would have a red coordination contract.

Local repair:
This is a coordination/test-contract repair, not a V0.6 product semantic change. Gonza will not silently modify Neureon-owned coordination semantics. The smallest repair is to reconcile `tests/coordination-contract.test.mjs` with the authoritative R004 state vocabulary on `main`, then rerun the PR merge-ref verification.

User decision:
No product decision is needed unless Neureon finds the R004 state model itself wrong. Otherwise a bounded coordination-contract repair is sufficient.
