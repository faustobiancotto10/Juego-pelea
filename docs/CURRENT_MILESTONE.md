# Current Milestone

**Official published version:** V0.6  
**Active development target:** V0.7  
**Live round:** `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION`  
**Execution:** AUTO_CHAIN

Official V0.6 release evidence remains archived at:
- `coordination/archive/R004-V06-CONTENT-EXPANSION.md`

## R005 frozen base

`378a991d55bed03e6237a03fdf6dfe96653fae72`

Branches:
- `round/r005-ricardo`
- `round/r005-germinator`
- `round/r005-mario`
- `round/r005-brancaforte`
- `round/r005-integration`

## V0.7 scope

V0.7 directly addresses post-release V0.6 human feedback:

- Camaleoni Lengua remains too dominant/spammable;
- CPU needs explicit fair difficulty levels;
- Juanchi locomotion needs visual repair;
- attack animation/effects need stronger game-feel;
- Juanchi needs a genuine red rage aura;
- El Toro becomes fighter four;
- every fighter card receives a procedural in-game portrait/icon.

CPU levels:
- FÁCIL
- NORMAL (default)
- DIFÍCIL

El Toro:
- Topete
- Shawarmazo
- Super Eructo

No new stage is planned for V0.7.

## Authoritative design

- `docs/superpowers/specs/2026-09-20-v07-post-v06-master-audit.md`
- `docs/superpowers/specs/2026-09-20-v07-lengua-balance-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-cpu-difficulty-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-animation-effects-quality-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-el-toro-character-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-content-design.md`
- `docs/superpowers/plans/2026-09-20-v07-implementation-plan.md`
- `docs/characters/el-toro/PACKAGE.md`

El Toro authoring references are persisted under:
- `docs/characters/el-toro/references/`

They are never runtime assets.

## Execution

Canonical sequence:

**Ricardo → Germinator → Mario + Brancaforte → Gonza**

Ricardo V07-R0 is the only implementation task immediately eligible. Green handoffs advance the AUTO_CHAIN without a new Neureon token.
