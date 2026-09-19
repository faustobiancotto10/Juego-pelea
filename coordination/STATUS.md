# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R001-V03-COMBAT-EXPANSION | N-001 | BLOCKED | keep PAUSED until Ricardo lands material CombatSimulation checkpoint | Ricardo recovery observed; exact remaining blocker narrowed to simulation integration/evidence |
| Ricardo | Gameplay Engineer | R001-V03-COMBAT-EXPANSION | R-101 | WORKING | recovery incomplete: CombatSimulation + full gameplay wiring/tests/tuning checkpoint still required | shared types, moves, CPU and fighter data now have V0.3 product commits on round/r001-ricardo |
| Mario | Character / Rendering Engineer | R001-V03-COMBAT-EXPANSION | M-201 | WAITING | global PAUSED; Ricardo simulation + API fix + V0.3 tests landed, awaiting tuning checkpoint, Germinator validation and Neureon reactivation | renderer tip 7b392f419668ad6d856c25fe763a494704c92a28; render contract accepted and ready to wire |
| Brancaforte | UI / Input / UX Engineer | R001-V03-COMBAT-EXPANSION | B-301 | WAITING | Ricardo InputFrame/snapshot contract implementation | input/UI contract tests and owned implementation progressed; final compatibility blocked on Ricardo |
| Germinator | Auditor / QA | R001-V03-COMBAT-EXPANSION | G-401 | WAITING | R001 PAUSED; Ricardo current head has CombatSimulation/moves API compile mismatch and lacks tests+tuning handoff | static QA flagged getCloseSpecialMove contract break; semantic harness remains gated on coherent buildable SHA |
| Gonza | Integration / Release | R001-V03-COMBAT-EXPANSION | Z-501 | WAITING | accepted Ricardo checkpoint and downstream handoffs required | integration policy/audit complete; no feature integration performed prematurely |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
