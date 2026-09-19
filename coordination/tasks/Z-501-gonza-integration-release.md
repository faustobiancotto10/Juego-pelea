# Task Z-501 — Integration and release

Round: R001-V03-COMBAT-EXPANSION
Owner: Gonza
Status: READY

## Goal

Integrate only accepted V0.3 work, verify the combined product and publish a GitHub Pages build that matches approved source.

## Dependencies

- START_ROUND for integration-risk review
- specialist handoffs/accepted SHAs for final integration
- Germinator validation verdict before publication

## Allowed files / subsystems

- integration conflict resolution with owners
- build/release tooling and standalone play.html generation/update
- gh-pages publication
- branch: round/r001-integration

## Prohibited scope

- inventing gameplay/UI/render behavior to hide missing handoffs
- bypassing unresolved Germinator blockers
- publishing a build that differs from approved integrated source

## Required collaborators / reviewers

- @Ricardo
- @Mario
- @Brancaforte
- @Germinator
- @Neureon

## Acceptance criteria

- [ ] review branch/file overlap risk early in ACTIVE
- [ ] integrate explicit accepted SHAs/contracts, not ambiguous branch heads
- [ ] stale coordination files from feature branches do not overwrite main coordination truth
- [ ] resolve merge/integration conflicts with subsystem owners
- [ ] full automated suite passes on integration result
- [ ] TypeScript/build succeeds
- [ ] standalone play.html is synchronized with accepted source
- [ ] desktop/mobile smoke reaches expected game flow without runtime errors
- [ ] GitHub Pages is updated
- [ ] published artifact is shown to match the approved integrated commit/content
- [ ] BLOCK_RELEASE is issued if prerequisites are not met

## Required tests / evidence

- [ ] integrated SHA list
- [ ] full test output / CI evidence
- [ ] build evidence
- [ ] smoke evidence
- [ ] public Pages URL/deployment evidence
- [ ] source-to-published consistency evidence

## Related forum threads

- coordination/forum/active/r001-integration-release.md
- coordination/forum/active/r001-balance-qa.md

## Checkpoints

- first checkpoint: integration-risk review after START_ROUND
