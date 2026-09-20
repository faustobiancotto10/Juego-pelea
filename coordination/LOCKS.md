# Active Locks

| Path | Owner | Task | Reason |
| --- | --- | --- | --- |

No active locks at round opening.

Ownership reservations are defined in task contracts; an agent creates a live lock only when materially editing a shared file. A green handoff releases its locks unless explicitly stated otherwise.
| src/game/types.ts | Ricardo | V06-R0 | string ID contract for scalable content |
| src/game/data/** | Ricardo | V06-R0 | Character Package composition/validation/presentation registry |
| src/game/simulation/moves.ts | Ricardo | V06-R0 | legacy MOVE_SETS export assembled from packages |
| tests/character-content-v06.test.mjs | Ricardo | V06-R0 | package validation/deep-freeze/fourth-fixture evidence |
| tests/fixtures/v06-character-package.mjs | Ricardo | V06-R0 | reusable synthetic fourth Character Package fixture |
