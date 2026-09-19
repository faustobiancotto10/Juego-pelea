# Task G-402 — V0.4 adversarial QA

Round: R002-V04-COMBAT-FEEL-MOBILE
Owner: Germinator
Status: VERIFIED
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


## Final verification

Verdict: PASS FOR RELEASE GATE

Integrated QA candidate:
- `27588cb77aa2f4e25df3c0b2eaa4b23361210225`

CI:
- draft validation PR #13, not an integration path;
- Repository verification run `35425575203` (#302): SUCCESS;
- coordination contract PASS;
- full test suite PASS;
- build PASS.

Independent G-402 coverage:
- sustained Supernariz post-commit punish gap;
- deterministic but imperfect nose-chain conversion;
- snapshot-only CPU / no GameInput or raw-input dependency;
- Camaleoni close-range compensation without strict first-button dominance;
- fresh-fight and post-Ultimate capture cleanup;
- two-pointer held movement + one-shot dedicated ULTIMATE with no action leakage;
- not-ready touch rejection;
- iPhone-scale 852x393 control geometry, including 59px side safe-area stress;
- renderer capture-effect cleanup and no runtime image loading.

The 852x393 geometry smoke leaves about 383px of center lane with zero side cutout and about 299px with 59px safe areas on both sides. The ULTIMATE touch target resolves to about 75px, and the action cluster begins around y=199px, keeping it in the lower half.

Limitation:
- no claim of real physical-device tactile feel; Stage 3 objective mobile geometry/input evidence is green. Final published-build smoke remains Z-502 responsibility.
