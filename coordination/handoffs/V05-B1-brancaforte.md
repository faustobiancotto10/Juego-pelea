# Handoff — V05-B1

Round: R003-V05-COMBAT-LOOP
From: Brancaforte
To: Neureon, Ricardo, Germinator
Task: V05-B1
Baseline: `b1dd335062e79d8eb0ec60ce5a23118960f17e99`
CI-green iterative head: `f927288560a0a86106766fb8045486797593050d`
Clean handoff commit: `4eddddad0a69df0b6562e28f3e55fd66bafd4fc5`
Clean branch: `handoff/r003-v05-b1`

## Files changed

Exactly four files relative to the Stage 1 baseline:
- `src/game/input/GameInput.ts`
- `src/game/ui/AppController.ts`
- `src/styles.css`
- `tests/input-v05-lifecycle.test.mjs`

No combat types, simulation, gameplay data, renderer or final V0.5 command grammar changed.

## Lifecycle contract

`GameInput.reset()` is public and idempotent. It neutralizes:
- keyboard held state;
- D-pad direction and pointer ownership;
- per-action pointer ownership sets;
- queued touch Ultimate;
- dash/double-tap state;
- chord buffer state;
- pressed visual classes.

Pointer handling:
- D-pad clears on pointerup, pointercancel and lostpointercapture;
- capture failure is caught and leaves input neutral;
- regular action buttons use per-action pointer sets, so releasing one pointer does not clear another owner's hold;
- stray releases do not clear owned actions;
- Ultimate pointer ownership controls pressed presentation while its one-shot V0.4 queue remains bounded;
- child-originated pointer events and owned drags beyond pad bounds preserve ownership;
- foreign pointer moves cannot steal D-pad state.

Browser lifecycle:
- blur => reset;
- pagehide => reset;
- hidden document visibilitychange => reset;
- orientationchange => reset;
- opening fight help resets input before pausing;
- closing help resets input again before resume;
- destroy performs reset before listener teardown, so remount starts neutral.

CSS/browser interaction:
- selection/callout/touch suppression is scoped to `.touch-layer`;
- global `body user-select:none` and global `touch-action:none` were removed;
- help/menu surfaces are not covered by the scoped no-selection rule.

## TDD evidence

RED:
- commit `ddb4769838f88dcfdbc54451cce874b350c6f5df`
- Actions run `35458669842`
- expected failure: 8 B1 lifecycle tests failed (lost capture, multi-pointer ownership, missing reset, suspension lifecycle, capture failure, remount, scoped CSS, help reset).

GREEN:
- final iterative head `f927288560a0a86106766fb8045486797593050d`
- Actions run `35458820283` — SUCCESS
- coordination contract: PASS
- full suite: **107/107 PASS, 0 failures**
- build: PASS
- TypeScript compilation passed inside `npm test` and again in build.

Explicit passing B1 coverage:
- D-pad lostpointercapture + blur;
- two owners on one action + stray pointerup;
- idempotent reset + queued Ultimate cancellation;
- pagehide / hidden visibility / orientation reset;
- capture failure;
- destroy/remount;
- scoped browser protections;
- help pause/resume reset;
- child-target drag beyond D-pad and foreign pointer isolation;
- per-owner action lostpointercapture.

Tree equivalence:
- CI-green tree: `00c71b071dc53a20ea8268bc141e4bdaba1bd154`
- clean handoff tree: `00c71b071dc53a20ea8268bc141e4bdaba1bd154`

## Evidence limitation

This session cannot resolve `github.com` from its local shell, so an actual local browser computed-style/gesture run and physical Safari device test could not be performed here. I am not marking those physical/browser gates as passed. The automated handler path and CSS contract are covered; physical Safari should be included in the later integrated device gate.

## Requested next action

Stage 1 now has both implementation handoffs:
- R1 Ricardo: `5f6d59eb2dae2e386c55593a9af346e184d5611f`
- B1 Brancaforte: `4eddddad0a69df0b6562e28f3e55fd66bafd4fc5`

@Neureon may advance to STAGE_2_CORE after reconciling the Stage 1 gate. Brancaforte must remain WAITING_FOR_TEAM; V05-B2 stays OFF_ROUND until G1 accepts the frozen core and Stage 4 is opened.
