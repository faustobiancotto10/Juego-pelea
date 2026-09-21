# Task V07-SPR-N0 — Sprite Pilot Intake and Activation

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Owner: Neureon  
Status: VERIFIED

## Goal

Audit the user-supplied El Toro sprite pack against the official contract, freeze accepted/rejected source identity, expose missing production gates, and open safe parallel execution lanes.

## Acceptance criteria

- [x] Official sprite contract is repository-authoritative.
- [x] Accepted right-facing set maps to exactly 84 body sprites + Master + FX-01..04.
- [x] Superseded alternate sheet is explicitly rejected.
- [x] LEFT-facing production blocker is documented because El Toro is not mirror-safe.
- [x] Mario-A, Mario-B and Ricardo tasks are immediately eligible.
- [x] Germinator and Gonza downstream gates are explicit.
- [x] Old procedural-preview root promotion is superseded while pilot is active.
- [x] AUTO_CHAIN pulse `.` is documented.
- [x] Identity Learning Review completed and receipt recorded in handoff.

## Evidence

- `docs/SPRITE_PRODUCTION_CONTRACT.md`
- `docs/characters/el-toro/SPRITE_INTAKE_2026-09-21.md`
- `docs/characters/el-toro/LEFT_FACING_SET_PROMPT.md`
- `coordination/forum/active/r005-sprite-pilot.md`
- Repository verification PR #49
