# Active Locks

| Path / subsystem | Owner | Task | Reason |
| --- | --- | --- | --- |
| `src/game/render/FightRenderer.ts` | Mario-D | V07-M3D | Shared dispatch for render-only attack timing envelopes/telegraphs. |
| `tests/v07-m3d-motion-fx.test.mjs` | Mario-D | V07-M3D | Lane-specific regression coverage for motion signatures and FX envelopes. |
| `src/game/render/LocomotionPose.ts` | Mario-D | V07-M3D | Shared travel-driven gait and fighter-specific motion signatures. |
| `src/game/render/PresentationPose.ts` | Mario-D | V07-M3D | Shared action phase/body-language presentation. |
| `src/game/render/AttackPresentation.ts` | Mario-D | V07-M3D | Render-only attack presentation profiles and timing interpretation. |
| `src/game/render/CombatEffects.ts` | Mario-D | V07-M3D | Shared combat FX, trails, contact bursts and aura presentation. |
| `src/game/render/CharacterStructure.ts` | Mario-A | V07-M3A | Shared character structure / anatomy architecture audit and improvement. |
| `src/game/render/ReferenceDetailPrimitives.ts` | Mario-A | V07-M3A | Shared reusable visual-detail/material primitives. |
| `src/game/render/RigAnchors.ts` | Mario-A | V07-M3A | Shared renderer anchor contract inspection; no gameplay authority. |
| `src/game/render/VisualQualityGates.ts` | Mario-A | V07-M3A | Inspectable silhouette/identity/gameplay-scale gate harness. |
| `tests/v07-m3a-visual-architecture.test.mjs` | Mario-A | V07-M3A | Automated architecture/gate contract coverage. |
| `src/game/render/ElToroRig.ts` | Mario-B | V07-M3B | Fighter-specific El Toro reference-fidelity reconstruction. |
| `src/game/render/JuanchiRig.ts` | Mario-B | V07-M3B | Fighter-specific Juanchi reference-fidelity reconstruction. |

V07-M3 current reference-fidelity candidate `032b1bb28c5dd4421e5772cc40ab007f42e4d462` is GREEN at Character Pipeline V2 run #36 / `35567747782` (336/336 + build + visual artifact + raster guard). Mario released all M3R renderer locks; Germinator V07-G2 is eligible. Initial structural candidate `e053e0b187acff3b4555ce8d537e9fd9ca616303` is historical.

V07-M1 exact candidate `d55cce8ce7f03a60168697a5a5bbe1c8b5833a24` is GREEN at verification run #1079 (305/305 + build).

V07-M2 exact candidate `a47326093ae004c602e00112ac2ed2226cf738c8` is GREEN at verification run #1113 (314/314 + build). Mario released all M2 locks after restoring the normal verification workflow.

V07-B1 exact candidate `9688764c7fb4c61a6b7462c6b34265f328e28a4d` is GREEN at repository verification run #1127. Mario M2 exact SHA `a47326093ae004c602e00112ac2ed2226cf738c8` is an ancestor of the B1 candidate; Brancaforte released all B1 locks.

V07-Z1 publication lock released after user rejected the preview. No production-root promotion is authorized.
V07-M3 works on `repair/v07-character-pipeline-v2`; Mario must claim concrete renderer/profile file locks before edits.


## Mario squad planned ownership

No squad lane has a live file lock until its chat instance registers and begins work. Planned boundaries:

- Mario-A / V07-M3A: shared character-structure / anatomy / silhouette primitives and visual-quality harnesses.
- Mario-B / V07-M3B: `ElToroRig.ts`, `JuanchiRig.ts`, and B-only fighter-detail helpers.
- Mario-C / V07-M3C: `ChameleonRig.ts`, `SupernarizRig.ts`, and C-only fighter-detail helpers.
- Mario-D / V07-M3D: shared locomotion / presentation pose / attack presentation / combat effects files.
- Mario-A / V07-M3I: integration branch only after all four lane handoffs are green.

Each instance must convert its planned boundary into concrete live locks before material edits. Cross-lane file edits require a forum request and explicit lock transfer/resolution.
