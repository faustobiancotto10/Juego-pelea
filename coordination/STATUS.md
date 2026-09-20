# Agent Status

Round: `R004-V06-CONTENT-EXPANSION`  
Global state: ACTIVE  
Execution: AUTO_CHAIN

| Agent | Role | Tasks | State | Dependency / next action |
| --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | V06-N0 | VERIFIED | Round frozen/open; no per-step gate. Audit/re-plan only when user requests or final closure. |
| Ricardo | Gameplay Engineer | V06-R0→R1→R2→R3 | WORKING | R2 green at 0bf6a56 / CI #800; V06-R3 Lengua/jump prep/CPU follow-through active |
| Germinator | Auditor / QA | V06-G1 | WAITING_DEPENDENCY | Starts only after Ricardo R3 green handoff. |
| Mario | Character / Rendering Engineer | V06-M1→M2 | WAITING_DEPENDENCY | Starts only after Germinator G1 green verdict. |
| Brancaforte | UI / Input / UX Engineer | V06-B1 | WAITING_DEPENDENCY | Starts only after Germinator G1 green verdict. |
| Gonza | Integration / Release | V06-Z0→Z1 | WAITING_DEPENDENCY | Final role only: starts after G1 + M2 + B1 are green. |

Allowed states: `OFF_ROUND`, `READY`, `WORKING`, `WAITING_DEPENDENCY`, `HANDOFF_READY`, `REVIEWING`, `VERIFIED`, `BLOCKED`, `UNRESPONSIVE`.

Authoritative sequence: **Ricardo → Germinator → Mario + Brancaforte → Gonza**.
Normal green handoffs unlock downstream tasks without Neureon authorization.
