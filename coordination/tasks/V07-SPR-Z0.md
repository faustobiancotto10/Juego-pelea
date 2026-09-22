# Task V07-SPR-Z0 — Isolated Sprite Pilot Preview

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Owner: Gonza  
Status: BLOCKED

## Goal

Publish an isolated preview of the exact Germinator-approved El Toro sprite-pilot candidate without replacing the production root.

## Dependencies

- BLOCKED — Germinator V07-SPR-G1 returned BLOCK on exact candidate `5c76664fb95ac9c1da019636ce3ad974c214d84c`.
- Required replacement: Mario-A must provide a live-previewable integrated candidate and Germinator must approve that exact SHA.

## Acceptance criteria

- [ ] Preview source matches approved candidate exactly.
- [ ] All runtime sprite assets resolve.
- [ ] Right- and left-facing El Toro states are smoke-tested.
- [ ] Existing production root remains unchanged until user/device acceptance.
- [ ] Identity Learning Receipt recorded.


## Current blocker

Do not publish `5c76664fb95ac9c1da019636ce3ad974c214d84c`.

Germinator PR #58 / run `35779776446` proved:
- bilateral package generation itself is green;
- live/default roster omits El Toro;
- default sprite package registry contains no El Toro registration;
- the exact candidate ships no runtime `assets/` root for the build to serve.

Resume only after V07-SPR-G1 approval on a replacement exact candidate.
