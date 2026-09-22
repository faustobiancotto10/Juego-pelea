# El Toro LEFT — Mario-A normalization handoff

Status: **GREEN SOURCE HANDOFF / ANCHORS STILL DOWNSTREAM**

This document supersedes the pending-intake state for the authored LEFT body set. The earlier `INTAKE_PENDING_2026-09-22.md` is retained as audit history.

## Admitted LEFT source

Repository binary intake commit:

`1f74072d8280f88b0f52d24d77495471d68033d0`

Path:

`docs/characters/el-toro/sprite-source/left/`

Admitted coverage:
- 1 LEFT master seed;
- exactly 84 LEFT body sprites across IMG-01..IMG-12;
- 13 source sheets total;
- no LEFT FX duplicate set; the existing text-free FX package remains a separate Mario-B/runtime concern.

The immutable receipt is:

`docs/characters/el-toro/sprite-source/left/LEFT_SOURCE_HASHES.json`

It records repository-byte SHA-256, decoded-RGBA SHA-256, dimensions, grid counts and hard-edge results for every admitted sheet.

## Lossless transport verification

The binary transfer path re-encoded some PNG containers. Mario-A therefore verified the **decoded RGBA bytes** against the local canonical inputs, in addition to recording the resulting repository-byte hashes.

Final binary-import verification run:

- GitHub Actions: `35683282959`;
- all 13 decoded RGBA hashes: PASS;
- all 13 required grid/frame counts: PASS;
- transparency: PASS;
- hard outer-canvas clipping: 0 on all 13;
- binary commit + push: PASS.

No artistic source was silently regenerated during transport.

## Pixel-preserving source repairs

Three mechanical source-layout repairs were required before admission. They change spacing/canvas only, not authored sprite pixels.

### LEFT-IMG-01 — Idle

Original authored art touched the bottom canvas edge.

Repair:
- appended 16 fully transparent rows below the original canvas;
- no original RGBA pixel moved, resampled or recolored;
- final dimensions: 1536×1040;
- hard outer-edge pixels: 0.

### LEFT-IMG-11 — Shawarmazo

Two authored bottom-row frames touched at the shoes and were detected as one connected component.

Repair:
- inserted transparent horizontal separation between those touching frames;
- no sprite pixel redrawn, resampled or recolored;
- final dimensions: 1560×1024;
- extractor coverage: 8/8;
- hard outer-edge pixels: 0.

### LEFT-IMG-12 — Super Eructo

Several authored frames touched at shoe boundaries and collapsed into connected components.

Repair:
- inserted transparent horizontal gutters at the touching boundaries;
- no sprite pixel redrawn, resampled or recolored;
- final dimensions: 1584×1024;
- extractor coverage: 10/10;
- hard outer-edge pixels: 0.

The production contract marks 1536×1024 as recommended rather than mandatory. Preserving authored pixels and clean extractability takes precedence over destructive resampling back to that recommendation.

## Facing-aware Mario-A source API

The source pipeline now accepts an explicit facing while preserving RIGHT as the default:

```bash
node scripts/el-toro-sprite-source-pipeline.mjs \
  --facing left \
  --source-dir docs/characters/el-toro/sprite-source/left \
  --out-dir <output-directory>
```

Expected LEFT output:
- accepted sheets: 13;
- master frames: 1;
- runtime body frames: 84;
- FX frames: 0;
- total normalized entries: 85;
- manifest facing: `left`;
- shipping status: `pilot-only-anchor-blocked`.

For actual atlas pixels, downstream code must use:

```js
generatePixelIsolatedFrameSet({
  sourceDir: 'docs/characters/el-toro/sprite-source/left',
  facing: 'left',
})
```

Expected:
- 85 component-owned RGBA crops;
- isolation version `component-owned-rgba-v1`;
- 1 master + 84 body;
- zero fabricated FX/body frames.

RIGHT callers remain backward-compatible when `facing` is omitted.

## TDD / verification receipt

LEFT RED:
- run `35683410357`;
- 0/2 LEFT tests passed;
- both failed because the old pipeline still searched the RIGHT filenames.

LEFT GREEN:
- run `35683651600`;
- 2/2 LEFT source tests PASS.

Full repository verification after the facing-aware implementation:
- run `35683651339`;
- coordination contract PASS;
- full test suite PASS;
- build PASS.

A final clean-branch verification is performed after removal of the temporary TDD workflow; the canonical exact SHA/run are recorded in the main Mario-A handoff and coordination thread.

## Runtime boundary

These multi-frame PNGs remain **AUTHORING INPUT ONLY**. Runtime must consume Mario-B's derived bilateral atlas/manifest package, never these source sheets directly.

## Remaining gate — anatomical anchors

The LEFT source-art blocker is removed.

Mario-A does **not** invent anatomical anchors from alpha bounds, component centroids, bboxes or pivots. RIGHT and LEFT anatomical attachment coordinates still require explicit visual authoring/verification in the package lane before El Toro becomes `runtimeLoadable:true`.

NEXT: Mario-B consumes this exact Mario-A descendant and builds/verifies the bilateral derived package and visual anchors. Mario-A then performs the designated integration step.
