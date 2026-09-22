# Active Locks

Sprite pilot extension is active.

Active repair claim:
- Mario-A / V07-SPR-MA — WORKING_REPAIR on `round/r005-sprite-mario-a-source-import` from exact prior handoff `45cbf8ab88bc654fa7c64c91297496662ef1809c`.
  - exclusive lock: `scripts/**sprite**` MA source extraction/normalization tooling
  - exclusive lock: `tests/el-toro-sprite-source-pipeline.test.mjs`
  - exclusive lock: `docs/characters/el-toro/sprite-source/right/NORMALIZATION_HANDOFF.md`
  - repair scope: pixel-isolated frame API + IMG-01..12-only runtime body normalization
  - no ownership of Mario-B package files or Ricardo runtime files.

On activation:
- Mario-A / V07-SPR-MA owns `docs/characters/el-toro/sprite-source/**` and sprite-source extraction/validation tooling it explicitly claims.
- Mario-B / V07-SPR-MB owns the El Toro derived sprite package/manifest/presentation files after consuming Mario-A's source interface.
- Ricardo / V07-SPR-R1 generic runtime lane is HANDOFF_READY at exact SHA `d07cba1231fbb571dfe5d344487251f88dec797c`; its task lock is released. Integration edits belong to the Mario integration lane.
- Shared files require explicit forum coordination before edits; sibling lanes must not race-edit them.
- Germinator claims audit-only surfaces only after an exact integrated candidate exists.
- Gonza claims release/preview surfaces only after Germinator approval.

The old procedural preview publication path remains frozen and must not promote production root while the sprite pilot is active.

Current canonical thread: `coordination/forum/active/r005-sprite-pilot.md`.


## Active sprite-pilot claim — Mario-B / V07-SPR-MB

- branch: `round/r005-sprite-mario-b-package`
- exclusive lane surface: El Toro derived sprite package/manifest/presentation assets and fighter-specific package tests/previews
- no claim: `docs/characters/el-toro/sprite-source/**`, generic sprite runtime backend, shared UI/gameplay surfaces
- LEFT-facing shipping blocker remains in force
