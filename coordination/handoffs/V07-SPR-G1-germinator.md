# V07-SPR-G1 — Germinator audit handoff

Round: `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION`  
Task: `V07-SPR-G1 — El Toro Sprite Pilot Audit`  
From: Germinator  
To: Gonza / V07-SPR-Z0 isolated preview  
Replacement product candidate: `fe2b505639d8ebf2dc4ab204b545233d96f214f2`  
Replacement product tree: `ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a`  
Approved V0.7 ancestor: `f34760948cb2024c0c83f4a02202117a8ad3bf2f`  
QA branch: `round/r005-germinator`  
Final QA head: `ac860f2ef320f83a977939483e742472b40389f9`  
Validation PR: #60  
Verdict: **APPROVE — SPRITE PILOT LIVE INTEGRATION GREEN**

## Scope of this approval

This approval unlocks **V07-SPR-Z0 isolated preview only**.

It does not authorize:
- production-root promotion;
- full-roster sprite cutover;
- waiving physical-phone/user acceptance;
- waiving the canonical production package-format gate described below.

## Previous blocker

The prior candidate `5c76664fb95ac9c1da019636ce3ad974c214d84c` remains rejected/historical.

Germinator previously proved that it:
- omitted El Toro from the live/default product composition;
- had an empty default sprite package registry;
- shipped no runtime `assets/` package;
- diverged from the approved V0.7 product lineage.

Replacement `fe2b5056...` closes all four failures.

## Exact replacement integration verified

Lineage:
- `fe2b5056...` is a descendant of approved V0.7 `f3476094...`;
- compare is 0 commits behind that approved line;
- gameplay/simulation production files are unchanged by the sprite integration delta.

Live product path:
- four-fighter V0.7 playable composition is preserved;
- El Toro presentation uses `bodyBackend:'sprite'`;
- El Toro uses `spritePackageKey:'el-toro'`;
- default sprite registry maps `el-toro` to the served manifest;
- normal build copies runtime sprite assets into `dist/assets/`;
- AppController preloads only selected fight sprite packages before combat;
- rematch reuses the package cache;
- missing package/load failures surface visibly rather than silently changing gameplay.

Bilateral package:
- `runtimeLoadable:true`;
- `blockingGates:[]`;
- `mirrorSafe:false`;
- 26 RIGHT + 26 LEFT resolver keys;
- authored LEFT frames are used without horizontal canvas mirroring;
- seven verified anatomical anchors remain baked into runtime frames.

## Fresh independent verification

### Repository verification
Run `35788816202` / Repository verification #1722:
- coordination contract: PASS;
- full suite: **433/433 PASS**;
- build: PASS.

### Character Pipeline V2
Run `35788816195` / Character Pipeline V2 #74:
- full suite: **433/433 PASS**;
- build: PASS;
- visual-evidence generation: PASS;
- runtime raster/reference guard: PASS;
- artifact ID: `10721013048`;
- artifact digest: `sha256:9fafac53621a87e574f8ab1e20a0e872ae110e00993f7a73acbdc1b84a362b26`.

### Independent G1 probes
The replacement audit proves:
1. four-fighter V0.7 composition survives and El Toro is live sprite-backed;
2. browser loader resolves the exact served El Toro manifest + body atlas;
3. selected-fight lifecycle loads only El Toro's package when needed and rematch reuses it;
4. authored RIGHT and LEFT resolve to different atlas rectangles with no runtime mirror;
5. RIGHT/LEFT live anchor samples are finite;
6. decoded atlas footprint remains within the audit bound;
7. normal build copies exact runtime manifest/atlas bytes to `dist`;
8. visual-QA tooling is separated from the legacy procedural-rig evidence.

## Visual QA

The old Character Pipeline visual page still describes the historical procedural El Toro rig, so Germinator did **not** use that page as sprite-pilot approval evidence.

A deterministic QA compositor instead sampled the exact runtime atlas using the exact runtime manifest and produced:
- `sprite-atlas-evidence.png`;
- `sprite-atlas-evidence-phone.png` at 844×390.

Direct inspection:
- RIGHT idle and LEFT idle are genuinely authored different facings;
- readable shirt text `TE VOY A CHOCAR` is correctly oriented on both facings;
- RIGHT Topete has a clear forward-driving silhouette without generic FX;
- LEFT Ultimate startup remains a distinct readable body pose;
- all four remain recognizable at the 844×390 evidence scale.

The async canvas helper was found to race image decode, so it was superseded by a static exact-atlas crop surface on the final QA head. Final browser captures `sprite-runtime.png` and `sprite-runtime-phone.png` visibly contain RIGHT idle, LEFT idle, RIGHT Topete and LEFT Ultimate from the served runtime atlas; no blank/pre-load capture is used for approval.

## Memory / device boundary

The served body atlas is ~6.17 MB encoded. Referenced atlas bounds imply roughly ~20.25 MiB decoded RGBA for the body atlas. This is cloud/static evidence only.

Physical iPhone decode/load/render performance remains a downstream user/device acceptance gate.

## PENDING PRODUCTION GATE — canonical package format

Authoritative sprite architecture/plan specify canonical production package names:
- `assets/fighters/<id>/body.webp`;
- `assets/fighters/<id>/animations.json`.

The pilot currently serves:
- `el-toro-body.png`;
- `el-toro-animations.json`.

This does **not** block the isolated pilot preview because the manifest/loader/build path is valid and the pilot is explicitly pre-cutover. It **does** block production/full-roster cutover until either:
1. the package is converted/materialized to the canonical production naming/encoding; or
2. Neureon explicitly amends the authoritative contract.

Do not silently treat the pilot PNG naming as final production format.

## Downstream

Gonza V07-SPR-Z0 is now eligible to:
- consume exact product candidate `fe2b505639d8ebf2dc4ab204b545233d96f214f2`;
- build and publish an **isolated sprite-pilot preview only**;
- verify source → build → served preview parity;
- smoke-test RIGHT/LEFT El Toro in the actual served game.

Production root remains unchanged until physical-phone/user acceptance and the later production-format/cutover gates are green.

## Tool receipts

- `TOOL_USED: Game Studio sprite-pipeline + game-playtest` — acceptance/evidence workflow applied.
- `TOOL_USED: Superpowers verification-before-completion` — fresh exact-head tests/build/evidence checked before verdict.
- `TOOL_UNAVAILABLE: Game Development Studio / game-dev CLI` — unavailable in this host; no CLI evidence is claimed.

## Identity Learning Review

Receipt: **UPDATED**

Reusable QA lesson: when a renderer migration coexists with legacy visual-evidence tooling, verify that the evidence actually consumes the target runtime backend/assets. A green screenshot job may still capture the old renderer or race asynchronous image decode; inspect pixels and maintain a deterministic asset-level visual fallback tied to the exact runtime manifest.


## Final evidence refresh — same APPROVE verdict

A later QA-only head supersedes the intermediate evidence receipt without changing the approved product candidate or verdict.

- exact product candidate remains: `fe2b505639d8ebf2dc4ab204b545233d96f214f2`;
- final QA-only head: `ac860f2ef320f83a977939483e742472b40389f9`;
- Repository verification #1722 / `35788816202`: **433/433 PASS + build PASS**;
- Character Pipeline V2 #74 / `35788816195`: **PASS**;
- final artifact ID: `10721013048`;
- final artifact digest: `sha256:9fafac53621a87e574f8ab1e20a0e872ae110e00993f7a73acbdc1b84a362b26`;
- direct served-atlas browser capture `sprite-runtime.png` / `sprite-runtime-phone.png` now visibly renders RIGHT idle, LEFT idle, RIGHT Topete and LEFT Ultimate from the actual runtime atlas;
- deterministic `sprite-atlas-evidence.png` independently shows the same four authored states.

The QA-only delta remains confined to validation workflow/tests/evidence tooling. No product file changed after `fe2b5056...`.

Verdict remains: **APPROVE — SPRITE PILOT LIVE INTEGRATION GREEN**.
