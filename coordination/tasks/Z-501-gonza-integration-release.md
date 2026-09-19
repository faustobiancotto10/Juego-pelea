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

- [x] review branch/file overlap risk early in ACTIVE
- [x] integrate explicit accepted SHAs/contracts, not ambiguous branch heads
- [x] stale coordination files from feature branches do not overwrite main coordination truth
- [x] resolve merge/integration conflicts with subsystem owners
- [x] full automated suite passes on integration result
- [x] TypeScript/build succeeds
- [x] standalone play.html is synchronized with accepted source
- [x] desktop/mobile smoke reaches expected game flow without runtime errors
- [ ] GitHub Pages is updated
- [ ] published artifact is shown to match the approved integrated commit/content
- [ ] BLOCK_RELEASE is issued if prerequisites are not met

## Required tests / evidence

- [x] integrated SHA list
- [x] full test output / CI evidence
- [x] build evidence
- [x] smoke evidence
- [ ] public Pages URL/deployment evidence
- [ ] source-to-published consistency evidence

## Related forum threads

- coordination/forum/active/r001-integration-release.md
- coordination/forum/active/r001-balance-qa.md

## Checkpoints

- first checkpoint: COMPLETE — integration-risk review posted; integration branch rebased/fast-forwarded to current main while empty


- pre-release integration candidate: `0a613a527366a0e8c95e3febf9ca190f4321ed9b`
- accepted inputs: Ricardo `7138ec09e1773da7dbe28b173d3208197bc3c027`, Mario `a9bc9b358c9956ace363798ef18de993fca0cd59`, Brancaforte `98290a60d8b0f77bd7b6762c6a80d6d660714e7f`
- final repository verification: Actions run `35422159391` (#175), SUCCESS
- release smoke: Actions run `35422114875`, SUCCESS at 1280x720 and 844x390 through select -> VS -> fight with no runtime errors
- standalone: root `play.html` regenerated from accepted integrated source, V0.3 self-contained (no external main.js/styles.css)
- final candidate diff vs main: 18 release files only (17 accepted product/test files + play.html); no coordination files or temporary workflows
- remaining lifecycle gate: Neureon must transition R001 to RELEASE before merge/publication
