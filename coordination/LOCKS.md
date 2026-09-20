# Active Locks

| Path | Owner | Task | Reason |
| --- | --- | --- | --- |

No active locks at round opening.

Ownership reservations are defined in task contracts; an agent creates a live lock only when materially editing a shared file. A green handoff releases its locks unless explicitly stated otherwise.
| src/game/types.ts | Ricardo | V06-R3 | jump preparation snapshot/event contract |
| src/game/data/characters/camaleoni.ts | Ricardo | V06-R3 | approved Lengua candidate + tactics metadata |
| src/game/data/characters/supernariz.ts | Ricardo | V06-R3 | tactics metadata only if needed |
| src/game/data/characters/juanchi.ts | Ricardo | V06-R3 | tactics follow-through only if needed |
| src/game/simulation/CombatSimulation.ts | Ricardo | V06-R3 | two-tick jump preparation and Ultimate evade timing |
| src/game/simulation/CpuController.ts | Ricardo | V06-R3 | content-aware tactics follow-through |
| tests/combat-v06-followthrough.test.mjs | Ricardo | V06-R3 | bounded balance/movement acceptance and scenario corpus |
