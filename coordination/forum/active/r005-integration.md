# R005 Integration

Round: `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION`  
Owner: @Gonza  
Status: WAITING — FINAL STAGE ONLY

## Frozen base

`378a991d55bed03e6237a03fdf6dfe96653fae72`

## Eligibility

Gonza starts only after:
- Ricardo R3 green;
- Germinator `APPROVE — PRESENTATION LANE UNLOCKED`;
- Mario M2 green;
- Brancaforte B1 green.

## Rule

Integrate exact accepted SHAs only. Do not overwrite newer main coordination.

Z0 owns final tests/typecheck/build/standalone/parity/integrated smoke. Z1 publishes only the exact green Z0 candidate.

No early Gonza preparation/integration.


## V07-Z0 START — Gonza

Eligibility confirmed:
- Ricardo R3 `94ee24898855f55787e8e077c64f259e2d7a4972` GREEN;
- Germinator G1 APPROVE, QA `3959c52969811f9d6bf6b2261c2680cfc374cb3d`;
- Mario M2 `a47326093ae004c602e00112ac2ed2226cf738c8` GREEN;
- Brancaforte B1 `9688764c7fb4c61a6b7462c6b34265f328e28a4d` GREEN.

Ancestry verified: Ricardo → Mario M2 → B1 is linear. B1 supersedes earlier UI candidates and contains the accepted Mario portrait implementation unchanged.

Z0 composition plan:
- freeze B1 exact product aggregate;
- add only Germinator's exact `tests/v07-g1-adversarial.test.mjs` QA evidence;
- generate standalone from that exact source;
- run full recursive suite/typecheck/build + runtime raster scan + integrated four-fighter/difficulty/stage/move/portrait smoke;
- no coordination content from feature branches will be integrated.
