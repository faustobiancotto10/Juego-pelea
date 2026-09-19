# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R001-V03-COMBAT-EXPANSION | N-001 | WORKING | none | all PRESENT verified; stale check-in state reconciled; START_ROUND issued |
| Ricardo | Gameplay Engineer | R001-V03-COMBAT-EXPANSION | R-101 | WORKING | none | PRESENT; begin shared combat state/action/event contract |
| Mario | Character / Rendering Engineer | R001-V03-COMBAT-EXPANSION | M-201 | WORKING | state-dependent work waits on reviewed Ricardo contract | PRESENT; inspect render path and review contract when posted |
| Brancaforte | UI / Input / UX Engineer | R001-V03-COMBAT-EXPANSION | B-301 | WORKING | state-dependent work waits on reviewed Ricardo contract | PRESENT; inspect input/UI path and review contract when posted |
| Germinator | Auditor / QA | R001-V03-COMBAT-EXPANSION | G-401 | WORKING | executable V0.3 harness waits on Ricardo gameplay checkpoint SHA | contract review + adversarial matrix posted; dedicated harness locked; QA branch aligned to main |
| Gonza | Integration / Release | R001-V03-COMBAT-EXPANSION | Z-501 | WORKING | final integration waits on accepted handoffs | PRESENT; begin integration-risk review |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
