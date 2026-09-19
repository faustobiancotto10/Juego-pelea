# Task M-202 — Coletazo and Ultimate presentation

Round: R002-V04-COMBAT-FEEL-MOBILE
Owner: Mario
Status: HANDOFF_READY
Branch: round/r002-mario

## Dependency

Stage 2 is OPEN. Branch starts from frozen Ricardo consumer SHA `683d81f50afa9626785408ac7f868414ffe4061f`.
Post PRESENT before implementation. Consume that exact gameplay contract; request any new authoritative state through the forum.

## Goal
Make Coletazo and both Ultimates materially more elaborate and readable while keeping combat truth in simulation.

## Required work
- authored procedural Coletazo wind-up, tail acceleration, contact beat, follow-through and recovery;
- richer Camaleoni Ultimate disappearance/dash/capture/combo/reappearance/finisher presentation;
- richer Supernariz inhale/suction/capture/nazazo/launch presentation;
- remove any renderer-owned residual trapped/capture effect;
- request missing authoritative phase/event hooks from Ricardo instead of guessing.

## Owned files
- src/game/render/
- render contract/tests

## Prohibited scope
- hit validity/damage/capture legality;
- modifying simulation outcomes;
- runtime sprite/reference-image loading;
- HUD/touch layout.

## Acceptance criteria
- [ ] Coletazo reads as a distinct authored move on small landscape screens
- [ ] both Ultimates have clear startup/capture/success/end beats
- [ ] no stale capture/suction/invisibility/trapped visual survives state end
- [ ] effects remain bounded for mobile
- [ ] renderer remains read-only consumer of simulation truth
- [ ] no forbidden image loading
- [ ] clean handoff SHA + build/test/smoke evidence
