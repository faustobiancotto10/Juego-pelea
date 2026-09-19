# Active Locks
| Path | Owner | Task | Reason |
| --- | --- | --- | --- |

Reservations for later stages do not authorize work before Neureon opens the gate.
| src/game/types.ts | Ricardo | V05-R3 | C1/C2 command and contact contracts |
| src/game/simulation/CombatSimulation.ts | Ricardo | V05-R3 | command buffer, routes, grammar, meter/recovery |
| src/game/simulation/moves.ts | Ricardo | V05-R3 | lows and move tuning |
| src/game/data/fighterKits.ts | Ricardo | V05-R3 | final low/special kit grammar |
| src/game/data/projectiles.ts | Ricardo | V05-R3 | projectile commitment/economy data if required |
| tests/combat-v05-input.test.mjs | Ricardo | V05-R3 | command buffer regression |
| tests/combat-v05-melee.test.mjs | Ricardo | V05-R3 | true combo and low-normal evidence |
| tests/combat-v05-specials.test.mjs | Ricardo | V05-R3 | special/meter/push-guard evidence |
| tests/fighter-mechanics.test.mjs | Ricardo | V05-R3 | deliberate final grammar updates |
| tests/combat-v02.test.mjs | Ricardo | V05-R3 | replace obsolete low-tongue expectations |
| tests/combat-v03.test.mjs | Ricardo | V05-R3 | update mapping/meter expectations |
| tests/combat-v04.test.mjs | Ricardo | V05-R3 | update mapping/tuning assumptions |
| src/game/data/combatRegistry.ts | Ricardo | V05-R3 | remove temporary R2 legacy binding validation at final kit freeze |
| tests/fixtures/v05-registry.mjs | Ricardo | V05-R3 | keep injected registry fixture valid under mandatory low-slot contract |
| tests/fighter-registry-v05.test.mjs | Ricardo | V05-R3 | migrate R2 trace fixture expectations to intentional R3 tuning while preserving registry proof |
| tests/simulation.test.mjs | Ricardo | V05-R3 | update generic damage regression to final Lengua tuning |
| tests/polish.test.mjs | Ricardo | V05-R3 | preserve round-reset projectile regression under later Chorizo spawn timing |
