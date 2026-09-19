# Task N-001 — Coordinate R001 V0.3

Round: R001-V03-COMBAT-EXPANSION
Owner: Neureon
Status: READY

## Goal

Coordinate the complete V0.3 round from CHECK_IN through ROUND_COMPLETE without taking specialist implementation work.

## Dependencies

- all required-agent check-ins before START_ROUND
- specialist evidence before state transitions

## Allowed files / subsystems

- coordination/CURRENT_ROUND.md
- coordination/STATUS.md
- coordination/LOCKS.md conflict resolution
- coordination/forum/active/
- coordination/tasks/
- coordination/handoffs/
- coordination/archive/
- docs/DECISIONS.md
- approved design/plan docs when clarification is needed

## Prohibited scope

- feature coding owned by Ricardo, Mario or Brancaforte
- bypassing Germinator blockers
- releasing on behalf of Gonza
- changing user-approved product intent without escalation

## Required collaborators / reviewers

- @Ricardo
- @Mario
- @Brancaforte
- @Germinator
- @Gonza

## Acceptance criteria

- [x] all six required agents post PRESENT
- [x] START_ROUND is issued only after complete check-in
- [ ] cross-agent contract disputes are resolved or explicitly escalated
- [ ] global state transitions are evidence-based
- [ ] durable V0.3 decisions are promoted to permanent docs
- [ ] workflow retrospective is captured
- [ ] ROUND_COMPLETE is issued only after QA/release evidence and archive/reset

## Required tests / evidence

- [x] check-in thread
- [ ] task/status/lock consistency
- [ ] Germinator final QA verdict
- [ ] Gonza release evidence
- [ ] round archive

## Related forum threads

- coordination/forum/active/r001-check-in.md
- coordination/forum/active/r001-combat-contract.md
- coordination/forum/active/r001-balance-qa.md
- coordination/forum/active/r001-integration-release.md

## Checkpoints

- round setup committed to main
- all six PRESENT blocks verified
- stale check-in state reconciled after Germinator audit
- START_ROUND issued; global state moved to ACTIVE
