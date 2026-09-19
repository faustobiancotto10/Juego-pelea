# Task B-302 — Dedicated mobile Ultimate control

Round: R002-V04-COMBAT-FEEL-MOBILE
Owner: Brancaforte
Status: CHECKING_IN
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
- [ ] mobile ULTIMATE button exists and is reachable while holding D-pad
- [ ] not-ready/READY states are clear
- [ ] one touch emits exactly one Ultimate intent
- [ ] no Attack/Special leakage
- [ ] movement remains held while Ultimate is pressed
- [ ] no playfield/HUD obstruction at target mobile-landscape size
- [ ] desktop compatibility regression passes
- [ ] help/hints match actual controls
- [ ] clean handoff SHA + tests/build/mobile smoke evidence
