# Task G-401 — Adversarial QA and balance harness

Round: R001-V03-COMBAT-EXPANSION
Owner: Germinator
Status: READY

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

- [ ] audit shared contracts before they harden into incompatible implementations
- [ ] scenario: Camaleoni cornered by Supernariz has costly but real escape paths
- [ ] scenario: blocked pressure at wall eventually creates authored separation
- [ ] scenario: Push Guard valid/invalid/low-GUARD/Guard-Break behavior
- [ ] compare melee reach advantages against startup/recovery/damage/knockback costs
- [ ] compare Lengua and Chorizo threat-space without requiring identical mechanics
- [ ] both ultimates: capture, block attempt, behind attacker, out of range, jump/crossover evade, whiff meter loss, recovery, guaranteed post-capture sequence
- [ ] CPU does not become frame-perfect and does not spend meter brainlessly
- [ ] deterministic 60 Hz outcomes remain reproducible
- [ ] V0.2 regression suite remains valid
- [ ] coordination locks/ownership/handoffs are audited
- [ ] final explicit PASS or BLOCKED verdict with evidence

## Required tests / evidence

- [ ] repeatable automated scenario coverage
- [ ] regression-suite result
- [ ] adversarial findings with owners/resolutions
- [ ] balance observations tied to measurable behavior
- [ ] coordination-audit result
- [ ] final QA verdict committed/reported

## Related forum threads

- coordination/forum/active/r001-combat-contract.md
- coordination/forum/active/r001-balance-qa.md
- coordination/forum/active/r001-integration-release.md

## Checkpoints

- first checkpoint: review design/testability and post initial adversarial matrix
