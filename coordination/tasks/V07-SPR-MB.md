# Task V07-SPR-MB — El Toro Sprite Package

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Owner: Mario-B  
Status: READY_WITH_LEFT_FACING_BLOCKER

## Execution branch

- branch: `round/r005-sprite-mario-b-package`
- exact starting SHA: `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`
- lane ownership: El Toro derived package / manifest / fighter-specific presentation assets
- integration target: `round/r005-sprite-mario-integration` after exact-SHA handoff to Mario-A.

## Goal

Build the production-intended El Toro sprite package from Mario-A's admitted/normalized source, including body/FX atlases, animation metadata, stable pivots/anchors and gameplay-scale previews.

## Dependencies

- Mario-A exact-SHA admitted source/normalization handoff.
- LEFT-FACING body set from the user/GPT Images before this lane can become production-complete.
- Ricardo's sprite manifest/runtime interfaces when they become available.

## Allowed files / subsystem

- El Toro sprite package/manifest/assets;
- Mario-owned renderer presentation metadata;
- fighter-specific sprite tests/previews.

## Prohibited scope

- no gameplay timing/damage/hitbox authority;
- no horizontal mirroring of readable shirt text as the final left-facing solution;
- no full-roster migration.

## Acceptance criteria

- [ ] Right-facing body set maps exactly to 84 contractual sprites.
- [ ] LEFT-facing body set maps exactly to the same 84 phases before production-complete status.
- [ ] FX remain separate from body.
- [ ] Stable per-frame pivot and required attachment anchors exist.
- [ ] Action reads at gameplay scale with generic FX disabled.
- [ ] Source sheets are not imported directly by runtime.
- [ ] Identity Learning Receipt recorded.


## Active checkpoint — 2026-09-21

- right-facing package contract frozen/tested at `45de7965dd7b55278f8758d44151fc4afbd27f57`
- PR #52 targets Mario-A integration branch
- CI run `35666619713`: full suite + build PASS
- waiting dependency for atlas packing: Mario-A generated normalization manifest / exact-SHA handoff
- waiting integration interface freeze: Ricardo generic sprite runtime exact-SHA handoff
- production-complete remains blocked on authored LEFT-facing IMG-00 + IMG-01..12
