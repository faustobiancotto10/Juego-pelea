# V07-SPR-MA — Mario-A Sprite Source / Normalization Handoff

Task: `V07-SPR-MA`  
Round: `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION`  
Sender: Mario-A / Character & Rendering Engineer  
Recipients: Mario-B / `V07-SPR-MB`, Ricardo / `V07-SPR-R1`, then Mario-A / sprite integrator  
Branch: `round/r005-sprite-mario-a-source-import`  
Base: `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`  
Exact handoff SHA: `45cbf8ab88bc654fa7c64c91297496662ef1809c`  
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

The generated manifest and contact sheet are deterministic build outputs of this exact handoff SHA. Downstream lanes must not reimplement Mario-A extraction logic.

After checking out/cherry-picking exact SHA `45cbf8ab88bc654fa7c64c91297496662ef1809c`, run:

```bash
node scripts/el-toro-sprite-source-pipeline.mjs \
  --source-dir docs/characters/el-toro/sprite-source/right \
  --out-dir <output-directory>
```

This writes:

- `NORMALIZATION_MANIFEST.json` — 107 source-derived entries with bboxes + normalized transforms;
- `NORMALIZED_PREVIEW.svg` — 107-entry normalized contact sheet.

The repository test invokes the same public `generateSpriteSourceEvidence()` entry point and parses/asserts the generated manifest. This is the exact Mario-A-owned interface Mario-B should consume; do not duplicate the extractor in the package lane.

## Runtime boundary

The admitted multi-frame PNG sheets remain AUTHORING INPUT ONLY.

Runtime consumes a derived sprite package/atlas plus manifest metadata. No source/reference sheet is wired directly into runtime by this lane.

Ricardo's generic runtime contract remains a separate lane. Mario-A does not own combat, balance or runtime authority.

## LEFT-facing blocker

El Toro remains **not mirror-safe**. Readable/directional art such as `TE VOY A CHOCAR` cannot ship via horizontal mirroring.

The authored LEFT-facing IMG-00 + IMG-01..12 set remains a hard production gate. This handoff authorizes right-facing pilot integration only.

## Verification evidence

Final repository verification on exact SHA `45cbf8ab88bc654fa7c64c91297496662ef1809c`:

- GitHub Actions run: `35667742014` / #1440;
- coordination contract: PASS;
- full test suite: PASS;
- build: PASS.

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

> Treat authored sprite-sheet grids as sequencing hints, not guaranteed safe crop boundaries. Inspect alpha continuity and preserve connected visible components across nominal dividers before shared-scale/pivot normalization. Distinguish low-alpha canvas residue from hard clipping with explicit thresholds and evidence.

This is a proposal, not an immediate `mario.md` edit, because this is a same-role squad lane.

## Known risks / unresolved questions

- Authored LEFT-facing body art is still missing and blocks production-complete El Toro.
- Human visual acceptance at gameplay/phone scale remains downstream; numeric extraction gates do not prove artistic likeness.
- Mario-B must consume this exact SHA (or an integrated exact descendant), not a moving branch head.
- Ricardo's facing-aware non-mirror-safe runtime amendment must be green before final pilot integration.

## Downstream eligibility

`V07-SPR-MA` is HANDOFF_READY.

Mario-B may now consume the exact normalization interface above without reimplementing extraction. Mario-A's later integration phase may compose this exact SHA with Mario-B's accepted SHA once that sibling lane is HANDOFF_READY. Germinator remains ineligible until the single integrated Mario candidate and Ricardo runtime candidate exist.
