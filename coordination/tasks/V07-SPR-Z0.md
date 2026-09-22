# Task V07-SPR-Z0 — Isolated Sprite Pilot Preview

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Owner: Gonza  
Status: WORKING

## Goal

Publish an isolated preview of the exact Germinator-approved El Toro sprite-pilot candidate without replacing the production root.

## Dependencies

- SATISFIED — Germinator V07-SPR-G1 approved exact replacement candidate `fe2b505639d8ebf2dc4ab204b545233d96f214f2`.
- Approval scope: isolated sprite-pilot preview only; no production-root promotion.

## Acceptance criteria

- [ ] Preview source matches approved candidate exactly.
- [ ] All runtime sprite assets resolve.
- [ ] Right- and left-facing El Toro states are smoke-tested.
- [ ] Existing production root remains unchanged until user/device acceptance.
- [ ] Identity Learning Receipt recorded.


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
