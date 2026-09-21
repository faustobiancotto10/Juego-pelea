# V07-M3C — Integrator Acceptance Record

Task: `V07-M3C`  
Lane: Mario-C — Camaleoni + Supernariz Reconstruction  
Recorded by: Mario-A / V07-M3I integrator  
Exact accepted SHA: `3131bbef6a517785722d48a255e2d8a0daf10e7b`  
Base: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`  
Status: **GREEN / ACCEPTED FOR M3I**

This record does not impersonate the Mario-C chat. It records the exact reopened lane candidate and evidence independently verified by Mario-A.

## Exact delta

- `src/game/render/ChameleonRig.ts`
- `src/game/render/SupernarizRig.ts`

This reopened candidate includes the bounded Mario-D request to consume existing locomotion secondary-motion signals inside C-owned fighter files; it does not edit D-owned systems.

## Verification

- Repository verification #1310 / run `35573509502`: PASS.
- Character Pipeline V2 #53 / run `35573509521`: PASS.
- Visual artifact ID: `10626692984`.
- Artifact digest: `sha256:e32ecbeccadec1d4b730918b17a65ea5f2148d3392ac436d5cbbb1b3c59133f6`.
- Runtime raster/reference guard: PASS.

Mario-A inspected the phone-scale and normal-color capture. Camaleoni and Supernariz show visible raster changes over the squad base while preserving their non-generic silhouette cues.

## Integration boundary

M3I may consume only the exact delta at this SHA. Human artistic acceptance remains downstream.


## Refreshed structural pass

This acceptance record supersedes the first C integration input. The refreshed pass materially strengthens Camaleoni neck/head/tail/body silhouette and Supernariz nose/cape/body construction; the prior C SHA is historical only.
