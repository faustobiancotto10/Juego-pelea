# Active Locks
| Path | Owner | Task | Reason |
| --- | --- | --- | --- |

Reservations for later stages do not authorize work before Neureon opens the gate.
| src/game/types.ts | Ricardo | V05-R4 | landing and Ultimate release snapshot/event contract |
| src/game/simulation/CombatSimulation.ts | Ricardo | V05-R4 | air carry, facing lock, landing recovery, Ultimate exit |
| src/game/simulation/moves.ts | Ricardo | V05-R4 | airborne motion metadata only if required |
| src/game/data/ultimates.ts | Ricardo | V05-R4 | successful release/launch tuning |
| tests/combat-v05-air.test.mjs | Ricardo | V05-R4 | aerial commitment and landing acceptance |
| tests/combat-v05-ultimate.test.mjs | Ricardo | V05-R4 | Ultimate release/separation acceptance |
| tests/combat-v02.test.mjs | Ricardo | V05-R4 | migrate crossover-facing expectation to takeoff/landing lock contract |
| tests/combat-v03.test.mjs | Ricardo | V05-R4 | migrate Ultimate startup/capture timing scenarios |
| tests/combat-v04.test.mjs | Ricardo | V05-R4 | migrate successful Ultimate release/actionability regression |
| tests/combat-v02.test.mjs | Ricardo | V05-R4 | migrate crossover facing assertion to grounded-actionable reorientation |
| tests/combat-v03.test.mjs | Ricardo | V05-R4 | migrate Ultimate timing/capture regressions to authored 22/24 startup |
| tests/combat-v04.test.mjs | Ricardo | V05-R4 | migrate authoritative capture/release timing regression |
