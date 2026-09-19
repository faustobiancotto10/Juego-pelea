# Task G-402 — V0.4 adversarial QA

Round: R002-V04-COMBAT-FEEL-MOBILE
Owner: Germinator
Status: WAITING
Branch: round/r002-germinator

## Dependency
Stage 3 opens only after exact Ricardo, Mario and Brancaforte handoffs exist.

## Goal
Independently verify the user's reported issues are actually fixed and that V0.4 introduces no regressions.

## Required scenarios
- Supernariz CPU pressure/reaction/punish-window scenarios;
- CPU non-cheating and deterministic imperfection;
- Camaleoni close contest, whiff punish and Coletazo pressure reset;
- no strict close-range dominance after buff;
- touch hold-direction + ULTIMATE with two fingers total;
- not-ready rejection and READY activation;
- no touch action leakage;
- desktop chord regression if retained;
- trapped-state/effect cleanup after successful Ultimates, whiffs, interrupted startup, KO, rematch and new fight;
- procedural renderer/no-image-loading contract;
- effect bounds/mobile readability;
- deterministic V0.3 regressions.

## Acceptance
Return explicit PASS or BLOCKED with exact SHAs, evidence and owned findings.
