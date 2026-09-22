# Agent Status

Round: `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION`  
Global state: ACTIVE — SPRITE PILOT EXTENSION  
Execution: AUTO_CHAIN / SAME-ROLE MARIO SQUAD  
Canonical continuation pulse: `.`

| Agent / Instance | Role | Active task | State | Next |
| --- | --- | --- | --- | --- |
| Neureon | Lead / Coordinator | V07-SPR-N0 | VERIFIED | Intake, contract and dependency graph established; remain coordinator. |
| Ricardo | Gameplay / runtime engineer | V07-SPR-R1 | HANDOFF_READY | Replacement exact SHA `5b20c351...`; crouch/block/block-crouch amendment green, 309/309 tests + build PASS; `79f8d81...` superseded. |
| Mario | Character / Rendering Engineer | V07-SPR-MA + V07-SPR-MB | READY | Run two isolated sprite-pilot lanes and converge through one Mario integration point. |
| ↳ Mario-A | Sprite integrator | V07-SPR-MA / RIGHT-only integration | BLOCKED | Exact integrated RIGHT-only candidate `002cc749...` is GREEN. New LEFT bundle received 2026-09-22; 12/13 sheets pass preliminary intake, but LEFT-IMG-01 fails hard bottom-canvas clipping. Binary source bytes are not yet staged through the current connector. |
| ↳ Mario-B | El Toro sprite package | V07-SPR-MB | BLOCKED | RIGHT-only package GREEN at `51e0e89...`; Ricardo timeline amendment GREEN at `5b20c351...`; remaining package gates are authored LEFT set and visually verified anatomical anchors. |
| Brancaforte | UI / Input / UX | standby | OFF_ROUND | Activate only if a real loading/menu/HUD/input contract changes. |
| Germinator | Independent QA | V07-SPR-G1 | WAITING_DEPENDENCY | Wait for one integrated El Toro sprite-pilot candidate. |
| Gonza | Integration / release | V07-SPR-Z0 | WAITING_DEPENDENCY | Wait for Germinator approval; then publish isolated sprite preview only. |

## Current asset gate

Right-facing El Toro source intake: **CONDITIONALLY ACCEPTED FOR PILOT**.

- accepted: IMG-00, exact 84-body IMG-01..12 set, FX-01..04;
- rejected/superseded: `13F1BB3E-C57C-4649-B9E7-07664E5E8BE8.PNG`;
- LEFT candidate received 2026-09-22: corrected IMG-10/11/12 transparency is good; LEFT-IMG-01 is rejected because 59 bottom-edge pixels exceed alpha 128 (max 180), violating the hard outer-canvas clipping gate. Exact mapping/hashes are recorded on Mario-A branch in `docs/characters/el-toro/sprite-source/left/INTAKE_PENDING_2026-09-22.md`.
- blocker: visually verified anatomical attachment anchors; generated templates/pivots exist but anchor coordinates are intentionally not fabricated.

Canonical audit: `docs/characters/el-toro/SPRITE_INTAKE_2026-09-21.md`.

## Superseded old preview path

The prior procedural V0.7 preview remains historical green evidence, but its pending physical-phone gate is no longer the active next action. Production-root promotion from that preview is blocked while the user-authorized sprite pilot runs.

Active order:

**Mario-A + Mario-B + Ricardo (parallel) → integrated El Toro sprite pilot → Germinator → Gonza isolated preview → user/device acceptance → production-cutover decision**
