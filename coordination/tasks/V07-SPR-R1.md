# Task V07-SPR-R1 — Generic Sprite Runtime Backend

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Owner: Ricardo  
Status: HANDOFF_READY

## Execution branch

- branch: `round/r005-sprite-ricardo-runtime`
- exact starting SHA: `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`
- lane ownership: generic sprite schema/resolver/cache/renderer runtime foundation
- integration target: one exact-SHA handoff for Mario integration and Germinator.

## Goal

Implement the generic, presentation-only sprite runtime foundation from `docs/superpowers/plans/2026-09-21-sprite-runtime-migration-plan.md` through the El Toro pilot integration boundary, without changing deterministic combat truth.

## Dependencies

- approved sprite architecture/spec and migration plan already on main;
- Mario-A manifest/source interface may be consumed when published;
- does not depend on final LEFT-facing art to build/test the generic backend.

## Allowed files / subsystem

- sprite manifest/schema/validation;
- AnimationResolver and deterministic frame sampling;
- sprite asset loading/cache lifecycle;
- temporary dual body renderer;
- backend-neutral attachment anchors/prop extraction;
- tests and build asset copy required by those components.

## Prohibited scope

- no gameplay/balance changes;
- no new generic `fighter.state`;
- no wall-clock animation authority;
- no production removal of procedural rigs in this pilot;
- no production-root publish.

## Acceptance criteria

- [x] Snapshot/event-driven animation resolution only.
- [x] Integer/tick deterministic frame sampling.
- [x] Fight-scoped selected-fighter loading only.
- [x] Missing/malformed package diagnostics are visible and tested.
- [x] Sprite body rendering cannot decide hit/damage/stun/legality.
- [x] Existing test suite/typecheck/build green.
- [x] Exact-SHA handoff to Mario integrator and Germinator.
- [x] Identity Learning Receipt recorded.

## Completion receipt

- final exact candidate: `79f8d81c2db75eebc595a93668e7332a9f429373`
- supersedes: `d07cba1231fbb571dfe5d344487251f88dec797c`
- TDD RED: run `35673297473` / job `106574354315` — coordination PASS; full suite 306 PASS / 2 expected regression FAIL
- final GREEN: run `35673440101` / job `106574802177` — coordination 10/10 PASS; 308/308 full-suite PASS; build PASS
- handoff: `coordination/handoffs/V07-SPR-R1-ricardo.md`
- authored-facing contract: explicit `mirrorSafe`; non-mirror-safe packages require matching `leftAnimations`
- transition-clock repair: presentation-only per-slot state-entry age from authoritative `combatTick`; renewed reactions restart; hitstop freezes
- full lane audit vs frozen start: 25 commits ahead / 0 behind; no `src/game/simulation/**` changes
- Identity Learning Review: UPDATED
