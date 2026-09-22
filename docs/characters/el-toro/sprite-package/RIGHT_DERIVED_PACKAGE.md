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
- `right-package-metrics.json`.

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
2. verified attachment anchors, at minimum a valid `head` anchor for cross-fighter attachment behavior such as Juanchi capture-cap placement;
3. Ricardo transition clock coverage for `crouch`, `block`, and `block-crouch` (current replacement SHA `79f8d81c...` still leaves those on ambient absolute combatTick);
4. integrated sprite/runtime validation and downstream Germinator audit;
5. physical-device/user acceptance.

Horizontal mirroring remains prohibited as the production substitute for LEFT-facing El Toro body art.
