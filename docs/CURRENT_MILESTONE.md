# Current Milestone

**Milestone:** V0.2 — Combat Fundamentals Rework

**Status:** released to `main` and GitHub Pages.

**Acceptance:** backward walking and contextual standing/crouch guard; GUARD meter and guard break; whiff-commitment on combo chains; forward dash/backdash; useful jump interactions for lows, projectiles and cross-overs; CPU reaction/commitment instead of frame-perfect defense; in-game controls help and first-fight onboarding hint.

The existing Character Select → VS → Fight → Result loop, procedural vector fighters, deterministic 60 Hz simulation and mobile-first three-button control scheme remain intact. Release verification: 39 automated tests passing, TypeScript build successful, desktop/mobile standalone smoke test clean, and GitHub Pages deployment completed successfully.

## Coordination infrastructure

The repository now also carries a persistent multi-agent coordination layer under `coordination/`. It is deliberately separate from the game runtime and starts in `IDLE`. Gameplay milestone V0.2 remains unchanged; the coordination layer exists to organize future implementation rounds.

## Active development round

**R001 — V0.3 Combat Expansion** is now in `CHECK_IN`.

Approved scope: common fighter-kit contract; Camaleoni Cagoni rename; balanced melee/long-range tradeoffs; Lengua/Coletazo and Chorizo/Tramontana kits; SUPER meter; two unblockable positional-capture ultimates; corner pushback transfer; Push Guard; CPU, HUD/input, procedural presentation, adversarial balance QA and full release integration.

No V0.3 product implementation begins until all six required agents are PRESENT and Neureon issues `START_ROUND`.
