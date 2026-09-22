# Task V07-SPR-G1 — El Toro Sprite Pilot Audit

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Owner: Germinator  
Status: BLOCKED

## Goal

Independently audit one integrated El Toro sprite-pilot candidate after Mario and Ricardo converge.

## Audited input

- exact candidate: `5c76664fb95ac9c1da019636ce3ad974c214d84c`;
- tree: `d42ccea2ff64ce7010f51f92005a3fc2c606919a`;
- QA evidence SHA: `3b9d754b0d1f118c774404c2371f188033ab7346`;
- validation PR: #58;
- run: `35779776446`;
- handoff: `coordination/handoffs/V07-SPR-G1-germinator.md`.

## Required audit

- manifest/schema validity;
- renderer remains presentation-only;
- resolver precedence and hitstop stability;
- pivot/facing/anchor stability;
- no reversed readable garment text;
- malformed/missing package behavior;
- only selected fighter packages load;
- effects-off action readability;
- mobile landscape load/memory evidence;
- full tests/typecheck/build.

## Result

**BLOCK**

Fresh independent CI:
- coordination/tooling contract: PASS;
- full suite: **354/357 PASS, 3 FAIL**;
- build: skipped after the failing full suite.

Passed:
- verified bilateral packer emits `runtimeLoadable:true`, `blockingGates:[]`;
- `mirrorSafe:false`;
- RIGHT/LEFT animation keys match;
- baked anchor coverage is complete.

Blocking exact-candidate integration failures:
1. El Toro is absent from the live/default playable + presentation composition.
2. `DEFAULT_SPRITE_PACKAGE_REGISTRY` is empty; no El Toro browser package is registered.
3. exact candidate has no runtime `assets/` root, while build only copies runtime assets from `assets/`.

The exact sprite candidate also diverges from the approved V0.7 product lineage at frozen base `378a991d55bed03e6237a03fdf6dfe96653fae72`; it cannot be published as the requested V0.7 El Toro sprite pilot without a new integration composition.

## Recovery condition

Mario-A integration must return a new exact candidate that composes the verified bilateral sprite/runtime work onto the approved four-fighter V0.7 product line, registers/materializes the El Toro package in the live browser path, and proves the served build can load it.

Germinator then reruns V07-SPR-G1. Gonza remains blocked.

## Acceptance criteria

- [x] Exact candidate SHA audited.
- [x] No blocker hidden behind visual polish.
- [ ] Exact candidate is live-previewable with El Toro sprite package.
- [ ] LEFT-facing correctness verified end-to-end in actual runtime.
- [x] Identity Learning Receipt recorded — UPDATED.
