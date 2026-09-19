# Decisions

- 2026-09-18: Use Phaser 3 + TypeScript + Vite for the V0.1 browser implementation.
- 2026-09-18: Keep a renderer-independent 60 Hz combat simulation.
- 2026-09-18: Reconstruct fighters as procedural articulated vector rigs; supplied images/sheets are reference-only.
- 2026-09-18: Mobile controls use 8-direction D-pad + Attack + Special + Jump, with hold-away blocking.
- 2026-09-18: Ruling — npm dependency installation is unavailable in the current sandbox. Use dependency-free Canvas2D + global TypeScript instead of Phaser/Vite. Cost if wrong: renderer scaffolding would need replacement later; simulation/input/data boundaries remain reusable.
