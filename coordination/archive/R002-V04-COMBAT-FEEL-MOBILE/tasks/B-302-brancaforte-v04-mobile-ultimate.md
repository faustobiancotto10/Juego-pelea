# Task B-302 — Dedicated mobile Ultimate control

Round: R002-V04-COMBAT-FEEL-MOBILE
Owner: Brancaforte
Status: REVIEWING
Branch: round/r002-brancaforte

## Dependency

Stage 2 is OPEN. Branch starts from frozen Ricardo consumer SHA `683d81f50afa9626785408ac7f868414ffe4061f`.
Post PRESENT before implementation. Consume that exact gameplay contract; request any new authoritative state through the forum.

## Goal
Replace the uncomfortable mobile Ultimate chord with one dedicated touch button while preserving simulation authority and mobile readability.

## Required work
- add a dedicated ULTIMATE touch button;
- disabled/not-ready state below full SUPER;
- obvious READY state at full SUPER;
- holding movement + tapping ULTIMATE must work with two fingers total;
- one press emits one Ultimate intent and cannot leak ATTACK/SPECIAL;
- remove ATTACK+SPECIAL requirement from touch;
- keyboard chord may remain as compatibility fallback;
- update help/hints to platform-accurate controls;
- preserve safe areas and usable touch targets.

## Owned files
- src/game/input/
- src/game/ui/
- src/styles.css
- input/UI tests

## Prohibited scope
- meter spend, capture legality or combat outcomes;
- renderer-world effects;
- release/publishing.

## Acceptance criteria
- [x] mobile ULTIMATE button exists and automated multi-pointer test keeps D-pad movement while activating it
- [x] not-ready/READY states are implemented from authoritative superReady
- [x] one touch emits exactly one Ultimate intent
- [x] no Attack/Special leakage
- [x] movement remains held while Ultimate is pressed (automated multi-pointer regression)
- [ ] no playfield/HUD obstruction at target mobile-landscape size
- [x] desktop compatibility regression passes
- [x] help/hints match actual controls
- [ ] clean handoff SHA + tests/build/mobile smoke evidence


## Validation checkpoint

- frozen R-201 base: `683d81f50afa9626785408ac7f868414ffe4061f`
- CI-green iterative head: `3926d862c76ca4d5c2e597d988f7ddfe5c15e574`
- clean handoff commit: `d5bfae4e108f882715c82ccd9282f1cc9c5f396a`
- clean tree = CI-green tree: `e806c7d55505473bf9fc747496e0801f843a5ee5`
- RED run: `35424997781`
- GREEN run: `35425090149` — coordination contract PASS, full suite 87/87 PASS, build PASS
- formal handoff: `coordination/handoffs/B-302-brancaforte-v04-mobile-ultimate.md`
- pending Stage 3 evidence: real iPhone-scale landscape visual/playfield-obstruction and tactile touch smoke; local browser checkout was unavailable because this runtime could not resolve github.com


## Validation checkpoint

- frozen R-201 base: `683d81f50afa9626785408ac7f868414ffe4061f`
- CI-green iterative head: `3926d862c76ca4d5c2e597d988f7ddfe5c15e574`
- clean handoff commit: `d5bfae4e108f882715c82ccd9282f1cc9c5f396a`
- clean tree = CI-green tree: `e806c7d55505473bf9fc747496e0801f843a5ee5`
- RED run: `35424997781`
- GREEN run: `35425090149` — coordination contract PASS, full suite 87/87 PASS, build PASS
- formal handoff: `coordination/handoffs/B-302-brancaforte-v04-mobile-ultimate.md`
- pending Stage 3 evidence: real iPhone-scale landscape visual/playfield-obstruction and tactile touch smoke; local browser checkout was unavailable because this runtime could not resolve github.com
