# Decisions

- 2026-09-18: Keep a renderer-independent fixed 60 Hz combat simulation as the single gameplay authority.
- 2026-09-18: Reconstruct fighters as procedural articulated vector rigs; supplied images/sheets are visual references only and never runtime fighter sprites.
- 2026-09-18: Use dependency-free Canvas2D + TypeScript + browser ES modules. The earlier Phaser proposal is superseded because dependency installation was unavailable; simulation/input/data boundaries remain renderer-independent.
- 2026-09-18: Mobile controls remain 8-direction D-pad + Attack + Special + Jump. No new persistent action buttons are added in V0.2.
- 2026-09-18: Holding away means backward movement first; when a compatible strike arrives, the same input becomes guard. Down+away is crouch guard.
- 2026-09-18: Defense is limited by a dedicated GUARD meter rather than a universal stamina bar. GUARD drains only on blocked hits, regenerates after a delay, and zero causes a short guard break.
- 2026-09-18: Double-tap direction produces dash/backdash. Backdash has only a short strike-evasion window and does not universally evade projectiles.
- 2026-09-18: Combo cancels require contact (hit or block). Whiffed light attacks must complete recovery instead of allowing free mash chains.
- 2026-09-18: CPU decisions use reaction thresholds and short commitment windows so it cannot switch from offense to perfect defense every frame.
- 2026-09-18: Text-heavy help remains DOM UI. Opening the controls panel during a fight pauses simulation; combat truth remains outside the UI layer.
