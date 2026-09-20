# R004 Integration

Round: `R004-V06-CONTENT-EXPANSION`  
Owner: @Gonza  
Status: WAITING — FINAL STAGE ONLY

## Canonical order

**Ricardo → Germinator → Mario + Brancaforte → Gonza**

Gonza does not perform early preparation or progressive integration in R004.

## Frozen base

Product base:
`2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13`

QA reference only:
`2876f3bce7d77c04c7415df89cafcf8b31f1b61c`

## Gonza eligibility

Gonza starts V06-Z0 only after all of these exist:
- Ricardo R3 green exact-SHA handoff;
- Germinator `APPROVE — PRESENTATION LANE UNLOCKED`;
- Mario M2 green exact-SHA handoff;
- Brancaforte B1 green exact-SHA handoff.

## Rule

Integrate only exact accepted SHAs. Do not merge coordination files from feature branches over newer main state.

V06-Z0 owns final integration, full tests/typecheck/build/standalone, source→artifact parity and integrated smoke. If green, it automatically unlocks V06-Z1 publication.

No second Neureon release token is required in AUTO_CHAIN. Any semantic integration conflict or release blocker is reported to the user instead of being silently fixed across ownership boundaries.
