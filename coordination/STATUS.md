# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R001-V03-COMBAT-EXPANSION | N-001 | WORKING | none | resolved ultimate spend/lock, Push Guard routing, input exclusivity, cooldown and balance-evidence contract boundaries |
| Ricardo | Gameplay Engineer | R001-V03-COMBAT-EXPANSION | R-101 | WORKING | none | PRESENT; begin shared combat state/action/event contract |
| Mario | Character / Rendering Engineer | R001-V03-COMBAT-EXPANSION | M-201 | WORKING | waiting on Ricardo shared-type/move-ID checkpoint for ultimates + Push Guard | guard-break feedback bounded; Coletazo/Tramontana procedural presentation committed on round/r001-mario |
| Brancaforte | UI / Input / UX Engineer | R001-V03-COMBAT-EXPANSION | B-301 | WORKING | state-dependent work waits on reviewed Ricardo contract | PRESENT; inspect input/UI path and review contract when posted |
| Germinator | Auditor / QA | R001-V03-COMBAT-EXPANSION | G-401 | WORKING | executable harness still waits on Ricardo gameplay checkpoint SHA | quantified SUPER economy + melee/threat-space baseline; contract ambiguities and QA checkpoint requested |
| Gonza | Integration / Release | R001-V03-COMBAT-EXPANSION | Z-501 | WORKING | final integration waits on accepted handoffs | PRESENT; begin integration-risk review |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
