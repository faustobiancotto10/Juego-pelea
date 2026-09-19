# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R001-V03-COMBAT-EXPANSION | N-001 | BLOCKED | keep PAUSED until Ricardo posts exact tuning/checkpoint evidence and Germinator validates | Ricardo API mismatch fixed and V0.3 gameplay tests now exist; recovery nearly complete |
| Ricardo | Gameplay Engineer | R001-V03-COMBAT-EXPANSION | R-101 | WAITING | Germinator must validate exact SHA 7138ec09; Neureon controls resume from PAUSED | CI-green checkpoint + tuning + formal G-401 handoff published |
| Mario | Character / Rendering Engineer | R001-V03-COMBAT-EXPANSION | M-201 | WAITING | global PAUSED; Ricardo simulation + API fix + V0.3 tests landed, awaiting tuning checkpoint, Germinator validation and Neureon reactivation | renderer tip 7b392f419668ad6d856c25fe763a494704c92a28; render contract accepted and ready to wire |
| Brancaforte | UI / Input / UX Engineer | R001-V03-COMBAT-EXPANSION | B-301 | WAITING | Ricardo InputFrame/snapshot contract implementation | input/UI contract tests and owned implementation progressed; final compatibility blocked on Ricardo |
| Germinator | Auditor / QA | R001-V03-COMBAT-EXPANSION | G-401 | WAITING | global PAUSED; frozen SHA 7138ec09 technically validated, awaiting tuning-table publication/reconciliation and ACTIVE resume | CI #116 independently verified; recovery contract/build accepted; adversarial slot-order/corner/behind/low-GUARD coverage remains for full QA |
| Gonza | Integration / Release | R001-V03-COMBAT-EXPANSION | Z-501 | WAITING | accepted Ricardo checkpoint and downstream handoffs required | integration policy/audit complete; no feature integration performed prematurely |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
