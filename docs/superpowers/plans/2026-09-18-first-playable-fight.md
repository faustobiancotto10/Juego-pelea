# First Playable Fight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a mobile-first browser fighting-game V0.1 where Camaleón and Supernariz can be selected and a complete best-of-three duel against CPU can be played.

**Architecture:** A deterministic 60 Hz TypeScript simulation owns combat state and rules; Canvas2D adapts snapshots to programmatic articulated vector fighters and effects; DOM handles menus, HUD, and touch input. Supplied images are references only and never runtime fighter textures.

**Tech Stack:** TypeScript, native Canvas2D, browser ES modules, Node test runner, DOM/CSS, Git.

**Spec:** `docs/superpowers/specs/2026-09-18-first-playable-fight-design.md`

## Global Constraints
- Mobile landscape is the primary target.
- Exactly two V0.1 fighters: Camaleón and Supernariz; mirror matches allowed.
- Reference PNG/JPEG/sprite sheets must not be used as runtime fighter textures.
- Runtime fighters are procedural articulated vector rigs.
- Simulation runs at a logical fixed 60 Hz and is renderer-independent.
- Touch input is 8-direction D-pad plus ATTACK, SPECIAL, JUMP; block is hold-away/down-back.
- One stage, Character Select, VS transition, best-of-three fight, result, rematch/select.
- CPU is distance/state aware rather than random spam.
- No ultimates, online multiplayer, or progression in V0.1.

---

### Task 1: Project scaffold and contracts
**Files:** create `package.json`, `tsconfig.json`, `index.html`, `src/main.ts`, `src/styles.css`, `src/game/types.ts`, `src/game/data/fighters.ts`, `AGENTS.md`, `docs/CURRENT_MILESTONE.md`, `docs/DECISIONS.md`.
**Interfaces:** produces `FighterId`, `InputFrame`, `FighterSnapshot`, `MatchSnapshot`, fighter definitions, npm scripts.
- [ ] Write type-level/unit smoke test for fighter definitions and exact fighter ids.
- [ ] Verify the global TypeScript toolchain and baseline failing test without network dependencies.
- [ ] Implement strict project scaffold and definitions.
- [ ] Run tests and production build.
- [ ] Commit.

### Task 2: Headless 60 Hz combat simulation
**Files:** create `src/game/simulation/*`, `tests/simulation.test.ts`.
**Interfaces:** produces `CombatSimulation.step(p1,p2): MatchSnapshot`, deterministic state reset, rounds/timer.
- [ ] Write failing tests for movement, bounds, facing, jump/gravity, attack timing, hit/block, KO/round transition.
- [ ] Implement simulation with frame-based move timelines, hitboxes/hurtboxes, hitstop, damage, stun and round state.
- [ ] Verify full test suite.
- [ ] Commit.

### Task 3: Fighter-specific mechanics and CPU
**Files:** modify `src/game/data/fighters.ts`, create `src/game/simulation/cpu.ts`, extend tests.
**Interfaces:** Camaleón connected tongue hitboxes; Supernariz three-hit nose chain, chorizo projectile cooldown, Tramontana gust; `CpuController.nextInput(snapshot,cpuIndex)`.
- [ ] Write failing fighter mechanic and CPU behavior tests.
- [ ] Implement both movesets and state/distance-aware CPU.
- [ ] Verify deterministic tests.
- [ ] Commit.

### Task 4: Procedural vector fighter renderer
**Files:** create `src/game/render/ChameleonRig.ts`, `SupernarizRig.ts`, `FighterRenderer.ts`, `StageRenderer.ts`, `FightRenderer.ts`.
**Interfaces:** consumes snapshots only; emits no combat rules.
- [ ] Add renderer smoke contract proving no image/spritesheet fighter assets are loaded.
- [ ] Implement layered programmatic rigs with articulated parts and attack-pose interpolation.
- [ ] Implement procedural tongue, nose deformation, cape/tail secondary motion, chorizo and Tramontana FX.
- [ ] Add original stage and restrained hit/KO camera feedback.
- [ ] Build.
- [ ] Commit.

### Task 5: Character Select, HUD, touch/keyboard input and game flow
**Files:** create `src/game/input/*`, `src/game/ui/*`, modify `src/main.ts`, `src/styles.css`.
**Interfaces:** one `InputFrame` pipeline feeds human and CPU; flow `SELECT_PLAYER -> SELECT_CPU -> VS -> FIGHT -> RESULT`.
- [ ] Write input mapping tests for block-away, down+special and jump.
- [ ] Implement Character Select, VS, HUD, result/rematch/select.
- [ ] Implement mobile 8-way D-pad + ATTACK/SPECIAL/JUMP and desktop fallback.
- [ ] Add portrait orientation prompt and safe-area CSS.
- [ ] Verify tests/build.
- [ ] Commit.

### Task 6: Playtest, polish and shipping verification
**Files:** targeted fixes only, `docs/CURRENT_MILESTONE.md`, `README.md`.
**Interfaces:** production build and deployable `dist/`.
- [ ] Run full tests and build.
- [ ] Run browser smoke/playtest at mobile landscape and desktop sizes; verify select->fight->KO->rematch path.
- [ ] Fix blocking visual/gameplay defects discovered by smoke test.
- [ ] Re-run tests/build.
- [ ] Update milestone and README with controls/architecture.
- [ ] Commit final V0.1 candidate.
