# Active Locks

Sprite pilot extension is active.

On activation:
- Mario-A / V07-SPR-MA owns `docs/characters/el-toro/sprite-source/**` and sprite-source extraction/validation tooling it explicitly claims.
- Mario-B / V07-SPR-MB owns the El Toro derived sprite package/manifest/presentation files after consuming Mario-A's source interface.
- Ricardo / V07-SPR-R1 replacement runtime handoff is HANDOFF_READY at exact SHA `5b20c351e75a45460b3f76416d41424f10e43a1f`; the narrow stance-timeline repair lock is released. Integration/package edits belong to Mario lanes.
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

## Active sprite integration claim — Mario-A

- branch: `round/r005-sprite-mario-integration`
- exact accepted package input: `51e0e892d08f9cf30742ef4894732f448a97da80`
- includes accepted Mario-A source pipeline v2: `0eb4a2b985813d1cdc9f8c53d059a81efe49be20`
- exclusive integration ownership: composition/registration surfaces only after exact accepted lane handoffs
- consume Ricardo exact green runtime SHA `5b20c351e75a45460b3f76416d41424f10e43a1f`; do not consume the moving branch
- do not claim all-facing completion; LEFT art and verified anatomical anchors remain external gates
