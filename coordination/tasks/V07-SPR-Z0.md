# Task V07-SPR-Z0 — Isolated Sprite Pilot Preview

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Owner: Gonza  
Status: VERIFIED

## Goal

Publish an isolated preview of the exact Germinator-approved El Toro sprite-pilot candidate without replacing the production root.

## Dependencies

- SATISFIED — Germinator V07-SPR-G1 approved exact replacement candidate `fe2b505639d8ebf2dc4ab204b545233d96f214f2`.
- Approval scope: isolated sprite-pilot preview only; no production-root promotion.

## Acceptance criteria

- [x] Preview source matches approved candidate exactly.
- [x] All runtime sprite assets resolve.
- [x] Right- and left-facing El Toro states are smoke-tested.
- [x] Existing production root remains unchanged until user/device acceptance.
- [x] Identity Learning Receipt recorded.


## Historical rejected candidate

Do not publish `5c76664fb95ac9c1da019636ce3ad974c214d84c`.

Germinator PR #58 / run `35779776446` proved:
- bilateral package generation itself is green;
- live/default roster omits El Toro;
- default sprite package registry contains no El Toro registration;
- the exact candidate ships no runtime `assets/` root for the build to serve.

Replacement approval is now satisfied by exact `fe2b505639d8ebf2dc4ab204b545233d96f214f2`. This section is retained only to prevent accidental reuse of the rejected `5c76664f...` candidate.


## Approved input

Consume **exact product candidate**:
`fe2b505639d8ebf2dc4ab204b545233d96f214f2`

Do not consume the Germinator QA branch/head.

Required Z0 work:
- build from the exact approved product candidate;
- publish only the isolated sprite-pilot preview;
- prove source → build → served-preview parity;
- smoke-test El Toro RIGHT and authored LEFT in the served game;
- preserve the current production root unchanged;
- hand the preview to the user for physical-phone acceptance.

The canonical production package-format gate remains downstream and does not block this isolated preview.

Final Germinator evidence: Repository #1722 / `35788816202`, Character Pipeline V2 #74 / `35788816195`, artifact `10721013048`.


## Final evidence

- approved product source: `fe2b505639d8ebf2dc4ab204b545233d96f214f2`
- approved product tree: `ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a`
- isolated preview build/verification run: `35790115564` — SUCCESS
- preview artifact ID: `10721593543`
- generated HTML SHA-256: `f9cfc89bd0cc2d909f58388e04186a0e6fe3cf54e1dc098b63ef96c66133724e`
- runtime manifest SHA-256: `c252c60076b0e0e242bb4e37f4b77435be6c1952bfec5164cf82832e3c885876`
- runtime atlas SHA-256: `819a8d3d4f939c2edacc10fe92d09d0c073b41bcfdac3f469a1b6ce79e91d571`
- build manifest/atlas bytes equal approved source bytes
- local served-game P1 El Toro RIGHT: PASS
- local served-game CPU El Toro authored LEFT: PASS
- authored LEFT draw path uses left manifest rects with no horizontal mirror
- gh-pages isolated preview publish SHA: `5f0eed1335a887ec1daea9a42091eb77bdd90ab4`
- Pages deploy run: `35790339751` — SUCCESS
- public served-byte parity run: `35790452035` — SUCCESS
- public P1 El Toro RIGHT: PASS
- public CPU El Toro authored LEFT: PASS
- public manifest + atlas requests: PASS
- production root remains V0.6 blob `bda2d2a16a0cd640f654b3b9c7aef148b7213f38`
- preview URL: https://faustobiancotto10.github.io/Juego-pelea/v07-sprite-preview/

## Remaining downstream gates

- user physical-phone acceptance of this exact isolated preview;
- canonical production package-format reconciliation (`body.webp` + `animations.json`, or explicit contract amendment) before production/full-roster sprite cutover;
- explicit production-cutover decision.

## Identity Learning Review

Receipt: **UPDATED**

Durable Gonza learnings were consolidated into `coordination/agents/gonza.md`: external runtime assets require source→build→served byte parity, and directional/fallback-sensitive renderer migrations require backend-level served-path verification rather than screenshot-only proof.
