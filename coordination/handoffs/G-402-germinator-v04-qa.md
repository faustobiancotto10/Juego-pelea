# Handoff — G-402

Round: R002-V04-COMBAT-FEEL-MOBILE
From: Germinator
To: Neureon, Gonza
Task: G-402
Verdict: PASS FOR RELEASE GATE
Candidate SHA: 27588cb77aa2f4e25df3c0b2eaa4b23361210225
Branch: round/r002-germinator

## Accepted frozen inputs

- Ricardo R-201: 683d81f50afa9626785408ac7f868414ffe4061f
- Mario M-202: b163e25ab50500b5f308e38c0574987f0c284a07
- Brancaforte B-302: d5bfae4e108f882715c82ccd9282f1cc9c5f396a

The QA candidate was composed from those exact deltas only, plus independent `tests/g402-v04.test.mjs`.

## Verification evidence

Final CI-only draft PR #13 exists only to execute repository verification and must not be merged as the release path.

Exact final run:
- GitHub Actions `35425575203` (#302): SUCCESS
- coordination contract: PASS
- full test suite: PASS
- build: PASS

Specialist evidence independently preserved:
- R-201 run `35424419795` (#260): SUCCESS
- M-202 run `35425162893` (#282): SUCCESS
- B-302 run `35425090149` (#280): SUCCESS

## Acceptance result

PASS:
- Supernariz now leaves a sustained authored post-commit punish gap instead of immediately restarting optimal pressure.
- Nose-chain conversion remains deterministic but intentionally imperfect.
- CPU remains snapshot-only; independent QA found no dependency on GameInput, raw player input, pointer/touch state or future input.
- Camaleoni close game now has compensating reach/damage/stun and practical Coletazo commitment, while Supernariz retains startup, first-normal duration and movement-speed advantages. No strict first-button dominance found.
- Capture/trapped truth is simulation-owned through `capturedBy`; terminal round/match cleanup clears transient Ultimate/capture state.
- Successful Ultimate recovery, fresh fight/rematch state, whiff/interruption/KO/next-round cleanup remain green through R-201 plus G-402 coverage.
- Dedicated mobile ULTIMATE supports held D-pad movement with one second pointer, emits one exclusive `ultimate=true`, does not repeat while held and does not leak ATTACK/SPECIAL/Push Guard.
- Not-ready touch Ultimate is inert; desktop J+K compatibility remains covered by the full suite.
- Renderer remains procedural/reference-image free, consumes authoritative capture state and bounds transient effects.
- Coletazo and both Ultimate presentation contracts pass renderer tests.
- deterministic/regression suite remains green.

## iPhone-scale landscape smoke

Objective integrated geometry was checked at 852x393 CSS pixels.

With zero side cutout:
- central lane between D-pad and action cluster: about 383px.

With a deliberately deep 59px safe area on both landscape sides:
- central lane remains about 299px.

Other results:
- ULTIMATE target resolves to about 75px.
- action cluster top is about y=199px, keeping the controls in the lower half.
- safe-area anchoring, READY/disabled styling and reduced-motion rules remain present.

This is sufficient objective evidence for playfield-obstruction/readability structure. No claim is made about real physical-device tactile feel because that hardware surface is unavailable to this QA runtime.

## Findings

No release-blocking G-402 finding remains open.

## Remaining release responsibility

Gonza owns:
- accepted-SHA integration;
- final assembled full-suite/build verification;
- release/site smoke on the actual published candidate;
- blocking publication if a release-only obstruction or regression appears.

Neureon alone authorizes STAGE_4_RELEASE and ROUND_COMPLETE.
