# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R003-V05-COMBAT-LOOP | V05-N1 | READY | waiting G2 automated verdict/evidence | Stage 5 integrated QA running |
| Ricardo | Gameplay Engineer | R003-V05-COMBAT-LOOP | V05-R1..R5 | READY | no active product task; wait for corrected G1 findings | READY issued after AC06 diagnosis; product values frozen |
| Brancaforte | UI / Input / UX Engineer | R003-V05-COMBAT-LOOP | V05-B1,B2 | WAITING_FOR_TEAM | wait for M1 acceptance + Stage 5 G2; repair B2 findings if assigned | B2 clean handoff d76e4ded; CI #598 green 179/179 + build; physical Safari/tactile gate pending G2 |
| Mario | Character / Rendering Engineer | R003-V05-COMBAT-LOOP | V05-M1 | WAITING_FOR_TEAM | B2 completion then Stage 5 G2; pixel/device evidence pending there | handoff e567fce333f535e21583cbef0ab46e300b089b0a; exact-core CI #599 169/169 + build PASS |
| Germinator | Auditor / QA | R003-V05-COMBAT-LOOP | V05-G1,G2 | BLOCKED | mandatory physical Safari + human V0.4/V0.5 + same-device performance evidence missing | automated G2 98f08e58; CI #626 205/205 + build; no code blocker |
| Gonza | Integration / Release | R003-V05-COMBAT-LOOP | V05-Z1 | OFF_ROUND | wait for G2 release approval | planned Stage 6 |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
