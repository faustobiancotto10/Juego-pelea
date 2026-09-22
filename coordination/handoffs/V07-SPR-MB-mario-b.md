# Handoff — V07-SPR-MB

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-SPR-MB — El Toro Sprite Package  
From: Mario-B  
To: Mario-A sprite integrator + Neureon  
Branch: `round/r005-sprite-mario-b-package`  
Exact Mario-B candidate SHA: `a5dfaa6d35ec3f32eaac15f687c7a098ed10500d`  
Integration target: `round/r005-sprite-mario-integration`  
Validation PR: #52 (draft; do not merge directly)  
Status: **BLOCKED / RIGHT-PACKAGE-READY**

## What is green

Mario-B completed every right-facing package/metadata step that can be proven without fabricating missing art or duplicating another lane's extraction logic.

### Right-facing body contract
- exactly 84 contractual body frames;
- IMG-01..12 semantics/grid/frame counts frozen;
- source sheets remain authoring-only;
- El Toro is explicitly `mirrorSafe: false`;
- runtime horizontal mirroring is prohibited for shipping.

### Resolver/runtime source blueprint
`right-package.json` plus `compileRuntimeFrameSourcePlan()` now freeze and validate:
- all 17 non-move resolver state keys;
- six reachable ordinary move keys:
  - `move:toroJab`;
  - `move:toroShoulder`;
  - `move:toroLow`;
  - `move:toroAir`;
  - `move:topete`;
  - `move:shawarmazoThrow`;
- three reachable Super Eructo phase keys:
  - `ultimate:superEructo:startup`;
  - `ultimate:superEructo:capture`;
  - `ultimate:superEructo:recovery`.

`move:superEructo` and `ultimate:superEructo:sequence` are intentionally absent because the frozen forwardBlast implementation resolves the Ultimate through startup -> capture/blast -> recovery.

Move/Ultimate frame durations are presentation-only and align visual beats to the already-authoritative V0.7 move lengths, active windows and Shawarmazo spawn frame. No gameplay timing/hitbox/damage values were changed.

Pilot-only visual aliases are explicit and review-gated:
- `toroShoulder` -> IMG-10 Topete body language;
- `toroAir` -> IMG-05 Jump body language;
- dash/block-crouch/guard-break/captured state aliases are marked for gameplay-scale review.

### FX package metadata
All 22 FX frames remain separate from body:
- FX-01 Topete impact;
- FX-02 Shawarmazo projectile;
- FX-03 Shawarmazo impact;
- FX-04 Super Eructo effect.

`compileEffectFrameSourcePlan()` validates all 22 against Mario-A admitted frames. Runtime status is explicitly `package-ready-effect-router-deferred`; Ricardo R1 is a body backend and Mario-B does not claim FX runtime routing exists.

## Exact dependency consumed

Mario-B consumed Mario-A exact handoff SHA:
`45cbf8ab88bc654fa7c64c91297496662ef1809c`

It was incorporated as a real two-parent merge, preserving MA ownership of extraction/normalization code. Mario-B did not reimplement connected-component extraction.

MA dependency files visible in PR #52 are inherited dependency content, not Mario-B-owned product edits:
- `docs/characters/el-toro/sprite-source/right/NORMALIZATION_HANDOFF.md`;
- `scripts/el-toro-sprite-source-pipeline.mjs`;
- `scripts/sprite-component-extractor.mjs`;
- `scripts/sprite-normalize-contract.mjs`;
- `scripts/sprite-png-alpha.mjs`;
- `scripts/sprite-preview-svg.mjs`;
- `scripts/sprite-source-config.mjs`;
- `tests/el-toro-sprite-source-pipeline.test.mjs`.

Mario-B-owned package/test surfaces:
- `docs/characters/el-toro/sprite-package/right-package.json`;
- `scripts/el-toro-sprite-package-builder.mjs`;
- `tests/el-toro-sprite-package-contract.test.mjs`;
- `tests/el-toro-sprite-bbox-isolation.test.mjs`;
- `tests/el-toro-runtime-key-plan.test.mjs`;
- `tests/el-toro-effect-source-plan.test.mjs`.

## Verification

Latest candidate verification:
- workflow run: `35670898169`;
- coordination contract: PASS;
- full repository test suite: PASS;
- build: PASS.

Additional diagnostic evidence:
- run `35669528082`: 20 overlapping frame-bbox pairs exposed the unsafe bbox-only crop assumption;
- run `35670339065`: current MA body scale `0.22988506`, IMG-01..12-only scale `0.40114613180515757`, ratio `1.7449856541575932`, proving IMG-00 currently constrains runtime body scale;
- current packer guards are GREEN because they fail fast on these unsafe upstream conditions rather than producing a bad atlas.

## Hard blockers

### 1. Mario-A pixel isolation
MA's generated bboxes overlap for 20 frame pairs. Bounding-box crops alone can include visible pixels assigned to neighboring frames.

Required:
- deterministic pixel-isolated frame outputs, component masks or equivalent MA-owned crop API;
- new exact-SHA MA handoff.

### 2. Mario-A runtime scale
IMG-00 Master Seed is currently classified into body normalization and shrinks IMG-01..12.

Required:
- runtime body shared scale calculated from IMG-01..12 only;
- Master Seed review normalization kept separate;
- new exact-SHA MA handoff.

### 3. Ricardo presentation clock
Ricardo exact handoff `d07cba1231fbb571dfe5d344487251f88dec797c` solved authored-facing, but current resolver still uses:
- decrementing remaining counters as forward animation ticks for reaction states;
- absolute ambient combatTick for one-shot crouch/block/jump-startup/knockdown transitions.

This can reverse or skip ordered sprite progressions.

Required:
- deterministic presentation-state-entry age for non-looping state animations;
- moveFrame and ultimatePhaseFrame remain authoritative forward ages;
- new exact-SHA Ricardo handoff.

### 4. Authored LEFT-facing body art
No LEFT source directory exists yet.

Required before a valid `mirrorSafe:false` runtime manifest:
- authored LEFT-facing IMG-00 + IMG-01..12;
- same contractual phases and animation-key coverage.

### 5. Per-frame attachment anchors
Pivot policy is frozen, but head/chest/frontHand/backHand/belt/frontFoot/backFoot coordinates cannot be fabricated from bounding boxes.

Required:
- verified anchor coordinates from admitted/normalized art before runtime package completion.

## Not yet claimable

Because of the blockers above, Mario-B does **not** claim:
- production body.webp;
- production effects.webp;
- valid all-facing animations.json;
- gameplay-scale sprite preview;
- action-readability acceptance;
- production-complete status.

## Requested next action

1. Mario-A repairs pixel isolation + runtime scale and publishes a new exact-SHA source/normalization handoff.
2. Ricardo repairs presentation-state-entry timing and publishes a new exact-SHA runtime handoff.
3. Authored LEFT-facing art is supplied/admitted.
4. Mario-B resumes atlas/manifest/anchor/preview work immediately under AUTO_CHAIN.
5. Mario-A integrator consumes only exact green SHAs.

## Identity Learning Review

**PROPOSAL** -> designated Mario-A integrator.

Proposed durable Mario learnings:
1. Treat nominal sprite-sheet grids as sequencing hints, not crop truth. If connected components cross dividers or frame bboxes overlap, require pixel-isolated component output before atlas packing.
2. Keep reference/master seeds out of runtime animation shared-scale calculations unless they are explicitly in the same normalization domain; a different reference canvas can silently shrink every runtime sprite.
3. Non-looping sprite transitions need forward presentation-state age. Remaining simulation counters and absolute fight time are not interchangeable with elapsed animation age; rendering must stay non-authoritative while tracking presentation entry time.

## Tool receipt

- Game Studio `sprite-pipeline` contract used.
- Superpowers TDD/execution/verification workflow used.
- `TOOL_UNAVAILABLE: Game Development Studio / game-dev CLI` in this host; no CLI result is claimed.


## Revision 3 — derived right-facing package GREEN

This revision supersedes the earlier right-metadata-only checkpoint.

### Exact candidate and verification

- exact Mario-B SHA: `a5dfaa6d35ec3f32eaac15f687c7a098ed10500d`
- verification run: `35674533122` / #1530
- coordination contract: PASS
- full repository suite: PASS
- build: PASS

### Revised dependency consumed

Mario-B consumed revised Mario-A exact SHA:
`0eb4a2b985813d1cdc9f8c53d059a81efe49be20`

The previous MA blockers are resolved:
- pixel-isolated RGBA is provided by MA-owned `generatePixelIsolatedFrameSet()`;
- runtime body scale excludes IMG-00 and now matches IMG-01..12 body-only scale.

### New derived outputs

`scripts/el-toro-sprite-atlas-packer.mjs` deterministically produces:
- `right-body.png` — normalized 84-frame body atlas;
- `right-effects.png` — separate 22-frame FX atlas;
- `right-runtime-fragment.json` — 26 resolver-reachable RIGHT animation keys;
- `right-effects-fragment.json` — FX package metadata;
- `right-gameplay-preview.svg` — 844x390 atlas-only phone-landscape evidence;
- `right-package-metrics.json` — decoded-memory metrics.

The CLI is reproducible:

```bash
node scripts/el-toro-sprite-atlas-packer.mjs \
  --source-dir docs/characters/el-toro/sprite-source/right \
  --package-contract docs/characters/el-toro/sprite-package/right-package.json \
  --out-dir <output-dir>
```

No source sheet path is emitted into runtime fragments or preview evidence.

### Derived-package fingerprint

Body:
- atlas dimensions: 2048x1509
- decoded RGBA: 12,361,728 bytes
- encoded PNG: 3,203,017 bytes
- SHA-256: `06d06bdfbc72b9ee07eae053d801f9f180b8776433e837839cbbfea1aa2826cc`

FX:
- atlas dimensions: 1024x901
- decoded RGBA: 3,690,496 bytes
- encoded PNG: 916,922 bytes
- SHA-256: `2fb2835545138560c7ddae960997161619ee142d98370b2b7f48fc42f1189002`

Combined decoded RGBA:
- 16,052,224 bytes

These are reproducibility measurements, not target-device acceptance.

### Runtime readiness boundary

The generated RIGHT runtime fragment is intentionally marked:
- `mirrorSafe: false`
- `runtimeLoadable: false`
- `leftAnimationsRequired: true`

Mario-B does not bypass the authored LEFT requirement.

### Remaining blockers

1. Authored LEFT-facing IMG-00 + IMG-01..12 remain absent.
2. Required per-frame attachment anchors remain unverified; Mario-B will not fabricate head/chest/hands/belt/feet coordinates.
3. Ricardo v2 SHA `79f8d81c2db75eebc595a93668e7332a9f429373` correctly repairs hurt/guard-break/jump-startup/land/captured/knockdown timing, but `crouch`, `block`, and `block-crouch` still use absolute ambient `combatTick`. Mario-B requested the narrow state-entry timeline amendment on PR #51.
4. Gameplay-scale evidence is generated, but human/device artistic acceptance remains downstream.

### Updated Identity Learning Review

**PROPOSAL** -> designated Mario-A integrator.

Additional reusable lesson:
- when normalized sprite dimensions are rounded to integer atlas pixels, transform pivots into the same rounded coordinate space before manifest emission; carrying pre-rounding float pivots directly can place an otherwise correct baseline a fraction outside the packed rect.
