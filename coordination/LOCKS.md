# Active Locks

Sprite pilot extension is active.

- Germinator V07-SPR-G1 replacement QA claim is RELEASED. Product candidate `fe2b5056...` is QA-approved for isolated preview; QA head `be597f25...` remains validation-only and must not be shipped.

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


## Active Mario-A live-integration repair claim

- branch: `round/r005-sprite-mario-a-live-repair`;
- approved product base: `f34760948cb2024c0c83f4a02202117a8ad3bf2f`;
- accepted sprite package input remains `5c76664fb95ac9c1da019636ce3ad974c214d84c` for source/anchors/runtime contracts only;
- scope: generic sprite runtime composition, El Toro `bodyBackend:'sprite'`, package registry, runtime `assets/fighters/el-toro/**`, integration regression;
- forbidden in this repair: gameplay balance/timing changes, source-art regeneration, anchor re-authoring, replacement of approved V0.7 visual modules;
- Germinator remains blocked until Mario-A publishes a replacement exact SHA;
- Gonza remains blocked until the fresh Germinator audit approves it.


## Mario-A live-integration repair — RELEASED

- repair branch: `round/r005-sprite-mario-a-live-repair`;
- final repair head: `4ee68f1cfe5ed06f9da5e547aadf71bb54cd32fd`;
- replacement integration branch: `round/r005-sprite-mario-integration-repair`;
- exact replacement candidate: `fe2b505639d8ebf2dc4ab204b545233d96f214f2`;
- exact tested/candidate tree: `ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a`;
- GitHub synthetic merge used for PR verification: `d0adc829e81810a69ba13acffe8257441d14a2f8`;
- materialization run `35782862607`: PASS;
- PR #59 Repository verification `35783156610`: PASS;
- PR #59 Character Pipeline V2 `35783156710`: PASS;
- source art and bilateral anchor coordinates were not re-authored;
- Mario-A repair claim is RELEASED;
- Germinator V07-SPR-G1 may now claim audit-only surfaces against exact `fe2b505639d8ebf2dc4ab204b545233d96f214f2`;
- Gonza remains blocked until Germinator approval.


## Active Germinator replacement-candidate audit

- task: `V07-SPR-G1`;
- exact candidate: `fe2b505639d8ebf2dc4ab204b545233d96f214f2`;
- exact tree: `ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a`;
- QA branch: `round/r005-germinator-live-repair-audit`;
- ownership: QA tests/evidence + coordination findings only;
- product/runtime/source/anchor files are read-only during this audit;
- Mario-A repair lane remains released;
- Gonza remains blocked until Germinator issues APPROVE.


## V07-SPR-G1 replacement closure

- exact approved product candidate: `fe2b505639d8ebf2dc4ab204b545233d96f214f2`;
- product tree: `ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a`;
- verdict: `APPROVE — SPRITE PILOT LIVE INTEGRATION GREEN`;
- final QA head: `be597f2549505b7609bdfd489a60570ad11216e1`;
- Repository verification `35788754170`: 433/433 + build PASS;
- Character Pipeline V2 `35788754059`: 433/433 + build + visual evidence + raster/reference guard PASS;
- Gonza V07-SPR-Z0 may claim isolated preview/release surfaces now;
- production-root promotion remains prohibited pending physical-device/user acceptance and canonical package-format reconciliation;
- no active Germinator product or QA-file lock remains.
