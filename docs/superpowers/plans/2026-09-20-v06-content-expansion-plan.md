# V0.6 Content Expansion — Active Execution Plan

Date: 2026-09-20  
Round: `R004-V06-CONTENT-EXPANSION`  
Execution: `AUTO_CHAIN`  
Status: ACTIVE

## Goal

Ship V0.6 with:
- Juanchi as complete third player/CPU fighter;
- Cancha 56 as second stage;
- physical locomotion for all three fighters;
- Universal Ultimate Clash;
- targeted Lengua/Ultimate follow-through;
- scalable Character Package/content/presentation architecture;
- fighting-game title/select/stage/VS front end;
- independent QA and reproducible release.

## Exact base

All product branches start from:
`2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13`

QA reference:
`2876f3bce7d77c04c7415df89cafcf8b31f1b61c`

Main is coordination/document authority and still contains the old public-root runtime. Do not accidentally implement V0.6 from main's V0.4 product state.

## Frozen constraints

- fixed 60 Hz simulation owns combat truth;
- native procedural/articulated Canvas2D fighters;
- Juanchi reference images are authoring guidance only;
- four mobile action buttons plus established dedicated Ultimate;
- stage selection cannot alter combat simulation;
- no generic scripting/ECS/animation graph;
- no fourth released playable fighter in V0.6;
- Coletazo remains intact absent reproduced regression.

## Specs

- system composition: ../specs/2026-09-20-v06-content-expansion-design.md
- Juanchi: ../specs/2026-09-20-v06-juanchi-character-contract.md
- animation: ../specs/2026-09-20-v06-animation-quality-contract.md
- Clash: ../specs/2026-09-20-v06-ultimate-clash-contract.md
- package pipeline: ../specs/2026-09-20-v06-character-package-pipeline.md
- Cancha 56: ../specs/2026-09-20-v06-cancha56-stage-contract.md
- fighting-game UI flow: ../specs/2026-09-20-v06-fighting-game-ui-flow.md
- character package: ../../characters/juanchi/PACKAGE.md

## Execution graph

`START_ROUND — AUTO_CHAIN` preauthorizes the full dependency graph.

Canonical sequence:

**Ricardo → Germinator → Mario + Brancaforte → Gonza**

Immediate:
- V06-R0 Ricardo.

Ricardo continues automatically:
- R0 → R1 → R2 → R3.

After R3 green:
- Germinator G1 audits Ricardo's complete gameplay/core candidate.

After G1 `APPROVE — PRESENTATION LANE UNLOCKED`:
- Mario: M1 → M2.
- Brancaforte: B1.
- Mario and Brancaforte may work in parallel.

After G1 + M2 + B1 are green:
- Gonza Z0 performs final integration/verification.
- Green Z0 automatically unlocks Gonza Z1 publication.

Gonza performs no early preparation/progressive integration in this round.

No PRESENT/check-in or Neureon token is required between normal green handoffs.

## Ownership

Ricardo:
- `src/game/types.ts`
- `src/game/data/**`
- `src/game/simulation/**`
- CPU gameplay/tactics
- gameplay tests

Mario:
- `src/game/render/**`
- stage rendering
- procedural character rigs
- combat visual effects

Brancaforte:
- `src/game/ui/**`
- `src/game/input/**` only where UI/navigation/input lifecycle requires
- `src/styles.css`

Germinator:
- independent gameplay/core audit immediately after Ricardo; fixes normally return to Ricardo.

Gonza:
- final-stage integration, full-suite/build/standalone/parity verification and Pages release only after Germinator + Mario + Brancaforte are green.

Neureon:
- coordination/contracts only; audit/re-plan when user requests; final archive/reset.

## Deviation policy

Normal local bugs inside an authorized task are repaired by the owner.

Stop affected downstream work and inform the user when evidence requires:
- frozen schema/meaning change;
- product-scope change;
- cross-role contract contradiction;
- unrecoverable integration/parity problem;
- QA blocker;
- missing authoritative input.

Record the finding in `coordination/forum/active/r004-findings.md`. The user decides whether Neureon audits/replans.

## Release acceptance

Germinator's G1 is the gameplay/core gate between Ricardo and presentation work.

Mario/Brancaforte then satisfy their visual/UI acceptance contracts. Gonza is the final integrator/release verifier and must run full integrated smoke, build/parity and release checks before publishing the exact candidate.
