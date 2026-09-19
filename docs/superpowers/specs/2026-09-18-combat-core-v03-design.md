# V0.3 — Corner Escape & Replicable Combat Core

## Intent

V0.3 fixes the current corner-pressure problem and restructures combat so future fighters can be added without adding fighter-specific branches to the core simulation.

The combat engine must own universal rules. Fighters provide data: stats, move bindings, move timelines, hitboxes, damage, guard damage, knockback, cooldowns, projectile definitions, status effects and AI tuning. Visual rigs remain separate from combat truth.

The target player experience is:

- Corner pressure is dangerous but escapable.
- Supernariz remains the stronger close-range pressure fighter.
- Camaleón remains range/control oriented and gains a dedicated close-range escape tool.
- New characters can be introduced by adding content/configuration and visuals, not by rewriting CombatSimulation.
- Complexity grows by adding reusable combat primitives, not character-name conditionals.

## Non-negotiable architecture rule

Core combat code must not branch on a concrete fighter id.

Forbidden in simulation/input/CPU:

```ts
if (fighter.id === 'supernariz') { ... }
if (fighter.id === 'chameleon') { ... }
```

Allowed:

```ts
const definition = fighterRegistry.get(fighter.id);
const move = definition.moves[moveId];
const profile = definition.ai;
```

Adding a normal future fighter must not require edits to:

- `CombatSimulation.ts`
- `CpuController.ts`
- universal input code
- guard/dash/jump/corner rules

A genuinely new mechanic that does not fit existing primitives may add a new reusable primitive to the engine once, but it must not be implemented as a one-off fighter branch.

## Universal combat core

These remain shared for every fighter:

- fixed 60 Hz simulation
- walking / backward walking
- crouch
- jump / airborne state
- facing
- arena bounds
- pushboxes / crossover
- standing guard / crouch guard
- GUARD meter / regeneration / guard break
- hitstop
- hitstun / blockstun
- startup / active / recovery timelines
- combo/cancel legality
- knockback
- chip damage
- dash / backdash
- push guard
- round timer / KO / best-of-three
- projectile collision
- status-effect application
- generic move cooldowns
- universal input actions

## Fighter content model

Each fighter definition contains data rather than logic.

```ts
interface FighterDefinition {
  id: string;
  displayName: string;
  role: string;
  stats: FighterStats;
  bindings: MoveBinding[];
  moves: Record<string, MoveDefinition>;
  ai: AiProfile;
  visualKey: string;
}
```

`FighterStats` owns values such as:

- maxHealth
- walkSpeed
- backwardWalkScale override if needed
- jumpSpeed
- gravity
- pushbox width
- hurtbox dimensions
- guard capacity / optional tuning overrides

## Data-driven move bindings

Input does not decide character-specific moves. The simulation asks the fighter definition which move matches the current action and conditions.

Example:

```ts
bindings: [
  { action: 'attack', when: { grounded: true }, move: 'claw1' },
  { action: 'attack', when: { airborne: true }, move: 'airClaw' },
  { action: 'special', when: { grounded: true, down: true }, move: 'tongueLow' },
  { action: 'special', when: { grounded: true, maxDistance: 105 }, move: 'tailSpin' },
  { action: 'special', when: { grounded: true }, move: 'tongueStraight' }
]
```

Bindings are evaluated from most specific to least specific.

This makes Camaleón's close-range tail move possible without a Camaleón-specific branch in the engine.

## Move schema

A move owns its complete combat data.

```ts
interface MoveDefinition {
  id: string;
  totalFrames: number;
  cancel?: CancelWindow[];
  hitboxes?: HitboxSpec[];
  projectile?: ProjectileSpec;
  applyStatus?: StatusApplication[];
  cooldownFrames?: number;
  tags?: string[];
}
```

Hitboxes remain attack-specific. Fighters do not share attack hitboxes.

`HitboxSpec` keeps:

- active frame range
- horizontal offset
- width
- vertical bottom/top
- attack level
- damage
- chip damage
- guard damage
- hitstun
- blockstun
- knockback
- hitstop
- strength/tags

The engine evaluates these values generically.

Multiple hitboxes per move are supported so later attacks can have more than one active region or active phase without changing the core.

## Generic projectiles

Projectiles become data-driven.

```ts
interface ProjectileSpec {
  projectileKey: string;
  spawnFrame: number;
  offsetX: number;
  offsetY: number;
  speedX: number;
  ttlFrames: number;
  width: number;
  height: number;
  hit: HitboxPayload;
}
```

Simulation stores `projectileKey`, collision data and combat values.

The renderer maps `projectileKey` to visuals separately.

There must be no `if move.id === 'chorizoThrow'` inside combat simulation.

## Generic status effects

Tramontana's current chill becomes a generic status effect instead of a Supernariz-specific field.

Initial reusable status primitive:

```ts
interface TimedModifier {
  id: string;
  durationFrames: number;
  moveSpeedMultiplier?: number;
  damageMultiplier?: number;
  guardRegenMultiplier?: number;
}
```

V0.3 needs only movement slow for Tramontana, but the data shape must allow future reusable modifiers.

New exotic mechanics are added as reusable primitives only when actually required.

## Generic CPU profiles

`CpuController` must not branch on fighter id.

Each fighter provides an `AiProfile` with tuning such as:

- preferredRangeMin / preferredRangeMax
- pressureRange
- retreatRange
- projectileMove
- projectileRange
- projectileCadence
- controlMove
- controlMoveRange
- lowGuardEscapeThreshold
- aggression / defense commitment durations

The universal CPU reads the profile and the currently available move bindings.

A future fighter should obtain functional baseline CPU behavior from profile data alone.

## Corner pressure fix

### Corner pushback transfer

Blocked attacks still apply authored pushback.

When the defender is against an arena boundary and cannot receive all intended block pushback, the unconsumed displacement transfers to the attacker in the opposite direction.

Result:

- blocking in the corner creates some separation
- stronger/final attacks create more separation
- Supernariz can pressure but cannot loop a full string forever because the wall deletes defender knockback

This is a universal combat rule.

### Push Guard

While in blockstun, pressing SPECIAL performs Push Guard if enough GUARD remains.

Initial tuning:

- cost: 35 GUARD
- no health damage
- no offensive hit
- strong attacker pushback
- short defender recovery
- unavailable during guard break
- cannot reduce GUARD below zero

Push Guard is universal and character-independent.

It must be documented in the controls panel.

## Camaleón close-range escape

Camaleón gains `tailSpin` (working name: Giro de Cola).

Binding:

- grounded SPECIAL at close range
- down + SPECIAL remains tongueLow
- normal SPECIAL outside close range remains tongueStraight

Purpose:

- moderate damage
- fast enough to challenge predictable close pressure
- high knockback
- meaningful recovery on whiff/block
- not a free invincible escape

Initial behavior should favor spacing recovery rather than raw damage.

Its exact hitbox and frame values are fighter data.

## Supernariz identity

Supernariz keeps:

- nose normal chain
- chorizo projectile
- Tramontana control/slow
- strong close-range pressure

The corner changes should not erase this identity. The goal is counterplay, not equal close-range strength.

## Future ultimates

V0.3 does not introduce a full super/ultimate meter yet.

However, move definitions and bindings must not assume only normal/special moves. They should support move tags such as:

- normal
- special
- ultimate

A future resource/meter system can gate moves through generic costs/requirements without replacing the move execution pipeline.

No fighter-specific ultimate logic belongs in `CombatSimulation`.

## Renderer boundary

Combat data and visuals stay independent.

Simulation owns:

- legality
- timelines
- hitboxes
- damage
- statuses
- projectiles
- movement consequences

Renderer owns:

- fighter rig
- pose/animation for move ids
- projectile appearance for projectileKey
- VFX
- HUD presentation

A new fighter still needs new visual implementation, but adding that visual must not alter combat rules.

## Replicability proof

Add a test-only third fighter fixture that is not selectable in the shipped UI.

The fixture must define:

- different stats
- at least one normal
- one special with a different hitbox
- one projectile or status behavior
- an AI profile

The automated test must instantiate it through the same registry and run combat without editing or branching inside `CombatSimulation` or `CpuController`.

This is the acceptance proof that the system is character-replicable.

## Balance test harness

Create deterministic scenario helpers for combat regression.

Required V0.3 scenarios:

1. Supernariz pressures Camaleón at left wall.
2. Full blocked nose string creates minimum post-string separation.
3. Push Guard spends GUARD and creates larger separation.
4. Push Guard cannot fire without enough GUARD.
5. Camaleón tailSpin creates escape space on hit.
6. Backdash remains bounded by arena wall and does not teleport through it.
7. Jump remains risky but can cross when a real gap exists.
8. Generic third fighter can load and execute moves.

The tests should measure combat state such as distance, health, GUARD, stun and fighter positions rather than visual appearance.

## CI

Add GitHub Actions for pushes and pull requests:

```
npm test
npm run build
```

The workflow fails if tests or TypeScript/build fail.

No deploy step is required in this CI module unless the existing Pages workflow is intentionally changed later.

## Debug / balance mode

Add an optional development-only query flag such as:

`?debug=1`

It may show:

- fighter x/y
- current move id/frame
- hitstun/blockstun
- GUARD
- dash state
- current distance
- hitboxes/hurtboxes when practical

This surface is for testing only and must not affect simulation behavior.

If this threatens V0.3 scope, hitbox drawing may be deferred while keeping the state panel.

## UI scope

Do not redesign Character Select in V0.3.

Only update controls documentation for Push Guard and, if needed, Camaleón's contextual close special.

The larger roster/select-screen redesign is a later module after the combat/content architecture is proven.

## Acceptance

V0.3 is complete when:

- corner block pushback no longer disappears into the arena wall
- Push Guard gives a reliable paid escape option
- Camaleón has a close-range spacing tool
- Supernariz remains stronger at sustained close pressure
- no concrete fighter-id branch remains in core combat or CPU
- moves/bindings/projectiles/statuses are content-driven
- a test-only third fighter proves registration without core edits
- deterministic corner regression tests pass
- GitHub Actions runs tests and build
- existing V0.2 behavior remains green
- public demo can still complete Character Select → VS → Fight → Result
