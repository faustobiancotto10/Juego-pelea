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


## V07-Z0 GREEN — Gonza

Exact clean candidate: `65bbb4122be526b0b878c214137192c7243db3ab`.

Evidence:
- accepted ancestry Ricardo `94ee2489` → Mario `a4732609` → B1 `9688764c`;
- exact G1 adversarial QA test included;
- Z0 run `35562321601`: SUCCESS;
- merge-ref Repository verification #1138 / `35562414551`: SUCCESS;
- full suite/typecheck/build + targeted V0.7 + raster scan + integrated mobile browser smoke: PASS;
- source fingerprint `5c039c2a...`;
- standalone SHA-256 `b64b18ed...`;
- final diff contains no temporary workflow or feature-branch coordination.

AUTO_CHAIN condition for V07-Z1 is satisfied. Final release verification starts now.


## V07-Z0 GREEN — Gonza

Exact clean candidate: `65bbb4122be526b0b878c214137192c7243db3ab`.

Automated evidence is complete:
- Z0 run `35562321601`: SUCCESS;
- Repository verification #1137/#1138: SUCCESS;
- full suite/typecheck/build: PASS;
- targeted V0.7 suite: PASS;
- runtime raster prohibition scan: PASS;
- source fingerprint `5c039c2a...`;
- standalone SHA-256 `b64b18ed...`;
- four portraits / four fighters / Easy-Normal-Hard / both stages mobile-browser smoke: PASS.

AUTO_CHAIN advances to V07-Z1.

The V0.7 spec explicitly retains physical phone smoke as a separate human/device release gate. Z1 will publish an isolated exact-candidate preview first; production root remains unchanged until that gate passes.
