# Handoff — V06-R3

Round: R004-V06-CONTENT-EXPANSION  
Task: V06-R3 — Combat feel follow-through: Lengua, jump prep, CPU  
From: Ricardo  
To: Germinator V06-G1  
Branch: `round/r004-ricardo`  
Exact gameplay/core candidate SHA: `d815694a76a7a92c004203f1ae9fd14e2035744c`  
Parent R2 SHA: `0bf6a5675ed9c1cbbbafbdd40a83ebde85ec86bd`  
Status: GREEN

## Delivered

### Lengua
Camaleoni `tongueStraight` now uses the bounded V0.6 candidate:
- totalFrames: 46
- active: 12–14 unchanged
- offsetX: 34 unchanged
- width: 340 unchanged
- damage: 80 unchanged
- chip: 4 unchanged
- guardDamage: 14 unchanged
- knockback: 4.8

No Coletazo values were changed.

### Two-tick grounded jump preparation
Public state:
- `FighterSnapshot.jumpStartupFrames`
- `FighterSnapshot.airborneTicks`

Events:
- `jump-start`
- `takeoff`

Semantics:
- accepted J0 publishes `jumpStartupFrames=2`, grounded, vx/vy 0;
- J1 decrements to1 and remains grounded;
- J2 decrements to0, applies cached takeoff direction, jump velocity and one physics integration;
- opposite steering during prep does not rewrite cached takeoff direction;
- clean hit/guard break/capture/reset cancels preparation;
- fighter cannot guard/attack/dash/Ultimate during preparation;
- landing recovery remains four ticks outside Clash;
- Clash landing does not stack ordinary landing recovery.

Existing V0.5 air-carry/facing tests were migrated to the authored two-tick semantics and remain green.

### CPU tactics
All three released fighters now publish explicit `CpuTactics`.
- perception delay remains 12 combat ticks;
- decision cadence remains 8 combat ticks;
- seeded miss/commitment behavior remains;
- CPU returns neutral while its own jump preparation is active;
- pressure archetype continues advancing through preferred range rather than stalling;
- control/pressure behavior remains data-driven through profile/tactics, not fighter-ID branches;
- Juanchi returning-projectile tactics from R2 are preserved.

### Ultimate timing re-evaluation
No Ultimate startup/capture timing was accelerated in R3.

A deterministic test starts the defender jump after 12 advancing ticks of Ultimate tell at mid-range and verifies no capture for:
- Camaleoni dashCapture;
- Supernariz suctionCapture;
- Juanchi capCapture.

Therefore the frozen two-tick jump preparation still leaves reproducible delayed-response counterplay under current Ultimate timings.

## Verification

Validation PR: #21, draft only.  
Repository verification run: `35535721604` (#814), job `106144276136`.

Results:
- coordination contract: 6/6 PASS;
- full suite: 241/241 PASS;
- build: PASS.

New R3 evidence:
- exact J0/J1/J2 semantics;
- prep interruption/no guard/no action;
- Lengua 46 / 4.8 contract;
- Coletazo unchanged;
- tactics present for all three;
- CPU neutral during own prep;
- 12-tick delayed jump response evades all three Ultimate kinds;
- ordered 3×3 CPU corpus across seeds 113/197/313/997.

## Ordered 3×3 CPU corpus

36/36 matches reached match-over.
- all contain real clean interaction;
- zero illegal ranged attempts recorded;
- all three fighters emit attack/Special/Ultimate actions across the corpus;
- combatTick range observed: 1865–5470;
- no fixed-slot same-kit winner survived the existing seed-swap symmetry suite.

Selected mirror evidence:
- existing G1 same-kit symmetry corpus passes for Camaleoni and Supernariz after tactics migration;
- mixed slot/mirror regressions remain green.

## Non-blocking observation for independent G1

Camaleoni-vs-Camaleoni in the sampled same-kit corpus is strongly Special-heavy:
- 49–68 Special-source hits in the existing seed-swap corpus;
- normal-source hits can be zero.

This does not create infinite rounds, illegal actions, slot bias or availability violations, and all sampled matches complete. However it is a plausible repeated-action/play-feel risk. Germinator should explicitly test whether repeated Lengua remains meaningfully avoidable/advanceable rather than treating completion or win rate as sufficient proof.

No silent balance correction was made beyond the frozen Lengua candidate.

## Files relevant to R3

- `src/game/types.ts`
- `src/game/data/characters/camaleoni.ts`
- `src/game/data/characters/supernariz.ts`
- `src/game/data/characters/juanchi.ts`
- `src/game/simulation/CombatSimulation.ts`
- `src/game/simulation/CpuController.ts`
- `tests/combat-v06-followthrough.test.mjs`
- migrated jump/Lengua expectations in existing regression tests

## Next action

V06-G1 is eligible immediately under AUTO_CHAIN. Germinator must independently audit exact SHA `d815694a76a7a92c004203f1ae9fd14e2035744c` and return either:
- `APPROVE — PRESENTATION LANE UNLOCKED`; or
- `BLOCK` with exact reproduction/evidence.
