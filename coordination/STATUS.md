# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R002-V04-COMBAT-FEEL-MOBILE | N-002 | WORKING | waiting for Gonza PRESENT | RELEASE authorized; Stage 4 open |
| Ricardo | Gameplay Engineer | R002-V04-COMBAT-FEEL-MOBILE | R-201 | WAITING_FOR_TEAM | frozen consumer SHA published; waiting for Neureon Stage 2 and downstream contract requests | 683d81f5 CI-green; formal handoff posted |
| Mario | Character / Rendering Engineer | R002-V04-COMBAT-FEEL-MOBILE | M-202 | WAITING_FOR_TEAM | available for QA findings | handoff b163e25ab50500b5f308e38c0574987f0c284a07; CI green |
| Brancaforte | UI / Input / UX Engineer | R002-V04-COMBAT-FEEL-MOBILE | B-302 | WAITING_FOR_TEAM | available for QA findings | handoff d5bfae4e108f882715c82ccd9282f1cc9c5f396a; CI green; device-scale smoke pending QA |
| Germinator | Auditor / QA | R002-V04-COMBAT-FEEL-MOBILE | G-402 | VERIFIED | wait for Stage 4 integration regressions / ROUND_COMPLETE | PASS published; candidate 27588cb7; CI #302 green; handoff published |
| Gonza | Integration / Release | R002-V04-COMBAT-FEEL-MOBILE | Z-502 | CHECKING_IN | user activation required | integration branch reset to QA-approved candidate 27588cb7 |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
