# Task V07-SPR-G1 — El Toro Sprite Pilot Audit

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Owner: Germinator  
Status: VERIFIED

## Goal

Independently audit the integrated El Toro sprite pilot before any isolated preview is published.

## Approved product candidate

- exact product SHA: `fe2b505639d8ebf2dc4ab204b545233d96f214f2`;
- exact product tree: `ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a`;
- approved V0.7 ancestor: `f34760948cb2024c0c83f4a02202117a8ad3bf2f`.

The earlier candidate `5c76664fb95ac9c1da019636ce3ad974c214d84c` remains rejected and must not be previewed.

## Final verdict

**APPROVE — SPRITE PILOT LIVE INTEGRATION GREEN**

## Final independent evidence

QA-only head:
`ac860f2ef320f83a977939483e742472b40389f9`

Validation PR:
#60 — closed without merge.

Repository verification:
- run number: **#1722**;
- run id: `35788816202`;
- coordination/tooling contract: PASS;
- full suite: **433/433 PASS**;
- build: PASS.

Character Pipeline V2:
- run number: **#74**;
- run id: `35788816195`;
- full suite: PASS;
- build: PASS;
- deterministic sprite visual evidence: PASS;
- runtime raster/reference guard: PASS.

Final visual artifact:
- artifact id: `10721013048`;
- digest: `sha256:9fafac53621a87e574f8ab1e20a0e872ae110e00993f7a73acbdc1b84a362b26`.

## What was independently verified

- four-fighter V0.7 composition is preserved;
- El Toro remains the existing V0.7 fighter and only his body presentation switches to `sprite`;
- default sprite registry resolves `el-toro`;
- browser loader resolves the exact runtime manifest and atlas;
- exact runtime files are copied into `dist/assets/` by the normal build;
- selected-fight loading loads only required sprite packages and rematch reuses the cached package;
- authored RIGHT and LEFT resolve to different atlas frames with no horizontal canvas mirroring;
- all required runtime anchors remain finite in both facings;
- decoded atlas memory remains inside the bounded mobile QA threshold;
- exact served atlas evidence visibly shows RIGHT idle, LEFT idle, RIGHT Topete and LEFT Ultimate;
- garment text remains correctly oriented in both authored facings;
- Topete and Ultimate body poses remain readable without gameplay FX at normal and phone evidence scale.

## QA-only delta

The QA branch is **not** a shipping candidate.

Compared with product SHA `fe2b5056...`, QA head `ac860f2...` changes only:
- `.github/workflows/character-pipeline-v2.yml`;
- `tests/v07-spr-g1-replacement-audit.test.mjs`;
- `tools/character-pipeline-v2/compose-sprite-atlas-evidence.mjs`;
- `tools/character-pipeline-v2/v07-spr-g1-runtime-evidence.html`.

No product/runtime/gameplay source changed during Germinator verification.

## Historical blocker closure

The original G1 blocker was real:
- El Toro omitted from live/default composition;
- sprite package registry empty;
- no build-served runtime asset root;
- wrong product lineage.

Mario-A's replacement exact candidate `fe2b5056...` closes all four.

Several intermediate visual-evidence workflow attempts failed only because Germinator-authored capture harness assumptions were wrong. Product tests/build stayed green. The final static served-atlas evidence removed those harness assumptions and passed.

## Downstream

V07-SPR-Z0 is unlocked.

Gonza may now publish an **isolated sprite-pilot preview only** from exact product SHA `fe2b505639d8ebf2dc4ab204b545233d96f214f2`.

Do not ship the Germinator QA head.

Production-root cutover remains blocked on:
1. served-preview parity/smoke;
2. user physical-phone acceptance;
3. canonical production package-format reconciliation or explicit contract amendment.

## Identity Learning Receipt

UPDATED.
