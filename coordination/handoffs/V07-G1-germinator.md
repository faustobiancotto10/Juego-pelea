# Handoff — V07-G1

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-G1 — Independent gameplay/core audit  
From: Germinator  
To: Mario V07-M1 + Brancaforte V07-B1  
Audited product SHA: `94ee24898855f55787e8e077c64f259e2d7a4972`  
QA branch: `round/r005-germinator`  
QA evidence SHA: `3959c52969811f9d6bf6b2261c2680cfc374cb3d`  
Validation PR: #30  
Verification run: #1041 / job 106207153203  
Status: GREEN

## Verdict

`APPROVE — PRESENTATION LANE UNLOCKED`

## Independent evidence

Repository verification on the QA evidence SHA:
- coordination contract: 6/6 PASS;
- full recursive suite: 308/308 PASS;
- build: PASS;
- 41 test files discovered.

Germinator added nine independent adversarial probes covering:
- Lengua block+advance counterplay in both slots;
- current foe position/super/air-state leakage before Easy/Normal/Hard observation delay;
- difficulty-policy read-only behavior over fighter definitions and snapshot resources;
- Topete whiff drive cutoff and committed recovery;
- Super Eructo horizontal/vertical field bounds and blocked cleanup;
- Shawarmazo single-contact behavior and cooldown rearm;
- Ultimate Clash effective-entry delta 3 accepted / delta 4 rejected;
- all 16 ordered matchup round-reset + fresh-rematch construction;
- malformed duplicate fighter/projectile/Ultimate registration rejection.

The existing Ricardo matrix also remained green, including:
- all 16 ordered Normal CPU matchups across representative seeds;
- all released fighters on Easy/Normal/Hard deterministic replay;
- all 4x4 ordered Ultimate pairings in both slot geometries;
- round reset/projectile/transient cleanup.

## QA harness correction

Validation run #1040 initially failed one new Lengua probe because the QA harness incorrectly required exactly six Lengua attempts. In the tested counterplay, the defender reached close range after four legal attempts, so the frozen product criterion had already been satisfied. Germinator corrected only that over-constrained QA assertion. No production code changed. Run #1041 then passed completely.

## Files changed by Germinator

QA branch only:
- `tests/v07-g1-adversarial.test.mjs`

No production runtime file was modified by Germinator.

## Contract / interface conclusion

The audited gameplay/core candidate satisfies the frozen V0.7 contracts within the tested scope. No reproducible gameplay/core blocker, regression, current-state CPU cheating path, stat/resource difficulty boost, duplicate projectile contact, Ultimate cleanup failure or registration-validation hole remains open from V07-G1.

## Known risks / deferred evidence

Presentation quality, procedural portrait rendering, Juanchi visual locomotion/aura quality and final mobile/device parity are intentionally outside G1 and remain owned by Mario, Brancaforte and Gonza.

## Unresolved questions

None for the V07-G1 gameplay/core dependency.

## Next action

V07-M1 and V07-B1 are automatically eligible under AUTO_CHAIN. Gonza V07-Z0 remains blocked until G1 + M2 + B1 are all green.
