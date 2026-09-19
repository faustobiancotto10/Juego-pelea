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

- 2026-09-19: V0.3 uses a common fighter-kit structure: melee, long-range special, close-range special, ultimate, plus universal movement/defense. Mechanical differences require explicit tradeoffs rather than free advantages.
- 2026-09-19: The fighter formerly displayed as Camaleón is renamed **Camaleoni Cagoni**, normally shortened to **Camaleoni** in UI. Stable internal IDs may remain unchanged when migration would add risk without player benefit.
- 2026-09-19: Camaleoni's long special is Lengua and close special is Coletazo. Supernariz's long special is Chorizo and close special is Tramontana.
- 2026-09-19: Melee reach stays within a comparable band. Meaningful reach advantages must be offset by startup, recovery, damage, knockback, cancelability or another observable cost; Supernariz must not retain uncompensated close-range and long-range superiority.
- 2026-09-19: V0.3 adds one-charge SUPER meter primarily from damage dealt and received. No passive/manual charging.
- 2026-09-19: Ultimates are unblockable forward capture attacks with finite considerable range. Position, range or crossing behind can evade before capture; after capture the sequence is guaranteed. A committed miss consumes meter and has recovery.
- 2026-09-19: Camaleoni's ultimate is an invisibility/near-invisibility forward dash capture into a guaranteed combo. Supernariz's ultimate is forward suction into a heavy nazazo and large launch.
- 2026-09-19: V0.3 adds corner pushback transfer and Push Guard using existing controls; no fourth persistent mobile action button is added.

- 2026-09-19: V0.3 SUPER baseline is cap 100, +0.12 per actual HP dealt and +0.055 per actual HP received; no passive gain, GUARD-only damage gives no SUPER, HP chip contributes normally. SUPER persists across rounds inside one match and resets for a new fight instance.
- 2026-09-19: Push Guard baseline costs 34 GUARD, buffers for 6 fixed-step frames through hitstop/block context, and authors 122 units of separation. Neutral, Guard Break and insufficient-GUARD requests are rejected by simulation.
- 2026-09-19: Ultimate meter is consumed at startup→capture commitment, not at initial startup. Pre-commit interruption preserves meter; committed whiffs consume it. Both V0.3 ultimates use a 190 total-damage band.
- 2026-09-19: Final mobile Ultimate input is READY-only ATTACK+SPECIAL with a 55 ms chord window; outside READY, ATTACK and SPECIAL remain immediate. Defensive SPECIAL routes an exclusive Push Guard intent from simulation-owned defensive context.
- 2026-09-19: V0.3 first-normal reach is intentionally near-equal (Camaleoni authored edge 86, Supernariz 88), with Supernariz retaining a small speed/tempo edge and Camaleoni compensating via damage/stun/knockback/cancel advantages.
