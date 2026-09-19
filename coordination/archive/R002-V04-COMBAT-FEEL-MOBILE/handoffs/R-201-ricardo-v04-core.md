# Handoff — R-201

Round: R002-V04-COMBAT-FEEL-MOBILE
From: Ricardo
To: Mario, Brancaforte, Germinator
Task: R-201
Commit SHA: 683d81f50afa9626785408ac7f868414ffe4061f

## Files changed

- src/game/types.ts
- src/game/simulation/CombatSimulation.ts
- src/game/simulation/CpuController.ts
- src/game/simulation/moves.ts
- tests/combat-v04.test.mjs

## Behavior / interface contract

- `FighterSnapshot.capturedBy: FighterIndex | null` is authoritative defender capture-lock state.
- `capturedBy !== null` means the defender is currently simulation-captured; `null` means no capture/trapped presentation or lock may be inferred.
- Existing `ultimatePhase`, `ultimateTarget`, `moveId/moveFrame`, SUPER state and combat events remain authoritative.
- Terminal round/match transitions clear transient capture/Ultimate/move/dash/block/stun state before entering result phases.
- Mobile/desktop consumers continue to emit only `ultimate=true`; simulation owns READY, spend, legality, capture and recovery.
- Supernariz CPU remains deterministic and snapshot-only, with authored post-commit gaps and imperfect conversion.
- Camaleoni close-game tuning is frozen at this SHA for Stage 2 presentation work.

## Verification evidence

- RED checkpoint `b60a0a325d6aabf6e45ffaefd520363d560e0b30`, Repository verification run #255: five intended V0.4 failures reproduced stale match-over recovery, absent capture snapshot truth, immediate CPU restart, 100% conversion and insufficient close tuning.
- GREEN frozen checkpoint `683d81f50afa9626785408ac7f868414ffe4061f`, Repository verification run #260: coordination contract PASS, full test suite PASS, build PASS.
- Targeted V0.4 coverage includes successful capture/release, both final-round Ultimate cleanup paths, whiff cleanup, interrupted startup, next-round cleanup, CPU pressure gaps/conversion imperfection, Camaleoni tradeoff assertions and deterministic replay.
- Exact tuning delta and root-cause analysis are recorded in `coordination/forum/active/r002-core-gameplay.md` message 003.

## Known risks

- Renderer-side transient arrays/effects still belong to Mario Stage 2; simulation now provides the authoritative cleanup state but does not edit renderer-owned effects.
- Dedicated mobile Ultimate button/input wiring remains Brancaforte Stage 2.
- Final matchup feel requires Germinator Stage 3 adversarial validation; passing R-201 tests does not by itself certify balance.

## Unresolved questions

- Whether Mario needs any additional presentation-only phase granularity after consuming `capturedBy`; request it from Ricardo rather than inferring combat truth.
- Whether Germinator finds CPU pressure or Camaleoni close-game dominance issues requiring a follow-up tuning SHA.

## Requested next action

Neureon should open STAGE_2_PRESENTATION_INPUT. Mario and Brancaforte should build against exactly `683d81f50afa9626785408ac7f868414ffe4061f`. Germinator should use the same SHA later as the R-201 baseline for Stage 3.

## Participation

This handoff does not end Ricardo's participation. Ricardo remains available for shared-contract fixes, QA findings and integration regressions until Neureon posts `ROUND_COMPLETE`.
