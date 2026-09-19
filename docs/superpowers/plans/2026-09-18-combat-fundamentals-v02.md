# V0.2 Combat Fundamentals Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make movement, defense, jumping and offense produce meaningful counterplay without adding action buttons.

**Architecture:** Extend the existing deterministic `CombatSimulation` and `InputFrame` while preserving renderer independence. Keep help/HUD in DOM and expose only snapshot state to presentation code.

**Tech Stack:** TypeScript, Canvas2D, browser DOM/CSS, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-18-combat-fundamentals-v02-design.md`

## Global Constraints

- Fixed logical simulation remains 60 Hz.
- No new persistent action button beyond D-pad + Attack + Special + Jump.
- Character references remain visual-only; runtime fighters remain procedural vector rigs.
- Combat rules live in simulation, not renderer or DOM.
- No external runtime dependencies.

## Review Focus

- Facing changes during crossover must not invert a dash already in progress.
- Backdash evasion must apply to physical strikes only and remain brief.
- Guard break must not leave stale blockstun/blocking state.
- Touch and keyboard double-tap must produce one dash pulse, not a held dash state.
- Help overlay must pause fight stepping without accumulating a giant catch-up frame on close.

---

### Task 1: Input and dash intent

**Files:** `src/game/types.ts`, `src/game/input/doubleTap.ts`, `src/game/input/GameInput.ts`, `tests/input.test.mjs`

**Interfaces:** Produces `InputFrame.dashLeft/dashRight` one-shot pulses and `DoubleTapTracker.tap(direction, nowMs)`.

- [x] Write a failing double-tap test covering same-direction, opposite-direction and timeout behavior.
- [x] Run it and verify failure because tracker/dash fields do not exist.
- [x] Implement double-tap tracking for keyboard and touch physical directions.
- [x] Run input tests and full suite green.

### Task 2: Guard, movement and offensive commitment

**Files:** `src/game/simulation/moves.ts`, `src/game/simulation/CombatSimulation.ts`, `tests/combat-v02.test.mjs`, `tests/fighter-mechanics.test.mjs`

**Interfaces:** Adds guard snapshot state, guard damage, contextual standing/crouch guard, backward walk scaling and contact-required combo cancels.

- [x] Write failing tests for backward walk+guard, block heights, guard break/regeneration and whiff cancel restriction.
- [x] Run them and verify behavior is missing.
- [x] Implement guard state and authored guard damage in simulation.
- [x] Require contact before light-chain cancels.
- [x] Run combat and regression suites green.

### Task 3: Dash/backdash and jump utility

**Files:** `src/game/simulation/CombatSimulation.ts`, `tests/combat-v02.test.mjs`

**Interfaces:** Physical dash pulses resolve against facing into committed forward/back dash state. Airborne collision uses actual height and crossover-compatible pushboxes.

- [x] Write failing tests for forward dash, brief strike-only backdash evasion, low/projectile jump clears and crossover.
- [x] Implement committed dash movement and frames 2–7 backdash strike evasion.
- [x] Relax grounded pushbox separation during meaningful airborne crossover height.
- [x] Run full suite green.

### Task 4: CPU reaction and commitment

**Files:** `src/game/simulation/CpuController.ts`, `tests/cpu.test.mjs`

**Interfaces:** CPU consumes only `MatchSnapshot`; produces ordinary `InputFrame`, including optional physical dash pulses.

- [x] Write failing tests proving no frame-perfect response to newly started fast attacks and multi-frame movement commitment.
- [x] Add reaction thresholds, deterministic missed recognition, intent windows and low-guard backdash behavior.
- [x] Preserve fighter-specific range logic and combo follow-up attempts.
- [x] Run CPU tests and full suite green.

### Task 5: HUD and controls onboarding

**Files:** `src/game/ui/AppController.ts`, `src/styles.css`, `tests/ui-v02.test.mjs`

**Interfaces:** DOM reads guard snapshot state and controls only `paused`; it never mutates combat state.

- [x] Write failing source-contract tests for guard HUD, help controls and first-fight pause/hint behavior.
- [x] Add GUARD bars, guard-break state, `? CONTROLES`, transient hint and pause-safe controls modal.
- [x] Keep mobile landscape safe-area behavior and playfield center clear.
- [x] Run UI tests and full suite green.

### Task 6: Release verification and standalone build

**Files:** `play.html`, `README.md`, `docs/CURRENT_MILESTONE.md`, `docs/DECISIONS.md`

- [x] Run `npm test` and confirm zero failures.
- [x] Run `npm run build` and confirm successful TypeScript/build output.
- [x] Regenerate standalone `play.html` without source-map tokens.
- [x] Browser-smoke Character Select → CPU select → VS → Fight on desktop and mobile landscape.
- [x] Verify GUARD/help/hint visually and no runtime exception.
- [ ] Commit, publish the changed source to GitHub, update `gh-pages`, and verify the public build.
