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
- LEFT-facing shipping blocker remains in force


## Mario-A LEFT source handoff — lock release

- exact frozen source/pipeline SHA: `c1b3e8e757b707f2975f6587217cc2f851e2ca6b`;
- final verification run: `35683738506` — coordination + full suite + build PASS;
- LEFT source-art dependency is released;
- Mario-B owns the next package/anchor mutation;
- Mario-A does not edit Mario-B package surfaces while waiting for the bilateral handoff.


## Active narrow repair claim — Mario-A / LEFT Topete

- reason: exact accepted `LEFT-IMG-10` reproduces a pathological component assignment under the canonical extractor;
- evidence before repair: slot body areas `[83260,79278,77005,93447,101421,115723,1008,168056]`; slot 6 is effectively empty while slot 7 contains two authored poses;
- claim surface: `docs/characters/el-toro/sprite-source/left/el-toro__LEFT-IMG-10__topete.png`, its source hash/receipt, and source-validation tests only;
- no claim: Mario-B package/anchor files, Ricardo runtime, shared UI/gameplay;
- exit: 8/8 visually isolated Topete poses, balanced source-slot body occupancy, hard-edge gate 0, full suite/build GREEN, exact re-handoff to Mario-B.


## Mario-A LEFT Topete repair — lock release

- supersedes source handoff `c1b3e8e757b707f2975f6587217cc2f851e2ca6b`;
- exact repaired source/pipeline SHA: `7782734bcc0cf4d98df74073fd86e6d8ead409d2`;
- binary repair commit: `4898b53aa21a81017f39cac1d62564e2d8138467`;
- one-shot repair run `35749493759`: targeted source-quality gate PASS;
- repository-wide verification PR #55/run `35749799535`: coordination + full suite + build PASS;
- active narrow Mario-A repair claim is released;
- Mario-B now owns regeneration of the bilateral package from this exact repaired source.
