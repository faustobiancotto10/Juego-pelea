# El Toro — Right-Facing Derived Sprite Package Receipt

Status: **RIGHT-FACING PACKAGE GREEN / PILOT ONLY**  
Owner: Mario-B / V07-SPR-MB  
Source handoff consumed: Mario-A `0eb4a2b985813d1cdc9f8c53d059a81efe49be20`

## Reproduction

From the repository root:

```bash
node scripts/el-toro-sprite-atlas-packer.mjs \
  --source-dir docs/characters/el-toro/sprite-source/right \
  --package-contract docs/characters/el-toro/sprite-package/right-package.json \
  --out-dir <output-directory>
```

The command emits:
- `right-body.png`;
- `right-effects.png`;
- `right-runtime-fragment.json`;
- `right-effects-fragment.json`;
- `right-gameplay-preview.svg`;
- `right-package-metrics.json`;
- `right-anchor-review.json` — 84-frame verification template with real packed pivots and null anatomical anchors;
- `right-anchor-review.svg` — atlas-only 84-frame visual review sheet with normalization pivots marked.

Source/reference sheets are not runtime assets.

## Verified body atlas

- contractual frames: 84;
- dimensions: 2048 × 1509;
- encoded PNG bytes: 3,203,017;
- decoded RGBA bytes: 12,361,728;
- SHA-256: `06d06bdfbc72b9ee07eae053d801f9f180b8776433e837839cbbfea1aa2826cc`.

## Verified FX atlas

- contractual frames: 22;
- dimensions: 1024 × 901;
- encoded PNG bytes: 916,922;
- decoded RGBA bytes: 3,690,496;
- SHA-256: `2fb2835545138560c7ddae960997161619ee142d98370b2b7f48fc42f1189002`.

Combined decoded atlas footprint: **16,052,224 bytes** (~15.31 MiB).

The asset lifecycle remains fight-scoped under Ricardo's runtime contract; source sheets are never loaded as fighter textures.

## Runtime metadata coverage

The right-facing fragment contains all 26 resolver-reachable El Toro animation keys:
- neutral/locomotion/reaction states;
- `move:toroJab`;
- `move:toroShoulder`;
- `move:toroLow`;
- `move:toroAir`;
- `move:topete`;
- `move:shawarmazoThrow`;
- `ultimate:superEructo:startup`;
- `ultimate:superEructo:capture`;
- `ultimate:superEructo:recovery`.

All frame rectangles come from Mario-A's pixel-isolated component ownership API. The runtime body scale uses IMG-01..12 only; IMG-00 is a separate review/reference domain.

## Gameplay-scale evidence

`right-gameplay-preview.svg` uses only `right-body.png` and shows:
- idle;
- walk;
- Jab active;
- Topete peak;
- Shawarmazo release;
- Super Eructo.

Viewport is 844 × 390, with sprite scale derived from the FightRenderer phone-landscape ratio `390/720`.

This is deterministic preview evidence, not user/device artistic acceptance.

## Current gates

The right-facing fragment deliberately reports `runtimeLoadable: false`.

Remaining gates:
1. authored LEFT-facing IMG-00 + IMG-01..12 with identical animation-key coverage;
2. verified attachment anchors. The packer now emits `right-anchor-review.json` plus `right-anchor-review.svg`; all seven anatomical anchors remain intentionally null until visual verification, while packed pivots are already authoritative;
3. Ricardo transition clock coverage for `crouch`, `block`, and `block-crouch` (current replacement SHA `79f8d81c...` still leaves those on ambient absolute combatTick);
4. integrated sprite/runtime validation and downstream Germinator audit;
5. physical-device/user acceptance.

Horizontal mirroring remains prohibited as the production substitute for LEFT-facing El Toro body art.

## Anchor verification workflow

The generated anchor review is deliberately gated:

- `right-anchor-review.json` contains all 84 packed body frames;
- each frame carries its real atlas rectangle and normalization ground pivot;
- required anatomical keys are present but set to `null`;
- `verified:false` is the default;
- `assertVerifiedElToroAnchorReview()` rejects pending, missing, non-finite or out-of-bounds anchor data;
- `right-anchor-review.svg` renders all 84 frames directly from `right-body.png`, marks only the already-authoritative pivot, and does **not** synthesize anatomical anchor coordinates.

This converts anchor work into a bounded visual-review task without fabricating head/hand/foot positions from alpha geometry.

## Applying a verified anchor review

After visual review marks all 84 frames `verified:true` and supplies the seven required in-bounds coordinates, regenerate with:

```bash
node scripts/el-toro-sprite-atlas-packer.mjs \
  --source-dir docs/characters/el-toro/sprite-source/right \
  --package-contract docs/characters/el-toro/sprite-package/right-package.json \
  --verified-anchor-review <verified-right-anchor-review.json> \
  --out-dir <output-directory>
```

Before baking anchors, the packer validates:
- review identity/facing/version and `verified` status;
- all 84 required frame IDs;
- all seven finite in-bounds anatomical anchors per frame;
- exact atlas rectangle equality against the newly generated atlas;
- exact normalization-pivot compatibility.

A stale review from a different pack/layout is rejected. When the review is valid, every resolver alias that reuses a packed frame receives the same reviewed anchor map and the `verified-attachment-anchors` blocking gate is removed. LEFT-facing and runtime-contract gates remain independent.
