# Handoff — V07-R1

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-R1 — Lengua balance + CPU difficulties  
From: Ricardo  
To: Ricardo V07-R2  
Branch: `round/r005-ricardo`  
Exact candidate SHA: `cbe67859f0f3ee4e178f14eaef7b503632b94518`  
Status: GREEN

## Lengua

Frozen V0.7 candidate shipped unchanged:
- total 54;
- active 12–14;
- width 300;
- damage 72;
- chip 3;
- hitstun 16;
- blockstun 8;
- knockback 3.2;
- guard damage 10;
- no cooldown;
- practical CPU threat range 365.

Block+advance corpus across both slots, center and wall-side starts reaches <=150 separation in 38–63 advancing ticks. No scenario required calibration beyond the frozen candidate.

## CPU difficulty

`CpuControllerOptions.difficulty` accepts `easy | normal | hard`; omitted difficulty is exactly Normal.

Difficulty is an effective policy layered over each fighter's authored `CpuProfile`:
- Easy: slower delayed reaction/decisions, more missed cues, lower confirms/resources, deliberate neutral mistakes.
- Normal: byte-equivalent V0.6 policy values.
- Hard: minimum 8-tick delayed observation, faster decisions, fewer misses, stronger legal confirms/resource timing.
- Hard anti-repetition uses only already-delayed move history; no current input/future state is read.

## Verification

Validation PR: #29 (draft only).  
Repository verification run: #1008 / job 106201417573.

Results:
- coordination contract: 6/6 PASS;
- full suite: 287/287 PASS;
- build: PASS.

Evidence:
- delayed legal cue responses across seeds: Easy 33, Hard 56;
- legal confirm conversions: Easy 34, Hard 55;
- repeated delayed long-range adaptation jumps: Easy 0, Hard 27;
- current/hidden cue invariants pass for Easy/Normal/Hard before 18/12/8 tick observation delays;
- all three released fighters replay deterministically on all three difficulties;
- default difficulty replay equals explicit Normal.

## Next

V07-R2 is automatically eligible: El Toro gameplay/core, Topete movement runtime, Shawarmazo, forwardBlast Super Eructo and universal Clash support.
