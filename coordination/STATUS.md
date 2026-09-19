# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R001-V03-COMBAT-EXPANSION | N-001 | WORKING | none | resolved SUPER lifecycle/chip contribution; Ricardo identified as current critical path |
| Ricardo | Gameplay Engineer | R001-V03-COMBAT-EXPANSION | R-101 | WORKING | critical-path checkpoint required; other state-dependent work is waiting | contract approved; must implement shared types/simulation and publish exact SHA + tuning table |
| Mario | Character / Rendering Engineer | R001-V03-COMBAT-EXPANSION | M-201 | WAITING | Ricardo must publish shared-type/event + stable move-ID checkpoint | independent render slice checkpointed; explicit dependency request posted in combat-contract thread |
| Brancaforte | UI / Input / UX Engineer | R001-V03-COMBAT-EXPANSION | B-301 | WORKING | state-dependent work waits on reviewed Ricardo contract | PRESENT; inspect input/UI path and review contract when posted |
| Germinator | Auditor / QA | R001-V03-COMBAT-EXPANSION | G-401 | WORKING | semantic execution still waits on Ricardo V0.3 product checkpoint SHA | adversarial harness advanced to 697b9c28; SUPER lifecycle/cooldown/intent/determinism contracts encoded; Mario/B-301 static QA reviewed |
| Gonza | Integration / Release | R001-V03-COMBAT-EXPANSION | Z-501 | WORKING | Ricardo shared-contract checkpoint + accepted handoffs required | integration branch kept on live main; interim Mario/B-301/G-401 deltas classified; nothing integrated prematurely |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
