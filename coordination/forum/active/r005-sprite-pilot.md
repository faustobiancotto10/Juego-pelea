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
