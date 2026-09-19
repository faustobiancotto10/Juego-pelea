# Handoff — V05-R5 / Frozen Core

Round: R003-V05-COMBAT-LOOP
From: Ricardo
To: Neureon, Germinator, Mario, Brancaforte
Task: V05-R5
Frozen core consumer SHA: `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc`
Branch: `round/r003-ricardo`
CI: Repository verification run #512 — 161/161 tests PASS, build PASS.

This SHA is frozen for Stage 3 consumers. Ricardo must not advance it unless Neureon explicitly coordinates a replacement after a blocking finding.

## CPU perception / decision contract

### Public delayed observation
- decisions are driven by `MatchSnapshot.combatTick`, not global/render frame;
- Standard released profiles delay opponent observations by 12 advancing combat ticks;
- duplicate reads of the same `combatTick` are idempotent and return the cached output;
- hitstop therefore does not age observation, decision cadence or reaction budget;
- opponent public projection contains visible geometry/state, move cue, Ultimate cue and visible projectiles; it does not consume GameInput/raw pointer/future input;
- own current state is used only for legality, blockstun continuation and own clean-hit chain confirm.

### Cue handling
- one cue serial per newly observed move instance / Ultimate startup / projectile instance;
- cue is evaluated once after the delayed observation boundary;
- seeded miss probability is latched for that cue; a missed cue is not rerolled each following frame;
- later distinct cues are independently evaluable;
- generic delayed reactions cover Ultimate, ranged strike, low, air normal and projectile cues;
- low guard height is selected from the delayed observed hit level, never current-frame oracle state.

### Cadence and commitment
- decision cadence: every 8 advancing combat ticks;
- movement commitments persist 12–18 ticks for Camaleoni and 12–20 for Supernariz;
- newly perceived threats do not cancel an existing movement/attack/dash commitment;
- pressure/control identity remains kit-profile data rather than fighter-ID branches or global-frame modulo triggers;
- no `snapshot.frame % ...` policy remains.

### Seed / reset
- constructor accepts `{ seed }`;
- deterministic integer PRNG;
- same seed + same public observation stream => identical outputs;
- `reset(seed?)` explicitly resets PRNG/controller hidden state;
- round transition resets controller policy state with a deterministic round-distinct sequence;
- different seeds can produce different cue/plan outcomes.

## Final released CPU profiles

### Camaleoni / control
- preferredRange: 240–330
- pressureRange: 105
- reactionTicks: 12
- decisionTicks: 8
- commitmentTicks: 12–18
- missChance: 0.25
- confirmChance: 0.85

### Supernariz / pressure
- preferredRange: 135–235
- pressureRange: 118
- reactionTicks: 12
- decisionTicks: 8
- commitmentTicks: 12–20
- missChance: 0.25
- confirmChance: 0.75

## RED → GREEN evidence

Initial R5 RED against the old CPU:
- 9 failures:
  - released profiles below 12-tick delay;
  - Ultimate current-frame response;
  - move-threat early divergence;
  - global-frame/hitstop budget drift;
  - no controller reset;
  - no seeded recognition distribution/miss latch;
  - global-frame modulo source policy;
  - no seed-dependent outcomes.

After implementation all R5 acceptance tests and migrated legacy regressions pass.

One additional real defect found during migration:
- before delayed history existed, own blockstun fallback could calculate the wrong away direction from an invented foe position;
- fixed by using own authoritative `facing`, which preserves legal block continuation without reading current opponent geometry.

## Quantitative evidence

100 isolated Standard Ultimate cues, seeds 1–100:
- recognized: **71**
- missed/latch: **29**
- target acceptance: 65–85% recognized.

Seeded integrated CPU-vs-CPU corpus:
- seed 3: match-over, winner slot 0, combatTick 2080, damage 2544, hits by source normal 27 / special 11 / projectile 3 / Ultimate 4
- seed 7: match-over, winner slot 0, combatTick 3428, damage 3532, hits 60 / 12 / 3 / 6
- seed 11: match-over, winner slot 0, combatTick 2439, damage 2817, hits 31 / 16 / 3 / 5
- seed 19: match-over, winner slot 0, combatTick 2939, damage 3168, hits 61 / 8 / 3 / 5

Same-seed integrated replay is exact.

All four sample self-play seeds were won by slot-0 Camaleoni. This is deliberately reported rather than hidden or compensated by making the CPU stronger. G1 should test whether this is a matchup/policy bias, side/seed sample artifact or meaningful balance issue.

## Verification

Exact frozen SHA `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc`:
- repository coordination contract: PASS
- full test suite: **161/161 PASS**
- build: PASS
- TypeScript checking: PASS through the exact `tsc` compilation invoked by both `npm test` and `npm run build`.

The workflow does not invoke the literal separate `npm run typecheck` / `tsc --noEmit` script, so no separate no-emit run is claimed. The same TypeScript type system compiled the exact candidate successfully in both test and build steps.

## Stage 3 consumer contract

Germinator G1 should consume exactly `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc` as the core baseline and independently attack:
- R1 commitment/guard;
- command buffering/hitstop;
- short routes/lows/Special grammar;
- air carry/facing/landing;
- Ultimate exit/walls/slots;
- delayed CPU cue timing, miss latch, seeds and self-play bias.

Mario and Brancaforte remain blocked until Neureon accepts G1 and opens Stage 4.

Ricardo remains available for gameplay/shared-contract findings until ROUND_COMPLETE.
