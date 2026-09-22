# V07-SPR-MA — Mario-A Sprite Source / Normalization Handoff

Task: `V07-SPR-MA`  
Round: `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION`  
Sender: Mario-A / Character & Rendering Engineer  
Recipients: Mario-B / `V07-SPR-MB`, Ricardo / `V07-SPR-R1`, then Mario-A / sprite integrator  
Branch: `round/r005-sprite-mario-a-source-import`  
Base: `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`  
Exact handoff SHA: `c1b3e8e757b707f2975f6587217cc2f851e2ca6b`  
PR: #50  
Result: **GREEN / HANDOFF_READY**

## Files changed

- `docs/characters/el-toro/sprite-source/right/NORMALIZATION_HANDOFF.md`
- `scripts/sprite-source-config.mjs`
- `scripts/sprite-png-alpha.mjs`
- `scripts/sprite-component-extractor.mjs`
- `scripts/sprite-normalize-contract.mjs`
- `scripts/sprite-preview-svg.mjs`
- `scripts/el-toro-sprite-source-pipeline.mjs`
- `tests/el-toro-sprite-source-pipeline.test.mjs`
- `tests/el-toro-sprite-pixel-isolation.test.mjs`

The 17 admitted source PNGs are unchanged from the frozen source-bearing base and are independently revalidated by the pipeline before normalization.

## Source validation result

At the exact handoff SHA:

- accepted source sheets: 17;
- master seed: 1;
- body frames: 84;
- FX frames: 22;
- normalized review entries: 107 total;
- recorded SHA-256 mismatches: 0;
- rejected alternate `13F1BB3E-C57C-4649-B9E7-07664E5E8BE8.PNG`: absent;
- empty expected frames: 0;
- unsupported admitted PNGs: 0;
- hard outer-canvas clipping: 0.

## Extraction finding and contract

A naive equal-grid crop is not valid for these authored sheets. Many visible components cross the nominal grid dividers; cutting strictly at the divider clips legitimate body/FX pixels.

Mario-A therefore froze deterministic extraction as:

1. decode admitted 8-bit RGBA PNGs;
2. alpha >= 32 is extractable content;
3. find 8-connected alpha components;
4. assign each complete component to the nearest nominal contract slot by centroid;
5. preserve the complete component bbox even when it crosses the nominal slot;
6. treat alpha > 128 on the OUTER source-sheet edge as hard clipping;
7. reject missing/empty slots or hard outer-edge clipping.

Low-alpha edge residue is not silently treated as a clipped sprite.

## Normalization contract

Body/master review normalization:

- canvas: 320x320;
- one shared scale for the complete set;
- anchor: bottom-center;
- stable ground pivot: `x=160, y=300`.

FX review normalization:

- canvas: 320x320;
- one shared FX scale;
- anchor: center;
- pivot: `x=160, y=160`.

Per-frame output includes the nominal source slot, extracted bbox, component-extraction metadata, normalized dimensions/position and pivot.

## Exact manifest / preview access for Mario-B

The generated manifest/contact sheet and the in-memory pixel-isolation API are deterministic outputs of this exact handoff SHA. Downstream lanes must not reimplement Mario-A extraction logic.

After checking out/cherry-picking exact SHA `0eb4a2b985813d1cdc9f8c53d059a81efe49be20`, run:

```bash
node scripts/el-toro-sprite-source-pipeline.mjs \
  --source-dir docs/characters/el-toro/sprite-source/right \
  --out-dir <output-directory>
```

This writes:

- `NORMALIZATION_MANIFEST.json` — 107 source-derived entries with bboxes + normalized transforms;
- `NORMALIZED_PREVIEW.svg` — 107-entry normalized contact sheet.

The repository tests invoke `generateSpriteSourceEvidence()` for manifest/preview
evidence and `generatePixelIsolatedFrameSet()` for actual isolated RGBA crops.
This is the exact Mario-A-owned interface Mario-B should consume; do not duplicate
the extractor in the package lane.

## Runtime boundary

The admitted multi-frame PNG sheets remain AUTHORING INPUT ONLY.

Runtime consumes a derived sprite package/atlas plus manifest metadata. No source/reference sheet is wired directly into runtime by this lane.

Ricardo's generic runtime contract remains a separate lane. Mario-A does not own combat, balance or runtime authority.

## LEFT-facing source state

El Toro remains **not mirror-safe**, but the authored LEFT source-art blocker is now removed.

At exact handoff SHA `c1b3e8e757b707f2975f6587217cc2f851e2ca6b`:
- authored LEFT IMG-00 + IMG-01..12 are present in GitHub;
- LEFT coverage is 1 master + exactly 84 body frames;
- all 13 sheets pass transparency, expected-slot extraction and hard outer-edge validation;
- the facing-aware source pipeline emits 85 LEFT normalized entries and 85 component-owned RGBA crops;
- RIGHT remains the backward-compatible default.

Horizontal mirroring is still prohibited for El Toro shipping art.

The remaining visual package gate is explicit anatomical-anchor authoring/verification for RIGHT and LEFT. Those coordinates are intentionally not inferred from alpha geometry, bboxes, centroids or pivots.

## Verification evidence

Final repository verification on exact SHA `0eb4a2b985813d1cdc9f8c53d059a81efe49be20`:

- GitHub Actions run: `35671720767` / #1487;
- coordination contract: PASS;
- full test suite: PASS;
- build: PASS.

Repair TDD receipt:
- RED run `35671546984` / #1483 failed on both intended defects: missing pixel-isolation API and IMG-00 still classified as body;
- first GREEN implementation run `35671658790` / #1486 passed full suite + build;
- final documented SHA run `35671720767` / #1487 passed full suite + build.

TDD history:

- RED: run `35666251412` failed exactly because the new pipeline implementation was absent;
- debugging then found nominal grid boundaries intersecting real sprite components;
- GREEN after component-preserving extraction: run `35667026833`;
- final cleaned handoff: run `35667742014` GREEN.

## Tool receipts

- TOOL_USED: Game Studio `sprite-pipeline`.
- TOOL_USED: Superpowers `executing-plans`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`.
- TOOL_UNAVAILABLE: Game Development Studio local `game-dev` CLI is not exposed by this host. No CLI evidence is claimed.

## Identity Learning Review

Receipt: **PROPOSAL**

Reusable Mario lesson proposed for consolidation by the designated Mario-A integrator after the same-role squad converges:

> Treat authored sprite-sheet grids as sequencing hints, not guaranteed safe crop boundaries. Preserve explicit pixel ownership when component bboxes overlap so atlas packing never relies on raw bbox crops. Keep master/reference seeds outside runtime animation normalization domains unless the contract explicitly says they share scale; otherwise a reference image can silently shrink the complete runtime set.

This is a proposal, not an immediate `mario.md` edit, because this is a same-role squad lane.

## Known risks / unresolved questions

- Authored LEFT-facing body art is admitted; visually verified bilateral anatomical anchors still block a production-loadable El Toro package.
- Human visual acceptance at gameplay/phone scale remains downstream; numeric extraction gates do not prove artistic likeness.
- Mario-B must consume this exact SHA (or an integrated exact descendant), not a moving branch head.
- Ricardo's facing-aware non-mirror-safe runtime amendment must be green before final pilot integration.

## Downstream eligibility

`V07-SPR-MA` is HANDOFF_READY.

Mario-B may now consume the exact RIGHT + LEFT normalization/pixel-isolation interface without reimplementing extraction. Mario-A's integration role waits for Mario-B's bilateral package/anchor handoff, then composes it with the already-accepted Ricardo runtime. Germinator remains ineligible until that genuinely loadable bilateral integrated candidate exists.


## Revision 2 — Mario-B blocker resolution

This handoff supersedes the earlier MA product SHA
`45cbf8ab88bc654fa7c64c91297496662ef1809c`.

Mario-B diagnostics were correct:
- 20 overlapping bboxes made bbox-only source copying unsafe;
- IMG-00 constrained the old body scale (`0.22988506`) while IMG-01..12
  independently required approximately `0.40114613`.

Both issues are resolved at exact SHA
`0eb4a2b985813d1cdc9f8c53d059a81efe49be20`.

Downstream consumption rule:
- use `generatePixelIsolatedFrameSet()` for atlas pixels;
- use manifest bboxes/transforms as metadata, not as ownership masks;
- use `normalization.body` for IMG-01..12 runtime frames;
- use `normalization.master` only for IMG-00 review/reference presentation.


## Revision 3 — Authored LEFT source admitted

This revision supersedes the LEFT-source blocker recorded in Revision 2.

Exact Mario-A handoff SHA:
`c1b3e8e757b707f2975f6587217cc2f851e2ca6b`

### Binary admission

- binary staging commit: `1f74072d8280f88b0f52d24d77495471d68033d0`;
- source path: `docs/characters/el-toro/sprite-source/left/`;
- immutable receipt: `LEFT_SOURCE_HASHES.json`;
- 13 LEFT sheets;
- 1 master + 84 body sprites;
- decoded-RGBA transport verification + repository byte hashes recorded;
- transparency: PASS;
- expected slot coverage: PASS;
- hard outer-canvas clipping: 0.

Binary import verification:
- run `35683282959` — SUCCESS.

### Mechanical source-layout repairs

The admitted LEFT source preserves authored pixels while fixing extractability:
- IMG-01: +16 transparent bottom rows; original pixels unchanged;
- IMG-11: transparent horizontal separation between touching frames; final 1560×1024;
- IMG-12: transparent gutters between touching frames; final 1584×1024.

No character pixel was redrawn, resampled or recolored by these repairs.

### Facing-aware pipeline

New supported call:

```bash
node scripts/el-toro-sprite-source-pipeline.mjs \
  --facing left \
  --source-dir docs/characters/el-toro/sprite-source/left \
  --out-dir <output-directory>
```

Pixel API:

```js
generatePixelIsolatedFrameSet({
  sourceDir: 'docs/characters/el-toro/sprite-source/left',
  facing: 'left',
})
```

LEFT output contract:
- 13 accepted sheets;
- 85 normalized entries;
- 85 component-owned RGBA crops;
- 1 master + 84 body + 0 duplicate FX;
- manifest `facing: "left"`;
- `shippingStatus: "pilot-only-anchor-blocked"`.

### TDD / final verification

RED:
- run `35683410357`;
- 0/2 LEFT tests, both failing because the pre-change pipeline searched RIGHT filenames.

GREEN:
- run `35683651600`;
- 2/2 targeted LEFT tests PASS.

Full implementation verification:
- run `35683651339`;
- coordination PASS;
- full suite PASS;
- build PASS.

Final clean-branch verification after documentation and removal of the temporary TDD workflow:
- run `35683738506`;
- coordination PASS;
- full suite PASS;
- build PASS.

### Next owner

Mario-A source/normalization work is **HANDOFF_READY**.

NEXT -> Mario-B:
consume exact Mario-A SHA `c1b3e8e757b707f2975f6587217cc2f851e2ca6b`, generate the bilateral LEFT-derived body package alongside the existing RIGHT package, complete the explicit visual anatomical-anchor review, and publish one exact-SHA bilateral package handoff. Do not mark `runtimeLoadable:true` until that anchor gate is green.

Mario-A then resumes only as the designated integrator.
