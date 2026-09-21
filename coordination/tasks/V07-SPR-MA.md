# Task V07-SPR-MA — El Toro Sprite Source Lead

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Owner: Mario-A  
Status: READY

## Goal

Import the accepted El Toro right-facing source bytes from the user's `SPRITES TORO.zip`, rename them to contract IDs, validate extraction/alpha/layout, and establish the normalized sprite-source package that Mario-B and Ricardo can consume.

## Dependencies

- User-provided `SPRITES TORO.zip` must be attached to this Mario instance.
- Read `docs/SPRITE_PRODUCTION_CONTRACT.md`.
- Read `docs/characters/el-toro/SPRITE_INTAKE_2026-09-21.md`.
- Read `docs/characters/el-toro/LEFT_FACING_SET_PROMPT.md`.

## Allowed files / subsystem

- `docs/characters/el-toro/sprite-source/**`
- `scripts/**sprite**` when needed for deterministic extraction/validation tooling
- sprite-pipeline documentation/tests directly needed by this lane

## Prohibited scope

- no combat/balance changes;
- no runtime renderer cutover;
- do not admit the rejected `13F1BB3E-...` sheet;
- do not silently mirror text-bearing art to manufacture a left-facing shipping set.

## Required work

1. Verify accepted source SHA-256 values against the intake audit.
2. Commit accepted right-facing source sheets using canonical names.
3. Exclude the rejected alternate.
4. Validate alpha, grid count, edge clipping and automatic frame extraction.
5. Produce normalized frame previews using one shared scale and stable ground pivot.
6. Define the exact authoring/runtime manifest handoff contract for Mario-B/Ricardo.
7. Record `TOOL_USED` or `TOOL_UNAVAILABLE` for Game Studio / Game Development Studio truthfully.
8. Complete Identity Learning Review.

## Acceptance criteria

- [ ] Exactly the accepted right-facing Master + IMG-01..12 + FX-01..04 are committed.
- [ ] SHA-256 values match the audit before any derived normalization.
- [ ] Rejected alternate is absent from admitted source paths.
- [ ] Normalized preview exposes no clipped body/FX frames.
- [ ] No source/reference sheet is wired directly into runtime.
- [ ] Exact-SHA handoff to Mario-B and Ricardo.
- [ ] Identity Learning Receipt recorded.
