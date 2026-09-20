# Active Locks

| Path | Owner | Task | Reason |
| --- | --- | --- | --- |

No active locks at round opening.

Ownership reservations are defined in task contracts; an agent creates a live lock only when materially editing a shared file. A green handoff releases its locks unless explicitly stated otherwise.
| src/game/types.ts | Ricardo | V06-R2 | multi-hit/projectile/cap snapshot and event contracts |
| src/game/data/** | Ricardo | V06-R2 | Juanchi package, returning projectile and cap Ultimate definitions |
| src/game/simulation/moves.ts | Ricardo | V06-R2 | authored multi-hit windows normalization contract |
| src/game/simulation/CombatSimulation.ts | Ricardo | V06-R2 | multi-hit, returning projectile, capCapture lifecycle |
| src/game/simulation/CpuController.ts | Ricardo | V06-R2 | data-driven Juanchi tactics/resource legality |
| src/game/simulation/ultimateArbitration.ts | Ricardo | V06-R2 | capCapture confrontation volume |
| tests/combat-v06-juanchi.test.mjs | Ricardo | V06-R2 | Juanchi primitive acceptance matrix |
