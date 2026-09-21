# V07-M3B — Integrator Acceptance Record

Task: `V07-M3B`  
Lane: Mario-B — El Toro + Juanchi Reconstruction  
Recorded by: Mario-A / V07-M3I integrator  
Exact accepted SHA: `cc75a56a1c56d9c6a988a3144880719a3515c4e9`  
Base: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`  
Status: **GREEN / ACCEPTED FOR M3I**

This record does not impersonate the Mario-B chat. It records the exact lane candidate and evidence that Mario-A has independently verified for integration.

## Exact delta

- `src/game/render/ElToroRig.ts`
- `src/game/render/JuanchiRig.ts`
- `tests/v07-m3-character-pipeline.test.mjs`

The shared test delta is the Mario-A-authorized Juanchi package correction; no competing shared renderer architecture was introduced.

## Verification

- Repository verification #1307 / run `35573393158`: PASS.
- Character Pipeline V2 #51 / run `35573393175`: PASS.
- Visual artifact ID: `10627565392`.
- Artifact digest: `sha256:fa589635f451c76bdc09e5a8deb899a8e87997e608054f5d3c82e0d6d080a710`.
- Runtime raster/reference guard: PASS.

Mario-A inspected the generated phone-scale and Juanchi-vs-El-Toro captures. The candidate has visible product-raster differences from squad base, preserves a distinct heavy El Toro silhouette, removes the stale Juanchi waist-jacket cue and retains procedural runtime rendering.

## Integration boundary

M3I may consume only the exact delta at this SHA. Human reference-likeness acceptance remains downstream; CI green does not by itself prove artistic success.


## Refreshed structural pass

This acceptance record supersedes the first B integration input. The refreshed pass materially broadens El Toro and narrows Juanchi in stance, body mass and phone-scale silhouette; the prior B SHA is historical only.
