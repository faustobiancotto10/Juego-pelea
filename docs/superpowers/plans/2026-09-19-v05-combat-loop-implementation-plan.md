# V0.5 Combat-loop Implementation Plan

> **For agentic workers:** use `superpowers:executing-plans` inside your assigned specialist task. Neureon routes the existing permanent team; do not spawn replacement roles or depend on Astra. Steps use checkboxes for execution tracking. This document does not activate a round or authorize this external auditor to implement production code.

**Goal:** make approach, short melee conversion, readable defense and escape more rewarding than holding away and repeating Special.

**Architecture:** retain fixed 60 Hz simulation, procedural Canvas2D rigs and DOM controls. Repair action/state invariants before tuning. Add only bounded command/perception state and explicit fighter-kit/projectile/Ultimate definitions justified by current duplication.

**Tech Stack:** TypeScript, browser ES modules, Canvas2D, DOM/CSS, Node test runner, GitHub Pages. No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-09-19-v05-combat-loop-master-audit.md` (read all sections, especially evidence labels and AC01–AC12).

**Baseline:** audited main `052b32604e1e0ced34aa0f6089a8615f52a79d15`; V0.4 product `db9b52e097f3f8ecf9ac45e7a73354477e8592b1`. Begin implementation from the main containing this documentation intervention, after rereading live coordination.

## Global constraints

- Logical combat runs at fixed 60 Hz. No wall-clock move/stun/cooldown/buffer/perception timers.
- Simulation owns combat truth. Rendering never determines hits, damage, legality, capture or spacing.
- Fighters remain procedural/articulated Canvas2D. No runtime reference sprites/images.
- Mobile landscape remains first-class. Keep four action buttons and the dedicated Ultimate.
- No new runtime dependencies, engine migration, fifth action button, new playable character or generic scripting system.
- Fewer meaningful mechanics: retain short normal chains, add one low normal per fighter, repair existing air overheads; no grab/tech in V0.5.
- Candidate tuning values in the spec are starting points; scenario outcomes are the gate. Record every accepted numerical departure.
- Coordination is not runtime content. Current round/locks/accepted SHAs outrank chat memory.
- This intervention changes documentation only. The user requested the plan for subsequent specialist execution.

## Review focus

1. Input lost between render samples or during hitstop, and ghosts after pause/background: B1/B2/R3 must test the whole path.
2. Slot/order asymmetry at simultaneous contact, Ultimate release and walls: R1/R4/G1 must compare mirrored traces.
3. A chain that changes move IDs but lets guard/jump escape between supposed combo hits: R3/G1 must assert actual damage and actionability.
4. New CPU reaction code quietly retrying a missed cue or observing current hidden state: R5/G1 must test delayed-observation twins and seeded replay.
5. New source paired with an old standalone/Pages bundle: Z1 must regenerate, compare and play the published artifact, not just source.

## Execution order and activation economy

Neureon opens a new user-approved round, suggested `R003-V05-COMBAT-LOOP`, with **Staged activation: enabled**. Do not overwrite IDLE as part of this audit. Each stage gets normal PRESENT/START_ROUND handling under the existing protocol.

| Stage | Active work | Gate to advance |
| --- | --- | --- |
| 0 — scope | Neureon only, N1 | Task contracts, branch/file ownership and acceptance baseline recorded |
| 1 — repair foundations | Ricardo R1 and Brancaforte B1 independently | Attack commitment and pointer lifecycle independently tested; no shared-type edits by B1 |
| 2 — core | Ricardo R2 → R3 → R4 → R5 | Exact core consumer SHA + types/schema/tuning + meaningful interaction tests frozen |
| 3 — independent core check | Germinator G1; Ricardo only for findings | Critical state/contract/balance regressions closed before visual work |
| 4 — presentation/UX | Mario M1 and Brancaforte B2 in parallel on frozen core | Both handoffs compile against the same accepted contract |
| 5 — integrated experience | Germinator G2, Neureon organizes physical/human test; owners repair findings | Independent QA + human/device gate accepted |
| 6 — release | Gonza Z1; Neureon closure | Exact accepted deltas integrated, artifacts verified, public smoke, archive/reset |

Do not require idle future roles to reread the entire archive. Neureon gives them the spec, their task, the frozen contract and unresolved findings. Implementers remain available for dependencies but do not manufacture extra work. If mechanics fail human playtest, return to the relevant bounded task, not a simultaneous whole-team redesign.

### Path shorthand

All paths are repository-relative. Bare `types.ts` means `src/game/types.ts`; `fighters.ts`/`fighterKits.ts` are under `src/game/data/`; `CombatSimulation.ts`/`moves.ts` under `src/game/simulation/`; `CpuController.ts` under `src/game/simulation/`; `GameInput.ts`/`keyboard.ts`/`dpad.ts` under `src/game/input/`; `AppController.ts` under `src/game/ui/`; render files, including both rigs, under `src/game/render/`. Coordination task files belong under `coordination/tasks/`. Check actual current paths before locking them.

### Branch and shared-file policy

Suggested branches: `round/r003-ricardo`, `round/r003-brancaforte`, `round/r003-mario`, `round/r003-germinator`, `round/r003-integration`. Live coordination stays on main. Integrate **accepted commit deltas**, never merge stale coordination from a feature branch.

- Ricardo exclusively owns `types.ts`, simulation, gameplay data, CPU and shared combat interfaces until freeze.
- Brancaforte owns input/UI/CSS; only consumes shared types. B1 avoids new shared types; B2 consumes R3/R4 contracts.
- Mario owns render files; requests missing state instead of inferring it.
- Germinator authors separate test files/fixtures; changes owner tests only by agreement.
- Gonza owns build/release tooling and artifact generation; obtains a package/CI lock before changing them.
- Neureon owns durable decisions and live task/status routing. Temporary locks and handoffs are mandatory when an active task touches a shared file.

### Forum policy for this round

Use at most three focused threads initially: `r003-contract.md`, `r003-qa-findings.md`, `r003-release.md`. Post only a discovery, decision, blocker, concrete question or handoff. Include task ID, exact SHA, reproduction, implication and requested action. No “still working” chatter and no email. Promote accepted semantics into DECISIONS at freeze. G1/G2 independently rerun important claims; Gonza independently validates the integrated artifact. Astra is not in any gate.

## Frozen contracts that tasks must produce

The following are recommended interface targets for Neureon to freeze, not code implemented or previously approved by this audit. Ricardo may refine names only **before** consumer freeze and must update the contract table and affected tasks together.

### C1 — Input delivery and command lifetime

In `src/game/types.ts`:

```ts
export type CombatAction = 'attack' | 'special' | 'jump' | 'ultimate' | 'pushGuard';
export interface CommandIntent {
  action: CombatAction;
  direction: { left: boolean; right: boolean; up: boolean; down: boolean };
}
// Add to existing InputFrame; retain held booleans and dash intents:
// commands?: readonly CommandIntent[];
```

`commands` is optional for legacy tests/controllers. If present, its entries are the **only** action edges for that input sample, including when empty; held booleans must not create duplicate commands. If absent, derive rising edges from legacy booleans. New GameInput/CPU producers should supply commands explicitly. Deliver queued edges in order, maximum four per sample; bounded eight-entry DOM queue, retain newest on overflow. Simulation collapses same-sample conflicts to priority from spec §6 and keeps at most one pending command per fighter. A command contains the direction at press time; do not re-read current D-pad direction when a buffered Special finally starts.

- `GameInput.reset(): void`: idempotently neutralizes all physical state/queues/styles/captures.
- `GameInput.getFrame(context?: CombatInputContext): InputFrame`: directions held, queued edges delivered once; direct desktop L Ultimate; no READY-dependent J/K delay.
- `CombatSimulation.resetInputState(): void`: clears per-fighter previous physical inputs and pending commands without advancing combat. AppController calls this together with GameInput.reset on suspension/help; ordinary hitstop never calls it.
- Six advancing-combat-frame simulation expiry, frozen during hitstop. All terminal/capture resets clear it. Invalid commands cannot freeze existing actions.

### C2 — Minimal snapshot additions

Add simulation-owned fields with deterministic defaults/reset and clone coverage:

| Field | Type / semantics | Consumer |
| --- | --- | --- |
| `MatchSnapshot.combatTick` | number; increments once per advancing fight step, not hitstop/intro/result; monotonic within match | CPU clock, scenarios |
| `FighterSnapshot.moveContact` | `'none'|'hit'|'block'`; current move only, reset on new/cleared move | confirm feedback, own-contact CPU policy |
| `FighterSnapshot.ultimatePhaseFrame` | number; per-phase frame, reset on transition | Mario timeline |
| `FighterSnapshot.ultimateConnected` | boolean; false at startup/whiff, true after capture until cleanup | successful exit versus whiff visuals |
| `FighterSnapshot.landingRecoveryFrames` | number; four-frame landing commitment, reset on next jump/capture/terminal | grounded landing pose/legality |
| `FighterSnapshot.pushGuardRecoveryFrames` | number; six-frame paid-escape commitment | gameplay/QA, subtle recovery pose |

Retain authoritative `capturedBy`, `ultimateTarget`, `ultimatePhase`, y/vy/grounded. Expose a `land` event `{type:'land'; fighter:FighterIndex}` and an `ultimate-release` event `{type:'ultimate-release'; attacker:FighterIndex; defender:FighterIndex}`. Extend `hit` with an authoritative source category (`normal|special|projectile|ultimate`) and `finisher:boolean` so final KO cleanup cannot erase effect identity. No consumer guesses source from a move ID that may have been cleared the same tick.

### C3 — Bounded fighter content

Create `src/game/data/combatRegistry.ts`, `src/game/data/fighterKits.ts`, `src/game/data/projectiles.ts`, `src/game/data/ultimates.ts`. Existing `fighters.ts` keeps stats and display identity; `moves.ts` keeps authored move tables and hitbox types.

```ts
interface FighterKit {
  standing: string; low: string; air: string;
  rangedSpecial: string; closeSpecial: string; ultimate: string;
  cpu: CpuProfile;
}
interface CpuProfile {
  preferredRange: readonly [number, number];
  pressureRange: number;
  reactionTicks: number; decisionTicks: number;
  commitmentTicks: readonly [number, number];
  missChance: number; confirmChance: number;
}
```

`CombatRegistry` exposes `getFighter(id)`, `getKit(id)`, `getMove(id,moveId)`, `getProjectile(key)`, `getUltimate(key)`, and `playableIds`. Lookups fail clearly on missing IDs. Default exported `DEFAULT_COMBAT_REGISTRY`; `CombatSimulationOptions.registry?` and `CpuController` options `registry?` enable isolated fixtures. Use a registry-validated string `FighterId` instead of assuming every unknown ID is Supernariz; released IDs stay unchanged and UI lists only `playableIds`.

Projectile definitions include key, spawn offset x/y, speed, TTL, collision extents, damage/chip/guard/stun/knockback/hitstop and cooldown. Moves reference projectile key plus spawn frame. Ultimate definitions include key, kind `dashCapture|suctionCapture`, startup/capture/recovery durations, capture dimensions, dash/pull parameters, sequence hit beats, release parameters and visual key. Move metadata includes category and binding role so CPU threats and meter rules do not enumerate fighter move names. Keep one current chill primitive; don't create a general status engine.

Definition types must be exported where used. No cyclic dependency from core data to renderer or DOM. Migration must preserve the R1-repaired baseline traces before subsequent tuning. During R2 only, allow an absent low slot and a temporary legacy-binding adapter so the existing up-Coletazo/down-tongue mappings remain equivalent. R3 fills both low slots, removes that adapter and makes the final FighterKit contract above mandatory. Do not combine the data extraction and binding changes. Third-fixture test uses an injected registry, not global mutation and not a selectable character.

### C4 — Replay and contact ordering

`CpuController(index, options?: {seed?: number; registry?: CombatRegistry})` remains callable with the existing single argument. Add `reset(seed?: number): void`. Capture the seed, initial state, scenario settings and InputFrame stream in QA reports. Determinism includes CPU observation queue/PRNG state and all new command/recovery fields.

Evaluate ordinary strike contact candidates from one post-movement pre-contact view; simultaneous compatible active strikes trade. An earlier hit on a prior step still interrupts startup. Ultimate capture/sequence is exclusive and needs deterministic arbitration for simultaneous requests; preserve tested current behavior unless G1 finds slot bias, then resolve by authored timing and an explicit symmetric tie policy (both captures fail on an exact simultaneous tie, meter committed and whiff recovery). Apply queued successful releases after fighter updates so slot 0/1 see identical first release state. Avoid per-slot side effects before the other fighter's intent is evaluated.

## N1 — Neureon: establish an executable round

**Files:** `coordination/CURRENT_ROUND.md`, `STATUS.md`, `LOCKS.md`, task files `V05-N1.md`, `V05-R1.md` through `V05-R5.md`, `V05-B1.md`, `V05-B2.md`, `V05-M1.md`, `V05-G1.md`, `V05-G2.md`, `V05-Z1.md`; three forum threads above; `docs/DECISIONS.md`, `docs/CURRENT_MILESTONE.md`.

- [ ] Confirm the current main and preserve the audit's historical baseline. Do not copy the stale V0.2 milestone or R001 start authorization.
- [ ] Open staged CHECK_IN, create each task with its owned paths, dependency, prohibited scope and this plan section link. Initially activate only Ricardo and Brancaforte.
- [ ] Record selected V0.5 package: short routes + low/overhead; no grab, universal stamina or blanket cooldown.
- [ ] Require per-task reproductions/red-green evidence, exact SHA and limitations. At core freeze record final tuning table and actual frame/actionability measurements.
- [ ] After G2, permit RELEASE only with closed blockers; after Z1, issue ROUND_COMPLETE and archive/reset every active index, not only CURRENT_ROUND.

**Acceptance:** existing coordination contract passes, no contradictory start tokens, no future role blocks a safe earlier stage.

## R1 — Ricardo: repair commitment and contact invariants

**Depends:** N1. **Parallel:** B1 only, no shared product files.
**Modify:** `src/game/simulation/CombatSimulation.ts`.
**Create:** `tests/combat-v05-commitment.test.mjs`.
**Consumes:** existing InputFrame/MatchSnapshot. **Produces:** one guard-eligibility path used for strike/projectile resolution; normal moves cannot survive by illegally blocking. No broad tuning here.

- [ ] Add the regression below plus startup/active/recovery, both fighters/slots, projectile, neutral guard and blockstun controls. Fail against unchanged V0.4 first.
- [ ] Implement shared guard legality (grounded, away/height, no offensive move/Ultimate/dash/hitstun/guardbreak/capture, positive GUARD). Ensure a blockstunned defender can continue correct height guard.
- [ ] Cover simultaneous active strikes/trades from C4, hit during startup, guard break while attacking and invalid Ultimate/Push Guard intent not suspending a timeline. Do not suppress all trades accidentally by resolving index 0 first.
- [ ] Run `npm test`, `npm run typecheck`; record before/after exact damage and contact state; commit `fix: enforce combat commitment and guard legality`.

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';
const input = p => ({...E, ...p});

test('Lengua startup cannot block nose1 by holding away', () => {
  const sim = new CombatSimulation('chameleon','supernariz',{skipIntro:true});
  // Test-only JS setup; production exposes no mutation hook.
  sim.fighters[0].x = 500; sim.fighters[1].x = 590;
  sim.step(input({left:true,special:true}), input({attack:true}));
  let snap;
  for (let n=0; n<4; n++) snap=sim.step(input({left:true}), E);
  const hit=snap.events.find(e=>e.type==='hit' && e.defender===0);
  assert.ok(hit); assert.equal(hit.blocked,false);
  assert.equal(hit.damage,42);
  assert.equal(snap.fighters[0].moveId,null);
});
```

**Risk / independent QA:** closing this exploit changes many strategy results; never compensate by restoring guard during recovery. Germinator must reproduce both hold-away and no-away cases independently, not only run this test.

## B1 — Brancaforte: browser-safe control lifecycle

**Depends:** N1. **Modify:** `src/game/input/GameInput.ts`, `src/styles.css`, suspension/help plumbing in `src/game/ui/AppController.ts`.
**Create:** `tests/input-v05-lifecycle.test.mjs`.
**Consumes:** current input/snapshot contract. **Produces:** `GameInput.reset()` and robust ownership; no new shared fields until B2.

- [ ] Reuse/extend the fake D-pad and button harness in `tests/g402-v04.test.mjs`; add assertions below. Against V0.4 lost capture/blur fails.
- [ ] Implement pointer ownership, lostcapture/cancel/up cleanup, capture-failure cleanup and idempotent reset. Per-action pointer sets prevent another pointer's release clearing a held button.
- [ ] Add scoped selection/callout/drag protections and nonpassive preventDefault. Preserve help/menu interaction; avoid treating `user-scalable=no` as a selection solution.
- [ ] Reset on blur/hidden/pagehide/help/orientation suspension; neutralize controls when returning; pause/resume safely. B2 attaches simulation reset once that API exists.
- [ ] Check actual DOM computed styles/gesture behavior in browser, then physical Safari as available. Record lack of a physical device rather than marking that gate passed.
- [ ] Run `npm test`, typecheck; commit `fix: recover mobile controls after browser interruptions`.

Core harness event/assertion sequence (use actual handlers; `fire` dispatches the supplied event to registered listeners):

```js
// Each case starts from a fresh GameInput fixture with D-pad rect 0,0,160,160.
dpad.fire('pointerdown',{pointerId:11,clientX:145,clientY:80});
assert.equal(gameInput.getFrame().right,true);
dpad.fire('lostpointercapture',{pointerId:11});
assert.equal(gameInput.getFrame().right,false);
dpad.fire('pointerdown',{pointerId:12,clientX:10,clientY:80});
assert.equal(gameInput.getFrame().left,true);
windowHarness.fire('blur');
assert.equal(gameInput.getFrame().left,false);
gameInput.reset(); gameInput.reset();
assert.deepEqual(gameInput.getFrame().commands ?? [],[]);
```

Also test two action pointers on one button (release one retains hold), stray pointerup, child targets, drag beyond pad bounds, destruction/remount, and queued Ultimate canceled by lifecycle reset. No string-regex-only declaration of browser safety.

## R2 — Ricardo: extract only current character primitives

**Depends:** R1. **Modify:** `fighters.ts`, `types.ts`, `simulation/moves.ts`, `CombatSimulation.ts`, data access in `CpuController.ts`.
**Create:** four C3 data files, `tests/fighter-registry-v05.test.mjs` and `tests/fixtures/v05-registry.mjs`.
**Produces:** C3 registry/kit definitions. No behavior tuning in this commit.

- [ ] Record compact reference traces from the repaired R1 baseline for normals, projectile, slow, both Ultimate kinds and both slots. Snapshot/action streams are the comparison, not source text.
- [ ] Move current values into definitions. Replace fighter-name dispatch in universal input, projectile spawn and CPU profile selection. Keep two explicit Ultimate primitive handlers and shared capture/release cleanup.
- [ ] Add a third fixture ID using existing primitives with different stats/normal/projectile values and a CPU profile; inject it without editing core methods. Test unknown IDs and incomplete kit references fail with clear errors.
- [ ] Assert trace equivalence for current fighters and prove fixture damage/range/cooldown come from its data. No test fixture in `playableIds` or default bundle.
- [ ] Run `npm test`, typecheck; commit `refactor: define fighter kits and existing combat primitives`.

Test shape:

```js
// v05-registry.mjs exports fixtureRegistry and fixtureId from an immutable
// DEFAULT_COMBAT_REGISTRY copy with fixture stats/moves/kit/projectile/ultimate.
const sim = new CombatSimulation(fixtureId,'chameleon',
  {skipIntro:true,registry:fixtureRegistry});
const cpu = new CpuController(0,{seed:7,registry:fixtureRegistry});
const snap=sim.step(cpu.nextInput(sim.getSnapshot()),E);
assert.equal(snap.fighters[0].id,fixtureId);
assert.ok(!fixtureRegistry.playableIds.includes(fixtureId));
assert.throws(()=>fixtureRegistry.getMove(fixtureId,'missing'));
```

**Risk:** definitions/import cycles and accidental behavior change during extraction. G1 must verify a third registered fixture actually attacks and launches its configured projectile, not merely constructs.

## R3 — Ricardo: command buffer, melee, mappings and Special economy

**Depends:** R2. **Modify:** `types.ts`, `simulation/CombatSimulation.ts`, `simulation/moves.ts`, relevant C3 data files.
**Create:** `tests/combat-v05-input.test.mjs`, `tests/combat-v05-melee.test.mjs`, `tests/combat-v05-specials.test.mjs`.
**Update deliberately:** `tests/fighter-mechanics.test.mjs`, low-tongue cases in `tests/combat-v02.test.mjs`, mapping/meter assumptions in `tests/combat-v03.test.mjs` and v04 tests.
**Produces:** C1 action contract, C2 contact/tick/recovery fields, playable grammar and frozen move/economy data.

- [ ] Add failing tests for hitstop edge capture, held-repeat, early expiry, invalid intent progression and direction-at-press; implement six-frame pending command semantics. Tests with absent commands retain old synthetic edge support; defined empty commands never double-trigger held booleans.
- [ ] Add grounded `clawLow`/`noseLow` and uniform down Special mapping using kit lookups. Replace—not merely skip—obsolete low-tongue tests with low-normal height interaction and Coletazo mapping tests. DOWN+ATTACK cannot chain-cancel; an unmodified ATTACK may. Cover direction-at-press for both.
- [ ] Apply spec §6 candidate normal timelines, then measure actual routes at 62/85, both slots/walls. Modify hitstun/cancel/pushback only enough to meet true-combo and counterplay criteria. Keep damage bands and first-normal identity.
- [ ] Apply spec §7 Special candidates separately; prove interrupted startup, punishable close/mid whiff/recovery, useful tip-range approach, cooldown and airborne answers. Keep Chorizo 120-frame cooldown; no new Lengua cooldown.
- [ ] Implement new per-category SUPER awards, zero chip/Ultimate gain, single ready event, carry-over/reset. Add Push Guard recovery and boundary overflow transfer; held Special cannot auto-trigger it.
- [ ] Produce measured table: startup/active/total, actual hit/block actionability, practical reach, punish distance, combo damage and meter. Freeze commands/kit/move schema; no renderer guesswork.
- [ ] Run targeted tests then full suite/typecheck; commit input, melee/mapping and balance separately for reviewable causality.

True-combo assertion, not merely transition:

```js
function runRoute(id, first, cancelAt) {
  const sim=new CombatSimulation(id,id,{skipIntro:true});
  sim.fighters[0].x=500; sim.fighters[1].x=562;
  sim.step(input({attack:true}),E);
  let snap=sim.getSnapshot(), confirmed=false, queued=false;
  const hits=[];
  for(let n=0;n<100;n++) {
    const f=snap.fighters[0];
    const chain=!queued && f.moveId===first && f.moveFrame>=cancelAt;
    if(chain) queued=true;
    snap=sim.step(chain?input({attack:true}):E,
      confirmed?input({right:true}):E);
    for(const e of snap.events) if(e.type==='hit' && e.attacker===0) {
      hits.push(e); confirmed=true;
    }
  }
  assert.equal(hits.length,2);
  assert.equal(hits[0].blocked,false); assert.equal(hits[1].blocked,false);
  return hits;
}
const clawHits=runRoute('chameleon','claw1',9);
assert.equal(clawHits.reduce((n,e)=>n+e.damage,0),106);
// Extend to the full nose1→nose2→nose3 route and late accepted window presses.
```

Add six individual hitstop-phase press tests (actual hitstop length varies per move); press/release/hold variants; successful queue versus expired whiff; pressure into reversal jump/backdash/guard. For resource tests set SUPER to 95, cause known normal damage, assert cap100 and exactly one ready event; repeat hits at cap emits none. Ultimate damage and chip emit zero gains to both sides.

**Risk / QA:** buffering must not turn holding attack into automatic combos; true combos must not imply infinite block pressure. Germinator runs constant defense after first hit and reach edge cases rather than trusting a `comboCount`.

## R4 — Ricardo: aerial commitment and successful Ultimate exit

**Depends:** R3. **Modify:** `CombatSimulation.ts`, `types.ts`, relevant move/Ultimate definitions.
**Create:** `tests/combat-v05-air.test.mjs`, `tests/combat-v05-ultimate.test.mjs`.
**Produces:** C2 phase/landing/release fields/events and §8–9 motion contract.

- [ ] Reproduce airClaw/nose horizontal stop and ordinary attack turn-through; implement preserved air carry, one physics integration per step and locked attack/takeoff facing.
- [ ] Add four-frame landing recovery with guard semantics from spec; author airborne hit trajectory and test intentional ascent/landing punishes. Try current hurtbox first, then candidate +16 foot inset only if required by escape evidence.
- [ ] Add Ultimate phase-frame/connected state, candidate startup tells, success versus whiff recovery and deferred common release pass. Use simulation release displacement/launch/stun, including corner overflow, not renderer offsets.
- [ ] Verify 190 total damage, zero self-refund, committed whiff spend, interrupted-startup preservation, simultaneous capture tie policy, behind/out-of-range/jump escape and terminal/rematch cleanup.
- [ ] Prove both successful Ultimates meet distance/actionability requirement center and both corners, with defender holding toward+attack/away/jump on release. Defender cannot immediately cancel the attacker's successful recovery with a normal.
- [ ] Publish a frozen consumer SHA with examples for start/capture/sequence/finisher/release/recovery/whiff/KO snapshots. Run full suite/typecheck and commit `fix: preserve aerial commitment and ultimate exit reward`.

Critical numerical assertion:

```js
for(const id of ['chameleon','supernariz']) {
  const sim=new CombatSimulation(id,id,{skipIntro:true,initialSuper:[100,0]});
  sim.fighters[0].x=500; sim.fighters[1].x=620;
  sim.step(input({ultimate:true}),E);
  let snap=sim.getSnapshot(), captured=false;
  for(let n=0;n<240;n++) {
    snap=sim.step(E,E);
    captured ||= snap.fighters[1].capturedBy===0;
    if(captured && snap.fighters[0].ultimatePhase==='idle') break;
  }
  assert.ok(captured);
  assert.equal(snap.fighters[0].ultimatePhase,'idle');
  assert.ok(Math.abs(snap.fighters[1].x-snap.fighters[0].x)>=200);
  assert.equal(snap.fighters[1].health,810);
}
```

Mirror this assertion by index and reflection around arena midpoint640. Capture/release counters must agree on the same advancing step; no one-tick free action for one slot. Use `>=200` only at actual attacker actionability, not during a later hand-picked instant.

## R5 — Ricardo: delayed, committed CPU decisions

**Depends:** R4 so observations reference final actions. **Modify:** `CpuController.ts`, `fighterKits.ts` CPU profiles.
**Create:** `tests/cpu-v05.test.mjs`, `tests/fixtures/v05-policies.mjs`.
**Produces:** C4 seeded controller; bounded public-observation history and single-decision-per-cue behavior.

- [ ] Write delayed-observation twin tests: histories identical until a new threat, future snapshots differ only by that threat; outputs cannot diverge because of it before 12 advancing ticks. Cover Ultimate, Lengua, projectile and air-normal cues.
- [ ] Implement public projection/ring, combatTick cadence, seeded missed-cue latch, 12–20-frame commitments and eight-tick decisions. No current opponent move-frame polling to bypass delayed history.
- [ ] Replace exact global-frame attack opportunities and compulsory helpless post-commit patterns with profile choices; retain recognizably zoner/rushdown priorities. Add low/overhead/guard-height choices without instant defense.
- [ ] Give missed cue cases a fixed seed where a miss occurs; assert no defense on later frames of the same cue, then allow a new cue to be evaluated. Hitstop does not advance reaction budget.
- [ ] Run 100 cue opportunities and repeated seeded matches; record reaction/action histograms, damage, time, category use and escape outcomes. Re-run Appendix B baseline policies; do not “fix” easy wins solely by making the CPU stronger.
- [ ] Run full suite/typecheck; commit `feat: give cpu delayed observations and committed decisions`.

Behavioral test contract:

```js
// observedTrace(seed, observations) is a test helper that calls nextInput once
// per supplied snapshot and records returned InputFrames without altering CPU.
const a=new CpuController(1,{seed:23});
const b=new CpuController(1,{seed:23});
// Base histories are neutral and equal. At tick20, B sees a newly started move.
for(let tick=0;tick<32;tick++) {
  const plain=makePublicScenario(tick,false);
  const threat=makePublicScenario(tick,tick>=20);
  assert.deepEqual(a.nextInput(plain),b.nextInput(threat));
}
```

Define `makePublicScenario` inside this test by cloning a fresh simulation snapshot and setting `combatTick`, `frame`, player position to500/700, and opponent moveId/moveFrame/Ultimate fields for the desired cue. Keep all self states identical and avoid an unrelated attack collision; this tests perception, not physics. Then run real integrated simulation traces separately. A regex forbidding `GameInput` imports remains useful but is insufficient.

## G1 — Germinator: independently reject a bad core freeze

**Depends:** exact R5 consumer SHA and B1 SHA. **Create:** `tests/v05-adversarial.test.mjs`, `coordination/handoffs/V05-G1.md`; findings in QA thread.

- [ ] Reconstruct B01/B03/B04/B05/B06/B09 independently from original source paths and Appendix A. Compare actual candidate behavior; do not accept tests that only assert values or method names.
- [ ] Run AC01/03–09/11: both slots, both matchups and mirrors, both walls, distances62/85/120/200/300/400/620, READY/not-ready, during hitstop and immediately after round reset.
- [ ] Add adversaries: permanent stand guard, crouch guard, retreat+Special, precise whiff punisher, jump-on-read, mashing pressure. Verify every offensive/defensive tool has at least one meaningful answer. Distinguish intended combo lock from infinite pressure.
- [ ] Verify two extracted current kits plus third test kit, including actual projectile hit/damage/status, and no fixture in released UI.
- [ ] Audit constraints, schema resets, CPU seeds/hidden-state boundary, cap/budget behavior and no runtime dependency on coordination. Run full tests/build against the **combined exact candidate**, not isolated branches.
- [ ] Issue APPROVE FOR PRESENTATION or BLOCK with minimal reproduction and exact SHA. Return fixes to owners; rerun failed scenario and affected regression family.

**Gate:** no critical defect, no missing state contract, no claim of human/device completion yet. Do not start Mario against a rejected moving target.

## M1 — Mario: purposeful procedural animation and feedback

**Depends:** G1 accepted core SHA. **Modify:** `FighterRenderer.ts`, `ChameleonRig.ts`, `SupernarizRig.ts`, `FightRenderer.ts`, `CombatEffects.ts`; optional renderer-only debug overlay within FightRenderer.
**Create:** `tests/render-v05.test.mjs`. **Consumes:** C2 state/events and readonly timing definitions.

- [ ] Replace non-chameleon fallback with explicit rig map; unregistered visual key fails visibly in development.
- [ ] Build ascent/apex/descent and four-frame landing poses; align low/standing/air attacks with contact heights/reach. Keep Coletazo's articulated vocabulary. Add a development-only hitbox/hurtbox overlay computed from readonly snapshot/data; it never mutates rules.
- [ ] Use phaseFrame and connected flag to author Ultimate startup/capture/sequence/finisher/release/whiff/recovery. Camaleoni early invisibility alpha<=0.12, deliberate reappearance before finisher; Supernariz launch trail follows authoritative release.
- [ ] Use authoritative hit source/finisher event for contact/KO effects; avoid inspecting a cleared move to decide if a hit was Ultimate. Clear capture geometry promptly; allow only bounded transient final impact on KO.
- [ ] Advance effect ages by consumed simulation-frame deltas, not render count; pauses don't age combat effects. Keep <=120 particles and <=6 flashes of each type. No runtime raster fighters.
- [ ] Record comparable screenshots/video at startup/active/recovery, jump apex/landing, both Ultimates, capture release/KO and 852×393 landscape. Show overlay comparison for strike contact, not just attractive screenshots.
- [ ] Run render contracts/full suite/build; commit `feat: align procedural combat animation with readable phases` and hand off exact SHA plus state contract and capture list.

**Tests:** calling render 1 or 4 times for the same snapshot does not advance combat-effect lifetime; consuming the same frame does not duplicate events; 30/60/120 render schedules over identical simulation stream keep phase alignment; zero state mutation across rendering; no lingering captured pose after cleared state; source image prohibition remains. Actual pixels are required to validate art, regex checks cannot.

## B2 — Brancaforte: consistent action grammar and whole-path responsiveness

**Depends:** G1 core SHA and B1. **Modify:** `GameInput.ts`, `keyboard.ts`, `dpad.ts` if needed for documented down grace, `AppController.ts`, `src/styles.css`, `README.md` controls.
**Create:** `tests/input-v05-commands.test.mjs`, `tests/ui-v05.test.mjs`.
**Consumes:** C1/C2/C3. **Produces:** exact InputFrame.commands delivery, explicit mobile help and new reset handshake.

- [ ] Add bounded action-edge queue, per-event direction capture and four-sample down grace. Retain D-pad diagonals; no distance-dependent Special choice. Test press/release between getFrame calls and down-right → right + immediate Special.
- [ ] Ensure one physical down-edge creates at most one action; Ultimate and Push Guard suppress lower-priority same-sample actions. Held Special or an earlier buffered offensive Special never changes into a new Push Guard; classify the new edge against the actual blockstun context at ingestion. Move toward+Ultimate remains two fingers.
- [ ] Map desktop L to dedicated Ultimate, remove J+K chord behavior and meter-dependent delays. Update legacy tests intentionally. Test before/at READY and resource consumption; UI cannot authorize illegal gameplay.
- [ ] Connect GameInput.reset and CombatSimulation.resetInputState to pause/visibility/help/orientation handling; no simulation step is taken merely to clear input. Queued action cannot execute on resume.
- [ ] UI derives released fighter listings from registry metadata; remove low-tongue copy, label both directional Specials and low normal in the guide, retain current compact layout. Context feedback should describe why a request is unavailable only when useful (SUPER/cooldown/actual Push Guard); no engine internals in player copy.
- [ ] Exercise 667×375, 852×393, 932×430 landscape and portrait overlay, safe areas and both thumb/action combinations. Focused help remains usable and can close with fresh neutral state.
- [ ] Run input/UI/full suite/build; commit `feat: unify mobile and keyboard combat commands`; handoff exact SHA and physical-browser evidence/limits.

Full-path test shape (use actual GameInput and simulation):

```js
attack.fire('pointerdown',{pointerId:3});
attack.fire('pointerup',{pointerId:3}); // both occur before a simulation sample
const frame=gameInput.getFrame();
assert.equal(frame.commands.filter(c=>c.action==='attack').length,1);
sim.step(frame,E);
assert.equal(sim.getSnapshot().fighters[0].moveId,'claw1');
assert.equal(gameInput.getFrame().commands.length,0);
// Repeat while hitstop is active; queue must start a legal chain exactly once.
```

**Risk:** UI tests with stubbed pointer capture prove logic, not iOS gesture suppression. Require physical Safari trace/checklist in G2; preserve ordinary browser accessibility outside active combat.

## G2 — Germinator + Neureon: integrated usability and fun gate

**Depends:** accepted G1+M1+B2 deltas assembled on an explicitly named QA candidate. Owners remain available only for findings.
**Create:** `coordination/handoffs/V05-G2.md`; `docs/qa/v05-combat-loop-validation.md` containing actual evidence, platform versions and exact candidate SHA.

- [ ] Run all automated tests/typecheck/build on candidate. Re-run critical attack+guard, hitstop command, Ultimate exit and air attack cases with real input adapters; do not trust “done.”
- [ ] Run the policy/distance/seed matrix from spec §15; publish table including damage/time/action variety. Assert reachable whiff punishment defeats back+Special in isolated fixtures. Inspect new exploits rather than optimizing a single win-rate score.
- [ ] Test actual mobile gestures and interruption recovery for 30 repetitions per class; collect Safari/iPhone model/version and observed results. If physical access is unavailable, mark AC02 BLOCKED/PENDING and request a concrete candidate playtest; do not relabel emulation as Safari verification.
- [ ] Execute human comparison: V0.4 vs candidate, three matches per fighter per build, deliberate commands and four feel scores. Ask what decisions led to wins/losses. Record negative feedback even with passing tests. If required gameplay improvement is not observed, reopen only the implicated task.
- [ ] Verify pixel evidence, pose/contact agreement and effect timing; run same-device two-minute performance comparison and report p95 plus long stalls/budgets. Include reduced-motion presentation if offered; it must not change gameplay.
- [ ] Issue APPROVE FOR RELEASE or BLOCK, listing AC01–AC12 status and exact accepted source deltas. No missing required device/human gate may be silently waived by an agent.

## Z1 — Gonza: reproducible standalone and actual released artifact

**Depends:** G2 release approval and Neureon RELEASE transition. **Modify:** `package.json`, `.github/workflows/repository-verification.yml`, `play.html`; build-only tooling `scripts/build-standalone.mjs`, `tests/standalone-v05.test.mjs`; `README.md` development/release instructions. Deployment on `gh-pages` only after gates.

- [ ] Reconstruct clean integration from accepted SHAs; do not import stale `coordination/` history. Ask owner on semantic conflicts; recheck G2 approval covers the result.
- [ ] Pin the TypeScript version used by verified builds instead of CI `typescript@latest`. Reuse/pin the existing release bundling method if recoverable from R002 workflow; otherwise a small deterministic local bundler script for this acyclic ES-module project or one pinned build-only bundler is acceptable. No runtime library or new game stack. Document the exact command and tool versions.
- [ ] `build:standalone` must regenerate `play.html` from compiled modules and current CSS, escape inline closing script/style boundaries, and emit only deterministic content. No hand edits to generated game logic. Include source/version fingerprint in release metadata or bundle comment, not a claim based only on the title badge.
- [ ] Add CI freshness test: generate to temporary path, compare bytes with committed play.html. Two clean generations of the same source must be identical. A source/CSS change with stale play.html must fail. Keep docs-only commits independent of gameplay content fingerprint.
- [ ] Run full tests/typecheck/build/standalone parity and desktop/mobile browser smoke on the generated standalone, not only dist. Confirm all accepted gameplay behavior is present through critical scenarios.
- [ ] Publish approved standalone as `gh-pages/index.html` and `gh-pages/play.html`; verify those blobs match `main/play.html`, deployment succeeds, and HTTP-served content matches the approved artifact (account for propagation, do not accept an old cached page).
- [ ] Play the public URL through selection → fight → result → rematch plus control reset, new mappings and visible Ultimate exit. Record final source SHA, publish SHA, byte/hash evidence, URL and checks. `BLOCK_RELEASE` for mismatch or unresolved issue.
- [ ] Send release handoff to Neureon; only Neureon closes/archives/resets. Explicitly correct README/milestone/index round/version references, preserving historical audit evidence.

**Release gate:** clean candidate tests, no critical/high unresolved acceptance blocker, G2 device/human evidence, deterministic replay, procedural-render policy, source→standalone→served parity, Gonza public smoke. No new QA claim based only on prior agents' messages.

## Acceptance ownership map

| Spec gate | Implementing task | Independent evidence |
| --- | --- | --- |
| AC01 guard commitment | R1 | G1 + G2 full path |
| AC02 mobile lifecycle/selection | B1/B2 | G2 physical Safari |
| AC03 action buffer/reset | R3/B2 | G1 simulation; G2 adapters/device |
| AC04 true combos/pressure windows | R3 | G1 adversaries; G2 human |
| AC05 grammar/low-high counterplay | R3/B2/M1 | G1 outcomes; G2 UI/art |
| AC06 Special punishability | R3 | G1 policy fixtures; G2 human |
| AC07 jump/corner | R4/M1 | G1 mirrored physics; G2 feel |
| AC08 CPU | R5 | G1 delayed twins, seeds, real traces |
| AC09 Ultimate exit | R4 | G1 mirrored/corner/mash; G2 visible exit |
| AC10 animation/performance | M1 | G2 image/video/device/cadence |
| AC11 character scalability | R2 | G1 third-kit execution |
| AC12 release | Z1 | Gonza actual integrated/public artifact, Neureon closure |

## Appendix A — Reproduce principal baseline failures without production edits

Save the following as a temporary `audit-probes.mjs` in the repository root (do not commit it; adjust import prefix if kept outside root), run `npm test` to compile, then `node audit-probes.mjs`. Private field access is a test-only technique already used by repository tests. Do not ship this probe as runtime code. Results below refer to the historical baseline, not future V0.5.

```js
import {CombatSimulation} from './dist/game/simulation/CombatSimulation.js';
import {EMPTY_INPUT as E} from './dist/game/types.js';
const i=p=>({...E,...p});
for(const id of ['chameleon','supernariz']) {
  const s=new CombatSimulation(id,id,{skipIntro:true,initialSuper:[100,0]});
  s.fighters[0].x=500; s.fighters[1].x=620;
  s.step(i({ultimate:true}),E);
  let captured=false;
  for(let n=0;n<150;n++) {
    const t=s.step(E,E); captured ||= t.fighters[1].capturedBy===0;
    if(captured && t.fighters[0].ultimatePhase==='idle') {
      console.log(id,'end distance',Math.abs(t.fighters[1].x-t.fighters[0].x));
      break;
    }
  }
}
// V0.4 prints 62 and 74, not a launch/reset.
const s=new CombatSimulation('chameleon','supernariz',{skipIntro:true});
s.fighters[0].x=500; s.fighters[1].x=800;
s.step(i({jump:true,right:true}),E);
for(let n=0;n<25;n++) {
  const t=s.step(i({right:true,attack:n===3}),E);
  if([2,3,10,24].includes(n)) console.log(n,t.fighters[0].x,t.fighters[0].moveId);
}
// V0.4 x=517 at n=2,3,10,24: airClaw halts movement.
```

B01 and B05 have executable tests in R1/R3 above. B02 has a pointer-event reproduction in B1. B04: press and hold a second ATTACK during claw1 hitstop, continue holding 25 steps: V0.4 defender HP954, no second hit. B09: call fresh `CpuController(1)` on a snapshot with opponent at distance 90 and `ultimatePhase='startup'`, varying snapshot.frame 0–59: 60/60 jump/backdash outputs, no observation delay. Repeat each finding with a fresh controller/simulation to avoid polluted state.

## Appendix B — Historical strategy comparison recipe

This is deliberately a *diagnostic*, not a balance pass/fail oracle. At the V0.4 baseline it produces the table in spec §3.2. All policies won, so it cannot certify interesting human decisions.

- Run both fighter IDs against the opposite stock CPU in both player slots.
- Initial positions and resources are default; `skipIntro:true`; set only `sim.frame` to each of `[0,1,2,3,4,7,11,17,23,31,47,59]` to test existing modulo phase sensitivity.
- Stop at first `round-over`, maximum 10000 step calls; record health differences, roundWinner, attacks started by category.
- Player policies below operate on own visible snapshot; on each step feed opponent `cpu.nextInput(snapshot)`. E means all EMPTY_INPUT booleans false. Always release ATTACK between chain presses.

```js
function policyInput(kind, me, foe, k, previousAttack) {
  const out={...E};
  const distance=Math.abs(me.x-foe.x);
  const toward=me.x<foe.x?'right':'left';
  const away=toward==='right'?'left':'right';
  if(kind==='holdBackSpecial') {
    out[away]=true;
    if(!me.moveId && k%2===0) {
      out.special=true;
      if(me.superReady && distance<260) out.ultimate=true;
    }
  } else if(me.moveId) {
    if(kind==='melee' && ['claw1','nose1','nose2'].includes(me.moveId)
      && me.moveFrame>=10 && me.moveFrame<=13 && !previousAttack) out.attack=true;
  } else if(kind==='ranged') {
    if(distance<260) out[away]=true;
    else if(distance>330) out[toward]=true;
    if(distance<370 && k%2===0 && me.projectileCooldown===0) out.special=true;
    if(me.superReady && distance<270 && k%2===0) out.ultimate=true;
  } else {
    if(distance>95) out[toward]=true;
    if(distance>230 && k%35===0) out[toward==='right'?'dashRight':'dashLeft']=true;
    if(distance<=112 && k%2===0) out.attack=true;
    if(me.superReady && distance<230 && k%2===0) out.ultimate=true;
  }
  return out;
}
```

For V0.5 additionally run adaptive policies using the new registered moves and command model; keep the historical policy version for comparison. Do not rename frame offsets as seeds or interpret 24 deterministic cases as a statistical sample of people. Explicitly report guard exploit closure, illegal buffering and missed actions separately from subjective balance.

## Handoff completeness check

- [ ] N1 has enough scope/ownership to create actual tasks without rediscovering the project.
- [ ] All AC01–AC12 have implementer and independent gate above.
- [ ] Frozen interfaces are coherent across simulation/input/render/CPU; no owner guesses missing state.
- [ ] Exact SHA, tests and remaining limitations accompany every checkpoint.
- [ ] No task depends on Astra, hidden conversation context, reference-image sprites or a future architecture rewrite.
