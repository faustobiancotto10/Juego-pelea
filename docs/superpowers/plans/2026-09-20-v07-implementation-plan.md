# V0.7 — R005 Implementation Plan

Date: 2026-09-20  
Target round: `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION`  
Execution: `AUTO_CHAIN`  
Canonical order: **Ricardo → Germinator → Mario + Brancaforte → Gonza**

## Goal

Ship a bounded V0.7 that directly answers post-release human feedback:
- Lengua is no longer a dominant spam loop;
- CPU has fair Easy/Normal/Hard difficulty;
- Juanchi locomotion is visually repaired;
- attack/effect presentation is raised across the roster;
- El Toro becomes fighter four;
- fighter-select cards use game-style procedural portraits/icons.

## Specs

- master audit: `../specs/2026-09-20-v07-post-v06-master-audit.md`
- Lengua: `../specs/2026-09-20-v07-lengua-balance-contract.md`
- CPU difficulty: `../specs/2026-09-20-v07-cpu-difficulty-contract.md`
- animation/effects: `../specs/2026-09-20-v07-animation-effects-quality-contract.md`
- El Toro: `../specs/2026-09-20-v07-el-toro-character-contract.md`
- product design: `../specs/2026-09-20-v07-content-design.md`

## Phase R0 — Ricardo: schemas + diagnostic baseline

Likely files:
- `src/game/types.ts`
- `src/game/data/characterContent.ts`
- `src/game/data/fighterKits.ts`
- `src/game/data/ultimates.ts`
- `src/game/simulation/moves.ts`
- test fixtures.

Required:
1. add typed `CpuDifficulty`;
2. add presentation `portraitKey`;
3. add bounded move movement schema for Topete;
4. add `forwardBlast` Ultimate schema fields/validation;
5. preserve existing V0.6 traces before tuning;
6. add explicit deterministic Lengua diagnostic scenarios and CPU difficulty test harness.

R0 does not yet release El Toro or tune presentation.

Handoff must freeze exact interfaces for downstream work.

## Phase R1 — Ricardo: Lengua + CPU difficulty

Implement:
- frozen Lengua candidate, calibrating only within allowed bounds;
- difficulty effective-policy layer;
- CPU anti-repetition based only on delayed observed history;
- App-facing difficulty input/API contract, not UI visuals.

Required evidence:
- Lengua approach probes;
- Easy/Normal/Hard deterministic traces;
- fairness test: current/unobserved cue cannot affect output before allowed delay;
- seeded corpus showing Hard better legal decision quality than Easy without stat cheats.

## Phase R2 — Ricardo: El Toro gameplay/core

Implement:
- `EL_TORO_CHARACTER_CONTENT`;
- normal/low/air/short route;
- Topete movement Special;
- Shawarmazo linear projectile;
- `forwardBlast` Super Eructo;
- Clash geometry/arbitration;
- CPU tactics;
- released roster registration.

Required evidence:
- move legality/resource/reset;
- Topete interrupt/block/whiff/wall;
- Shawarmazo one-hit/cooldown;
- Super Eructo geometry/block/damage/Clash;
- all El Toro matchups.

## Phase R3 — Ricardo: complete gameplay candidate

Run:
- all **16 ordered matchups** across representative seeds;
- both slots/walls where interaction-sensitive;
- all 4×4 Ultimate pairings;
- Lengua spam corpus;
- all three difficulty levels × all fighters;
- malformed content tests.

No arbitrary win-rate quota.

Output one exact gameplay/core candidate SHA.

## Phase G1 — Germinator: independent gameplay/core audit

Starts only after R3 green.

Attack:
- Lengua scenario validity;
- difficulty fairness/determinism;
- hidden/current input leakage;
- El Toro balance/lifecycles;
- Topete wall/interrupt;
- Shawarmazo duplicate contacts;
- forwardBlast/Clash order/ties;
- all 16 matchups;
- reset/rematch/resource cleanup;
- package validation.

Verdict only:
- `APPROVE — PRESENTATION LANE UNLOCKED`
- or `BLOCK` with exact reproduction.

## Phase M1 — Mario: Juanchi locomotion + shared effects architecture

Starts only after G1 approve.

Implement:
- render-only `LocomotionStyle`;
- Juanchi gait repair;
- bounded attack-presentation registry;
- current three fighters' ordinary/Special/Ultimate effect upgrade;
- genuine Juanchi red rage aura.

Do not tune gameplay.

## Phase M2 — Mario: El Toro rig/effects + four portraits

Implement:
- procedural El Toro articulated rig;
- Topete/Shawarmazo/Super Eructo effects;
- portrait/icon renderers for Camaleoni, Supernariz, Juanchi, El Toro;
- visual-key registrations.

Reference images under `docs/characters/el-toro/references/` are authoring-only.

Evidence:
- effects-off body readability;
- portrait recognition;
- phone-landscape screenshots/captures;
- no runtime raster references;
- render cadence/hitstop invariants.

## Phase B1 — Brancaforte: difficulty + portrait fighter cards

Runs in parallel with Mario after G1.

Implement:
- `CpuDifficulty` in flow state;
- Easy/Normal/Hard selector on CPU select;
- rematch persistence;
- VS/result difficulty display if useful;
- portrait-based fighter cards for roster four;
- preserve scalable 5/10 fixtures;
- safe-area/touch/keyboard accessibility.

Brancaforte consumes `portraitKey`; does not invent character raster art.

## Phase Z0 — Gonza: final integration

Starts only when:
- G1 approve;
- M2 green;
- B1 green.

Integrate exact accepted SHAs only.

Run:
- full suite;
- typecheck;
- build;
- standalone generation;
- source→standalone parity;
- integrated mobile flow smoke;
- all four fighters/difficulties/stages/rematch;
- runtime raster scan.

Any semantic conflict returns to owner; Gonza does not redesign.

## Phase Z1 — Gonza: release

Publish exact green Z0 candidate.

Verify served artifact:
- title/player/CPU select;
- four portrait cards;
- difficulty selector;
- El Toro;
- Lengua behavior sanity;
- Juanchi locomotion/aura;
- both stages;
- result/rematch;
- input interruption;
- Pages parity.

## AUTO_CHAIN

One R005 start token preauthorizes this dependency graph.

Normal green handoffs unlock downstream tasks automatically. No PRESENT/check-in or Neureon per-stage gate.

If a frozen contract is contradicted by evidence, the affected agent:
1. records the blocker;
2. stops affected dependents;
3. tells the user;
4. waits for user decision/audit rather than silently broadening scope.
