# Task Z-502 — V0.4 integration and release

Round: R002-V04-COMBAT-FEEL-MOBILE
Owner: Gonza
Status: CHECKING_IN
Branch: round/r002-integration

## Dependency

Stage 4 is OPEN.
Germinator verdict: PASS FOR RELEASE GATE.
QA-approved integrated candidate: `27588cb77aa2f4e25df3c0b2eaa4b23361210225`.

The integration branch has been reset to that exact candidate. Post PRESENT before release work.

## Goal
Integrate accepted V0.4 SHAs/deltas only, verify the combined game and publish a Pages artifact matching approved source.

## Requirements
- never whole-merge stale feature-branch coordination history;
- integrate exact accepted checkpoints;
- full tests/typecheck/build;
- regenerate/synchronize standalone play.html;
- desktop smoke;
- mobile landscape smoke including movement + dedicated Ultimate interaction;
- verify public Pages content matches accepted source;
- publish final main/gh-pages SHAs and evidence.

## Release blocker rule
Issue BLOCK_RELEASE for unresolved QA findings, failing tests/build/smoke, conflicts or public/source mismatch.
