# Handoff — V06-G1 Germinator

Round: R004-V06-CONTENT-EXPANSION  
From: Germinator  
To: Mario, Brancaforte, Neureon  
Task: V06-G1  
Verdict: **APPROVE — PRESENTATION LANE UNLOCKED**

## Accepted gameplay/core product

Exact Ricardo product SHA:
`d815694a76a7a92c004203f1ae9fd14e2035744c`

Do not consume the Germinator QA branch as product. It adds QA-only coverage.

## Independent QA evidence

Final Germinator QA head:
`56230b2702975e451ca2da6e79a5e2daed8dab02`

QA delta:
- `tests/v06-g1-adversarial.test.mjs` only, relative to exact Ricardo product branch.

CI:
- Repository verification run `35536768078` (#827)
- base: `round/r004-ricardo` at exact `d815694a76a7a92c004203f1ae9fd14e2035744c`
- coordination contract: PASS
- full suite: **251/251 PASS**
- build: PASS

Earlier run #824 is not gameplay evidence: its PR merge-ref targeted `main` and mixed current AUTO_CHAIN coordination with an older coordination-contract test from the product branch. Retargeting the CI vehicle to the exact Ricardo candidate removed that unrelated merge-ref contamination.

## Independent adversarial coverage

PASS:
- simultaneous opposing returning Rugby Boomerangs both land before symmetric cancellation/rearm;
- global hitstop freezes boomerang position, age and phase tick;
- blocked Fricción produces exactly `rub-a`, `rub-b`, `palm-release`, 6 chip, 20 GUARD damage and no projectile;
- Police Cap Rage interruption before commitment preserves the original 100 SUPER; after commitment the original meter is spent (a later ordinary interrupt hit may grant fresh received-damage meter);
- Universal Ultimate Clash accepts controlled effective-entry deltas ±3 and rejects ±4 across every ordered 3×3 pairing and both side assignments;
- accepted Clash clears live Juanchi Rugby + linear projectile state and starts Juanchi rearm at 30;
- malformed Character Package rejects an unknown projectile movement kind and a return-to-owner projectile missing return config;
- Juanchi projectile information cannot affect CPU output before the authored 12-combatTick public-snapshot delay;
- full inherited suite retains Juanchi gameplay, 9 ordered matchup legality, Ultimate/capture/release, reset/mirror, fourth-package and V0.5 regression coverage.

## Repeated Lengua counterplay

Independent scripted avoid-and-advance fixture:
- initial distance: 900;
- final distance: 178.4154;
- Lengua starts faced: 5;
- Lengua hits taken: 2;
- combat tick when melee range reached: 201.

This demonstrates measurable repeated-Lengua avoidance **and** forward conversion. It is not a claim that every Lengua is avoidable or that matchup balance is solved.

## No blocker

No reproducible gameplay/core blocker remains on the exact accepted product SHA.

Germinator made no product-code/tuning change.

## Auto-chain eligibility

This green verdict satisfies the dependency for:
- `V06-M1` — Mario;
- `V06-B1` — Brancaforte.

Both are now eligible and may start in parallel without a new Neureon token.

`V06-M2` remains dependent on M1.  
Gonza remains blocked until G1 + Mario M2 + Brancaforte B1 are all green.
