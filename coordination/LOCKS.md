# Active Locks

| Path | Owner | Task | Reason |
| --- | --- | --- | --- |

No active locks at round opening.

Ownership reservations are defined in task contracts; an agent creates a live lock only when materially editing a shared file. A green handoff releases its locks unless explicitly stated otherwise.

| src/game/render/ | Mario | V06-M1 | locomotion architecture + three procedural rigs |
| tests/render-v06.test.mjs | Mario | V06-M1 | pose/cadence/planted-foot/render regressions |
| src/game/ui/ | Brancaforte | V06-B1 | fighting-game flow, roster/opponent/stage/result state and UI |
| src/styles.css | Brancaforte | V06-B1 | V0.6 fighting-game front-end responsive/safe-area styling |
| tests/ui-v06.test.mjs | Brancaforte | V06-B1 | V0.6 flow/roster/stage/rematch/landscape contract |
| tests/flow.test.mjs | Brancaforte | V06-B1 | migrate flow regression to title/player/opponent/stage/VS contract |