# Handoff — V05-R2

Round: R003-V05-COMBAT-LOOP
From: Ricardo
To: Neureon, Germinator, Brancaforte, Mario
Task: V05-R2
Commit SHA: 848be3032b38732ec779330a2d06592f47f0dbda
Branch: round/r003-ricardo
Draft CI PR: #16 — validation vehicle only; do not merge directly.

## Files changed

- src/game/data/fighters.ts
- src/game/data/combatRegistry.ts
- src/game/data/fighterKits.ts
- src/game/data/projectiles.ts
- src/game/data/ultimates.ts
- src/game/types.ts
- src/game/simulation/moves.ts
- src/game/simulation/CombatSimulation.ts
- src/game/simulation/CpuController.ts
- tests/fighter-registry-v05.test.mjs
- tests/fixtures/v05-registry.mjs
- tests/combat-v05-commitment.test.mjs (fixture-only registry-key adaptation)

## Schema / contract

### IDs
- `FighterId = 'chameleon' | 'supernariz'` remains the **playable UI ID** union.
- `RegisteredFighterId = string` is the extensible content/runtime ID used by registry lookups and simulation snapshots.
- This is a naming refinement over the initial forum proposal: it preserves current UI type safety and ownership while giving simulation/registry a string-validated content boundary.
- `ProjectileSnapshot.kind: string` is now a registry projectile key.

### CombatRegistry
`DEFAULT_COMBAT_REGISTRY` exposes:
- `playableIds`
- `getFighter(id)`
- `getKit(id)`
- `getMove(id, moveId)`
- `getProjectile(key)`
- `getUltimate(key)`

Unknown/incomplete references fail clearly at registry creation or lookup.

### FighterKit
R2 fields:
- standing
- optional low (R2 only; R3 makes it mandatory)
- air
- rangedSpecial
- closeSpecial
- ultimate
- temporary legacyDownSpecial / legacyUpSpecial adapter
- CPU profile

R2 deliberately preserves V0.4 bindings through the temporary adapter. R3 removes it and freezes the final grammar.

### Move metadata
Move definitions now expose:
- category
- bindingRole
- optional projectileKey / ultimateKey
- CPU threat range/reaction metadata

Existing frame data/damage/range values were not tuned in R2.

### Projectiles / Ultimates
- Chorizo runtime values moved into a projectile definition.
- Existing Ultimate behavior moved into two bounded primitives: `dashCapture` and `suctionCapture`.
- Timings, capture geometry, hit beats, damage and release values match the repaired R1 baseline.
- No generic scripting/status system was added.

### Injection
- `CombatSimulationOptions.registry?`
- `CpuController(index, { registry? })`
Default callers remain source-compatible.

## Trace-equivalence evidence

Pre-extraction repaired-R1 trace checkpoint:
- SHA `7bba059a5ad108164dd0b8b7b978783f5ea99e68`
- CI run #418 PASS.

Those same trace assertions pass on final R2 SHA:
- Camaleoni first normal = 46 damage in both slots.
- Supernariz first normal = 42 damage in both slots.
- Chorizo = kind `chorizo`, vx 9.2, cooldown 120.
- Tramontana = 38 damage with ~90 chill frames.
- Both released Ultimates capture and preserve the 190-damage band in both slots.

Final R2:
- SHA `848be3032b38732ec779330a2d06592f47f0dbda`
- CI run #435
- 116/116 tests PASS
- coordination contract PASS
- build PASS.

## Third-fighter fixture evidence

Injected test-only ID: `fixture-sparring`.
It is not present in default `playableIds`.

The fixture proves, through the actual simulation:
- custom max health 777 comes from registry stats;
- custom standing normal deals 33;
- configured standing practical center reach hits at 121 and whiffs at 122;
- custom projectile `fixtureBolt` uses speed 6.5, cooldown 47 and deals 31;
- custom dash-capture Ultimate reuses the existing primitive and deals its configured 77;
- CPU can consume its injected kit/profile;
- unknown fighter/move/projectile and broken kit references fail explicitly.

## Architecture evidence

On final SHA:
- `CombatSimulation.ts` has no `chameleon/supernariz` identity dispatch and no direct `FIGHTERS[id]` lookup.
- `CpuController.ts` selects kit/profile/threat metadata from registry rather than fighter names.
- R2 data/registry modules have no renderer/DOM dependency.

## Migration risks / deferred work

- Renderer/UI still intentionally support the two released playable IDs only; the test fixture is never rendered or selectable.
- Temporary R2 legacy Special binding fields exist solely for trace equivalence. R3 removes them and implements the approved final grammar.
- CPU profile `archetype` preserves V0.4 policy behavior only as a migration bridge. R5 replaces the policy with delayed seeded perception/decisions.
- This boundary is intentionally bounded: no generic scripting engine, no generic status system, no new playable fighter.

## Requested next action

R2 is ready. Per Neureon's existing Stage 2 authorization, Ricardo will proceed to V05-R3 after re-reading coordination and reserving R3 paths. Germinator should use this handoff later as the content-boundary baseline for G1.

Ricardo remains available until ROUND_COMPLETE.
