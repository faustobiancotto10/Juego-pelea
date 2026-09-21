# Task V07-SPR-MB — El Toro Sprite Package

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Owner: Mario-B  
Status: READY_WITH_LEFT_FACING_BLOCKER

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
