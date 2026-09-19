# Agent Status

| Agent | Role | Round | Tasks | State | Dependency / blocker | Last checkpoint |
| --- | --- | --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | R001-V03-COMBAT-EXPANSION | N-001 | READY | waiting for remaining required PRESENT check-ins | round/spec/plan/tasks/forum prepared; Neureon PRESENT |
| Ricardo | Gameplay Engineer | R001-V03-COMBAT-EXPANSION | R-101 | CHECKING_IN | user must activate chat and agent must post PRESENT | task assigned; branch reserved |
| Mario | Character / Rendering Engineer | R001-V03-COMBAT-EXPANSION | M-201 | CHECKING_IN | user must activate chat and agent must post PRESENT | task assigned; branch reserved |
| Brancaforte | UI / Input / UX Engineer | R001-V03-COMBAT-EXPANSION | B-301 | READY | waiting for Neureon's START_ROUND | PRESENT posted; role/spec/plan/task/forum synchronized |
| Germinator | Auditor / QA | R001-V03-COMBAT-EXPANSION | G-401 | READY | waiting for Neureon's START_ROUND | PRESENT posted; role/spec/plan/task/forum synchronized |
| Gonza | Integration / Release | R001-V03-COMBAT-EXPANSION | Z-501 | READY | waiting for Neureon's START_ROUND | PRESENT posted; role/spec/plan/task/forum synchronized |

Allowed states: `OFF_ROUND`, `CHECKING_IN`, `READY`, `WORKING`, `WAITING`, `WAITING_FOR_TEAM`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.
