# Current Round

Status: ACTIVE  
Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Execution mode: AUTO_CHAIN  
Goal: fix V0.6's human-reported balance/challenge/presentation problems and expand the roster with El Toro.

Planned agents: Neureon, Ricardo, Germinator, Mario, Brancaforte, Gonza

Start token: `START_ROUND — AUTO_CHAIN`  
Issued: 2026-09-20  
Per-task Neureon gates: disabled  
Completion token: not issued

## Exact frozen base

All R005 feature branches start from:
`378a991d55bed03e6237a03fdf6dfe96653fae72`

This base contains official V0.6 runtime plus the completed V0.7 planning package and El Toro authoring references.

Branches:
- Ricardo: `round/r005-ricardo`
- Germinator: `round/r005-germinator`
- Mario: `round/r005-mario`
- Brancaforte: `round/r005-brancaforte`
- Gonza/integration: `round/r005-integration`

## Frozen V0.7 scope

1. Camaleoni Lengua counterplay correction.
2. CPU Easy / Normal / Hard, Normal default, no cheating/stat boosts.
3. Juanchi locomotion repair.
4. Shared procedural attack/effects quality pass across the roster.
5. Genuine Juanchi red rage aura.
6. El Toro as fourth player/CPU fighter:
   - Topete;
   - Shawarmazo;
   - Super Eructo.
7. Universal Ultimate Clash support for El Toro.
8. Fighter-select cards with procedural in-game portrait/icon for all four fighters.
9. Final mobile/device + deterministic build/release parity.

Out of scope:
- new El Toro stage;
- online/story/shop/account systems;
- fifth gameplay action;
- generic ECS/scripting/animation graph;
- long-combo redesign;
- runtime use of uploaded/reference fighter images.

## Authoritative design

- `docs/superpowers/specs/2026-09-20-v07-post-v06-master-audit.md`
- `docs/superpowers/specs/2026-09-20-v07-lengua-balance-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-cpu-difficulty-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-animation-effects-quality-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-el-toro-character-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-content-design.md`
- `docs/superpowers/plans/2026-09-20-v07-implementation-plan.md`
- `docs/characters/el-toro/PACKAGE.md`

## El Toro visual authority

Original source hashes:
- identity master: `86f2eee15ae055ebe72a4ea2d476e6a5c6bc20fcfe9f6809001621e9a098f8c5`
- action sheet: `d368d5fde8737cfaa3a8ec1a209114b0666c7806ef2c4e9cfb800ffcf5373393`

Repository authoring copies:
- `docs/characters/el-toro/references/identity-master-reference.webp`
- `docs/characters/el-toro/references/action-sheet-reference.webp`

These are authoring-only and prohibited from runtime.

## AUTO_CHAIN — authoritative sequence

**Ricardo → Germinator → Mario + Brancaforte → Gonza**

Immediately eligible:
- V07-R0 — Ricardo.

Then automatically:
- Ricardo R0 → R1 → R2 → R3.
- R3 green unlocks Germinator G1.
- G1 `APPROVE — PRESENTATION LANE UNLOCKED` unlocks Mario M1→M2 and Brancaforte B1 in parallel.
- G1 + M2 + B1 green unlock Gonza Z0.
- Z0 green unlocks Gonza Z1.

No PRESENT/check-in and no Neureon stage token is required on the normal path.

## Deviation rule

If an agent discovers:
- reproducible blocker/regression;
- frozen-contract contradiction;
- missing authoritative input;
- required scope/interface change outside its written task;

it stops affected dependents, records the finding, marks BLOCKED and tells the user. The user decides whether Neureon audits/replans.

Local bugs inside the authorized contract are repaired by the owner without ceremonial escalation.

## Completion

Only after Z1 publication/parity evidence does Neureon archive R005 and issue ROUND_COMPLETE.


## User-rejected preview repair

The physical/user-facing V0.7 preview check failed on character visual identity. Production-root promotion remains blocked.

Repair branch:
- `repair/v07-character-pipeline-v2`
- starts from rejected Z0 product candidate `65bbb4122be526b0b878c214137192c7243db3ab`
- contains the Character Pipeline V2 authoring/tooling bootstrap.

Repair sequence:
**Mario V07-M3 → Germinator V07-G2 → Gonza rebuild/re-publish preview → user physical-phone acceptance → Z1**

Mario V07-M3 is immediately eligible. Existing V0.7 gameplay contracts remain frozen; this repair is visual/rendering-only unless a blocker is explicitly raised.
