# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R002-V04-COMBAT-FEEL-MOBILE | N-002 | READY | waiting for Ricardo PRESENT before START_ROUND | R002 planned; staged activation enabled |
| Ricardo | Gameplay Engineer | R002-V04-COMBAT-FEEL-MOBILE | R-201 | CHECKING_IN | user activation required | Stage 1 owner: CPU/melee/stale-state core |
| Mario | Character / Rendering Engineer | R002-V04-COMBAT-FEEL-MOBILE | M-202 | OFF_ROUND | wait for frozen Ricardo consumer SHA | planned Stage 2 |
| Brancaforte | UI / Input / UX Engineer | R002-V04-COMBAT-FEEL-MOBILE | B-302 | OFF_ROUND | wait for frozen Ricardo consumer SHA | planned Stage 2 |
| Germinator | Auditor / QA | R002-V04-COMBAT-FEEL-MOBILE | G-402 | OFF_ROUND | wait for all implementation handoffs | planned Stage 3 |
| Gonza | Integration / Release | R002-V04-COMBAT-FEEL-MOBILE | Z-502 | OFF_ROUND | wait for Germinator PASS + RELEASE token | planned Stage 4 |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
