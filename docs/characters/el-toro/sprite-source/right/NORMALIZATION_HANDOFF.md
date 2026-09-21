# El Toro Sprite Source Normalization Handoff

Task: `V07-SPR-MA`  
Owner: Mario-A  
Source-facing set: RIGHT  
Original frozen source base: `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`

## Accepted source set

The admitted package is exactly:

- `IMG-00` master seed: 1 source image.
- `IMG-01..12`: 84 body animation frames by the production contract.
- `FX-01..04`: 22 effect frames by the production contract.
- Normalized review total: 107 frames including the master seed.

All 17 admitted PNGs are pinned by SHA-256 in
`scripts/sprite-source-config.mjs`. The rejected alternate
`13F1BB3E-C57C-4649-B9E7-07664E5E8BE8.PNG` is not part of the package.

## Extraction finding

A naive equal-cell crop is not safe for these source sheets.

Independent alpha inspection found that many visible sprite components cross the
nominal 1x4, 2x3, 2x4 or 2x5 grid boundaries. The outer canvas edges, by
contrast, contain only low-alpha residue on the admitted sheets; no admitted
sheet has hard outer-edge content at the pipeline clipping threshold.

The production extractor therefore uses this contract:

1. decode 8-bit RGBA PNG deterministically;
2. consider alpha >= 32 as extractable content;
3. find 8-connected alpha components;
4. assign each complete component to the nearest nominal grid slot by centroid;
5. preserve the component's full bounding box even when it crosses the nominal
   slot boundary;
6. treat alpha > 128 on the OUTER source-sheet edge as hard clipping;
7. reject missing/empty expected slots or hard outer-edge clipping.

This avoids cutting limbs, effects or silhouettes that legitimately cross a
nominal grid divider while still detecting real source-canvas clipping.

Implementation:

- `scripts/sprite-source-config.mjs`
- `scripts/sprite-png-alpha.mjs`
- `scripts/sprite-component-extractor.mjs`
- `scripts/sprite-normalize-contract.mjs`
- `scripts/sprite-preview-svg.mjs`
- `scripts/el-toro-sprite-source-pipeline.mjs`
- `tests/el-toro-sprite-source-pipeline.test.mjs`

## Normalization contract

Body/master frames:

- normalized review canvas: 320x320;
- one shared scale for the whole body/master set;
- stable bottom-center anchor;
- ground pivot: `x=160, y=300`.

FX frames:

- normalized review canvas: 320x320;
- one shared FX scale;
- center anchor;
- FX pivot: `x=160, y=160`.

The pipeline never rescales individual body frames independently. The shared
scale and stable pivot are part of the handoff contract.

## Generate manifest and normalized preview

From repository root:

```bash
node scripts/el-toro-sprite-source-pipeline.mjs \
  --source-dir docs/characters/el-toro/sprite-source/right \
  --out-dir <output-directory>
```

Outputs:

- `NORMALIZATION_MANIFEST.json`
- `NORMALIZED_PREVIEW.svg`

The manifest contains, per frame:

- source sheet and nominal slot;
- extracted component bounding box;
- extraction method and whether content crossed the nominal slot;
- normalized scale, dimensions and pivot placement.

## Runtime boundary

The admitted PNG sheets are AUTHORING INPUT ONLY.

Runtime must consume a derived frame/atlas package plus manifest metadata. It
must not load these multi-frame source sheets directly as fighter textures.
Mario-B owns the derived package/atlas lane; Ricardo owns the runtime backend
lane. Those downstream lanes must consume a pinned Mario-A commit SHA, not the
moving branch name.

## LEFT-facing production gate

This RIGHT-facing package is pilot material, not a production-ready bilateral
fighter package. El Toro contains readable/directional artwork, including
`TE VOY A CHOCAR`; horizontal mirroring is forbidden for shipping art.

Production cutover remains blocked until the authored LEFT package required by
`docs/characters/el-toro/LEFT_FACING_SET_PROMPT.md` is accepted.

## Tool receipts

- TOOL_USED: Game Studio `sprite-pipeline` — strip validation, shared-scale
  normalization, pivot stability and preview workflow applied.
- TOOL_USED: Superpowers `executing-plans`, `test-driven-development`,
  `systematic-debugging`, and `verification-before-completion`.
- TOOL_UNAVAILABLE: Game Development Studio local `game-dev` CLI is not
  exposed by this chat host. No CLI result is claimed or fabricated.

## Verification

The source-pipeline regression test verifies all 17 hashes, exact frame counts,
rejected-alternate absence, non-empty extraction, hard outer-edge clipping,
shared body/FX normalization, manifest shape and all 107 preview entries.

A fresh repository-verification run must be green on the final handoff SHA
before this lane is marked complete.
