# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R003-V05-COMBAT-LOOP | V05-N1 | READY | Stage 4 check-ins | G1 accepted: 186/186 + build; presentation/UX gate opening |
| Ricardo | Gameplay Engineer | R003-V05-COMBAT-LOOP | V05-R1..R5 | READY | no active product task; wait for corrected G1 findings | READY issued after AC06 diagnosis; product values frozen |
| Brancaforte | UI / Input / UX Engineer | R003-V05-COMBAT-LOOP | V05-B1,B2 | READY | waiting Stage 4 START token after Mario PRESENT + CURRENT_ROUND reconciliation | B2 PRESENT; frozen core 8e74d1e7 + accepted B1 4eddddad + G1 approval synchronized |
| Mario | Character / Rendering Engineer | R003-V05-COMBAT-LOOP | V05-M1 | CHECKING_IN | user activation required | Stage 4 M1 authorized for check-in after G1 approval |
| Germinator | Auditor / QA | R003-V05-COMBAT-LOOP | V05-G1,G2 | WAITING_FOR_TEAM | Stage 4 presentation/UX then G2 integrated gate | G1 APPROVE FOR PRESENTATION; QA bcececf5; CI #561 186/186 + build |
| Gonza | Integration / Release | R003-V05-COMBAT-LOOP | V05-Z1 | OFF_ROUND | wait for G2 release approval | planned Stage 6 |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
