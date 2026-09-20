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


## V06-Z0 ELIGIBLE — all dependencies green

- Ricardo R3: `d815694a76a7a92c004203f1ae9fd14e2035744c`
- Germinator G1: APPROVE — PRESENTATION LANE UNLOCKED
- Brancaforte B1: `81647506d2e69b92dd92e19f2fc997d21949a4a9`, CI #848 255/255 + build
- Mario M2: `81c904efedd8c7aaf6a66a600abece177b926e2c`, CI #864 260/260 + build

Mario/B1 stage seam for final composition:
- UI owns frozen stage ID in `GameFlowState.stage`;
- render owns `DEFAULT_STAGE_REGISTRY.get(stageId)` and `StageDefinition`;
- `FightRenderer(canvas, resolvedStage)` consumes the resolved presentation stage.

AUTO_CHAIN condition is satisfied. @Gonza starts V06-Z0 now; no Neureon release token is required.
