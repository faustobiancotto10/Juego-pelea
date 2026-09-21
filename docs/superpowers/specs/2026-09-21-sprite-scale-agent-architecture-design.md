# Sprite Runtime + Scalable Content + Agent Operating System — Design

Status: **APPROVED BY USER — IMPLEMENTATION PLANNING AUTHORIZED**  
Date: 2026-09-21  
Owner: Neureon  
Applies after: R005 / V0.7 production acceptance, unless the user explicitly reopens that round.

## 1. Intent

Juego-pelea is expected to expand well beyond four fighters. Future growth includes many fighters, fighter-specific abilities, additional game modes, more visual content and potentially several parallel agent instances working in one session.

The architecture therefore needs to solve four connected scaling problems:

1. fighter visuals must move from procedural body rigs to authored sprite animation without moving combat truth into rendering;
2. fighter/mode content must become increasingly package-driven so adding content does not require widening central conditionals;
3. durable agent identities must be able to scale horizontally into multiple temporary instances;
4. every completed agent task must feed reusable operational learning back into the durable identity when such learning exists.

The repository is the persistent authority. Chat instances are disposable workers.

## 2. Non-goals and current-round isolation

This design does **not** rewrite or invalidate the still-active R005 release candidate.

Until V0.7 is accepted and promoted:
- current procedural fighter rigs remain the production runtime;
- no partial sprite migration is published to production;
- no R005 gameplay/balance contract is silently changed;
- the existing physical-phone acceptance gate remains authoritative.

The sprite migration may use a temporary hybrid renderer during development, but a published migration is accepted only when all playable fighters in the current roster use the production sprite-body backend.

Canvas2D remains valid for stages, HUD-independent playfield rendering, generic particles, lighting, screen effects and other presentation where procedural drawing is useful. The migration targets **fighter body animation**, not every Canvas2D primitive in the game.

## 3. Core runtime boundary

Simulation remains the sole owner of combat truth.

The renderer may consume:
- fighter position/velocity/facing;
- grounded/crouching/blocking/stun state;
- move ID and move frame;
- dash kind/frame;
- Ultimate phase/frame;
- combat events;
- other explicitly exposed snapshot fields.

The renderer may never decide:
- whether an attack is legal;
- hitbox timing;
- damage;
- guard/stun;
- projectile legality;
- move completion;
- CPU decisions;
- clash outcome.

The current 60 Hz deterministic simulation remains unchanged by the visual migration.

### 3.1 Target body-render path

Current body path:

```text
FighterSnapshot
  → locomotion/presentation sampling
  → procedural fighter rig
  → Canvas2D body
```

Target body path:

```text
FighterSnapshot + MatchSnapshot/event context
  → AnimationResolver
  → SpriteAnimationKey + animation tick
  → SpriteAnimationSet
  → atlas frame + pivot + duration
  → SpriteFighterRenderer
```

There is no new generic `fighter.state` field. Presentation derives from the existing authoritative snapshot/event contract. If a future visual genuinely lacks required authoritative information, Mario requests the smallest stable renderer-facing field from Ricardo instead of inferring gameplay state.

### 3.2 Temporary dual backend

During migration, `FighterRenderer` may route by presentation backend:

```ts
type FighterBodyBackend = 'procedural' | 'sprite';
```

This duality is a migration mechanism, not the final art direction.

Rules:
- hybrid matches are allowed only in development/preview;
- a fighter may fall back to a visible missing-asset diagnostic in development;
- production migration cannot silently fall back to procedural bodies;
- after all released fighters pass sprite acceptance, the procedural body backend is retired from production use.

## 4. Sprite package contract

A production sprite is a derived game asset, not a source/reference image.

Recommended runtime package:

```text
assets/fighters/<fighter-id>/
  body.webp
  effects.webp                 # optional identity-specific raster FX
  animations.json
```

Authoring/source material stays separate, for example:

```text
docs/characters/<fighter-id>/references/
docs/characters/<fighter-id>/sprite-source/
```

A general concept sheet containing labels, numbers, backgrounds or mixed frame sizes is never loaded directly at runtime.

### 4.1 Animation manifest

The manifest is declarative data. At minimum it records:
- atlas source;
- animation keys;
- ordered frames;
- source rectangle per frame;
- bottom/character pivot per frame;
- duration in simulation ticks or presentation ticks;
- optional named attachment anchors needed by identity-specific props/FX;
- looping/hold behavior;
- development fallback policy.

Conceptual shape:

```ts
interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  pivotX: number;
  pivotY: number;
  durationTicks: number;
}

interface SpriteAnimation {
  loop: boolean;
  frames: readonly SpriteFrame[];
}

interface SpriteAnimationSet {
  version: 1;
  atlas: string;
  animations: Readonly<Record<string, SpriteAnimation>>;
}
```

Frames are trimmed. They do not need identical bounding boxes. Stable pivots keep the fighter anchored while allowing crouches, lunges, knockdowns and large Ultimate poses to occupy different rectangles.

### 4.2 Animation keys

The exact released key set is frozen during implementation, but it must cover the visible semantics already present in the game rather than mirror every simulation field one-for-one.

Expected families include:
- idle;
- walk forward/back;
- crouch;
- jump startup/ascent/apex/descent/land as needed;
- block;
- hurt / heavy hurt / knockdown;
- dash;
- standing/chain/low/air attacks;
- ranged special;
- close special;
- Ultimate startup/sequence/recovery;
- win/KO when those states become visually distinct.

Move-specific keys are permitted where identity requires them, e.g. `topete`, `shawarmazo`, `super-eructo`. The resolver maps existing move IDs/phases to those keys.

Frame count is not a fixed global quota. Holds and short reactions may use fewer drawings; signature attacks may use more. Quality and readable timing matter more than reaching an arbitrary number.

## 5. Sprite authoring pipeline

The canonical 2D production workflow follows the Game Studio sprite-pipeline contract when that host capability is available:

1. approve a representative seed/reference frame;
2. generate an entire animation strip together where practical rather than generating isolated frames independently;
3. preserve character identity, facing, palette, silhouette family, outfit proportions and transparency;
4. normalize the strip using one shared scale and anchor;
5. optionally lock the first frame to an approved shipped/base pose;
6. render a preview sheet;
7. inspect in-engine at gameplay scale before admitting the assets.

The repository must eventually provide repeatable scripts for deterministic validation/packing so Mario does not manually register hundreds of frames.

Automation targets:
- file/name validation;
- alpha/transparency checks;
- frame count validation;
- shared scale/pivot normalization checks;
- atlas packing;
- manifest generation/validation;
- preview-sheet generation;
- missing animation detection.

### 5.1 El Toro vertical slice

El Toro is the first migration proof because representative art already demonstrated acceptable cross-pose consistency.

The first retained implementation slice should cover roughly one complete visual loop rather than the whole roster:
- idle;
- walk;
- one ordinary attack;
- Topete.

A ~32-drawing body slice is sufficient for the initial comparison. This is a validation budget, not a permanent contract.

Acceptance question: does the sprite path produce an obvious character/readability improvement at real gameplay scale without unacceptable memory/performance cost?

Only after that answer is yes should the full four-fighter asset production fan out.

## 6. FX policy

Keep generic effects procedural when that is cheaper and more flexible:
- shake;
- generic dust;
- generic hit sparks;
- generic trails;
- flashes;
- lighting;
- generic aura layers.

Use raster/sprite assets for identity-specific visuals where authored shape materially improves quality:
- signature projectiles;
- signature props;
- special impact/debris;
- unique Ultimate bursts;
- body-coupled effects that cannot be represented cleanly with generic procedural primitives.

Body and projectile/FX assets remain separate so projectiles are independent game/render entities rather than baked into body frames.

## 7. Loading and mobile memory

Do not preload the entire future roster.

Menus load only the light assets needed for selection UI. A fight loads:
- the two selected fighter body packages;
- required identity-specific FX/projectile assets;
- stage assets;
- shared generic assets.

Fight-scoped assets are releasable after the match/scene lifecycle no longer needs them.

Compressed file size is not treated as decoded GPU/bitmap memory. Performance acceptance must use real target-device evidence, especially iPhone/Safari landscape.

## 8. Scalable character content architecture

Adding fighter N should be cheaper and safer than adding fighter 4.

A fighter is conceptually one package:

```text
character/
  definition
  stats
  moveset
  abilities
  presentation
  sprite-manifest
  audio
  fx
  tests
```

The existing `CombatCharacterContent` composition remains the starting point. Future extensions should add declarative package surfaces rather than central fighter-ID branches.

Unique fighter abilities should preferentially compose reusable simulation primitives such as:
- projectile lifecycle;
- committed movement;
- grab/capture when introduced;
- armor;
- knockback;
- buff/debuff;
- area effect;
- resource consumption;
- transformation/stance.

A genuinely new mechanic may add one bounded primitive with explicit tests and contracts. The system must not force every unique ability into an ill-fitting generic abstraction, but it also must not accumulate a large `if (fighter.id === ...)` gameplay tree.

## 9. Scalable game modes

New modes must not be implemented as widening conditional branches inside the normal fight scene.

The future mode boundary should separate:
- participant/roster rules;
- match/round configuration;
- win/loss conditions;
- stage selection restrictions;
- mode-specific resources/rules;
- UI flow metadata;
- persistence/progression hooks when those systems exist.

Shared combat primitives remain reusable. A mode may configure or compose them without duplicating the core deterministic simulation.

The exact `ModeDefinition` API is deferred until the first new mode is specified; this design freezes the boundary principle, not speculative fields.

## 10. Agent model: identity is not an instance

The six names are durable specialist identities, not six permanent chats.

Examples:

```text
Mario identity
  ├─ Mario-A
  ├─ Mario-B
  ├─ Mario-C
  └─ Mario-D
```

or, for another round:

```text
Ricardo × 3
Mario × 5
Germinator × 2
Brancaforte × 1
Gonza × 1
```

There is no repository-defined numeric maximum. The limiting factor is safe decomposition, not chat count.

Parallel instances are created only when work can be partitioned with:
- independent lanes;
- explicit files/subsystems;
- explicit dependencies;
- isolated branches or otherwise proven-safe write boundaries;
- exact-SHA handoffs;
- one integrated candidate before downstream QA.

More instances are not automatically better. If workers repeatedly need the same mutable files or one lane depends on understanding another lane's unfinished implementation, the work should remain serial or be re-partitioned.

A same-role squad may designate a temporary architect/integrator. That instance gets coordination authority over the squad's lane interface, not broader product authority.

## 11. Fundamental identity-learning law

The durable identity under `coordination/agents/<role>.md` is the role's accumulated operating knowledge.

**Every meaningful task/session closeout must perform an Identity Learning Review before its handoff is considered complete.**

The review asks:
- what friction/error/insight appeared during this work?
- would the lesson help a replacement instance of this same identity on multiple future tasks?
- is it supported by actual evidence?
- is it operational rather than merely historical?

Every handoff leaves an explicit receipt with one of:
- `UPDATED` — durable identity was improved;
- `PROPOSAL` — reusable lesson exists but must be consolidated by the squad/role integrator;
- `NO_CHANGE` — the review was performed and no durable reusable lesson passed the filter.

`NO_CHANGE` is valid. Skipping the review is not.

Never store:
- current task/round/branch/SHA state;
- one-off bugs;
- temporary tuning values;
- facts already better represented by current code/specs;
- guesses or unverified preferences;
- new authority/scope.

### 11.1 Multi-instance identity consolidation

Multiple simultaneous instances must not race to rewrite the shared identity file.

Each lane records its learning receipt/proposal. The designated same-role integrator, or the final instance chosen by the round, deduplicates proposals and performs at most one coherent update to the durable identity after the squad converges.

System-wide lessons do not get smuggled into one role identity. They are promoted by Neureon to `AGENTS.md`, `coordination/PROTOCOL.md`, `coordination/TOOLING.md` or `docs/DECISIONS.md` as appropriate.

## 12. Tool capability contract

Repository instructions can require and route tools, but **cannot install or enable a ChatGPT plugin inside another chat**. Plugin availability is a property of the host/session.

The repository therefore defines capability routing and truthful fallback behavior.

### 12.1 Superpowers

When exposed by the host, agents use applicable Superpowers process skills before acting, including:
- brainstorming for architecture/behavior design;
- writing-plans for approved multi-step implementation;
- TDD for features/bugfixes;
- systematic-debugging for unexpected failures;
- parallel-agent guidance for separable lanes;
- verification-before-completion before success claims.

### 12.2 Game Studio

For this browser game, use the most specific Game Studio capability when exposed:
- `web-game-foundations` — simulation/render/input/asset boundaries;
- `sprite-pipeline` — 2D sprite generation/normalization/preview workflow;
- `game-playtest` — browser-game smoke/visual QA;
- `game-ui-frontend` — HUD/menu work when relevant.

The project does not migrate to Phaser merely because the plugin defaults to Phaser for new 2D games. Existing TypeScript/Canvas2D architecture is preserved unless a separate user-approved engine migration exists.

### 12.3 Game Development Studio

When exposed by the host, Game Development Studio is authorized for the workflows its skills actually support:
- game asset production/inspection/normalization;
- asset package vendoring;
- deterministic visual debugging/capture;
- bounded measurable performance optimization.

Its durable local interface is the `game-dev` CLI. Environment readiness checks are:
- `game-dev --version`;
- `game-dev capabilities --json`;
- `game-dev doctor --json`.

No provider credential is stored, requested or copied into the repository/chat.

If the plugin or CLI is unavailable in a particular agent session:
1. record `TOOL_UNAVAILABLE` in the task/handoff when the missing capability matters;
2. do not claim the plugin was used;
3. continue with repository-native tooling only when acceptance can still be proven;
4. block/escalate if the missing capability is required evidence.

This explains why a Mario chat can read repository authorization yet still be unable to execute Game Development Studio: repository policy cannot manufacture a host plugin or local CLI that the chat does not have.

## 13. QA and acceptance gates

Sprite migration acceptance requires all of:
- deterministic gameplay tests remain green;
- renderer does not become combat-authoritative;
- manifest/asset validation rejects malformed packages;
- all current playable fighters have complete production sprite packages before final production cutover;
- actions remain readable with generic FX disabled;
- character identity remains recognizable at gameplay scale;
- target mobile landscape performance/memory is acceptable;
- missing assets fail visibly during development rather than silently hiding;
- production build contains no direct source/reference-sheet imports;
- human/device visual acceptance remains a separate gate from automated pixel/performance evidence.

Agent-system acceptance requires:
- handoff template contains an identity-learning receipt;
- task closeout requires the receipt;
- same-role squads have lane ownership and an integration point;
- multi-instance learnings consolidate rather than race;
- tool use/fallback is explicit and truthful.

## 14. Rollout sequence

1. Land the coordination/identity/tooling contract without changing R005 runtime behavior.
2. After V0.7 release closure, open the sprite/scalability implementation round.
3. Build the sprite manifest/loader/resolver and dual backend with tests.
4. Run the El Toro development vertical slice.
5. User/device acceptance of the slice decides whether full migration proceeds.
6. If accepted, fan out full current-roster production across parallel Mario lanes.
7. Integrate one four-fighter sprite candidate.
8. Germinator audits correctness/asset/runtime boundaries; performance evidence is collected.
9. Gonza publishes an isolated preview.
10. After user/device acceptance, cut production to all-sprite fighter bodies and remove production dependence on procedural fighter rigs.
11. Reuse the same package/pipeline contracts for fighter 5+ and later mode expansion.

## 15. Success criterion

The architecture is successful when adding more content scales primarily by adding validated packages and independent lanes, not by multiplying central special cases; when several instances of one identity can safely work in parallel; and when each generation of that identity inherits reusable lessons from the work that came before it.
