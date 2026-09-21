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


## V07-Z1 PREVIEW READY / BLOCK_RELEASE — Gonza

Exact Z0 standalone is now served at:
https://faustobiancotto10.github.io/Juego-pelea/v07-preview/

Evidence:
- preview gh-pages SHA `2b583b14a8c903142dbb56c8f0b7f949aaf23c16`;
- Pages run `35562586454`: SUCCESS;
- preview index/play are exact candidate blob `51eba287c535782f9fc72a9528169edf3b5c7de2`;
- production root remains V0.6 blob `bda2d2a1...`.

Per frozen V7-10 acceptance, automated/mobile-viewport smoke cannot substitute for the required physical-phone/user-facing check. Z1 is therefore BLOCKED from root promotion until that evidence is supplied.


## V07-Z1 PREVIEW READY — production promotion held for physical gate

Exact preview candidate:
- Z0 source: `65bbb4122be526b0b878c214137192c7243db3ab`;
- standalone SHA-256: `b64b18ed408c67eec48f5b60b78e4ed5520c07eabd4ce7ff7a4822cc3524da28`;
- gh-pages preview publish: `2b583b14a8c903142dbb56c8f0b7f949aaf23c16`;
- Pages run `35562586454`: SUCCESS;
- preview/source blob parity: `51eba287c535782f9fc72a9528169edf3b5c7de2`.

Preview URL:
https://faustobiancotto10.github.io/Juego-pelea/v07-preview/

Production root is intentionally still V0.6.

V7-10 requires real physical-phone evidence. Cloud mobile smoke already passed but does not satisfy that wording. Z1 is therefore BLOCK_RELEASE only on this external device gate; no code defect is open.


## V07-Z1 rebuilt preview ready — Gonza

The rejected preview has been replaced with the G2-approved repaired visual candidate.

Evidence:
- exact product source `f34760948cb2024c0c83f4a02202117a8ad3bf2f`;
- rebuilt verification `35575811935`: SUCCESS;
- full suite/typecheck/build + mobile smoke + raster guard: PASS;
- rebuilt standalone SHA-256 `b0326df090a4847dff43d43f9d3280937ffe8b2113fea97a5590a7070d5d3be3`;
- preview publish `d7358cd390445e22d1dbc31bb346a5ea82e1bdb6`;
- Pages run `35575920696`: SUCCESS;
- preview blob parity `40135c2db0b908bf9a901fa50b08de2b239f5014`;
- production root still V0.6.

Preview:
https://faustobiancotto10.github.io/Juego-pelea/v07-preview/

Z1 remains BLOCK_RELEASE only until the user accepts this rebuilt preview on a physical phone.
