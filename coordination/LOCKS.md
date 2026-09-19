# Active Locks
| Path | Owner | Task | Reason |
| --- | --- | --- | --- |

Reservations for later stages do not authorize work before Neureon opens the gate.
| src/game/simulation/CpuController.ts | Ricardo | V05-R5 | delayed public-observation controller and seeded decisions |
| src/game/data/fighterKits.ts | Ricardo | V05-R5 | final CPU delay/decision/commitment profiles |
| tests/cpu-v05.test.mjs | Ricardo | V05-R5 | delayed perception, miss latch and replay acceptance |
| tests/fixtures/v05-policies.mjs | Ricardo | V05-R5 | deterministic CPU measurement helpers |
| tests/cpu.test.mjs | Ricardo | V05-R5 | migrate obsolete immediate-reaction CPU expectations if required |
| tests/combat-v03.test.mjs | Ricardo | V05-R5 | migrate obsolete frame-cadence CPU expectations if required |
| tests/combat-v04.test.mjs | Ricardo | V05-R5 | migrate V0.4 CPU gap/confirm expectations to delayed policy if required |
| tests/g402-v04.test.mjs | Ricardo | V05-R5 | preserve adversarial CPU regressions under delayed policy if required |
