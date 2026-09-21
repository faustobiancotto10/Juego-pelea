# Active Locks

Sprite pilot extension is active.

Active sprite-pilot claims:
- Mario-A / V07-SPR-MA — WORKING on `round/r005-sprite-mario-a-source-import` from exact base `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`.
  - exclusive lock: `docs/characters/el-toro/sprite-source/**`
  - exclusive lock: deterministic sprite-source extraction/validation tooling created for V07-SPR-MA under `scripts/**sprite**`
  - no ownership of Mario-B derived runtime package or Ricardo runtime backend.

On activation:
- Mario-A / V07-SPR-MA owns `docs/characters/el-toro/sprite-source/**` and sprite-source extraction/validation tooling it explicitly claims.
- Mario-B / V07-SPR-MB owns the El Toro derived sprite package/manifest/presentation files after consuming Mario-A's source interface.
- Ricardo / V07-SPR-R1 owns the generic sprite runtime backend/schema/resolver/cache/renderer files defined by its task.
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
