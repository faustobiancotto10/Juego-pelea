# Handoff — V07-SPR-Z0 Gonza

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-SPR-Z0 — Isolated Sprite Pilot Preview  
From: Gonza  
To: User/device acceptance → Neureon cutover decision  
Verdict: **GREEN / HANDOFF_READY**

## Exact approved product

`fe2b505639d8ebf2dc4ab204b545233d96f214f2`

Tree:
`ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a`

Germinator QA head was not shipped.

## Preview publication

- URL: https://faustobiancotto10.github.io/Juego-pelea/v07-sprite-preview/
- gh-pages SHA: `5f0eed1335a887ec1daea9a42091eb77bdd90ab4`
- Pages run: `35790339751` — SUCCESS
- production root remains unchanged at V0.6 blob `bda2d2a16a0cd640f654b3b9c7aef148b7213f38`

## Source → build → served parity

Build/verification run:
`35790115564` — SUCCESS

Hashes:
- HTML: `f9cfc89bd0cc2d909f58388e04186a0e6fe3cf54e1dc098b63ef96c66133724e`
- manifest: `c252c60076b0e0e242bb4e37f4b77435be6c1952bfec5164cf82832e3c885876`
- body atlas: `819a8d3d4f939c2edacc10fe92d09d0c073b41bcfdac3f469a1b6ce79e91d571`

Manifest and atlas build bytes exactly match approved product source bytes.

Public served verification:
`35790452035` — SUCCESS

- public HTML byte parity: PASS
- public manifest byte parity: PASS
- public atlas byte parity: PASS
- runtime asset requests: PASS

## RIGHT / LEFT runtime smoke

Actual game path was instrumented at Canvas2D draw time against the served manifest.

- El Toro as P1: authored RIGHT atlas frame used — PASS
- El Toro as CPU: authored LEFT atlas frame used — PASS
- authored LEFT path used left-animation source rectangles — PASS
- no horizontal mirror on authored LEFT — PASS

## Known risks / downstream gates

1. Physical iPhone decode/load/render performance remains unverified by cloud CI.
2. User must accept the sprite-pilot visuals/feel on the exact preview above.
3. Pilot filenames/encoding are still pre-cutover (`el-toro-body.png`, `el-toro-animations.json`); canonical production format requires `body.webp` + `animations.json` or an explicit Neureon amendment before production/full-roster cutover.
4. Production-root promotion is not authorized by this handoff.

## Requested next action

User tests the exact isolated preview on a physical phone. If accepted, proceed to production-format reconciliation and explicit production-cutover decision; do not silently promote root.

## Identity Learning Review

Receipt: **UPDATED**

Gonza durable role memory now records:
- parity for asset-backed releases must cover every separately served runtime asset, not only HTML/bundle;
- directional/fallback-sensitive renderer migrations should be verified on the actual served backend path, not from screenshots alone.
