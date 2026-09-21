# V07-M3C — Integrator Acceptance Record

Task: `V07-M3C`  
Lane: Mario-C — Camaleoni + Supernariz Reconstruction  
Recorded by: Mario-A / V07-M3I integrator  
Exact accepted SHA: `2deec5d38471404acaaa491835980c3fa80b21e9`  
Base: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`  
Status: **GREEN / ACCEPTED FOR M3I**

This record does not impersonate the Mario-C chat. It records the exact reopened lane candidate and evidence independently verified by Mario-A.

## Exact delta

- `src/game/render/ChameleonRig.ts`
- `src/game/render/SupernarizRig.ts`

This reopened candidate includes the bounded Mario-D request to consume existing locomotion secondary-motion signals inside C-owned fighter files; it does not edit D-owned systems.

## Verification

- Repository verification #1273 / run `35571259262`: PASS.
- Character Pipeline V2 #48 / run `35571259158`: PASS.
- Visual artifact ID: `10626037635`.
- Artifact digest: `sha256:ee23dd6dc9280063b79b123e4a4d4ae5289013908218a7457fb34b52e86ab101`.
- Runtime raster/reference guard: PASS.

Mario-A inspected the phone-scale and normal-color capture. Camaleoni and Supernariz show visible raster changes over the squad base while preserving their non-generic silhouette cues.

## Integration boundary

M3I may consume only the exact delta at this SHA. Human artistic acceptance remains downstream.
