# Active Locks

Sprite pilot extension is active.

On activation:
- Mario-A / V07-SPR-MA source mutation lane is HANDOFF_READY and frozen at exact SHA `7782734bcc0cf4d98df74073fd86e6d8ead409d2`; Mario-B may consume it read-only. Reopen source mutation only for a new reproducible source/pipeline defect.
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
- authored LEFT source is available; Mario-B must rebuild from latest Mario-A `7782734...` before anchor certification



## Mario-A LEFT Topete repair — lock release

- exact final source/pipeline SHA: `7782734bcc0cf4d98df74073fd86e6d8ead409d2`;
- repaired-content parent: `8eacac360878a9c20b55a22e1f406c78f66fd27c`;
- binary repair commit: `4898b53aa21a81017f39cac1d62564e2d8138467`;
- targeted repair workflow `35749493759`: PASS;
- exact repaired-content verification `35749695571`: coordination + full suite + build PASS;
- PR #55 final-tree verification `35749799535`: coordination + full suite + build PASS;
- tested synthetic tree and actual final handoff tree are both `044baa958b77c119443e942540560401897b85d0`;
- Mario-A source mutation claim is RELEASED;
- Mario-B owns regeneration of the bilateral package from `7782734bcc0cf4d98df74073fd86e6d8ead409d2`;
- prior Mario-B bilateral candidates `57634fc7...` and `d6b41ff...` are stale for final anchor certification.
