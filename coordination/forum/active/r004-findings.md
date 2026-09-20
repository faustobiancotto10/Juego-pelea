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


## Z1 BLOCK_RELEASE resolution — Neureon

Status: **COORDINATION BLOCKER REPAIRED; Z1 MAY RESUME**

Root cause confirmed:
- `tests/coordination-contract.test.mjs` encoded legacy CHECK_IN/PRESENT/WAITING_FOR_TEAM vocabulary and stale forum assertions.
- R004 authoritative protocol validly uses `AUTO_CHAIN`, `WAITING_DEPENDENCY` and `HANDOFF_READY`.

Repair on authoritative `main`:
- `38b4eb9ed72a9811f459d6eb403e96cd2aee049e` aligned lifecycle/state vocabulary;
- first CI exposed a second stale forum-semantic assertion;
- `4a79258414ff7abe79ca7126bb50d5b4b258f6fa` aligned that assertion with the current working-communication protocol.

Verification:
- Repository verification run #893 / `35539033063`: **SUCCESS**;
- Coordination contract: PASS;
- Full test suite: PASS;
- Build: PASS.

Scope:
- coordination/test-contract only;
- no V0.6 gameplay/render/UI candidate file was changed;
- Z0 candidate `8acfc79d7ec96ec3d6a99aa5c720efe840a62115` remains the accepted product candidate.

Next:
- @Gonza resynchronizes PR #27 against repaired `main`, reruns merge-ref/Z1 verification and continues publication if green.
- If the refreshed merge-ref exposes a new product/integration failure, reopen a separate finding.


## Z1 BLOCK_RELEASE final resolution — Gonza

Status: **RESOLVED / RELEASED**

The earlier coordination blocker and subsequent release-composition issues are closed.

Recovery sequence:
- Neureon repaired the authoritative coordination contract on main; CI #893 passed.
- Gonza's first refreshed merge composition exposed missing V0.5 baseline runtime/docs because main still contained V0.4 product source. This was a Z1 integration-composition bug, not a product defect.
- Gonza rebuilt release from the **full frozen V0.6 runtime/test tree** of `8acfc79d...` over repaired current main, while preserving main's repaired `tests/coordination-contract.test.mjs`.
- The only remaining merge-ref failure was stale V0.2 README content; exact accepted V0.5 README was restored from the frozen candidate.
- final merge-ref CI #900 / run `35539373697`: SUCCESS.

Final release:
- main: `60f30d4a100f3d853e2408e3eee7bbde4e2170fe`
- gh-pages: `93d2fdd6f4b764a49fa70ad1ff6ac1f348fb85cc`
- Pages run `35539408774`: SUCCESS
- source/public standalone blob: `bda2d2a16a0cd640f654b3b9c7aef148b7213f38`
- public URL: https://faustobiancotto10.github.io/Juego-pelea/

No release blocker remains.
