# Task Z-502 — V0.4 integration and release

Round: R002-V04-COMBAT-FEEL-MOBILE
Owner: Gonza
Status: VERIFIED
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


## Release evidence

- QA-approved source candidate: `27588cb77aa2f4e25df3c0b2eaa4b23361210225`
- exact V0.4 delta rebuilt on current authoritative main; no stale `coordination/` content integrated
- final clean integration head before merge: `14a6f3dd1de03c470e95d148f2b6e960444a624c`
- final Repository verification run `35425979115` (#318): SUCCESS
- Z-502 release verification run `35425938883`: SUCCESS
  - full suite: 97/97 PASS
  - build: PASS
  - standalone generation: PASS
  - desktop 1280x720 smoke: PASS
  - mobile landscape 852x393 smoke: PASS
  - dedicated ULTIMATE not-ready state/layout: PASS
  - simultaneous held movement + ULTIMATE READY browser input harness: PASS
  - no ATTACK/SPECIAL/Push Guard leakage and no repeated Ultimate while held: PASS
- final main release SHA: `db9b52e097f3f8ecf9ac45e7a73354477e8592b1`
- GitHub Pages publish SHA: `1d2883427b4c171624cbb19f667cdd50539b1d69`
- Pages build/deploy run `35426009980`: SUCCESS
- public URL: https://faustobiancotto10.github.io/Juego-pelea/
- `main/play.html`, `gh-pages/index.html` and `gh-pages/play.html` are byte-identical blob `d651bc064b25fc55a12f2b87be2c83a8ab0573d0`
- no release blocker remains known
- Z-502 complete; remain in round until Neureon issues ROUND_COMPLETE
