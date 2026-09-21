# R005 Sprite Pilot Extension — Coordination Thread

Status: ACTIVE  
Opened: 2026-09-21  
Authority: explicit user direction to begin the approved sprite workflow now.

## Neureon intake finding

Uploaded `SPRITES TORO.zip` was inspected against the Official Sprite Production Contract v1.0.

Result:
- right-facing body coverage can be reduced to the exact required 84 sprites by accepting the mapped IMG-01..12 set;
- all four El Toro FX families are present;
- one alternate 8-frame idle-like sheet is rejected/superseded and must not enter the pipeline;
- El Toro is not mirror-safe because of readable/directional garment text/logos;
- authored LEFT-FACING IMG-01..12 is therefore a hard asset gate before shipping/cutover.

Canonical audit:
- `docs/characters/el-toro/SPRITE_INTAKE_2026-09-21.md`

Canonical generation instructions for the missing set:
- `docs/characters/el-toro/LEFT_FACING_SET_PROMPT.md`

## Runtime scope ruling

The user has explicitly reopened R005 scope for the already-approved sprite pilot. This permits the post-R005 sprite plan to begin before the old procedural-preview phone gate finishes.

This does **not** authorize production-root promotion from the old preview. That old gate is superseded by the sprite-pilot path.

## Parallel start

Immediately eligible once instances are activated:
- Mario-A — asset/pipeline lead and accepted-source import/normalization;
- Mario-B — El Toro package lane; may process accepted right-facing content now but cannot declare all-facing package complete until LEFT-FACING inputs arrive;
- Ricardo — generic sprite runtime backend; must remain simulation-authoritative and can proceed independently of missing left-facing art.

Then:
- Germinator — independent audit of the single integrated El Toro sprite-pilot candidate;
- Gonza — isolated preview only after Germinator approval;
- user/device acceptance — final gate before any production cutover.

## Tool capability receipt

Current Neureon session:
- `TOOL_UNAVAILABLE: Game Development Studio / game-dev CLI` — repository contract is present, but this host does not expose the local CLI. No Game Development Studio result is claimed.
- Game Studio sprite-pipeline contract was read and used for the source/normalization workflow definition.


## Binary source transfer receipt

Neureon staged the accepted right-facing source bytes for the active pilot:
- branch: `round/r005-sprite-mario-a-source-import`;
- exact SHA: `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`;
- PR: #50;
- source directory: `docs/characters/el-toro/sprite-source/right/`;
- 17 accepted PNGs present under canonical contract names;
- rejected `13F1BB3E-C57C-4649-B9E7-07664E5E8BE8.PNG` absent;
- one-shot import workflow run `35664899123`: SUCCESS;
- repository verification run `35664982990` / #1377: SUCCESS.

This removes the previous requirement to re-attach the ZIP in the Mario-A chat. Mario-A remains responsible for independent source hash confirmation plus extraction/normalization/preview evidence before its exact-SHA handoff.


## Frozen implementation lanes

All active sprite-pilot implementation lanes share exact source-bearing base `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`.

- Mario-A: `round/r005-sprite-mario-a-source-import`;
- Mario-B: `round/r005-sprite-mario-b-package`;
- Ricardo: `round/r005-sprite-ricardo-runtime`;
- Mario integration: `round/r005-sprite-mario-integration`.

Mario-A is the temporary same-role integrator after the MA/MB exact-SHA handoffs; that integration role does not require a third Mario chat. Germinator consumes one integrated candidate only.


## Mario-A activation claim — 2026-09-21

- instance: Mario-A
- task: `V07-SPR-MA`
- branch: `round/r005-sprite-mario-a-source-import`
- exact base/head on activation: `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`
- dependencies: accepted PR #50 source bytes + Sprite Production Contract + El Toro intake audit + LEFT-facing gate contract
- exclusive ownership: `docs/characters/el-toro/sprite-source/**` and V07-SPR-MA sprite extraction/validation tooling under `scripts/**sprite**`
- prohibited overlap: no Mario-B derived runtime package, no Ricardo runtime backend, no combat/balance edits
- integration target: Mario-A later composes `round/r005-sprite-mario-integration` after exact-SHA MA/MB handoffs
- required evidence: independent SHA-256 check, alpha/grid/edge/extraction validation, shared-scale + stable-ground-pivot preview, manifest handoff, verification receipt, Identity Learning Review
- tool receipt at activation: Game Studio `sprite-pipeline` skill read and applied; Game Development Studio orchestration skill read, but no local `game-dev` CLI tool is exposed in this chat host, so no CLI result will be fabricated.


## Mario-B activation claim — V07-SPR-MB

- instance: Mario-B
- branch: `round/r005-sprite-mario-b-package`
- exact base: `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`
- owned scope: El Toro derived sprite package, manifest, fighter-specific presentation metadata/tests/previews
- prohibited overlap: Mario-A source extraction/normalization tooling, Ricardo generic runtime backend, unrelated shared renderer/UI/gameplay files
- current gate: right-facing package work authorized now; production-complete/all-facing handoff remains blocked until authored LEFT-FACING IMG-00 + IMG-01..12 exists
- integration target: Mario-A on `round/r005-sprite-mario-integration`


## Mario-B checkpoint / dependency request — V07-SPR-MB

- lane branch: `round/r005-sprite-mario-b-package`
- current exact SHA: `45de7965dd7b55278f8758d44151fc4afbd27f57`
- draft handoff PR: #52 -> `round/r005-sprite-mario-integration`
- TDD evidence: RED on missing right-package descriptor, then GREEN on run `35666619713` (full suite + build)
- frozen right-facing contract: exactly 84 body frames + 22 identity FX, source sheets authoring-only, no shipping mirror, authored LEFT-facing remains required
- Ricardo contract observed: v1 sprite manifest uses atlas rects/pivots/durationTicks/optional named anchors; resolver keys are authoritative and will be consumed rather than redefined here
- REQUEST -> Mario-A: publish an exact-SHA handoff that includes or exposes the generated `NORMALIZATION_MANIFEST.json` (107 source-derived frames with bbox + normalized transform) and preview evidence. Mario-B needs those exact derived transforms to pack atlas coordinates without reimplementing Mario-A-owned extraction logic.
- REQUEST -> Ricardo: when the runtime contract is frozen for integration, publish the exact resolver/package interface SHA. Mario-B will map El Toro assets to it without editing Ricardo-owned generic runtime files.
- TOOL_UNAVAILABLE in Mario-B host: Game Development Studio / `game-dev` CLI. Game Studio `sprite-pipeline` contract is being followed; no unavailable-tool result is claimed.
