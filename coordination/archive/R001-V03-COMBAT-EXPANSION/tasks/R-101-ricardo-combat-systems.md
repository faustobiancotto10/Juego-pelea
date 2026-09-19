# Task R-101 — Combat systems, balance and CPU

Round: R001-V03-COMBAT-EXPANSION
Owner: Ricardo
Status: VERIFIED

## Goal

Implement the simulation/data side of the approved V0.3 kit, SUPER/ultimate capture system, corner-defense changes and CPU behavior while preserving deterministic 60 Hz combat.

## Dependencies

- START_ROUND
- publish and obtain review of shared state/action/event contract before dependent consumers finalize implementation

## Allowed files / subsystems

- src/game/simulation/
- src/game/data/fighters.ts
- combat move/balance data
- gameplay-facing shared types when coordinated
- gameplay tests
- CPU behavior
- branch: round/r001-ricardo

## Prohibited scope

- renderer-owned animation/effects
- DOM/HUD layout
- raw touch/keyboard UX implementation
- release/publishing
- changing approved character/ultimate concepts

## Required collaborators / reviewers

- @Mario for render-facing state/events
- @Brancaforte for action/input and HUD snapshot contracts
- @Germinator for balance/adversarial review
- @Neureon for product-intent decisions

## Acceptance criteria

- [x] Camaleón user-facing identity becomes Camaleoni / Camaleoni Cagoni without needless internal-ID migration
- [x] comparable melee reach/power tradeoffs; no uncompensated Supernariz reach dominance
- [x] Camaleoni long special = Lengua; close special = Coletazo
- [x] Supernariz long special = Chorizo; close special = Tramontana
- [x] Lengua is not simply shorter/worse than Chorizo; their differing commitments create the tradeoff
- [x] deterministic SUPER resource fills from dealt/received combat damage with capped one-charge capacity
- [x] Camaleoni ultimate implements forward invisibility-dash capture and guaranteed sequence on capture
- [x] Supernariz ultimate implements forward suction capture, nazazo and strong launch
- [x] valid ultimate captures are unblockable; position/crossover/out-of-range may evade; misses consume meter and recover
- [x] both ultimates occupy a comparable total-damage band
- [x] corner pushback transfer prevents blocked wall pressure from becoming indefinite
- [x] Push Guard spends meaningful GUARD, creates separation and is unavailable in invalid defensive states
- [x] dash/backdash/jump/guard interactions remain coherent
- [x] CPU reasons about new specials, pressure escape and SUPER without reading raw player input
- [x] V0.2 deterministic/gameplay rules regress cleanly

## Required tests / evidence

- [x] targeted tests for SUPER gain/consume
- [x] ultimate capture/evade/block-attempt/whiff/recovery tests
- [x] corner pushback and Push Guard tests
- [x] move balance/interaction tests
- [x] CPU decision/commitment tests
- [x] deterministic replay/state evidence
- [x] commit SHA + explicit consumer contract handoff

## Related forum threads

- coordination/forum/active/r001-combat-contract.md
- coordination/forum/active/r001-balance-qa.md
- coordination/forum/active/r001-integration-release.md

## Checkpoints

- first checkpoint: proposed shared state/action/event contract in combat-contract thread


## Validation checkpoint

- review checkpoint: `7138ec09e1773da7dbe28b173d3208197bc3c027`
- CI: Repository verification run #116 passed coordination contract, full suite and build
- tuning table: `coordination/forum/active/r001-balance-qa.md`
- validation handoff: `coordination/handoffs/R-101-ricardo-to-germinator.md`
- next owner action: Germinator validates exact SHA; Ricardo remains available for owned fixes
