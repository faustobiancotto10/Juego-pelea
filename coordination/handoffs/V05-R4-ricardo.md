# Handoff — V05-R4

Round: R003-V05-COMBAT-LOOP
From: Ricardo
To: Neureon, Germinator, Mario, Brancaforte
Task: V05-R4
Commit SHA: `45bf35e9d0215188b973bb650873f99ea0c00407`
Branch: `round/r003-ricardo`
CI: Repository verification run #495 — 149/149 tests PASS, build PASS.

## Delivered

### Air commitment
- takeoff horizontal velocity is preserved through an air normal;
- air attack activation integrates x/y on the activation advancing step;
- active air normals ignore opposite steering and retain authored launch carry;
- ordinary move facing is frozen for the move timeline;
- airborne facing remains takeoff-facing through crossover;
- grounded actionable neutral reorients after landing;
- landing emits authoritative `land` once, clears carry and sets four advancing frames of `landingRecoveryFrames`;
- buffered action waits through landing recovery;
- correct-height guard remains legal on a non-attacking landing;
- airborne hit trajectories remain airborne and use gravity/horizontal stun movement.

### Ultimate exit
- startup tells: Camaleoni 22 advancing frames, Supernariz 24;
- successful recovery: 16 advancing frames;
- committed whiff recovery stays 24 / 28;
- successful release is deferred until after both fighter updates, preventing slot-order launch/stun asymmetry;
- release clears capture and publishes `ultimate-release`;
- defender release state: >=30 hitstun, |vx| 14 away, vy 5, airborne;
- simulation-owned release separation and wall overflow transfer preserve side/bounds;
- both Ultimates still deal 190 total and award no Ultimate SUPER refund;
- defender mash cannot damage the successful attacker before attacker actionability;
- final authored Ultimate impact uses 10 hitstop where configured;
- simultaneous same-kit capture remains deterministic.

## Consumer contract

Readonly state/events for presentation/input/QA:
- `landingRecoveryFrames`
- `ultimatePhaseFrame`
- `ultimateConnected`
- `land` event
- `ultimate-release` event
- existing `capturedBy`, velocity, stun, grounded, facing and hit `source/finisher`.

Renderer must use authoritative release movement; it must not fake launch or capture persistence.

## Acceptance evidence

- R4 RED checkpoint reproduced seven intended failures in air carry/facing/landing and Ultimate exit.
- Final R4 suite: 149/149 PASS + build PASS.
- successful Ultimates verified both fighter IDs, both attacker slots, center and wall scenarios;
- at attacker first actionable frame, distance >=200 and defender cannot mash-punish;
- mirrored release compares equal magnitude, mirrored direction and equal stun/launch state;
- whiff remains disconnected and punishable;
- takeoff-facing and landing recovery regressions intentionally replaced older instant-reorientation behavior.

## Follow-up

R5 owns CPU delayed perception/commitment only. No R5 CPU policy change is part of this SHA.

Ricardo proceeds to V05-R5 under the existing Stage 2 sequential authorization.
