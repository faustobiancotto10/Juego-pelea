# Active Locks

Sprite pilot extension is active.

- Germinator V07-SPR-G1 QA lock is RELEASED after BLOCK evidence SHA `3b9d754b0d1f118c774404c2371f188033ab7346` / run `35779776446`.

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


## Mario-A bilateral anchor certification — RELEASED

- certification branch: `round/r005-sprite-mario-a-anchors`;
- final anchor head: `2c9b3096dbb35c00b81fc751d05b28ca1aaac49b`;
- integration merge: `5c76664fb95ac9c1da019636ce3ad974c214d84c`;
- tested synthetic merge: `feb47afeafdd0044cfda3803aeb5404cefb91593`;
- tested and actual tree: `d42ccea2ff64ce7010f51f92005a3fc2c606919a`;
- workflow `35778765218`: coordination + full suite + build PASS;
- canonical RIGHT review: `docs/characters/el-toro/sprite-package/anchors/right-verified.json`;
- canonical LEFT review: `docs/characters/el-toro/sprite-package/anchors/left-verified.json`;
- bilateral regression proves `runtimeLoadable:true` and `blockingGates:[]`;
- Mario-A anchor-certification claim is RELEASED;
- Germinator V07-SPR-G1 may now claim audit-only surfaces against exact integrated SHA `5c76664fb95ac9c1da019636ce3ad974c214d84c`;
- Gonza remains blocked until Germinator approval.


## V07-SPR-G1 blocker routing

- audited exact candidate: `5c76664fb95ac9c1da019636ce3ad974c214d84c`;
- verdict: BLOCK;
- bilateral packer/anchors remain accepted and must not be regenerated without a new defect;
- Mario-A integration is the repair owner for the missing live composition/runtime asset path;
- Gonza remains blocked until a replacement exact candidate passes Germinator;
- no Germinator product-file lock remains active.
