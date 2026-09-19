# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R003-V05-COMBAT-LOOP | V05-N1 | READY | waiting Stage 1 PRESENTs | R003 contracts opened from Astra audit |
| Ricardo | Gameplay Engineer | R003-V05-COMBAT-LOOP | V05-R1..R5 | CHECKING_IN | user activation required | Stage 1 R1 first |
| Brancaforte | UI / Input / UX Engineer | R003-V05-COMBAT-LOOP | V05-B1,B2 | CHECKING_IN | user activation required | Stage 1 B1 first |
| Mario | Character / Rendering Engineer | R003-V05-COMBAT-LOOP | V05-M1 | OFF_ROUND | wait for G1 accepted core | planned Stage 4 |
| Germinator | Auditor / QA | R003-V05-COMBAT-LOOP | V05-G1,G2 | OFF_ROUND | wait for frozen core | planned Stages 3/5 |
| Gonza | Integration / Release | R003-V05-COMBAT-LOOP | V05-Z1 | OFF_ROUND | wait for G2 release approval | planned Stage 6 |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
