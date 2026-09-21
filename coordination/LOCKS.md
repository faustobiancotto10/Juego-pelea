# Active Locks

| Path / subsystem | Owner | Task | Reason |
| --- | --- | --- | --- |
| `src/game/render/CharacterStructure.ts` | Mario | V07-M3R | User-directed reference fidelity repair |
| `src/game/render/ElToroRig.ts` | Mario | V07-M3R | Re-author against supplied El Toro master/sheet |
| `src/game/render/JuanchiRig.ts` | Mario | V07-M3R | Re-author against supplied Juanchi master/sheet |
| `src/game/render/SupernarizRig.ts` | Mario | V07-M3R | Re-author against supplied Supernariz master/sheet |
| `src/game/render/ChameleonRig.ts` | Mario | V07-M3R | Re-author against supplied Camaleoni master/sheet |
| `src/game/render/PortraitRenderer.ts` | Mario | V07-M3R | Keep portrait identity aligned with runtime rigs |

V07-M3 exact candidate `e053e0b187acff3b4555ce8d537e9fd9ca616303` is GREEN at Repository verification #1171 and Character Pipeline V2 run #15 (335/335 + build + visual artifact + raster guard). Mario released all M3 locks; Germinator V07-G2 is eligible.

V07-M1 exact candidate `d55cce8ce7f03a60168697a5a5bbe1c8b5833a24` is GREEN at verification run #1079 (305/305 + build).

V07-M2 exact candidate `a47326093ae004c602e00112ac2ed2226cf738c8` is GREEN at verification run #1113 (314/314 + build). Mario released all M2 locks after restoring the normal verification workflow.

V07-B1 exact candidate `9688764c7fb4c61a6b7462c6b34265f328e28a4d` is GREEN at repository verification run #1127. Mario M2 exact SHA `a47326093ae004c602e00112ac2ed2226cf738c8` is an ancestor of the B1 candidate; Brancaforte released all B1 locks.

V07-Z1 publication lock released after user rejected the preview. No production-root promotion is authorized.
V07-M3 works on `repair/v07-character-pipeline-v2`; Mario must claim concrete renderer/profile file locks before edits.
