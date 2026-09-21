# Handoff — V07-R3

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-R3 — Complete four-fighter gameplay candidate  
From: Ricardo  
To: Germinator V07-G1  
Branch: `round/r005-ricardo`  
Exact candidate SHA: `94ee24898855f55787e8e077c64f259e2d7a4972`  
Status: GREEN

## Candidate scope

This SHA is the complete R005 gameplay/core candidate after R0→R3:
- V0.7 Lengua anti-spam balance;
- Easy/Normal/Hard CPU effective-policy layer with delayed-history fairness;
- released fighter four El Toro;
- Topete committed movement;
- Shawarmazo linear projectile;
- Super Eructo forwardBlast;
- forwardBlast participation in Universal Ultimate Clash;
- released four-fighter package/registry schemas and presentation metadata.

## R3 verification

Validation PR: #29 (draft only).  
Repository verification run: #1030 / job 106202940705.

Results:
- coordination contract: 6/6 PASS;
- full suite: 299/299 PASS;
- build: PASS.

### Integrated 4×4 corpus

All 16 ordered matchups were run at Normal CPU across seeds:
- 113
- 197
- 313
- 997

All 64 matches:
- reached `match-over`;
- produced a non-null winner;
- contained clean interaction;
- traversed real round reset(s);
- emitted legal offensive actions from both sides;
- recorded zero illegal ranged attempts for both slots.

No win-rate quota is asserted or implied.

### Difficulty matrix

Every released fighter:
- Camaleoni
- Supernariz
- Juanchi
- El Toro

replayed deterministically on:
- Easy
- Normal
- Hard

for fixed fighter/seed inputs.

R1 evidence remains part of this candidate:
- delayed legal cue responses: Easy 33 / Hard 56;
- legal confirm conversions: Easy 34 / Hard 55;
- repeated delayed long-range adaptation: Easy 0 / Hard 27;
- no current/hidden cue influence before 18/12/8-tick Easy/Normal/Hard observation delay.

### Ultimate matrix

All 4×4 ordered Ultimate pairings were aligned and tested in both slot geometries.

Every pairing:
- produced exactly one Universal Ultimate Clash;
- produced zero same-tick damage on accepted Clash;
- cleared capture state;
- spent both meters symmetrically;
- entered shared 30-frame Clash recovery.

### Cleanup

R3 verifies:
- round reset clears linear projectiles;
- projectile cooldown/ranged availability reset correctly;
- transient move/Ultimate/capture/guard-break/jump-startup state does not leak;
- fresh rematch construction starts all 16 ordered matchups with clean match-scoped resources/state.

## Earlier targeted evidence still binding

R1:
- repeated Lengua block+advance corpus reaches <=150 separation in 38–63 advancing ticks across both slots/center/wall-side starts;
- no cooldown added.

R2:
- Topete drive/contact/block/recovery/wall/interrupt tests PASS;
- Shawarmazo single-contact + 96 cooldown PASS;
- Super Eructo forward-only/blockable/45+45+90 PASS;
- El Toro CPU deterministic on all difficulties PASS.

## Requested next action

Germinator must independently attack this exact SHA. Do not substitute a later Ricardo SHA without a new handoff.

Verdict only:
- `APPROVE — PRESENTATION LANE UNLOCKED`
- or `BLOCK` with exact reproduction/evidence.
