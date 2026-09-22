# Task V07-SPR-MB — El Toro Sprite Package

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Owner: Mario-B  
Status: BLOCKED_EXTERNAL_INPUTS_RIGHT_PACKAGE_AND_ANCHOR_WORKFLOW_GREEN

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

- [x] Right-facing body set maps exactly to 84 contractual sprites.
- [ ] LEFT-facing body set maps exactly to the same 84 phases before production-complete status.
- [x] FX remain separate from body.
- [ ] Stable per-frame pivot and required attachment anchors exist.
- [ ] Action reads at gameplay scale with generic FX disabled.
- [x] Source sheets are not imported directly by runtime.
- [x] Identity Learning Receipt recorded.


## Active checkpoint — 2026-09-21

- right-facing package contract frozen/tested at `45de7965dd7b55278f8758d44151fc4afbd27f57`
- PR #52 targets Mario-A integration branch
- CI run `35666619713`: full suite + build PASS
- waiting dependency for atlas packing: Mario-A generated normalization manifest / exact-SHA handoff
- waiting integration interface freeze: Ricardo generic sprite runtime exact-SHA handoff
- production-complete remains blocked on authored LEFT-facing IMG-00 + IMG-01..12


## Mario-B verified checkpoint — 2026-09-21

- exact branch SHA: `a89c6587e1eff646939a46748410661c82a39081`
- PR: #52
- latest verification: run `35667105152` — full suite + build PASS
- derived package contract: 84 body frames + 22 FX; resolver-state/kit-role mapping frozen without invented move IDs
- Mario-A extraction finding: internal grid boundaries contain solid sprite pixels; current MA component-based extraction is therefore the required source of bboxes/transforms
- runtime conflict: Ricardo currently mirrors body art with `scaleX: fighter.facing`; El Toro is not mirror-safe, so authored-facing selection is required before integration
- remaining gates: MA exact-SHA normalization handoff, Ricardo facing-aware runtime handoff, authored LEFT-facing set, verified per-frame anchor coordinates


## Mario-B right-metadata handoff checkpoint — 2026-09-21/22

- exact Mario-B branch SHA: `f4a1b3f291fafabc364b4f52a8872014cb8664f6`
- PR: #52 -> `round/r005-sprite-mario-integration`
- final current-lane verification: run `35670898169` — coordination contract + full suite + build PASS
- exact Mario-A dependency SHA consumed by two-parent merge: `45cbf8ab88bc654fa7c64c91297496662ef1809c`
- right-facing contract complete in metadata:
  - exactly 84 body frames;
  - exactly 22 FX frames kept separate;
  - 26 resolver-reachable body animation keys compiled to admitted MA frame IDs;
  - frozen V0.7 move IDs and presentation-only move/Ultimate retiming recorded;
  - FX source/routing blueprint recorded with runtime effect routing explicitly deferred;
  - source sheets remain prohibited as runtime textures;
  - non-mirror-safe LEFT-facing requirement remains explicit.
- packer safety guards are GREEN and intentionally reject unsafe inputs:
  - 20 overlapping MA frame bbox pairs require pixel-isolated component outputs before atlas crop/pack;
  - IMG-00 currently constrains runtime body normalization: current `0.22988506` vs body-only `0.40114613180515757` (ratio `1.7449856541575932`).
- external blockers before body/FX atlas, runtime manifest, anchors and gameplay-scale preview:
  1. Mario-A revised exact-SHA handoff with pixel-isolated frame outputs and IMG-01..12-only runtime body scale;
  2. Ricardo revised exact-SHA runtime handoff with forward presentation-state-entry age for non-looping transition/reaction states;
  3. authored LEFT-facing IMG-00 + IMG-01..12;
  4. verified per-frame attachment-anchor coordinates from admitted/normalized art.
- Game Development Studio local `game-dev` CLI remains unavailable in this host; no CLI evidence is claimed.


## Mario-B derived-package checkpoint — 2026-09-22

- exact Mario-B candidate SHA: `a5dfaa6d35ec3f32eaac15f687c7a098ed10500d`
- PR: #52 -> `round/r005-sprite-mario-integration`
- verification: run `35674533122` / #1530 — coordination contract + full suite + build PASS
- revised Mario-A exact dependency consumed: `0eb4a2b985813d1cdc9f8c53d059a81efe49be20`
- right-facing derived package is now reproducibly generated from MA pixel-isolated RGBA:
  - 84-frame body PNG atlas;
  - 22-frame separate FX PNG atlas;
  - 26-key right-facing runtime fragment;
  - separate FX fragment;
  - 844x390 atlas-only gameplay-scale SVG evidence;
  - deterministic CLI + metrics receipt.
- reproducibility receipt from run `35674533122`:
  - body: 2048x1509, decoded RGBA 12,361,728 bytes, encoded PNG 3,203,017 bytes, SHA-256 `06d06bdfbc72b9ee07eae053d801f9f180b8776433e837839cbbfea1aa2826cc`;
  - FX: 1024x901, decoded RGBA 3,690,496 bytes, encoded PNG 916,922 bytes, SHA-256 `2fb2835545138560c7ddae960997161619ee142d98370b2b7f48fc42f1189002`;
  - combined decoded RGBA: 16,052,224 bytes.
- runtime fragment remains intentionally `runtimeLoadable:false` until all shipping gates exist.
- remaining blockers:
  1. authored LEFT-facing IMG-00 + IMG-01..12;
  2. verified per-frame attachment anchors;
  3. Ricardo narrow timeline amendment for `crouch`, `block`, `block-crouch` (current v2 timeline covers other one-shot transition states but these three still receive absolute ambient combatTick).
- action-readability evidence exists, but human/device visual acceptance is still downstream and is not self-declared green by Mario-B.


## Mario-B anchor-review checkpoint — 2026-09-22

- exact candidate SHA: `63ed61fc438a471541bbd99abba294cd7b2719fc`
- verification: run `35674688193` — coordination contract + full suite + build PASS
- stable per-frame ground pivots now exist for all 84 packed RIGHT body frames
- `right-anchor-review.json` is generated deterministically with all required anatomical anchor slots and packed-frame-local bounds
- `assertVerifiedElToroAnchorReview()` prevents an incomplete/unreviewed anchor file from being accepted as verified
- anatomical anchor coordinates remain intentionally unset pending visual verification; they were not fabricated
- task remains BLOCKED_EXTERNAL_INPUTS_RIGHT_PACKAGE_GREEN on:
  1. authored LEFT-facing body set;
  2. visually verified anatomical anchors;
  3. Ricardo crouch/block/block-crouch entry-timeline amendment.


## Mario-B final right-facing package checkpoint — 2026-09-22

- exact candidate SHA: `d65ac308747ce73bc39356d409de8f05daee32ce`
- PR: #52 -> `round/r005-sprite-mario-integration`
- verification: run `35674789789` / #1543 — coordination contract + full suite + build PASS
- revised MA exact dependency consumed: `0eb4a2b985813d1cdc9f8c53d059a81efe49be20`
- reproducible right-facing outputs:
  - 84-frame body PNG atlas;
  - 22-frame FX PNG atlas;
  - 26-key right-facing runtime fragment;
  - separate FX fragment;
  - 844x390 atlas-only gameplay-scale SVG preview;
  - deterministic metrics + CLI receipt;
  - 84-frame `right-anchor-review.json` template with derived pivots and all seven anatomical anchors explicitly unset;
  - strict anchor verifier rejects pending, incomplete, duplicate or out-of-bounds anchor reviews.
- right-facing package remains intentionally `runtimeLoadable:false`.
- external gates remaining before production-complete:
  1. authored LEFT-facing IMG-00 + IMG-01..12;
  2. visually verified per-frame anatomical anchors for all 84 body frames;
  3. Ricardo narrow presentation-timeline amendment for `crouch`, `block`, `block-crouch` (requested against current exact SHA `79f8d81c...`).
- no production-root cutover, registry activation or full-roster fanout is authorized from this lane.
