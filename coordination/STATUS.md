# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R001-V03-COMBAT-EXPANSION | N-001 | VERIFIED | none | archive prepared; QA/release evidence complete; issuing ROUND_COMPLETE |
| Ricardo | Gameplay Engineer | R001-V03-COMBAT-EXPANSION | R-101 | VERIFIED | none | accepted gameplay checkpoint 7138ec09 shipped |
| Mario | Character / Rendering Engineer | R001-V03-COMBAT-EXPANSION | M-201 | VERIFIED | none | renderer checkpoint a9bc9b35 shipped |
| Brancaforte | UI / Input / UX Engineer | R001-V03-COMBAT-EXPANSION | B-301 | VERIFIED | none | clean input/UI checkpoint 98290a60 shipped |
| Germinator | Auditor / QA | R001-V03-COMBAT-EXPANSION | G-401 | VERIFIED | none | PASS FOR INTEGRATION; adversarial CI green |
| Gonza | Integration / Release | R001-V03-COMBAT-EXPANSION | Z-501 | VERIFIED | none | main e16b2cb0 + gh-pages fa2192d8 deployed and verified |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
