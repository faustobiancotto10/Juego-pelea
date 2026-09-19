# Task Z-502 — V0.4 integration and release

Round: R002-V04-COMBAT-FEEL-MOBILE
Owner: Gonza
Status: WAITING
Branch: round/r002-integration

## Dependency
Stage 4 opens only after Germinator PASS and Neureon RELEASE token.

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
