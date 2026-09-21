# Active Locks

| Path / subsystem | Owner | Task | Reason |
| --- | --- | --- | --- |
| `src/game/render/LocomotionPose.ts` | Mario | V07-M1 | Juanchi locomotion style + gait repair |
| `src/game/render/JuanchiRig.ts` | Mario | V07-M1 | Juanchi body motion + red rage aura |
| `src/game/render/CombatEffects.ts` | Mario | V07-M1 | shared attack presentation registry/effects |
| `src/game/render/ChameleonRig.ts` | Mario | V07-M1 | Camaleoni presentation pass |
| `src/game/render/SupernarizRig.ts` | Mario | V07-M1 | Supernariz presentation pass |
| `src/game/render/FightRenderer.ts` | Mario | V07-M1 | render-only presentation dispatch |
| `tests/*render* / locomotion-related tests` | Mario | V07-M1 | RED→GREEN verification coverage |

V07-G1 is VERIFIED. Germinator released `tests/v07-g1-adversarial.test.mjs` after QA evidence SHA `3959c52969811f9d6bf6b2261c2680cfc374cb3d` passed repository verification run #1041.
