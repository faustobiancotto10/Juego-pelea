# Sprite Runtime Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace procedural fighter-body rendering with a data-driven sprite animation backend while preserving the existing deterministic combat simulation, then migrate all currently playable fighters before production cutover.

**Architecture:** Keep `FighterSnapshot`/simulation authoritative. Add a declarative sprite manifest, a render-only animation resolver, a fight-scoped sprite asset store, and a `SpriteFighterRenderer` behind a temporary dual backend. Validate first with an El Toro vertical slice, then fan out the complete roster using isolated Mario lanes.

**Tech Stack:** TypeScript, Canvas2D, browser `ImageBitmap`/HTMLImageElement-compatible image loading, JSON sprite manifests, Node.js tests, existing build/test tooling.

**Spec:** `docs/superpowers/specs/2026-09-21-sprite-scale-agent-architecture-design.md`

## Global Constraints

- **Hard prerequisite:** R005/V0.7 is `ROUND_COMPLETE` and production promotion is finished, unless the user explicitly reopens R005 scope.
- Source/reference sheets remain authoring-only and are never imported directly by runtime.
- Production sprite assets are normalized derived assets.
- Simulation remains sole combat authority at fixed 60 Hz.
- Do not add a generic `fighter.state` field.
- Rendering derives animation choice from existing `FighterSnapshot`, `MatchSnapshot`, move data, and events.
- Hybrid procedural/sprite matches are development-only.
- Final production cutover requires every currently playable fighter to use the accepted sprite-body backend.
- Generic particles/trails/shake/lighting may remain procedural.
- No Phaser migration.
- El Toro pilot requires user-approved production sprite frames; the earlier general concept sheet is not automatically a shipping asset.

## Review Focus

- Missing/malformed sprite packages must fail visibly in development and never silently alter combat behavior.
- Animation timing must remain stable through hitstop, round transitions, and held simulation frames.
- Facing flips and per-frame pivots must not make the fighter slide or jump relative to authoritative world position.
- Only the two selected fighter packages should be fight-loaded; roster growth must not preload every body atlas.
- Production cutover must not leave one fighter procedural while another is sprite-based.

---

### Task 1: Add the sprite manifest schema and validation

**Files:**
- Create: `src/game/render/sprites/SpriteManifest.ts`
- Create: `tests/sprite-manifest.test.mjs`
- Modify: `src/game/data/characterContent.ts`
- Modify: `src/game/data/presentationRegistry.ts`

**Interfaces:**
- Consumes: existing `FighterPresentationDefinition`.
- Produces:
  - `FighterBodyBackend = 'procedural' | 'sprite'`
  - `SpriteFrameDefinition`
  - `SpriteAnimationDefinition`
  - `SpriteAnimationSetDefinition`
  - validated optional sprite presentation metadata.

- [ ] **Step 1: Write failing manifest validation tests**

Create `tests/sprite-manifest.test.mjs` that imports compiled JS after `tsc` and asserts:
- version must equal `1`;
- atlas path is non-empty;
- animation map is non-empty;
- every animation has at least one frame;
- frame rect width/height > 0;
- `pivotX`/`pivotY` are finite;
- `durationTicks` is an integer >= 1;
- duplicate/empty animation keys are rejected by construction;
- sprite backend requires a sprite package key;
- procedural backend may omit one.

Use fixture data such as:

```js
const valid = {
  version: 1,
  atlas: 'assets/fighters/el-toro/body.webp',
  animations: {
    idle: {
      loop: true,
      frames: [
        { x: 0, y: 0, width: 180, height: 260, pivotX: 90, pivotY: 250, durationTicks: 6 },
      ],
    },
  },
};
```

- [ ] **Step 2: Run RED**

```bash
npm run clean && tsc && node --test tests/sprite-manifest.test.mjs
```

Expected: FAIL because sprite manifest types/validator do not exist.

- [ ] **Step 3: Implement schema**

In `SpriteManifest.ts` define:

```ts
export type FighterBodyBackend = 'procedural' | 'sprite';

export interface SpriteFrameDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
  pivotX: number;
  pivotY: number;
  durationTicks: number;
}

export interface SpriteAnimationDefinition {
  loop: boolean;
  frames: readonly SpriteFrameDefinition[];
}

export interface SpriteAnimationSetDefinition {
  version: 1;
  atlas: string;
  animations: Readonly<Record<string, SpriteAnimationDefinition>>;
}
```

Export `validateSpriteAnimationSet(value: unknown, path?: string): SpriteAnimationSetDefinition` with explicit errors.

Extend `FighterPresentationDefinition` with:

```ts
bodyBackend?: FighterBodyBackend;
spritePackageKey?: string;
```

Validation rule:
- missing `bodyBackend` means current procedural behavior;
- `bodyBackend: 'sprite'` requires non-empty `spritePackageKey`;
- `bodyBackend: 'procedural'` does not require it.

- [ ] **Step 4: Run GREEN**

```bash
npm run clean && tsc && node --test tests/sprite-manifest.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/render/sprites/SpriteManifest.ts src/game/data/characterContent.ts src/game/data/presentationRegistry.ts tests/sprite-manifest.test.mjs
git commit -m "feat: add validated fighter sprite manifests"
```

---

### Task 2: Add a render-only AnimationResolver

**Files:**
- Create: `src/game/render/sprites/AnimationResolver.ts`
- Create: `tests/sprite-animation-resolver.test.mjs`

**Interfaces:**
- Consumes: `FighterSnapshot`, existing move definitions via `getMoveDefinition`.
- Produces:

```ts
export interface ResolvedSpriteAnimation {
  key: string;
  tick: number;
}
export function resolveSpriteAnimation(fighter: FighterSnapshot): ResolvedSpriteAnimation;
```

- [ ] **Step 1: Write failing resolver tests**

Cover at minimum:
- neutral grounded stationary → `idle`;
- grounded horizontal velocity → `walk-forward` or `walk-back` using facing × vx;
- crouching neutral → `crouch`;
- blocking standing/crouching → `block` / `block-crouch`;
- dashKind → `dash-forward` / `dash-back`;
- airborne positive vy → `jump-ascent`;
- airborne near apex → `jump-apex`;
- airborne negative vy → `jump-descent`;
- landingRecoveryFrames > 0 → `land`;
- stun/guard break → `hurt` / `guard-break`;
- ordinary move IDs resolve to `move:<moveId>`;
- Ultimate phases resolve to `ultimate:<moveId>:startup|capture|sequence|recovery`.

Assert tick selection comes only from authoritative snapshot counters such as `moveFrame`, `dashFrame`, `airborneTicks`, `ultimatePhaseFrame` and `landingRecoveryFrames`; it must not use wall-clock time.

- [ ] **Step 2: Run RED**

```bash
npm run clean && tsc && node --test tests/sprite-animation-resolver.test.mjs
```

Expected: FAIL because resolver is missing.

- [ ] **Step 3: Implement resolver**

Priority order must make mutually exclusive authoritative states explicit:

```text
captured/terminal reaction
→ guard break/stun
→ Ultimate phase
→ active move
→ block
→ dash
→ airborne/landing
→ crouch
→ locomotion
→ idle
```

Do not add simulation fields.

- [ ] **Step 4: Run GREEN**

```bash
npm run clean && tsc && node --test tests/sprite-animation-resolver.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/render/sprites/AnimationResolver.ts tests/sprite-animation-resolver.test.mjs
git commit -m "feat: resolve fighter sprite animations from snapshots"
```

---

### Task 3: Add deterministic frame selection

**Files:**
- Create: `src/game/render/sprites/SpriteFrameSampler.ts`
- Extend: `tests/sprite-animation-resolver.test.mjs`

**Interfaces:**
- Consumes: `SpriteAnimationDefinition`, integer animation tick.
- Produces:

```ts
export interface SampledSpriteFrame {
  frame: SpriteFrameDefinition;
  frameIndex: number;
}
export function sampleSpriteFrame(animation: SpriteAnimationDefinition, tick: number): SampledSpriteFrame;
```

- [ ] **Step 1: Write failing frame-timing tests**

Test:
- variable frame durations;
- looping animation wraps by total tick duration;
- non-looping animation holds final frame;
- negative tick clamps to zero;
- hitstop behavior is stable because repeated authoritative tick returns same frame.

- [ ] **Step 2: Run RED**

```bash
npm run clean && tsc && node --test tests/sprite-animation-resolver.test.mjs
```

- [ ] **Step 3: Implement cumulative-duration sampling**

Use integer ticks only. No `performance.now()`, `Date.now()`, or render-frame counter.

- [ ] **Step 4: Run GREEN**

Same command, expected PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/render/sprites/SpriteFrameSampler.ts tests/sprite-animation-resolver.test.mjs
git commit -m "feat: sample sprite frames from simulation ticks"
```

---

### Task 4: Add fight-scoped sprite asset loading

**Files:**
- Create: `src/game/render/sprites/SpriteAssetStore.ts`
- Create: `src/game/render/sprites/SpritePackageRegistry.ts`
- Create: `tests/sprite-asset-store.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: fighter IDs + sprite package keys.
- Produces:

```ts
export interface LoadedSpritePackage {
  manifest: SpriteAnimationSetDefinition;
  image: CanvasImageSource;
}

export interface SpriteAssetStore {
  preload(packageKeys: readonly string[]): Promise<void>;
  get(packageKey: string): LoadedSpritePackage;
  releaseExcept(packageKeys: readonly string[]): void;
  clear(): void;
}
```

- [ ] **Step 1: Write failing registry/cache tests**

Use injected loader functions rather than network in unit tests.

Assert:
- two selected keys load exactly once each;
- duplicate preload does not duplicate fetch/decode;
- `get` on missing package throws a visible diagnostic error;
- `releaseExcept(['a','b'])` removes unrelated cached packages;
- registry rejects missing manifest/atlas metadata.

- [ ] **Step 2: Run RED**

```bash
npm run clean && tsc && node --test tests/sprite-asset-store.test.mjs
```

- [ ] **Step 3: Implement injected async loader**

Browser default loader:
- fetch manifest JSON;
- validate with `validateSpriteAnimationSet`;
- resolve atlas path relative to manifest/registry;
- load/decode image;
- return one package.

Keep test loader injectable.

- [ ] **Step 4: Add build asset copy**

Add package script behavior so `assets/` is copied into `dist/assets/` when the directory exists.

Use a repository script rather than a shell that fails on missing assets:

Create `scripts/copy-runtime-assets.mjs` with:
- if `assets` missing: exit 0;
- otherwise recursively copy to `dist/assets`.

Modify `build` to invoke it after `tsc`.

- [ ] **Step 5: Run GREEN**

```bash
npm run clean && tsc && node --test tests/sprite-asset-store.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/render/sprites/SpriteAssetStore.ts src/game/render/sprites/SpritePackageRegistry.ts scripts/copy-runtime-assets.mjs package.json tests/sprite-asset-store.test.mjs
git commit -m "feat: load fight-scoped fighter sprite packages"
```

---

### Task 5: Add SpriteFighterRenderer and temporary backend routing

**Files:**
- Create: `src/game/render/sprites/SpriteFighterRenderer.ts`
- Modify: `src/game/render/FighterRenderer.ts`
- Create: `tests/sprite-fighter-renderer.test.mjs`

**Interfaces:**
- Consumes: `FighterSnapshot`, resolved animation, loaded sprite package.
- Produces:
  - pivot-correct `drawImage` parameters;
  - facing flip around authoritative fighter world anchor;
  - temporary routing by `presentation.bodyBackend`.

- [ ] **Step 1: Write failing pure-layout tests**

Extract a pure helper:

```ts
export function computeSpriteDrawPlacement(
  fighter: FighterSnapshot,
  frame: SpriteFrameDefinition,
): {
  translateX: number;
  translateY: number;
  scaleX: -1 | 1;
  source: { x: number; y: number; width: number; height: number };
  dest: { x: number; y: number; width: number; height: number };
};
```

Test:
- source rect preserved;
- bottom pivot lands on `fighter.x` / ground-relative `fighter.y`;
- facing=-1 mirrors without shifting anchor;
- crouch/lunge frames with different trimmed sizes remain anchored.

- [ ] **Step 2: Run RED**

```bash
npm run clean && tsc && node --test tests/sprite-fighter-renderer.test.mjs
```

- [ ] **Step 3: Implement renderer**

`SpriteFighterRenderer`:
1. gets package from store;
2. resolves animation key/tick;
3. fails visibly if animation key absent;
4. samples frame;
5. applies alpha supplied by caller;
6. draws only the atlas source rectangle.

- [ ] **Step 4: Route `FighterRenderer`**

Keep current procedural code intact.

Pseudo-contract:

```ts
if ((presentation.bodyBackend ?? 'procedural') === 'sprite') {
  spriteRenderer.draw(...);
  return;
}
drawProceduralRig(...);
```

Do not change `FightRenderer` combat effects yet.

- [ ] **Step 5: Run GREEN + existing visual architecture tests**

```bash
npm run clean && tsc
node --test tests/sprite-fighter-renderer.test.mjs
node --test tests/v07-m3a-visual-architecture.test.mjs tests/v07-m3d-motion-fx.test.mjs
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/render/sprites/SpriteFighterRenderer.ts src/game/render/FighterRenderer.ts tests/sprite-fighter-renderer.test.mjs
git commit -m "feat: add temporary dual fighter body renderer"
```

---

### Task 6: Integrate fight lifecycle preloading

**Files:**
- Modify: `src/game/ui/AppController.ts`
- Modify: `src/game/render/FightRenderer.ts`
- Create: `tests/sprite-fight-lifecycle.test.mjs`

**Interfaces:**
- Consumes: selected player/CPU IDs from existing UI flow.
- Produces: preload-before-fight and fight-scoped release behavior.

- [ ] **Step 1: Write failing lifecycle tests**

Use a fake `SpriteAssetStore` and assert:
- starting a fight with two sprite-backed fighters preloads exactly their two package keys;
- one procedural + one sprite dev match loads only the sprite package;
- rematch with same fighters does not reload;
- changing fighters releases packages not required by the next fight;
- menu/selection does not preload the full roster body atlases.

- [ ] **Step 2: Run RED**

```bash
npm run clean && tsc && node --test tests/sprite-fight-lifecycle.test.mjs
```

- [ ] **Step 3: Implement preload gate**

Before constructing/starting live fight rendering, await selected sprite packages. Keep selection UI responsive with a bounded loading state.

Do not allow a sprite fighter to enter live combat before its package is ready.

- [ ] **Step 4: Run GREEN**

Same command, expected PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/ui/AppController.ts src/game/render/FightRenderer.ts tests/sprite-fight-lifecycle.test.mjs
git commit -m "feat: preload only selected fighter sprite packages"
```

---

### Task 7: Build the repository sprite validation/preview pipeline

**Files:**
- Create: `scripts/validate-sprite-package.mjs`
- Create: `scripts/build-sprite-preview.mjs`
- Create: `tests/sprite-package-tools.test.mjs`
- Create: `docs/SPRITE_PIPELINE.md`

**Interfaces:**
- Consumes: normalized frame directory or packed atlas + manifest.
- Produces: deterministic validation receipt and preview sheet metadata/image when local image tooling supports it.

- [ ] **Step 1: Write failing CLI tests**

Fixtures under `tests/fixtures/sprites/`:
- valid tiny package;
- missing animation;
- zero-size frame;
- out-of-atlas rect;
- invalid pivot/duration.

Assert validator exit codes and messages.

- [ ] **Step 2: Run RED**

```bash
node --test tests/sprite-package-tools.test.mjs
```

- [ ] **Step 3: Implement validator**

Checks:
- manifest schema;
- required animation set supplied by a CLI argument/profile;
- atlas exists;
- every rect fits atlas dimensions;
- no invalid durations;
- source/reference directories are not runtime import roots.

- [ ] **Step 4: Implement preview command**

Generate a deterministic preview layout from package frames. If repository-native image composition cannot run in CI, emit a deterministic HTML/JSON preview plus optional PNG when image tooling is available; tests must validate the deterministic metadata path.

- [ ] **Step 5: Document Game Studio handoff**

`docs/SPRITE_PIPELINE.md` must state:
- approved seed/reference frame;
- whole-strip generation where practical;
- shared scale/anchor normalization;
- transparent background;
- preview before admission;
- Game Studio `sprite-pipeline` is used when host exposes it;
- if unavailable, record `TOOL_UNAVAILABLE` and use the repository scripts for deterministic validation only;
- general concept sheets are not runtime assets.

- [ ] **Step 6: Run GREEN**

```bash
node --test tests/sprite-package-tools.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add scripts/validate-sprite-package.mjs scripts/build-sprite-preview.mjs tests/sprite-package-tools.test.mjs tests/fixtures/sprites docs/SPRITE_PIPELINE.md
git commit -m "tools: add deterministic sprite package validation"
```

---

### Task 8: El Toro vertical slice

**Files:**
- Create after approved production art exists:
  - `assets/fighters/el-toro/body.webp`
  - `assets/fighters/el-toro/animations.json`
- Modify: `src/game/data/characters/elToro.ts`
- Create: `tests/el-toro-sprite-slice.test.mjs`

**Interfaces:**
- Consumes: user-approved normalized El Toro sprite frames for idle, walk, one ordinary attack, Topete.
- Produces: first retained sprite-backed fighter preview.

- [ ] **Step 1: Confirm authoritative production art input**

Required before mutation:
- approved transparent frames/strip for the slice;
- explicit confirmation that these are production-intended derived assets, not merely the earlier general concept sheet.

If absent, mark this task BLOCKED rather than fabricating replacement art.

- [ ] **Step 2: Validate/pack the package**

Run repository validation/packing workflow and Game Studio `sprite-pipeline` normalization when the host exposes it.

Required keys:
- `idle`;
- `walk-forward`;
- `walk-back` may reuse mirrored/retimed art only if visual review accepts it;
- `move:toroJab`;
- `move:topete`.

- [ ] **Step 3: Write failing content-registration test**

Assert El Toro presentation switches to:

```ts
bodyBackend: 'sprite',
spritePackageKey: 'el-toro',
```

and the package provides all required pilot keys.

- [ ] **Step 4: Run RED, register package, run GREEN**

```bash
npm run clean && tsc && node --test tests/el-toro-sprite-slice.test.mjs
```

- [ ] **Step 5: Run A/B preview**

Capture the same deterministic states with procedural and sprite body backends:
- idle;
- walking;
- jab startup/active/recovery;
- Topete startup/drive/recovery;
- phone-landscape scale.

Human question: is identity/action readability obviously better?

- [ ] **Step 6: Measure target-device impact**

Record:
- atlas dimensions;
- decoded approximate RGBA footprint;
- load/decode timing where available;
- representative frame/render timing;
- iPhone/Safari physical acceptance.

Game Development Studio performance/visual-debugging may supply evidence only when available; it does not replace human artistic acceptance.

- [ ] **Step 7: Decision gate**

If the pilot is not a clear visual win, do not fan out roster production. Return to art/pipeline iteration.

If accepted, commit the pilot and open the full-roster squad tasks.

---

### Task 9: Fan out the complete current roster with Mario ×N

**Files:**
- Create per fighter:
  - `assets/fighters/camaleoni/*`
  - `assets/fighters/supernariz/*`
  - `assets/fighters/juanchi/*`
  - complete `assets/fighters/el-toro/*`
- Modify each fighter presentation package under `src/game/data/characters/`.
- Add fighter-specific package completeness tests.

**Interfaces:**
- Consumes: accepted pilot manifest/renderer contract.
- Produces: complete sprite package for every currently playable fighter.

- [ ] **Step 1: Neureon defines isolated same-role lanes**

Recommended shape:
- Mario-A: sprite contract/integration lead;
- Mario-B: El Toro complete;
- Mario-C: Juanchi;
- Mario-D: Camaleoni;
- Mario-E: Supernariz.

Use `coordination/templates/squad-lane.md`. Each lane owns its fighter asset/package/test files and does not edit another fighter's package.

- [ ] **Step 2: Every lane generates/normalizes full animation coverage**

Each package covers the resolver keys reachable by that fighter. Frame counts are action-specific, not forced to a single global number.

Each lane must:
- validate package;
- render preview;
- inspect effects-off readability;
- inspect gameplay scale;
- leave exact-SHA handoff;
- leave Identity Learning Receipt as PROPOSAL or NO_CHANGE.

- [ ] **Step 3: Mario-A integrates exact accepted lane SHAs**

One integrated candidate only.

No downstream QA consumes moving lane heads.

- [ ] **Step 4: Run package completeness matrix**

Test every playable fighter:
- presentation backend is sprite;
- package registered;
- every resolver-reachable move/Ultimate key exists;
- source/reference paths are absent from runtime imports.

- [ ] **Step 5: Commit integrated sprite roster candidate**

Commit message:

```text
feat: migrate full playable roster to sprite bodies
```

---

### Task 10: Independent QA, mobile/performance gate, and production cutover

**Files:**
- Modify as needed from verified findings only.
- Eventually remove/retire production use of:
  - `src/game/render/ChameleonRig.ts`
  - `src/game/render/SupernarizRig.ts`
  - `src/game/render/JuanchiRig.ts`
  - `src/game/render/ElToroRig.ts`
  - obsolete body-only procedural helpers.

**Interfaces:**
- Consumes: one integrated all-sprite roster candidate.
- Produces: audited preview, then production cutover after user acceptance.

- [ ] **Step 1: Germinator independent audit**

Attack:
- resolver precedence;
- hitstop frame stability;
- facing/pivot anchoring;
- missing animation behavior;
- round/reset/rematch lifecycle;
- two-fighter loading only;
- malformed package rejection;
- source/reference runtime scan;
- all ordered matchups for render crashes;
- effects-off action readability;
- mobile landscape memory/load behavior.

- [ ] **Step 2: Full verification**

```bash
npm test
npm run typecheck
npm run build
```

Expected: all exit 0.

- [ ] **Step 3: Gonza publishes isolated sprite preview**

Do not replace production root yet.

Verify served artifact includes all runtime assets and matches approved source.

- [ ] **Step 4: User physical-device acceptance**

Require visual approval on representative iPhone landscape states for all four fighters.

- [ ] **Step 5: Production cutover**

Only after approval:
- set all released fighters permanently to sprite backend;
- remove development fallback to procedural bodies for released fighters;
- delete/retire obsolete procedural fighter body code only after tests prove no remaining imports;
- keep procedural generic FX/stage code that still serves the presentation architecture.

- [ ] **Step 6: Final verification and release**

Run full suite/typecheck/build/served parity and publish exact accepted candidate.

