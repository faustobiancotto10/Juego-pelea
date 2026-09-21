# V0.7 planning handoff — Neureon substitute audit

Date: 2026-09-20  
Status: CONSUMED BY R005 / HISTORICAL PLANNING HANDOFF

## Context

The repository contained an Astra master prompt for a post-V0.6 audit, but the external run did not persist its required outputs before credits ended.

At direct user instruction, Neureon performed the bounded source/design audit using that prompt as the initial brief and completed the implementation-ready package.

No V0.7 product code was implemented by this audit.

## Audited base

Official V0.6 runtime on `main`; R004 already archived and released.

Key shipped facts inspected:
- Lengua V0.6 exact data;
- delayed deterministic CpuController policy;
- generic travel-driven LocomotionPose;
- Juanchi procedural rig;
- current CombatEffects helpers;
- three-package released composition;
- linear/returning projectiles;
- capture-only Ultimate kind set;
- scalable V0.6 fighter-select flow using letter marks rather than portraits.

## New authoritative inputs

El Toro repository references are now persisted:
- `docs/characters/el-toro/references/identity-master-reference.webp`
- `docs/characters/el-toro/references/action-sheet-reference.webp`

They are authoring-only.

## Documents produced

- `docs/superpowers/specs/2026-09-20-v07-post-v06-master-audit.md`
- `docs/superpowers/specs/2026-09-20-v07-lengua-balance-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-cpu-difficulty-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-animation-effects-quality-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-el-toro-character-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-content-design.md`
- `docs/superpowers/plans/2026-09-20-v07-implementation-plan.md`

## Product decisions

- V0.7 scope is bounded to user-reported quality problems + El Toro + portrait fighter cards.
- CPU levels: Easy / Normal / Hard; Normal default; no cheating/stat boosts.
- Lengua uses a bounded tuning/redesign candidate, no default cooldown.
- Juanchi gait stays travel-driven but gains per-rig locomotion style.
- attack presentation gets a small render-only profile registry.
- El Toro is heavy bruiser/line breaker.
- Topete uses one bounded committed-movement move primitive.
- Shawarmazo reuses linear projectile.
- Super Eructo introduces one typed `forwardBlast` Ultimate kind.
- no new stage in V0.7.
- fighter cards use procedural game-style portraits/icons, never uploaded photos.

## Recommended first implementation task

`V07-R0` — Ricardo freezes schemas/interfaces and diagnostic baselines.

Canonical execution remains:
**Ricardo → Germinator → Mario + Brancaforte → Gonza**.

## Open user decisions

None required to start implementation.

Numeric tuning has narrow evidence-based calibration bounds documented where appropriate. Any need to leave those bounds becomes a blocker/user decision.

## Activation

R005 has now been formed from this package. Current execution authority is `coordination/CURRENT_ROUND.md` and `coordination/tasks/V07-*.md`.
