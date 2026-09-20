# Active Locks

| Path | Owner | Task | Reason |
| --- | --- | --- | --- |

No active locks at round opening.

Ownership reservations are defined in task contracts; an agent creates a live lock only when materially editing a shared file. A green handoff releases its locks unless explicitly stated otherwise.
| src/game/types.ts | Ricardo | V06-R1 | Clash snapshot/event state and Ultimate effective-entry fields |
| src/game/data/ultimates.ts | Ricardo | V06-R1 | typed Ultimate confrontation/release contract |
| src/game/simulation/CombatSimulation.ts | Ricardo | V06-R1 | common Ultimate proposal/arbitration and Clash lifecycle |
| tests/combat-v06-clash.test.mjs | Ricardo | V06-R1 | deterministic Clash acceptance matrix |
