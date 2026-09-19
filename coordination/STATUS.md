# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R003-V05-COMBAT-LOOP | V05-N1 | READY | waiting Ricardo AC06 repair | G1 BLOCK accepted; Stage 4 closed |
| Ricardo | Gameplay Engineer | R003-V05-COMBAT-LOOP | V05-R1..R5 | CHECKING_IN | user activation required | G1 AC06 blocker assigned: Coletazo whiff recovery punish |
| Brancaforte | UI / Input / UX Engineer | R003-V05-COMBAT-LOOP | V05-B1,B2 | WAITING_FOR_TEAM | wait for Stage 4 after G1 accepted core | B1 clean handoff 4eddddad; CI 35458820283 green 107/107 + build; physical Safari pending later device gate |
| Mario | Character / Rendering Engineer | R003-V05-COMBAT-LOOP | V05-M1 | OFF_ROUND | wait for G1 accepted core | planned Stage 4 |
| Germinator | Auditor / QA | R003-V05-COMBAT-LOOP | V05-G1,G2 | BLOCKED | AC06: Coletazo whiff recovery lacks clean normal punish on frozen core | BLOCK handoff published; QA 02769904; CI #537 185/186 |
| Gonza | Integration / Release | R003-V05-COMBAT-LOOP | V05-Z1 | OFF_ROUND | wait for G2 release approval | planned Stage 6 |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
