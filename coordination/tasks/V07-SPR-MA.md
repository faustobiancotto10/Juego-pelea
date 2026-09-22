# Task V07-SPR-MA — El Toro Sprite Source Lead

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Owner: Mario-A  
Status: WORKING_REPAIR

## Execution branch

- branch: `round/r005-sprite-mario-a-source-import`
- exact starting SHA: `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`
- lane ownership: admitted source validation/extraction/normalization
- later integration role: Mario-A becomes the temporary Mario integrator on `round/r005-sprite-mario-integration` after both Mario lanes hand off.

## Goal

Continue from the exact staged El Toro right-facing source bytes in PR #50, independently re-verify the intake hashes, validate extraction/alpha/layout, and establish the normalized sprite-source package that Mario-B and Ricardo can consume.

## Source handoff

- branch: `round/r005-sprite-mario-a-source-import`
- exact SHA: `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`
- PR: #50
- import workflow: GitHub Actions run `35664899123` — SUCCESS
- repository verification: run `35664982990` / #1377 — SUCCESS
- accepted source files present: 17 PNGs + `SOURCE_MANIFEST.md`
- rejected `13F1BB3E-C57C-4649-B9E7-07664E5E8BE8.PNG`: absent from admitted source path

## Dependencies

- Accepted source bytes are staged on branch `round/r005-sprite-mario-a-source-import` at exact SHA `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65` in PR #50; no chat re-attachment is required.
- Read `docs/SPRITE_PRODUCTION_CONTRACT.md`.
- Read `docs/characters/el-toro/SPRITE_INTAKE_2026-09-21.md`.
- Read `docs/characters/el-toro/LEFT_FACING_SET_PROMPT.md`.

## Allowed files / subsystem

- `docs/characters/el-toro/sprite-source/**`
- `scripts/**sprite**` when needed for deterministic extraction/validation tooling
- sprite-pipeline documentation/tests directly needed by this lane

## Prohibited scope

- no combat/balance changes;
- no runtime renderer cutover;
- do not admit the rejected `13F1BB3E-...` sheet;
- do not silently mirror text-bearing art to manufacture a left-facing shipping set.

## Required work

1. Verify accepted source SHA-256 values against the intake audit.
2. Commit accepted right-facing source sheets using canonical names.
3. Exclude the rejected alternate.
4. Validate alpha, grid count, edge clipping and automatic frame extraction.
5. Produce normalized frame previews using one shared scale and stable ground pivot.
6. Define the exact authoring/runtime manifest handoff contract for Mario-B/Ricardo.
7. Record `TOOL_USED` or `TOOL_UNAVAILABLE` for Game Studio / Game Development Studio truthfully.
8. Complete Identity Learning Review.

## Acceptance criteria

- [x] Exactly the accepted right-facing Master + IMG-01..12 + FX-01..04 are committed.
- [x] SHA-256 values match the audit before any derived normalization.
- [x] Rejected alternate is absent from admitted source paths.
- [x] Normalized preview exposes no hard outer-canvas clipping; component-preserving extraction prevents nominal-grid clipping.
- [x] No source/reference sheet is wired directly into runtime.
- [x] Exact-SHA handoff to Mario-B and Ricardo: `45cbf8ab88bc654fa7c64c91297496662ef1809c`.
- [x] Identity Learning Receipt recorded: `PROPOSAL` in `coordination/handoffs/V07-SPR-MA-mario-a.md`.


## Completion handoff

- state: `HANDOFF_READY`
- exact product SHA: `45cbf8ab88bc654fa7c64c91297496662ef1809c`
- final repository verification: run `35667742014` / #1440 — SUCCESS
- canonical handoff: `coordination/handoffs/V07-SPR-MA-mario-a.md`
- downstream: Mario-B + Ricardo may consume the exact contract; later Mario-A integration consumes this exact SHA after the sibling Mario lane is ready.
