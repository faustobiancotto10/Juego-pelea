# Task R-201 — CPU, Camaleoni melee and stale-state fix

Round: R002-V04-COMBAT-FEEL-MOBILE
Owner: Ricardo
Status: REVIEWING
Branch: round/r002-ricardo

## Goal
Fix the V0.4 gameplay-side issues before renderer/input consumers harden.

## Required work
- reproduce and diagnose the lingering trapped/captured-state bug;
- fix simulation/state cleanup if the source is gameplay-side;
- reduce Supernariz CPU oppressive/over-optimal pressure while preserving its aggressive identity;
- improve Camaleoni close-combat viability without making it strictly dominant;
- retune Coletazo gameplay only as needed for credible close-range reset utility;
- expose only the minimum stable snapshot/event changes Mario/Brancaforte need;
- preserve deterministic fixed 60 Hz combat.

## Owned files/subsystems
- src/game/simulation/
- src/game/data/fighters.ts
- src/game/types.ts when coordinated
- gameplay/balance tests
- CPU logic

## Prohibited scope
- DOM/touch layout
- procedural visual polish
- release/publishing

## Acceptance criteria
- [x] trapped-state repro exists and root cause is stated
- [x] no stale simulation lock/phase/target survives legal cleanup transitions
- [x] Supernariz CPU has measurable punish/reaction gaps and no raw-input/future-state cheating
- [x] CPU no longer repeatedly converts every optimal pressure opportunity
- [x] Camaleoni normals/chain have practical close contest and whiff-punish value
- [x] Coletazo is a credible pressure-reset tool
- [x] Camaleoni does not become strict close-range winner across measured tradeoffs
- [x] V0.3 rules regress cleanly
- [x] exact tuning delta + consumer contract + frozen SHA are published

## Required evidence
- targeted V0.4 gameplay tests;
- CPU scenario evidence;
- stale-state cleanup regression;
- deterministic replay/regression;
- full test/build on the checkpoint or CI equivalent;
- handoff to Mario/Brancaforte/Germinator.


## Frozen Stage 1 checkpoint

- SHA: `683d81f50afa9626785408ac7f868414ffe4061f`
- RED evidence: `b60a0a325d6aabf6e45ffaefd520363d560e0b30`, CI run #255, 5 intended V0.4 failures
- GREEN evidence: CI run #260, coordination contract + full suite + build PASS
- contract/tuning: `coordination/forum/active/r002-core-gameplay.md`
- handoff: `coordination/handoffs/R-201-ricardo-v04-core.md`
- next action: Neureon opens Stage 2; Ricardo remains available for downstream contract fixes
