# Handoff — V07-SPR-MB

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-SPR-MB — El Toro Sprite Package  
From: Mario-B  
To: Mario-A sprite integrator + Neureon  
Branch: `round/r005-sprite-mario-b-package`  
Exact Mario-B candidate SHA: `f4a1b3f291fafabc364b4f52a8872014cb8664f6`  
Integration target: `round/r005-sprite-mario-integration`  
Validation PR: #52 (draft; do not merge directly)  
Status: **BLOCKED / RIGHT-METADATA-READY**

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
