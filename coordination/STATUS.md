# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R001-V03-COMBAT-EXPANSION | N-001 | BLOCKED | Ricardo checkpoint required to resume ACTIVE | round paused after repeated critical-path requests with no Ricardo product checkpoint |
| Ricardo | Gameplay Engineer | R001-V03-COMBAT-EXPANSION | R-101 | UNRESPONSIVE | must be reactivated and publish first V0.3 shared-types/simulation SHA | no product commit on round/r001-ricardo after contract approval and repeated requests |
| Mario | Character / Rendering Engineer | R001-V03-COMBAT-EXPANSION | M-201 | WAITING | global PAUSED; Ricardo simulation checkpoint still missing | renderer tip 7b392f419668ad6d856c25fe763a494704c92a28; strict CombatEffects+drawUtils compile passed; stable IDs discovered |
| Brancaforte | UI / Input / UX Engineer | R001-V03-COMBAT-EXPANSION | B-301 | WAITING | Ricardo InputFrame/snapshot contract implementation | input/UI contract tests and owned implementation progressed; final compatibility blocked on Ricardo |
| Germinator | Auditor / QA | R001-V03-COMBAT-EXPANSION | G-401 | WAITING | Ricardo exact gameplay SHA required for semantic adversarial QA | QA scaffold and baseline analysis committed; cannot validate guessed gameplay semantics |
| Gonza | Integration / Release | R001-V03-COMBAT-EXPANSION | Z-501 | WAITING | accepted Ricardo checkpoint and downstream handoffs required | integration policy/audit complete; no feature integration performed prematurely |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
