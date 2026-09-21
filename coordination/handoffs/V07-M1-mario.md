# Handoff — V07-M1

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-M1 — Juanchi locomotion + shared effects quality  
From: Mario  
To: Mario V07-M2  
Branch: `round/r005-mario`  
Base gameplay/core SHA: `94ee24898855f55787e8e077c64f259e2d7a4972`  
Exact candidate SHA: `d55cce8ce7f03a60168697a5a5bbe1c8b5833a24`  
Status: GREEN

## Files changed

- `src/game/render/LocomotionPose.ts`
- `src/game/render/AttackPresentation.ts`
- `src/game/render/CombatEffects.ts`
- `src/game/render/FightRenderer.ts`
- `src/game/render/JuanchiRig.ts`
- `tests/v07-m1-render.test.mjs`

No simulation/gameplay/data balance files changed.

## Behavior / interface contract

- render-only `LocomotionStyle` registry preserves travel-driven gait clocks and gives Juanchi the frozen V0.7 54 / 0.80 / 0.62 / 6 / 1.3 / 0.035 / -0.055 locomotion style;
- gait phase drives bounded hip/chest counter-motion and free-arm swing while the ball arm stays constrained;
- start/stop presentation derives from movement-blend change rather than wall time;
- `AttackPresentationProfile` is a bounded render registry with diagnostic missing-profile behavior and no gameplay authority;
- ordinary/Special/Ultimate accents for Camaleoni, Supernariz and Juanchi consume authoritative move/event/projectile state;
- Rugby Boomerang has outbound/return/catch presentation;
- Fricción sparks originate between hands and culminate at release;
- Police Cap Rage owns a procedural crimson aura outside/behind the body silhouette, with an authored build/rush/finisher-collapse envelope;
- renderer never owns collision, damage, hit legality, stun or move legality.

## Verification evidence

TDD RED:
- run #1067: 299 baseline tests passed; all 4 new M1 contract tests failed before implementation.
- run #1078: aura-lifecycle regression test failed specifically because the required lifecycle helper did not yet exist.

Final verification:
- GitHub Actions repository verification run #1079 / job 106211304278;
- coordination contract: PASS;
- full suite: **305/305 PASS**;
- build/typecheck: PASS;
- static scope scan: zero runtime raster references in changed render files;
- `AttackPresentation.ts`: zero gameplay-authority terms from the guarded set (damage/hitbox/hitstun/blockstun/captureReach/collision);
- diff from gameplay base touches only `src/game/render/*` plus M1 tests.

Concurrency incident:
- run #1074 caught a same-branch duplicate `drawJuanchiRageAura` implementation caused by overlapping Mario instances;
- reconciled before this candidate; run #1079 is the fresh post-reconciliation evidence;
- incident recorded in `coordination/forum/active/r005-findings.md`.

## Known risks / deferred evidence

- Human phone-landscape visual capture is intentionally grouped under Phase M2 evidence in the approved implementation plan. M2 must visually confirm Juanchi gait/aura together with El Toro/portrait surfaces before its green handoff.
- Shared effects remain intentionally bounded and procedural; no generic animation graph was introduced.

## Unresolved questions

None within frozen M1 scope.

## Downstream eligibility

This exact green SHA satisfies V07-M1 and automatically unlocks V07-M2 under AUTO_CHAIN.
