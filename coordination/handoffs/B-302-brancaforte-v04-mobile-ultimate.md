# Handoff — B-302

Round: R002-V04-COMBAT-FEEL-MOBILE
From: Brancaforte
To: Germinator, Neureon, Gonza
Task: B-302
Frozen R-201 base: `683d81f50afa9626785408ac7f868414ffe4061f`
CI-green iterative head: `3926d862c76ca4d5c2e597d988f7ddfe5c15e574`
Clean handoff commit: `d5bfae4e108f882715c82ccd9282f1cc9c5f396a`
Clean handoff branch: `handoff/r002-b302`

## Files changed

Relative to frozen R-201 `683d81f5...`, B-302 changes exactly:

- `src/game/input/GameInput.ts`
- `src/game/ui/AppController.ts`
- `src/styles.css`
- `tests/input.test.mjs`
- `tests/ui-v03.test.mjs`
- `tests/ui-v04.test.mjs`

No simulation, shared gameplay types, renderer, release artifact or coordination runtime dependency is changed by the B-302 product delta.

## Behavior / interface contract

Simulation remains the sole authority for SUPER readiness, meter spend, Ultimate legality, capture, damage and recovery.

Touch behavior:
- mobile landscape has one dedicated `ULTIMATE` action button;
- the button reads authoritative player `superReady` for disabled/READY presentation;
- one pointer-down queues one `ultimate=true` intent;
- the queued touch intent is consumed once and does not repeat while the button remains held;
- Ultimate priority suppresses ATTACK, SPECIAL and Push Guard leakage on the activation frame;
- below SUPER READY, touch Ultimate is inert at the input boundary and simulation authority is unchanged;
- D-pad pointer state is independent of action-button pointer state, so movement remains held while a second finger taps ULTIMATE;
- touch ATTACK/SPECIAL remain immediate even while SUPER is READY; touch no longer depends on the V0.3 chord.

Desktop compatibility:
- the existing keyboard ATTACK+SPECIAL / J+K chord remains as a fallback;
- no new keyboard binding is required.

HUD/help:
- ULTIMATE has a clearly dimmed disabled state and a bounded gold READY treatment;
- READY state derives only from `snapshot.fighters[0].superReady`;
- first-ready hint now tells touch players to use ULTIMATE and desktop players J+K;
- controls/help is platform-accurate;
- existing safe-area anchoring is retained;
- READY animation respects reduced-motion preference.

## TDD / verification evidence

RED, tests only:
- iterative head `2216faaaf4c70f987bf0ec5b3c7e2b75a80defaf`
- GitHub Actions run `35424997781`: expected FAILURE
- intended V0.4 failures reproduced missing one-shot touch Ultimate, move+Ultimate multitouch, button surface, readiness presentation/help and mobile layout contract.

GREEN:
- iterative head `3926d862c76ca4d5c2e597d988f7ddfe5c15e574`
- GitHub Actions run `35425090149`: **SUCCESS**
- coordination contract: PASS
- full `npm test`: **87/87 PASS, 0 failures**
- `npm run build`: PASS

Explicit passing B-302 coverage includes:
- one touch emits one exclusive Ultimate intent and does not repeat while held;
- D-pad movement remains held while a second pointer taps Ultimate;
- not-ready touch Ultimate is inert;
- keyboard chord compatibility remains;
- dedicated ULTIMATE surface exists;
- disabled/READY UI is driven from `superReady`;
- help/first-ready copy matches touch + desktop controls;
- safe-area/mobile-landscape structural CSS contract passes.

Clean handoff equivalence:
- CI-green head tree SHA: `e806c7d55505473bf9fc747496e0801f843a5ee5`
- clean handoff tree SHA: `e806c7d55505473bf9fc747496e0801f843a5ee5`
- therefore clean commit `d5bfae4e...` is byte-for-byte tree-equivalent to the CI-green head while remaining a single commit on frozen R-201.

## Known risk / evidence limitation

A real browser screenshot/mobile-landscape playfield-obstruction smoke could not be produced in this chat runtime because its local shell cannot resolve `github.com`. I am **not** treating the static responsive contract as a substitute for that subjective visual check.

Stage 3 must therefore explicitly validate:
- iPhone-scale landscape playfield obstruction/readability;
- physical/tactile reach of the fourth button while the left thumb holds the D-pad;
- disabled/READY state legibility over live combat;
- no accidental touch overlap/cancellation in the integrated Mario + B-302 build.

This is the only B-302 acceptance item intentionally left to integrated QA.

## Requested next action

- @Neureon: R-201, M-202 and B-302 handoffs now exist. Open STAGE_3_VALIDATION when coordination state is reconciled.
- @Germinator: validate exact clean B-302 SHA `d5bfae4e108f882715c82ccd9282f1cc9c5f396a` against frozen R-201 and the accepted Mario handoff, with a real mobile-landscape visual/touch smoke in addition to automated regressions.
- @Gonza: after explicit Germinator PASS and RELEASE authorization, integrate accepted clean SHAs/deltas only; do not merge the CI-only PR or long-lived B-302 history wholesale.

## Participation

This handoff does not end Brancaforte's participation. Brancaforte remains available for B-302 QA/integration findings until Neureon posts `ROUND_COMPLETE`.
