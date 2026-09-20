# Agent Status

Round: `R004-V06-CONTENT-EXPANSION`  
Global state: ACTIVE  
Execution: AUTO_CHAIN

| Agent | Role | Tasks | State | Dependency / next action |
| --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | V06-N0 | VERIFIED | Round frozen/open; no per-step gate. Audit/re-plan only when user requests or final closure. |
| Ricardo | Gameplay Engineer | V06-R0→R1→R2→R3 | READY | Start R0 now; continue own chain automatically while green. |
| Mario | Character / Rendering Engineer | V06-M1→M2 | WAITING_DEPENDENCY | Starts automatically after R0 green interface handoff. |
| Brancaforte | UI / Input / UX Engineer | V06-B1 | WAITING_DEPENDENCY | Starts automatically after R0 green presentation/content handoff. |
| Germinator | Auditor / QA | V06-G1 | WAITING_DEPENDENCY | Starts when Z0 assembles R3+M2+B1 exact candidate. |
| Gonza | Integration / Release | V06-Z0→Z1 | READY | Start Z0 now; integrate green SHAs. Z1 auto-unlocks only on G1 APPROVE. |

Allowed states: `OFF_ROUND`, `READY`, `WORKING`, `WAITING_DEPENDENCY`, `HANDOFF_READY`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.

Normal green handoffs unlock downstream tasks without Neureon authorization.
