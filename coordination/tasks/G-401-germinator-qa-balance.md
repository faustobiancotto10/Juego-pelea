# Task G-401 — Adversarial QA and balance harness

Round: R001-V03-COMBAT-EXPANSION
Owner: Germinator
Status: VERIFIED

## Goal

Continuously challenge V0.3 implementation and coordination, build repeatable adversarial/balance scenarios, and issue an evidence-based final QA verdict.

## Dependencies

- START_ROUND
- implementation checkpoints as they become available

## Allowed files / subsystems

- automated regression/balance tests
- QA fixtures/harnesses that do not implement feature truth
- coordination audit threads/findings
- branch: round/r001-germinator

## Prohibited scope

- silently fixing specialist feature logic instead of returning findings to owners
- redefining user product intent
- release/publishing

## Required collaborators / reviewers

- @Ricardo for combat findings
- @Mario for visual/readability findings
- @Brancaforte for input/UX findings
- @Gonza for release blockers
- @Neureon for scope/decision escalation

## Acceptance criteria

- [x] audit shared contracts before they harden into incompatible implementations
- [x] scenario: Camaleoni cornered by Supernariz has costly but real escape paths
- [x] scenario: blocked pressure at wall eventually creates authored separation
- [x] scenario: Push Guard valid/invalid/low-GUARD/Guard-Break behavior
- [x] compare melee reach advantages against startup/recovery/damage/knockback costs
- [x] compare Lengua and Chorizo threat-space without requiring identical mechanics
- [x] both ultimates: capture, block attempt, behind attacker, out of range, jump/crossover evade, whiff meter loss, recovery, guaranteed post-capture sequence
- [x] CPU does not become frame-perfect and does not spend meter brainlessly
- [x] deterministic 60 Hz outcomes remain reproducible
- [x] V0.2 regression suite remains valid
- [x] coordination locks/ownership/handoffs are audited
- [x] final explicit PASS or BLOCKED verdict with evidence

## Required tests / evidence

- [x] repeatable automated scenario coverage
- [x] regression-suite result
- [x] adversarial findings with owners/resolutions
- [x] balance observations tied to measurable behavior
- [x] coordination-audit result
- [x] final QA verdict committed/reported

## Related forum threads

- coordination/forum/active/r001-combat-contract.md
- coordination/forum/active/r001-balance-qa.md
- coordination/forum/active/r001-integration-release.md

## Checkpoints

- first checkpoint: review design/testability and post initial adversarial matrix
