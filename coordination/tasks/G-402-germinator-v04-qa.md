# Task G-402 — V0.4 adversarial QA

Round: R002-V04-COMBAT-FEEL-MOBILE
Owner: Germinator
Status: CHECKING_IN
Branch: round/r002-germinator

## Dependency

Stage 3 is OPEN.
Exact accepted implementation inputs:
- Ricardo: `683d81f50afa9626785408ac7f868414ffe4061f`
- Mario: `b163e25ab50500b5f308e38c0574987f0c284a07`
- Brancaforte: `d5bfae4e108f882715c82ccd9282f1cc9c5f396a`

The QA branch has been reset to the Ricardo base. Post PRESENT before work. Compose the validation candidate from the exact Mario + Brancaforte handoff deltas only; do not use moving branch heads.

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
