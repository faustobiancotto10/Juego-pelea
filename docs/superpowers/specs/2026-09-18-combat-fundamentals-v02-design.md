# V0.2 Combat Fundamentals Rework — Design

## Intent

V0.2 makes the existing fight readable and strategically interactive without adding action buttons or expanding roster/content scope. The player should have meaningful choices among advancing, retreating, guarding, dashing, backdashing, jumping, attacking and waiting to punish. No single action should solve offense and defense by itself.

## Movement and guard

Holding away moves the fighter backward at reduced walk speed. If a compatible incoming attack connects while away is held, it becomes a guard. Standing guard blocks mids and overheads but loses to lows. Down+away crouch guard blocks mids and lows but loses to overheads. Merely holding away never consumes GUARD.

Each fighter has 100 GUARD. Blocked moves deal authored guard damage. GUARD waits 45 simulation frames after blocked damage, then regenerates at 0.9 per frame. Reaching zero causes a 42-frame guard break and recovery returns GUARD to at least 55.

## Offensive commitment

Move timelines continue to own startup, active and recovery. Light-chain cancels require the current move to have contacted the opponent. A whiff therefore finishes its recovery and creates a punish opportunity. Hit and blocked contact both permit authored cancel windows.

## Dash and backdash

A same-direction double tap within 230 ms emits a one-shot physical-direction dash input. `CombatSimulation` resolves that physical direction against current facing: toward is a 12-frame forward dash and away is a 16-frame backdash. Backdash has strike evasion on frames 2–7 only; it is committed movement, cannot block during it, and does not automatically evade projectiles.

## Jump utility

Airborne hurtboxes use actual simulation height. Low hitboxes and the low chorizo projectile can pass below sufficiently airborne fighters. Pushboxes stop separating fighters once either fighter is above the crossover threshold, so forward jumps can pass over an opponent and facing then flips naturally. Existing air attacks remain the offensive jump option.

## CPU V2

CPU reads simulation state, not player button intent. Threat recognition starts after an attack has visibly progressed through a reaction threshold and includes deterministic missed reactions. Once the CPU chooses approach, retreat or guard, it retains that intent for a short commitment window. At low GUARD it can create space with backdash. Character-specific range behavior remains intact.

## UI and onboarding

Health HUD receives a thin GUARD row for both fighters, including a visible guard-break state. Character Select and Fight expose a `? CONTROLES` surface. Fight help pauses simulation. The first fight in a page session shows a short transient hint explaining backward guard, backdash and GUARD. The live playfield center remains unobstructed outside that transient hint or explicitly opened help.

## Boundaries

`CombatSimulation` remains the authority for guard, dashes, hit validity, jump/crossover behavior and move commitment. Input only maps physical actions and detects double taps. Renderer reads snapshots only. DOM UI reads snapshots and may pause stepping, but never decides combat outcomes.

## Out of scope

Throws, parries, armor, super meter, universal offensive stamina, air block, new fighters, new stages, ultimates and new combo systems are deferred.

## Acceptance

Automated coverage must prove backward walk+guard, block-height rules, guard break/regeneration, whiff cancel restriction, dash/backdash behavior, jump clearing lows/projectiles/crossover, non-frame-perfect CPU reaction, CPU commitment, double-tap detection, GUARD HUD, controls help and fight pause. Existing V0.1 regression tests must remain green. A browser smoke test must reach Character Select, VS and Fight at desktop and mobile landscape sizes without runtime exceptions or playfield-obscuring HUD regressions.
