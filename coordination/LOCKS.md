# Active Locks

| Path / subsystem | Owner | Task | Reason |
| --- | --- | --- | --- |
| `src/game/render/CharacterStructure.ts` | Mario | V07-M3 | structural rig/profile authority |
| `src/game/render/ChameleonRig.ts` | Mario | V07-M3 | re-author Camaleoni anatomy/silhouette |
| `src/game/render/SupernarizRig.ts` | Mario | V07-M3 | re-author Supernariz anatomy/silhouette |
| `src/game/render/JuanchiRig.ts` | Mario | V07-M3 | re-author Juanchi anatomy/silhouette |
| `src/game/render/ElToroRig.ts` | Mario | V07-M3 | re-author El Toro anatomy/silhouette |
| `src/game/render/PortraitRenderer.ts` | Mario | V07-M3 | derive portraits from structural profiles |
| `src/game/render/LocomotionPose.ts` | Mario | V07-M3 | identity-specific mass/posture locomotion |
| `tests/v07-m3-character-pipeline.test.mjs` | Mario | V07-M3 | structural differentiation acceptance |
| `.github/workflows/character-pipeline-v2.yml` | Mario | V07-M3 | repair false-negative toolchain verification (`synfig --version` exits 3) |
| `tools/character-pipeline-v2/visual-evidence.html` | Mario | V07-M3 | render-only neutral/silhouette/mobile evidence harness |

V07-M1 exact candidate `d55cce8ce7f03a60168697a5a5bbe1c8b5833a24` is GREEN at verification run #1079 (305/305 + build).

V07-M2 exact candidate `a47326093ae004c602e00112ac2ed2226cf738c8` is GREEN at verification run #1113 (314/314 + build). Mario released all M2 locks after restoring the normal verification workflow.

V07-B1 exact candidate `9688764c7fb4c61a6b7462c6b34265f328e28a4d` is GREEN at repository verification run #1127. Mario M2 exact SHA `a47326093ae004c602e00112ac2ed2226cf738c8` is an ancestor of the B1 candidate; Brancaforte released all B1 locks.

V07-Z1 publication lock released after user rejected the preview. No production-root promotion is authorized.
V07-M3 works on `repair/v07-character-pipeline-v2`; Mario must claim concrete renderer/profile file locks before edits.
