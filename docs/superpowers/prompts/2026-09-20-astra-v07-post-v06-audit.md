# ASTRA MASTER PROMPT — POST-V0.6 AUDIT AND V0.7 IMPLEMENTATION PLAN

## ROLE

Act as the **senior external game director, combat-system architect, AI designer, animation/game-feel director, character-system architect and technical auditor** for:

`faustobiancotto10/Juego-pelea`

You are an external expert intervention. You are **not** one of the permanent implementation agents.

Your job is to inspect the **actually shipped V0.6 code and public build**, reproduce the user's problems where possible, identify root causes, and write an implementation-ready plan for the next bounded version.

Do not rubber-stamp V0.6 because its automated tests passed. The user has now played the published build and supplied new human evidence.

## CURRENT AUTHORITY

Repository coordination state is IDLE. V0.6 is closed.

Read first:
- `AGENTS.md`
- `coordination/PROTOCOL.md`
- `coordination/CURRENT_ROUND.md`
- `coordination/STATUS.md`
- `coordination/archive/R004-V06-CONTENT-EXPANSION.md`
- `docs/CURRENT_MILESTONE.md`
- `docs/DECISIONS.md`
- `docs/feedback/2026-09-20-v06-post-release-playtest.md`
- `docs/characters/juanchi/**`
- `docs/characters/el-toro/PACKAGE.md`
- existing V0.6 specs/plans only as historical design intent.

Then inspect the actual runtime source/tests on `main`.

### Exact released V0.6 evidence

Product release merge:
`60f30d4a100f3d853e2408e3eee7bbde4e2170fe`

Frozen integrated candidate:
`8acfc79d7ec96ec3d6a99aa5c720efe840a62115`

Pages publish:
`93d2fdd6f4b764a49fa70ad1ff6ac1f348fb85cc`

Public build:
`https://faustobiancotto10.github.io/Juego-pelea/`

V0.6 is an official release. The next work must improve it rather than reopen R004.

## PRIMARY HUMAN EVIDENCE

Treat these reports as authoritative product feedback to investigate, not as conclusions to blindly encode.

### 1. Lengua is still broken

The user reports that Camaleoni's Lengua remains so effective that simply spamming it can beat almost anyone too easily.

Do not assume the V0.6 tuning worked because the tests passed.

You must:
- inspect the shipped Lengua implementation and exact values;
- quantify repeat-spam behavior against every current fighter;
- test both slots, walls, several start distances and deterministic seeds;
- include human-like approach/guard/jump/dash response models, not only optimal bots;
- separate the contribution of reach, startup, recovery, damage, blockstun, hitstun, knockback, meter gain, guard interaction and CPU weakness;
- determine why the V0.6 recovery/knockback changes were insufficient;
- design a bounded solution.

Do **not** default to a blanket cooldown just because it is easy. Use one only if evidence shows it is the cleanest systemic answer.

The goal is:
- Lengua remains a defining long-range Camaleoni tool;
- repeated use has meaningful counterplay;
- a defender can make measurable progress after correct reads;
- Camaleoni does not lose his identity.

### 2. CPU is now far too easy

The user reports that the current AI is very weak.

The next version should introduce **difficulty levels**.

Audit the existing CPU architecture and design an exact difficulty model.

Harder AI must be stronger because of better decision quality, spacing, commitment, punish selection and reduced mistakes — **not** because it reads raw current-frame input, sees the future, ignores resource legality or blocks perfectly.

Define:
- exact number/names of difficulty levels;
- default difficulty;
- parameter table per level;
- observation/reaction delay;
- decision cadence;
- intentional mistake rate;
- action commitment;
- combo conversion probability;
- punish quality;
- spacing/range discipline;
- anti-repetition adaptation if appropriate;
- aggression/defense weighting;
- Ultimate use;
- fighter-specific tactic interaction;
- deterministic seed behavior.

Specify which parameters may scale with difficulty and which fairness rules remain invariant.

Create tests that prove the hardest level is stronger without becoming an input-reading bot.

### 3. Juanchi's walk looks wrong

The user says V0.6 animation is better overall but Juanchi specifically walks strangely.

Inspect the actual shipped implementation and diagnose the real cause before prescribing a fix.

Audit:
- planted-foot behavior;
- stride distance and gait cadence;
- root translation versus leg cycle;
- hip/chest counter-rotation;
- knee/foot arcs;
- weight transfer;
- start/stop transitions;
- forward versus backward locomotion;
- wall-clamped gait;
- rugby-ball arm constraint;
- rig proportions/anchors;
- render cadence and snapshot interpolation.

Use the supplied Juanchi visual package as identity authority.

The fix must preserve simulation ownership: rendering cannot change combat movement truth.

### 4. Attack presentation does not match character design quality

The user likes the character designs but feels the attack animations/effects still look cheap.

Specific evidence:
- Juanchi was intended to have a **real red rage aura**;
- V0.6 mostly turns his body red before attacking;
- that is not an acceptable replacement for the intended aura;
- similar under-presentation exists across the roster.

Audit every released fighter:
- Camaleoni;
- Supernariz;
- Juanchi.

For every normal, Special and Ultimate category, evaluate:
- anticipation/readability;
- body force production;
- contact pose;
- follow-through;
- motion trails;
- hit flash;
- sparks/debris/gas/energy;
- ground interaction;
- screen shake/impact framing;
- aura/charge treatment;
- prop secondary motion;
- recovery readability;
- whether effects actually reinforce the move rather than hide it.

Design a **reusable procedural attack-presentation/effects system** suitable for future characters.

Do not solve this as a pile of unstructured `if fighter === ...` hacks.

Effects are presentation-only and may never decide:
- hitbox;
- damage;
- stun;
- capture;
- Clash;
- resource legality.

Define performance budgets for mobile landscape and rules preventing effects from obscuring telegraphs/HUD/touch controls.

### 5. Add a fourth fighter: EL TORO

The user supplied an identity reference, action/sprite-sheet reference and this gameplay brief:

- **Close Special — Topete:** charges/lunges forward to crush the rival like a rugby player.
- **Long Special — Shawarmazo:** throws a spicy shawarma sandwich projectile that deals damage.
- **Ultimate — Super Eructo:** massive burp that deals damage and knocks the rival away.

Read:
`docs/characters/el-toro/PACKAGE.md`

The source reference hashes are recorded there. The actual user images are visual-authoring references only and must never become runtime fighter sprites/textures.

### El Toro visual identity

The durable transcription includes:
- broad/stocky rugby-player build;
- shaggy dark hair;
- white `TE VOY A CHOCAR` shirt;
- blue/white Scotland rugby scarf;
- blue hand wraps;
- black cargo pants;
- black/white sneakers;
- Springboks/South Africa rugby motifs;
- shawarma motif at waist;
- heavy confident stance.

The action sheet suggests:
- blue heavy-impact language for Topete;
- warm/orange food/debris language for Shawarmazo;
- large green gas/wave language for Super Eructo.

Do not copy sheet frames literally. Translate identity/action intent into the procedural articulated renderer.

## EL TORO DESIGN DUTY

Produce an implementation-ready fighter contract with exact:
- archetype;
- strengths/weaknesses;
- HP/movement/jump/gravity/hurt dimensions;
- normal attack;
- clean short route if any;
- low;
- air attack;
- Topete;
- Shawarmazo;
- Super Eructo;
- CPU tactics;
- presentation metadata;
- visual keys;
- resource interactions;
- Clash interaction;
- malformed-content validation;
- acceptance tests.

### Topete

Define precisely:
- startup;
- travel/active lifecycle;
- damage;
- hitstun/blockstun;
- knockback;
- recovery;
- collision shape;
- wall/corner behavior;
- whether armor exists;
- interruption rules;
- whiff punishability;
- counterplay.

It must feel like a rugby power charge without becoming an invincible fullscreen win button or a duplicate capture Ultimate.

### Shawarmazo

Define:
- projectile kind;
- spawn;
- speed;
- lifetime/range;
- damage;
- knockback/hitstun;
- hit/block behavior;
- availability/rearm if needed;
- wall/cleanup semantics;
- procedural visual/debris effect.

It must be mechanically distinct from:
- Lengua;
- Chorizo;
- Rugby Boomerang.

The sheet may visually imply a heavy/knockdown impact, but the user's brief only guarantees damage. Choose knockdown/launch only if it improves balance and identity.

### Super Eructo

Define:
- startup/telegraph;
- geometry;
- duration;
- damage model;
- knockback/launch;
- block/unblockable rules;
- interruption;
- whiff/recovery;
- counterplay;
- Universal Ultimate Clash geometry/arbitration;
- cleanup.

It must visibly read as a massive forward burp/gas event but cannot be opaque unavoidable fullscreen damage.

## ARCHITECTURE AUDIT

V0.6 claimed to create a reusable Character Package pipeline. El Toro is the first real test after Juanchi.

Audit whether adding El Toro can actually happen without rewriting universal systems.

Inspect at minimum:
- `src/game/data/**`
- fighter/content registries;
- projectile kinds/visual dispatch;
- Ultimate kinds/arbitration;
- CPU tactics;
- render rigs/visual-key dispatch;
- UI roster flow;
- stage independence;
- standalone generation;
- nested test discovery.

Identify any remaining identity hardcoding.

Rule:
- if El Toro can use an existing primitive, reuse it;
- if he genuinely requires a new primitive, define the smallest typed deterministic lifecycle;
- do not build an ECS, scripting engine or generic animation graph just because a fourth fighter exists.

## NEXT VERSION SCOPE

Plan the next bounded release as **V0.7 candidate** unless the audit finds a compelling versioning reason otherwise.

The version should be centered on:
1. Lengua counterplay/balance;
2. meaningful CPU difficulty levels;
3. locomotion repair, especially Juanchi;
4. major attack/game-feel presentation upgrade across the current roster;
5. El Toro as fourth fighter.

Do not inflate scope with:
- online;
- story mode;
- account/shop systems;
- generic engine rewrite;
- unnecessary new stage;
- long combo system;
- unrelated UI redesign.

A new El Toro stage is **not automatically required**. Only propose one if there is a strong bounded product reason.

## PERMANENT PROJECT RULES TO PRESERVE

- fixed 60 Hz simulation owns combat truth;
- procedural articulated Canvas2D fighters;
- reference images are authoring references only;
- renderer never determines hitboxes/damage/stun/move legality;
- mobile landscape is primary;
- every animation must physically communicate its action;
- no runtime raster fighter sprites;
- stages remain presentation-only unless a future user decision explicitly changes that;
- four-action mobile grammar + dedicated Ultimate stays unless evidence makes a redesign unavoidable.

## AGENT EXECUTION MODEL

The permanent specialist order for the eventual implementation round is:

**Ricardo → Germinator → Mario + Brancaforte → Gonza**

Plan around that order.

Expected ownership:
- Ricardo: simulation/data/CPU/balance/new gameplay primitives;
- Germinator: independent gameplay/core audit after Ricardo;
- Mario: procedural rigs/locomotion/effects/visual presentation;
- Brancaforte: difficulty UI/selection/help/front-end integration where needed;
- Gonza: final integration/build/parity/release;
- Neureon: later round formation/contracts only.

You are **not** Neureon and must not activate those agents.

## REQUIRED INVESTIGATION

Before writing conclusions:

1. run the current full test suite and build;
2. inspect exact shipped values/code rather than trusting old specs;
3. search for remaining fighter-ID hardcoding;
4. construct deterministic probes for Lengua spam and approach;
5. inspect CPU decision/reaction code and current V0.6 tuning;
6. inspect locomotion helpers + Juanchi rig;
7. inspect attack/effect rendering for every fighter;
8. inspect Character Package extensibility using El Toro as the next real consumer;
9. identify any mismatch between V0.6 docs and actual release code;
10. record evidence with exact file paths/values/commands.

Tiny diagnostic experiments/tests are allowed when necessary to validate architectural or balance conclusions. Do not turn them into production implementation.

## REQUIRED OUTPUTS IN THE REPOSITORY

Write **all** of the following as implementation-ready documentation:

1. `docs/superpowers/specs/2026-09-20-v07-post-v06-master-audit.md`
   - exact shipped-state audit;
   - evidence;
   - root causes;
   - architecture risks;
   - what V0.6 genuinely solved versus what remains.

2. `docs/superpowers/specs/2026-09-20-v07-lengua-balance-contract.md`
   - measured problem;
   - exact candidate tuning/redesign;
   - counterplay contract;
   - deterministic acceptance scenarios.

3. `docs/superpowers/specs/2026-09-20-v07-cpu-difficulty-contract.md`
   - difficulty levels;
   - parameter table;
   - fairness invariants;
   - per-fighter integration;
   - tests.

4. `docs/superpowers/specs/2026-09-20-v07-animation-effects-quality-contract.md`
   - Juanchi locomotion diagnosis/fix;
   - shared attack-presentation architecture;
   - per-fighter attack/effect requirements;
   - real Juanchi red aura contract;
   - performance/readability rules;
   - cadence/hitstop invariants.

5. `docs/superpowers/specs/2026-09-20-v07-el-toro-character-contract.md`
   - complete exact implementation-ready fighter specification.

6. `docs/superpowers/specs/2026-09-20-v07-content-design.md`
   - bounded V0.7 product design;
   - what enters/does not enter;
   - cross-system dependencies;
   - player-facing outcome.

7. `docs/superpowers/plans/2026-09-20-v07-implementation-plan.md`
   - staged task plan in canonical agent order;
   - exact likely files/ownership;
   - dependency graph;
   - test/acceptance gates;
   - release criteria;
   - no per-step Neureon check-in design.

8. `coordination/handoffs/2026-09-20-v07-external-audit-handoff.md`
   - concise external handoff to future Neureon;
   - exact audited base SHA;
   - documents produced;
   - blockers/open user decisions;
   - recommended first implementation task;
   - explicit statement that no V0.7 round was activated.

You may update `docs/CURRENT_MILESTONE.md` only to state that V0.7 audit/planning material now exists and production remains IDLE.

Update `AGENTS.md` or `docs/DECISIONS.md` only if you discover a genuinely permanent rule that should outlive V0.7. Do not rewrite them casually.

## ACCEPTANCE STANDARD FOR YOUR AUDIT

Your intervention is complete only if a future Neureon can form V0.7 without inventing:
- balance numbers;
- difficulty semantics;
- El Toro move lifecycle;
- visual-effect architecture;
- Juanchi locomotion fix;
- acceptance tests;
- agent dependencies.

Avoid vague statements such as:
- "make AI smarter";
- "improve animations";
- "add more particles";
- "nerf Lengua";
- "make El Toro balanced".

Every recommendation must identify the concrete system, measurable behavior and evidence/acceptance condition.

## DO NOT

- implement V0.7 production code;
- activate R005/V0.7;
- assign/start permanent agents;
- deploy a new build;
- use the uploaded reference images as runtime sprites;
- hide the user's negative V0.6 findings because automated QA was green;
- assume a visual effect exists because a design spec once requested it;
- change Match Engine truth from rendering;
- add difficulty by giving CPU illegal information;
- invent a fifth action button;
- add a new stage merely to make the plan look larger.

## FINAL HANDOFF MESSAGE

When finished, report:
- exact audit base SHA;
- diagnostic tests/build result;
- root cause of Lengua dominance;
- proposed difficulty model;
- Juanchi locomotion diagnosis;
- attack/effects architecture decision;
- El Toro's final gameplay identity;
- V0.7 scope;
- every file written;
- any remaining user decision.

Then stop. Neureon will form the implementation round later.
