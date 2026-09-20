# R003-V05-COMBAT-LOOP — Round Archive

Closed: 2026-09-20  
Closure token: `ROUND_COMPLETE — R003-V05-COMBAT-LOOP`  
Closure authority: direct user instruction to close V0.5 before forming V0.6.

## Goal

Repair combat commitment/input foundations and redesign the V0.5 combat loop so active fighting is more rewarding than passive guard + repeated Special use.

## Outcome

R003 is closed as a **technical milestone, not an official V0.5 public release**.

Accepted integrated product composition:
- `2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13`

Final independent QA composition:
- `2876f3bce7d77c04c7415df89cafcf8b31f1b61c`
- CI #632: 206/206 tests PASS + build PASS.

Preview evidence:
- isolated V0.5 preview: `/v05-preview/`
- preview publish SHA: `d6cdfdb5990051d3ef2cfb36d4970862943da420`
- preview blob: `f60818093c2e850cbdf8ed58182d0df02d27f180`
- official root remains V0.4 blob `d651bc064b25fc55a12f2b87be2c83a8ab0573d0`, unchanged.

## Delivered work

- offensive commitment can no longer block illegally;
- browser/pointer lifecycle and stuck-input recovery repaired;
- action edges buffered through hitstop;
- short clean-hit routes and grounded lows added;
- final Special grammar established;
- airborne carry/facing and Ultimate release/separation repaired;
- CPU perception made delayed, seeded and commitment-based;
- procedural presentation/UX pass completed;
- bounded registry/content boundary added and exercised with a synthetic third kit.

## Independent QA

Germinator's final automated G2 found no demonstrated code blocker. The candidate passed the integrated regression/adversarial suite and build.

Human/device evidence was not fully completed:
- physical Safari/tactile interruption testing;
- same-device V0.4 versus V0.5 comparison;
- real pixel/readability review;
- same-device performance comparison.

These gates are **not marked PASS**. They are closed with R003 by user direction and may be re-tested against the future V0.6 candidate where still relevant.

## Human findings carried forward

Subsequent playtest evidence reported:
- V0.5 materially improved over the prior build;
- repeated Lengua remains too effective at denying safe approach;
- locomotion still looks mechanically primitive;
- Ultimate presentation/counterplay still needs improvement.

These findings are inputs for future work, not failures retroactively hidden by this closure.

## Release result

V05-Z0 preview deployment completed successfully.

V05-Z1 official release was **not executed** because the human/device release gate was never approved. V0.5 therefore remains preview-only and is superseded as the next development baseline rather than promoted to the public root.

## Agent/task disposition

- Neureon: round coordination complete.
- Ricardo R1–R5: accepted/frozen.
- Brancaforte B1/B2: accepted.
- Mario M1: accepted.
- Germinator G1: approved; G2 automated evidence complete, human/device gate unresolved.
- Gonza Z0: verified preview.
- Gonza Z1: cancelled/superseded without release.

No active locks remain.

## Deferred / future inputs

The V0.6 external architecture/design documents already present in the repository remain planning material only. This closure does **not** activate V0.6, create R004, assign V0.6 tasks or issue any START/DIRECT_START token.

Next action belongs to Neureon only after a separate user instruction to form V0.6.
