# Handoff — V07-R0

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-R0 — Schemas + diagnostics baseline  
From: Ricardo  
To: Ricardo V07-R1  
Branch: `round/r005-ricardo`  
Exact candidate SHA: `eee192c6254337b68c8c1251ce8ffc78b862e30e`  
Status: GREEN

## Delivered

- `CpuDifficulty = 'easy' | 'normal' | 'hard'`.
- Fighter presentation metadata now requires non-empty `portraitKey`; released V0.6 packages publish stable keys.
- Bounded committed-forward move schema:
  - `start`
  - `end`
  - `speed`
  - `kind: 'forward'`
  - `stopAtWall: true`
- `forwardBlast` Ultimate schema with bounded blast duration/range/vertical geometry and authored per-beat block/contact data.
- R0 runtime consumer compatibility only: `forwardBlast` is recognized as reserved by simulation, but Super Eructo runtime remains intentionally unimplemented until V07-R2.
- Deterministic malformed-schema coverage for portrait/movement/forwardBlast.
- Deterministic Lengua repeated-use approach baseline and CPU normal-policy trace corpus.

## Verification

Validation PR: #29 (draft only).  
Repository verification run: #995 / job 106200470735.

Results:
- coordination contract: 6/6 PASS;
- full suite: 280/280 PASS;
- build: PASS.

Deterministic baseline:
- Lengua six-attempt window produced 5 legal attempts / 5 blocks in 240 ticks;
- final separation 154.057;
- minimum separation 102.308;
- CPU baseline traces replay identically for Camaleoni, Supernariz and Juanchi at seeds 113/313, 180 ticks each.

## Known boundary

The first CI exposed two exhaustive `UltimateKind` consumers that still assumed exactly three kinds. R0 fixed only compile-safe recognition of the reserved fourth kind; it did not activate new runtime collision/damage semantics.

## Next

V07-R1 is automatically eligible. Apply the frozen Lengua candidate and Easy/Normal/Hard delayed CPU policy, preserving fairness and determinism.
