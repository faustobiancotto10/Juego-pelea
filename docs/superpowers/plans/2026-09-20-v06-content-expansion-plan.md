# V0.6 Content Expansion Implementation Plan

> **For agentic workers:** use `superpowers:executing-plans` within the assigned permanent specialist task. Neureon routes Ricardo, Mario, Brancaforte, Germinator and Gonza. Steps use checkboxes. This external intervention does not start execution or require Astra to return.

**Goal:** ship playable Juanchi, a second stage, physically readable locomotion, fair deterministic Ultimate Clash and a repeatable character-production path.

**Architecture:** preserve fixed60Hz combat and procedural Canvas2D. Extend the delivered V0.5 registry with typed character composition, multihit windows, one returning projectile and one cap-capture primitive; arbitrate capture/Clash centrally. Presentation consumes stable state/definitions; stages never enter simulation.

**Tech Stack:** current TypeScript/browser ES modules/Canvas2D/DOM/Node tests/GitHub Pages. No new runtime dependencies.

**Specs:** [audit](../specs/2026-09-20-v06-architecture-gameplay-audit.md), [system design](../specs/2026-09-20-v06-content-expansion-design.md), [Juanchi](../specs/2026-09-20-v06-juanchi-character-contract.md), [animation](../specs/2026-09-20-v06-animation-quality-contract.md), [Clash](../specs/2026-09-20-v06-ultimate-clash-contract.md), [Character Package](../specs/2026-09-20-v06-character-package-pipeline.md).

## Global constraints

- No production work from this audit turn and no activation of permanent agents.
- Fixed60Hz simulation owns combat truth. No render-driven damage/capture or wall-clock combat timing.
- Native procedural/articulated Canvas2D fighters; references never runtime raster sprites.
- Four mobile action buttons, existing universal grammar and mobile landscape first.
- Juanchi and stage2 are required content; no fourth playable fighter, generic scripting engine or runtime dependency expansion.
- Coletazo gameplay/animation baseline remains unchanged unless an independently reproduced regression demands repair.
- Candidate balance values require scenario/human verification; record numerical changes without pretending they were already validated.
- Stages cannot change a combat snapshot, collision or CPU decision.
- Preserve live coordination; integrate accepted product deltas, not stale branch coordination.

## Review focus

1. Ball return, cap flight and Fricción need explicit per-instance/per-hit identities; duplicate render/step consumption must not duplicate damage or props (R2/M1/G1).
2. Equal-time Ultimate decisions, prior capture, same-tick lethal strike and wall launches must not depend on slot order (R1/G1).
3. New two-tick jump preparation changes all old evade timings; a passing old jump probe is not final V0.6 evidence (R3/G1).
4. A fourth simulation-only fixture is insufficient; selection, renderer, projectile visuals, HUD and CPU must execute its injected content (R0/B1/M1/G1).
5. A preview or green source test does not prove the served release is current; verify exact artifact hashes and phone behavior (Z0/G1/Z1).

## 0. Baseline and authorization boundary — N0, Neureon

Main at audit: `753d3aa4d6abe1e6da1683d4d069848c4ac4e8ac` contains V0.4 product plus R003 coordination. Use V0.5 product `2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13` and QA delta `2876f3bce7d77c04c7415df89cafcf8b31f1b61c` as reviewed inputs, or explicitly record a later accepted equivalent. **Do not begin from main's V0.4 source by accident.** Exact QA baseline206 tests passed independently during this audit.

**Files owned:** coordination round/status/locks/tasks/forum, docs/DECISIONS.md, docs/CURRENT_MILESTONE.md; `docs/characters/juanchi/PACKAGE.md` and reference intake. No specialist code.

- [ ] On future user-authorized execution, reconcile R003: record the current human feedback and outstanding physical-device/performance evidence. Either finish its release appropriately or explicitly close/supersede its preview-only milestone as authorized, carrying unverified gates into V0.6. Never label the preview a released V0.5 or silently waive QA.
- [ ] Establish one exact V0.6 product base and preserve all current live coordination on main. Suggested next round R004; confirm unused name first. No second simultaneous global round.
- [ ] Freeze C1–C7 schemas, Juanchi move/visual IDs, two-stage choice and Clash rules. Numerical candidates can be revised by evidence; field names/reset semantics cannot drift independently.
- [ ] Create Juanchi PACKAGE using existing spec links. Record master absence until the promised reference actually exists; then capture path/hash and authority. Gameplay/helpers/stage can start without final art approval; likeness gate cannot pass without it.
- [ ] Create actual tasks corresponding to this plan, branches and exact ownership. Use DIRECT_START for unambiguous specialist tasks, with accepted input SHA/evidence/prohibited scope. No redundant PRESENT pulse. In protocol, explicitly make DIRECT_START the exception to the contradictory later staged-PRESENT paragraph; no wholesale workflow rewrite.
- [ ] Keep forum to `r004-contract.md`, `r004-findings.md`, `r004-integration.md`. Post only contract decisions, blockers, reproductions or accepted handoffs. One schema freeze checkpoint, not a gate for every parameter change.

## Dependency graph and activation economy

| Lane / task | Dependency | What may run in parallel |
| --- | --- | --- |
| R0 Ricardo: composition/types/validation | N0 exact base and frozen contract | Z0 packaging; Mario reference/pose work; Germinator scenario design |
| R1 Ricardo: shared Ultimate arbitration/Clash | R0 accepted schema | M1 rigs/locomotion; M2 stages/effects; B1 roster/stage UX; G1 test authoring |
| R2 Ricardo: Juanchi gameplay primitives/content | R1 | Same independent presentation/UI/tooling lanes |
| R3 Ricardo: Lengua, jump preparation, CPU tactics | R2 | M1/M2/B1 completion and independent QA on completed subsystems |
| Z0 Gonza: repeatable build + candidate assembly | N0; assembly as accepted deltas arrive | All implementation lanes; no release authority |
| G1 Germinator: integrated acceptance | R3+M1+M2+B1 assembled exact SHA | Only owner repairs; Neureon collects human/device evidence |
| Z1 Gonza: release | G1 approval + Neureon release token | Neureon closure preparation |

R0 is a short interface/data checkpoint, not “finish all combat before Mario starts.” Once its default fields/types are accepted, consumer implementation proceeds against fixtures while Ricardo continues. Mario owns two tasks but is one worker: sequence his rig and stage/effect work as useful; do not require artificial extra activation between them. DIRECT_START bundles an ordered backlog where ownership and inputs are stable.

Suggested branches: `round/r004-ricardo`, `round/r004-mario`, `round/r004-brancaforte`, `round/r004-germinator`, `round/r004-integration`. No spawned replacement permanent roles. The user activates chats normally; the repo is their operational memory.

## Shared ownership and integration boundary

| Area | Exclusive implementation owner | Consumers |
| --- | --- | --- |
| `src/game/types.ts`, `src/game/data/`, `src/game/simulation/` | Ricardo | everyone reads frozen exports |
| `src/game/render/`, including stage registry, visual maps/validation | Mario | Brancaforte passes selection, QA renders |
| `src/game/ui/`, input only if required, `src/styles.css`, controls README | Brancaforte | Ricardo does not alter UI |
| independent adversarial tests/evidence | Germinator | owner tests remain owner-owned |
| package/lockfile/build scripts/CI/generated standalone | Gonza | others request changes |
| live coordination and package acceptance decisions | Neureon | agents post focused evidence |

R0 publishes the constructor/options and snapshot schema once. All new state gets defaults, copy/reset handling and test fixtures. Presentation receives the same CombatRegistry and presentation registry used to build fixtures; never imports global move data for injected fighters. Mario owns render-handler maps; Ricardo owns gameplay content and behavior kinds. Gonza's final assembly adds the single released roster registration only after gameplay+visual+metadata exist. No feature branch promotes Juanchi to public release prematurely.

## R0 — Ricardo: content composition and stable interfaces

**Modify:** `src/game/types.ts`, `src/game/data/{combatRegistry,fighters,fighterKits,projectiles,ultimates}.ts`, `src/game/simulation/{moves,CombatSimulation,CpuController}.ts` for schema/defaults only.
**Create:** `src/game/data/characterContent.ts`, `src/game/data/characters/{camaleoni,supernariz}.ts`, `src/game/data/fighterPresentation.ts`, `tests/content-v06.test.mjs`, `tests/fixtures/v06-fourth-content.mjs`.
**Consumes/produces:** existing six registry methods plus C1 typed packages/presentation registry; C2/C3/C4/C5 fields with neutral defaults; CpuTactics C6 type. No tuning, no new playable ID in default roster yet.

- [ ] Capture V0.5 scenario traces: both normals/chains, projectile, close Specials, each Ultimate, both slots. Compare existing fields exactly after extraction; assert newly added fields are neutral defaults.
- [ ] Add failing source-mutation, NaN, duplicate/missing reference, cyclic chain and invalid window tests. Clone/deep-freeze only owned plain data, validate deterministic domains, reject duplicate composition keys.
- [ ] Move original data into two character modules, retain compatibility exports, remove closed roster union from universal APIs. Verify no runtime import cycle; type-only references are allowed.
- [ ] Define pending schema additions without falsely simulating unimplemented features: missing probe/clash null, counters0, linear projectile outbound/default visual, availability from existing cooldown. Keep original two-fighter snapshots behavior-equivalent.
- [ ] Publish a test fixture with a new ID and modified existing primitives. No universal engine identity edit is allowed to make it work. Fixtures remain out of default release content.
- [ ] Run `npm test`, `npm run typecheck`, `npm run build`; commit `refactor: compose validated character content and freeze v06 interfaces`. Handoff exact SHA, exports and default snapshot examples so M/B can DIRECT_START.

Regression example, using current API plus cloned records:

```js
const source = structuredClone({fighters:FIGHTERS,kits:FIGHTER_KITS,
  moves:MOVE_SETS,projectiles:PROJECTILES,ultimates:ULTIMATES,
  playableIds:[...DEFAULT_COMBAT_REGISTRY.playableIds]});
const registry=createCombatRegistry(source);
const original=registry.getFighter('chameleon').walkSpeed;
source.fighters.chameleon.walkSpeed=999;
assert.equal(registry.getFighter('chameleon').walkSpeed,original);
source.moves.chameleon.claw1.totalFrames=NaN;
assert.throws(()=>createCombatRegistry(source),/claw1|totalFrames/);
```

**Risk:** accidental behavior tuning, import cycles and weakening ID validation. Independent G1 verifies a fixture actually attacks/renders later, not only the registry object.

## R1 — Ricardo: common Ultimate proposals, Clash and impact release

**Depends:** R0. **Modify:** `src/game/simulation/CombatSimulation.ts`, `src/game/data/ultimates.ts` compatibility/types and original character packages, `src/game/types.ts` only within frozen contract.
**Create:** `src/game/simulation/ultimateResolution.ts`, `tests/ultimate-clash-v06.test.mjs`, `tests/ultimate-release-v06.test.mjs`.
**Interfaces:** common proposal/arbitration helper and Clash state/event from Clash spec; same `CombatSimulation.step/getSnapshot` public API. Helpers take readonly common state/proposals and return a resolution; they do not import rendering.

- [ ] Add the red same-kit simultaneous fixture below plus timing/geometry negative cases. Historical test asserting one slot wins must be replaced deliberately with symmetric Clash semantics.
- [ ] Extract candidate collection from per-fighter mutations. Implement ordinary-contact interrupt priority, common capture/pull arbitration, four-effective-tick Clash window and deterministic late-tie whiff. No random winner/index tie-break.
- [ ] Implement zero-damage cancellation, both meters consumed,12 hitstop calls, bilateral vx16/vy8,30 synchronized launch ticks and command/projectile cleanup. Cover walls/timeout/reset and last-six-tick buffering.
- [ ] Move major impact/release to the final damage tick; add majorImpact without repurposing KO finisher. Use common successful-release values for both originals. Candidate Cam18/10, Super24/20/pull14 must retain escape cases.
- [ ] Test every current-kind pairing now; R2 extends to all nine with cap. Run full suite/typecheck/build; commit arbitration and presentation-timing changes separately.

```js
const sim=new CombatSimulation('chameleon','chameleon',
  {skipIntro:true,initialSuper:[100,100]});
sim.fighters[0].x=500; sim.fighters[1].x=620;
let snap=sim.step({...E,ultimate:true},{...E,ultimate:true});
let clash=null;
for(let n=0;n<100 && !clash;n++) {
  snap=sim.step(E,E);
  clash=snap.events.find(e=>e.type==='ultimate-clash');
}
assert.ok(clash);
assert.deepEqual(snap.fighters.map(f=>f.health),[1000,1000]);
assert.deepEqual(snap.fighters.map(f=>f.superMeter),[0,0]);
assert.ok(snap.fighters.every(f=>f.capturedBy===null));
const tick=snap.combatTick;
for(let n=0;n<12;n++) snap=sim.step(E,E);
assert.equal(snap.combatTick,tick);
for(let n=0;n<30;n++) snap=sim.step(E,E);
assert.equal(snap.clash,null);
assert.ok(Math.abs(snap.fighters[1].x-snap.fighters[0].x)>=300);
```

**Independent focus:** run E offsets−4..4, contact ages0..4, ordinary-hit/KO precedence, cap-before-attach boundary later, and reflected wall traces. Do not accept just one attractive Clash screenshot.

## R2 — Ricardo: Juanchi gameplay and reusable primitive extensions

**Depends:** R1. **Modify:** `src/game/simulation/{CombatSimulation,moves}.ts`, data definition types/validation, shared snapshot fields as frozen.
**Create:** `src/game/data/characters/juanchi.ts`, `src/game/simulation/projectileMotion.ts`, `tests/characters/juanchi.test.mjs`, `tests/boomerang-v06.test.mjs`, `tests/multihit-v06.test.mjs`, `tests/cap-capture-v06.test.mjs`.
**Produces:** full Juanchi package export; injected registry gameplay before release registration; returnToOwner, normalized hit windows and capCapture. No generic scripts/status engine.

- [ ] First implement C2 hit-ledger normalization with legacy trace regression. Assert each Fricción hitId contacts once, maximum60 clean damage, no projectile and finite block/Push Guard exits.
- [ ] Add returning-ball phase/catch/swept collision as the one new movement handler. Assert34+30 maximum, turn4, at most18+4+42 advancing lifetime, min10 between legs, one active ball and30 rearm. Test owner-hit cancellation before ball contact, simultaneous returning-ball trades, guard direction by fighter, jumping/moving owner, walls, catch ties and repeated invalid casts.
- [ ] Define all Juanchi stats/kit/move/presentation values from the character contract, including108 route, low/air and exact Fricción table. Use copied/injected content for tests, not mutation of DEFAULT_COMBAT_REGISTRY.
- [ ] Add capCapture exhaustive handler and sequenceApproach. Probe hit is sole capture event; pin target anchor during rage; rush only18..23;15×4+130=190; major hit/release40. Preserve pre-/post-commit meter policy and guaranteed captured sequence.
- [ ] Add cap to the Clash9-pair matrix, including flight interruption and same-tick capture-vs-Clash. Test head attachment inputs from authoritative snapshot, not canvas hit detection.
- [ ] Commit independently testable primitives/content in small deltas, run full suite/typecheck/build, hand off exact snapshot traces for Mario/B and numerical outcome table.

Executable assertion pattern (test imports `juanchiContent` from the new character module; `registryFor` below is the local fixture helper assembled from exported packages):

```js
// registryFor(...packages) composes the C1 package fields into createCombatRegistry:
// fighters keyed by fighter.id; kits/moves by that ID; merge projectile/Ultimate
// maps with duplicate rejection; playableIds are the provided IDs in order.
const sim=new CombatSimulation('juanchi','supernariz',
  {skipIntro:true,registry:registryFor(juanchiContent,supernarizContent)});
sim.fighters[0].x=500;sim.fighters[1].x=585;
let snap=sim.step({...E,down:true,special:true},E);
const contacts=[];
for(let n=0;n<100;n++) {
  contacts.push(...snap.events.filter(e=>e.type==='hit'&&e.attacker===0));
  assert.equal(snap.projectiles.length,0);
  snap=sim.step(E,E);
}
assert.deepEqual(contacts.map(e=>e.hitId),['rub-a','rub-b','palm-release']);
assert.equal(contacts.reduce((sum,e)=>sum+e.damage,0),60);
```

Define `registryFor` in `tests/fixtures/v06-content.mjs`, sharing only content assembly; independent QA must not share scenario verdict logic. Include real input-driven boomerang/Ultimate tests in addition to isolated motion helpers.

**Risk:** extending one-hit logic accidentally enables old normals to hit every active frame; returning projectile rescues a punished owner; delayed cap attachment falsely promises a capture; fixture-only behavior differs from release registration.

## R3 — Ricardo: bounded balance, jump preparation and CPU tactics

**Depends:** R2. **Modify:** character data, `CombatSimulation.ts`, `CpuController.ts` and definition validation.
**Create:** `tests/lengua-approach-v06.test.mjs`, `tests/jump-v06.test.mjs`, `tests/cpu-content-v06.test.mjs`.

- [ ] Reproduce the audit's repeated block-and-advance fixture at350 distance. Apply only total46/knockback4.8 first; keep damage/reach/Coletazo unchanged. Record baseline/candidate both slots and walls, exact timings and health. Add response offsets0/2/4/6 rather than testing one perfect timing.
- [ ] Add two-tick grounded jump preparation per C5, direction capture, interruption, takeoff/airborne/landing counters/events and resets. Rerun all evasions with that actual jump model; no stale probe result is final evidence.
- [ ] Define CpuTactics data/defaults; Juanchi approaches behind own return with bounded chance, sees enemy returning leg once through delayed observation. Existing seed/miss/commitment tests remain, no current-frame opponent oracle or special Clash response.
- [ ] Run all9 matchups over seeds113/197/313/997 plus isolated scripts: retreat Special, block-advance, jump-read, whiff punish, melee approach. Record damage/time/category use/approach distance/guard breaks/first SUPER; don't optimize a win-rate quota.
- [ ] Finalize measured move/actionability table for all three. Required: clean Juanchi108 route at62/85; Fricción block exit; avoided Lengua earns approach; no indefinite ball-assisted corner lock; each Ultimate has useful escape/punish choices at its intended range.
- [ ] Run full suite/typecheck/build; publish exact core SHA and final parameters. Changes to consumer timing get a single forum delta with affected captures/tests.

Approach fixture contract: Camaleoni x500 / Supernariz x850; caster repeats Special on the first idle sample; defender holds away through visible tongueFrame14 then approaches, no CPU/Ultimate. Within300 advancing ticks candidate must reach center distance<=115 with no clean hit under the baseline precise policy. Repeat both slots. Offset variants measure tolerance and must include a nonzero response margin that still gains space; do not make all delayed errors magically safe. At tip range, two successfully avoided casts should net>=40 approach units for at least one readable block/dash/jump policy without damage. Human confirms practicality.

**Risk:** shorter/higher-reach Ultimates plus jump preparation can remove escape; smaller tongue knockback can enable unintended close links; smarter return CPU can become perfect. Neureon may revise candidate values only within demonstrated counterplay requirements.

## M1 — Mario: physical locomotion, Juanchi rig and generic visual bindings

**Depends:** R0 schema; full art likeness also needs actual master. Does not wait for R3 gameplay completion.
**Modify:** `src/game/render/{FighterRenderer,PresentationPose,ChameleonRig,SupernarizRig,FightRenderer,CombatEffects}.ts`.
**Create:** `src/game/render/{LocomotionPose,RigAnchors,presentationHandlers}.ts`; `src/game/render/characters/JuanchiRig.ts`; `tests/animation-v06.test.mjs`, `tests/rig-content-v06.test.mjs`; character pose/evidence docs.
**Consumes:** C1 metadata/definitions, C3 flight phase, C4 probe/capture/majorImpact/Clash, C5 jump state; animation RigFrame/anchors. **Produces:** procedural rig/visual-key handlers, physically caused poses, explicit missing-key validation.

- [ ] Implement shared local-anchor and locomotion sampling; consumption once per fixed snapshot. Use actual locomotion displacement for foot plants, combatTick for body poses, snapshot.frame only for permitted impact decay. No rendered-repeat advancement.
- [ ] Retrofit walk/jump start/drive/air/landing to both originals. Preserve Coletazo's numerical/body animation contract; overlay captures prove its active phase remains aligned.
- [ ] Build Juanchi's silhouette/clothes/curly hair/chain/ball/cap from primitives against the master when available. Draw readable La56 text after facing transform compensation. Implement all move/Ultimate phases and exclusive prop locations, not just idle plus translations.
- [ ] Replace generic identity-based effect dispatch/global move access with visual keys and the injected registry. Every projectile selects its own procedural visual; unknown keys fail visibly in development and fail roster validation before shipping.
- [ ] Use snapshots/fixtures for development, then replay actual R2/R3 trajectories. Capture reference comparisons and keyframe strips at667×375/852×393, on both stages, effects enabled/disabled.
- [ ] Test no snapshot mutation, repeat-frame/cadence equivalence, planted-foot drift diagnostic, correct rig anchors, fourth fixture render and KO/reset cleanup. Commit locomotion and character art separately; record explicit visual limitations.

```js
const before=structuredClone(snapshot);
renderer.consumeEvents(snapshot);
renderer.render(snapshot,0);
const once=rig.sample(rigFrame);
for(let n=0;n<3;n++) renderer.render(snapshot,100+n);
assert.deepEqual(rig.sample(rigFrame),once);
assert.deepEqual(snapshot,before);
```

`rig` and `rigFrame` are the injected ProceduralRig and exact RigFrame used by draw, not anchors inferred from pixels. A separate test feeds advancing locomotion snapshots and measures the planted-foot diagnostic. Pixel/video review remains mandatory independently of this logical test.

## M2 — Mario: second stage and shared high-impact effects

**Depends:** C7 frozen at N0, R0 for event/types; can be implemented alongside Ricardo's work. **Modify:** StageRenderer/FightRenderer/CombatEffects.
**Create:** `src/game/render/stages/{stageRegistry,TramontanaStage,Cancha56Stage}.ts`, `tests/stages-v06.test.mjs`, `tests/clash-render-v06.test.mjs`.

- [ ] Extract current stage unchanged; register Tramontana and Cancha56 with fixed shared world/floor. Distinct evening rugby environment, no gameplay objects/hazards.
- [ ] Add constructor stage injection with old default. Stage functions receive presentation time only, never a mutable simulation; no arena overrides.
- [ ] Author Clash's bilateral silhouette/flash/trails and all three major-impact launches. Finite event-driven KO launch continuation must not retain capture geometry or create fake damage.
- [ ] Verify stage swapping does not alter combat traces, actor contrast on both backgrounds, no floor/feet occlusion and bounded effects. Supply stage preview and final-Clash captures to Germinator.
- [ ] Run render/full suite/build; handoff separate stage/effect delta. No new cinematics, raster fighter assets or performance-heavy scene system.

## B1 — Brancaforte: roster expansion, stage selection and clear availability

**Depends:** R0 schema/C7 interface; use fixture registries before final content assembly. **Modify:** `src/game/ui/{AppController,flow}.ts`, `src/styles.css`, controls README; input only if a demonstrated regression requires it.
**Create:** `tests/roster-ui-v06.test.mjs`, `tests/availability-ui-v06.test.mjs`.
**Consumes:** validated playableIds, getPresentation(id), StageRegistry, rangedAvailability/recovery and existing GameInput. **Produces:** no new combat action; UI chooses IDs/stage and forwards commands.

- [ ] Move copy/labels to package metadata; remove “Dos estilos” and Supernariz-only cooldown branch. Validate IDs at DOM/route entry. Demo mode chooses from valid release order rather than assuming two named IDs.
- [ ] Compact selectable roster for3/5/10 fixture IDs, scrollable in a dedicated region without clipping controls. Preserve selection/rival/mirror/rematch and keyboard focus. No carousel dependency.
- [ ] Add compact stage choice during rival selection, retain stage on rematch, pass StageDefinition into FightRenderer; no stage field in CombatSimulation or combat replay state.
- [ ] Display Juanchi ball ready/in-flight/rearm states; update help with both ball legs, Fricción, cap confirmation and non-input Clash explanation. No added action button or gesture.
- [ ] Re-run V0.5 pointer/capture/reset/visibility/input-buffer regressions and mobile667×375,852×393,932×430 plus portrait gate. Actual iPhone evidence remains a device gate.
- [ ] Run tests/typecheck/build and provide exact SHA plus viewport captures/physical limitations.

**Acceptance:** every fixture card can become player/CPU; third ID is never silently mapped to Supernariz; switching stage changes presentation only; button meaning stays constant regardless of ball availability. No layout assertion based only on counting DOM nodes.

## Z0 — Gonza: packaging early, clean candidate integration

**Depends:** N0 exact base. No release permission. **Own:** package.json/lockfile, `.github/workflows/repository-verification.yml`, `scripts/build-standalone.mjs`, generated play.html and integration branch only.
**Create tests:** `tests/standalone-v06.test.mjs`.

- [ ] Recover the V05 preview generator method from its build evidence; make a deterministic documented repo command. Pin the verified compiler; use a pinned build-only bundler only if required. No runtime dependencies.
- [ ] Ensure npm test discovers `tests/characters/*.test.mjs` once R2 adds it, in addition to existing root tests; run both explicit globs or an equivalent verified discovery script. Test omission of Juanchi tests is a blocker.
- [ ] Add source→standalone fingerprint/parity check including styles/stages/registrations. Two clean builds are byte-identical; a changed source with old play.html fails. Documentation-only edits do not invalidate gameplay fingerprint.
- [ ] Integrate accepted deltas progressively. Add Juanchi's released composition entry only once gameplay/rig/metadata exist together. Do not merge stale coordination or guess semantic conflicts.
- [ ] Build an isolated V0.6 preview for G1/human tests when Neureon authorizes that concrete preview; preserve official root bytes. Record exact source/preview hash/URL. No release badge implying approved product.

**Gate:** same candidate consumed by QA and human test, reproducible tooling, no absent nested tests or silent missing visual. Z0 may finish before G1; Gonza waits for actual release authority afterward.

## G1 — Germinator: independent integrated acceptance

**Depends:** exact assembled core+M1+M2+B1/Z0 candidate for verdict; scenario authoring starts earlier from these specs.
**Own:** `tests/v06-adversarial.test.mjs`, `tests/fixtures/v06-adversaries.mjs`, `docs/qa/v06-content-expansion-validation.md`, QA handoff/forum.

- [ ] Independently reproduce audit findings and prove fixes at the candidate SHA: registry mutation/NaN, slot arbitration, returning projectile visual dispatch, source/injected renderer distinction, repeated Lengua approach.
- [ ] Run all V6-01..12. All9 ordered matchups × both slots; center/each wall; distances62/85/120/180/240/300/400; seeds113/197/313/997 where CPU matters. Pairwise primitives need boundary tests, not only full matches.
- [ ] Clash offsets−4..4/ages0..4, phase/capture/ordinary-hit/KO/timeout resets; identical launch rules for three Ultimates; delayed-observation twins for return cues. Test maliciously invalid content as well as valid fixtures.
- [ ] Fourth package must pass selection, rendering, CPU, resource HUD and mechanics using existing primitives without universal fighter-ID edits;5/10-entry UI layouts fit/scroll. Assert default roster has exactly the approved3.
- [ ] Human/device gate on actual preview:6 Juanchi coverage matches as character contract; retest repeated Lengua and all Ultimate evasions; check both stages/physical locomotion and command comprehension. Record intended versus executed actions, chosen openings, unfair locks and willingness to rematch. Do not invent pixel/device approval from mocked tests.
- [ ] Physical Safari: original long-press/drag/release-outside/lostcapture/help/background/orientation scenarios,20 cycles per relevant interruption class; no stuck input. Keep V0.5's missing evidence visible until actually performed. Two-minute same-phone performance comparison, report p95/long stalls and exact device/browser.
- [ ] Report PASS/BLOCK per acceptance ID, exact SHA, source of human observations and remaining limitations. Return failures to the owner, rerun that scenario/family then final integrated suite. A user's report that the ball or cap is unreadable is a real failure, not overridden by206+ green tests.

No statistical win-rate promise. A single preferred repetitive strategy across matchups is a design warning; scoped counterplay fixtures and the user's actual play decide whether it blocks release. No compulsory extra round of generic polish once required content/quality gates pass.

## Z1 — Gonza: release the verified content, not a different bundle

**Depends:** G1 APPROVE at exact candidate SHA and Neureon release token. **Own:** accepted delta assembly, generated standalone and gh-pages publication.

- [ ] Verify input SHAs/locks/handoffs, rerun full discovered suite/typecheck/build/parity on integrated source. No new semantic changes after G1 without revalidation.
- [ ] Verify three fighters/two stages and all accepted mechanic paths on generated standalone, then publish approved artifacts. Preserve historical preview URLs or document replacement; root promotion is deliberate.
- [ ] Check main/play.html, gh-pages index/play files and actual HTTP-served content match approved hash. Record source SHA, publication SHA, build versions and URL; guard against cached V0.4/V0.5.
- [ ] Public smoke: Juanchi selection/CPU, ball/Fricción/cap, one staged Clash reproduction, stage selection, result/rematch, input interruption recovery. Verify actual released artifact independently of another agent's “done.”
- [ ] Handoff to Neureon; only Neureon closes/archives the round and updates milestone/active indexes. No Astra approval.

## Final release gates and stopped scope

All V6-01..12 pass with automation versus human evidence labeled. No unresolved high-severity capture/input/determinism/resource/roster bug; no missing master-based Juanchi likeness review; no absent new character/stage hidden behind “architecture complete”; no stale release bundle. Existing V0.5 gates are not silently waived, but a failed preview balance result may be explicitly addressed by V0.6 rather than forcing an unnecessary old-version release.

Do not build fourth-fighter content, networking, generic scripts/status/animation engines, throws, parry, air Specials, long combos, more stages, new buttons, progression or runtime raster fighters. Future fourth-character work follows the Package pipeline and the structural fixture evidence already delivered.

## Review checklist before Neureon issues implementation tasks

- [ ] Exact V0.5 product baseline resolved independently of main coordination.
- [ ] Character reference gate recorded honestly; other safe lanes not blocked by it.
- [ ] Single owner for every shared file, accepted schemas/base SHAs and DIRECT_START scope explicit.
- [ ] Each V6 acceptance ID mapped to implementation and independent evidence above.
- [ ] No plan step assumes Astra, hidden chat state or a future undocumented mechanic.
