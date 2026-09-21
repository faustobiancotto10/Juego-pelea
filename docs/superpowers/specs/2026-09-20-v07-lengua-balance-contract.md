# V0.7 — Camaleoni Lengua Balance Contract

Status: FROZEN CANDIDATE / Ricardo may calibrate only inside the stated bounds with evidence.

## Shipped V0.6

`tongueStraight`:
- startup to active: 12;
- active: 12–14;
- total: 46;
- width: 340;
- damage: 80;
- chip: 4;
- hitstun: 18;
- blockstun: 12;
- knockback: 4.8;
- guard damage: 14;
- hitstop: 6.

Human result: repeated Lengua remains a low-skill dominant strategy.

## V0.7 initial candidate

Keep:
- startup/active identity;
- mid level;
- strong classification;
- hitstop 6;
- no arbitrary cooldown.

Change:
- width **340 → 300**;
- totalFrames **46 → 54**;
- damage **80 → 72**;
- chip **4 → 3**;
- hitstun **18 → 16**;
- blockstun **12 → 8**;
- knockback **4.8 → 3.2**;
- guardDamage **14 → 10**;
- cpuThreatRange should track real practical reach rather than remain 405.

## Design intent

Lengua remains Camaleoni's defining long-range commitment:
- strong at calling out passive movement;
- meaningful clean-hit reward;
- visually long and threatening.

It must no longer:
- repeatedly restore essentially the same comfortable zoning state on block;
- delete approach through guard damage alone;
- provide high damage, extreme reach and low repeat risk simultaneously.

## Calibration bounds

Ricardo may tune after deterministic probes without user escalation only within:
- width 285–310;
- totalFrames 52–58;
- damage 68–74;
- blockstun 7–9;
- knockback 2.8–3.6;
- guard damage 8–11.

Changing startup below 11, adding a cooldown, changing attack level, adding armor, changing input grammar or moving outside these bands is a contract change and must be reported.

## Required probes

Test both slots, center/walls and start distances 240/300/360.

At minimum:
1. repeated Lengua vs block+advance;
2. repeated Lengua vs jump-read approach;
3. repeated Lengua vs dash/guard approach;
4. whiffed Lengua punish window;
5. clean-hit reset;
6. Camaleoni CPU using Lengua against every released fighter.

Human-like policy must use delayed decisions; do not test only an omniscient optimal defender.

## Acceptance

- from 340-ish separation, a correct block/advance policy must reach ≤150 separation within **240 advancing combat ticks** against six consecutive legal Lengua attempts in representative center scenarios;
- wall scenarios cannot create an infinite safe reset;
- a clean Lengua remains materially stronger than a whiff/block;
- Camaleoni still has a measurable zoning advantage at long range;
- no new cooldown UI/resource is introduced;
- Coletazo is unchanged unless an independently reproduced regression requires repair.
