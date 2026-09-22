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


## User-rejected preview repair — multi-instance super-improvement

The physical/user-facing V0.7 preview failed on character visual identity. The first single-Mario repair improved structure/reference fidelity but the user has explicitly authorized a stronger multi-instance Mario squad experiment before Germinator/Gonza proceed.

Authoritative visual base for all squad lanes:
`032b1bb28c5dd4421e5772cc40ab007f42e4d462`

This is the latest green single-Mario reference-fidelity candidate and is now the baseline to beat, not the final visual candidate.

### Authorized Mario squad

- V07-M3A — Mario-A — Visual Architecture / Lead
  - branch: `round/r005-mario-squad-architect`
- V07-M3B — Mario-B — El Toro + Juanchi Reconstruction
  - branch: `round/r005-mario-squad-toro-juanchi`
- V07-M3C — Mario-C — Camaleoni + Supernariz Reconstruction
  - branch: `round/r005-mario-squad-camaleoni-supernariz`
- V07-M3D — Mario-D — Motion / Presentation / FX
  - branch: `round/r005-mario-squad-motion-fx`
- V07-M3I — Mario-A temporary squad integrator
  - branch: `round/r005-mario-squad-integration`
  - waits for M3A+B+C+D green exact-SHA handoffs.

All five branches start from exact base:
`032b1bb28c5dd4421e5772cc40ab007f42e4d462`

### Procedure

**REFERENCE ANALYSIS → STRUCTURE → LIKENESS → MOTION → EFFECTS → PHONE-SCALE VALIDATION**

Mandatory visual gates:
1. silhouette gate;
2. identity/reference-fidelity gate;
3. gameplay-scale gate;
4. effects-off action-readability gate.

The squad uses isolated branches and explicit file/subsystem ownership. Same-file concurrent editing is prohibited unless the round is amended. Cross-instance requests go through `coordination/forum/active/r005-mario-squad.md`.

`@Game Development Studio` is authorized as bounded authoring/evidence support for visual debugging, deterministic captures and asset-production inspection when available. Its measurements do not replace human artistic acceptance.

### Active repair sequence

**Mario-A + Mario-B + Mario-C + Mario-D (parallel) → Mario-A V07-M3I integration → Germinator V07-G2 → Gonza rebuilt preview → user physical-phone acceptance → Z1**

Germinator V07-G2 is VERIFIED with `APPROVE — CHARACTER PIPELINE REPAIR GREEN` on exact M3I candidate `f34760948cb2024c0c83f4a02202117a8ad3bf2f`.

Gonza is now eligible to rebuild/re-publish the **isolated V0.7 preview** from that exact candidate. Production-root promotion remains blocked until the rebuilt preview passes user physical-phone acceptance and final Z1 release verification.

Existing V0.7 gameplay contracts remain frozen. No Mario instance may change gameplay/balance or silently migrate the renderer/runtime architecture.


## User-authorized sprite-pilot extension — 2026-09-21

The user explicitly reopened R005 scope to begin the already-approved sprite migration now, using the supplied El Toro sprite package as the first production pilot.

This extension supersedes the old procedural-preview phone gate as the active visual path. The existing procedural V0.7 candidate remains historical green evidence, but **no production-root promotion from that procedural preview is authorized while this sprite pilot is active**.

Authoritative sprite documents:
- `docs/SPRITE_PRODUCTION_CONTRACT.md`;
- `docs/characters/el-toro/SPRITE_INTAKE_2026-09-21.md`;
- `docs/characters/el-toro/LEFT_FACING_SET_PROMPT.md`;
- `docs/superpowers/specs/2026-09-21-sprite-scale-agent-architecture-design.md`;
- `docs/superpowers/plans/2026-09-21-sprite-runtime-migration-plan.md`.

### Intake result

The supplied `SPRITES TORO.zip` contains an accepted right-facing El Toro source set of exactly 84 contractual body sprites plus IMG-00 and FX-01..04 after excluding one superseded alternate idle-like sheet.

El Toro is **not mirror-safe** because his costume contains readable/directional text and marks. Production completion therefore requires a genuinely authored LEFT-FACING IMG-00 + IMG-01..12 set. Runtime horizontal mirroring is not an acceptable shipping substitute for text-bearing body art.

### Sprite-pilot branch freeze

Common implementation base containing the accepted right-facing source bytes:
`e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`

Frozen lanes:
- Mario-A / V07-SPR-MA: `round/r005-sprite-mario-a-source-import` — continue source validation, extraction and normalization from the common base;
- Mario-B / V07-SPR-MB: `round/r005-sprite-mario-b-package` — El Toro derived package lane;
- Ricardo / V07-SPR-R1: `round/r005-sprite-ricardo-runtime` — generic sprite runtime lane;
- Mario integration: `round/r005-sprite-mario-integration` — Mario-A becomes the temporary same-role integrator after MA/MB handoffs; no third Mario chat is required for integration.

The branches are isolated and start from the same exact source-bearing SHA. Shared-interface changes are coordinated through `coordination/forum/active/r005-sprite-pilot.md`.

### Sprite-pilot AUTO_CHAIN

Immediately eligible in parallel after agent activation:
- `V07-SPR-MA` — Mario-A — source import / validation / normalization lead;
- `V07-SPR-MB` — Mario-B — El Toro package lane; right-facing work may begin, but all-facing completion is blocked on LEFT-FACING source delivery;
- `V07-SPR-R1` — Ricardo — generic sprite runtime backend.

Then:
- Mario integrated El Toro pilot + Ricardo runtime candidate → `V07-SPR-G1` Germinator;
- Germinator approval → `V07-SPR-Z0` Gonza isolated preview;
- user/device acceptance → explicit production-cutover decision.

Brancaforte is not required unless the sprite-loading path introduces a real UI/loading/input contract change.

The canonical user AUTO_CHAIN pulse is **`.`**. On `.`, an eligible agent synchronizes repository state and immediately continues its highest-priority assigned task. The pulse never bypasses missing assets, locks, QA blockers or user/device gates.

### Binary source handoff

The accepted user-provided binary source set has now been staged in GitHub for Mario-A:
- branch: `round/r005-sprite-mario-a-source-import`;
- exact source-handoff SHA: `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`;
- PR: #50;
- 17 accepted PNGs are under `docs/characters/el-toro/sprite-source/right/`;
- the rejected alternate is absent;
- import hash verification and repository CI are green.

Mario-A must consume that exact SHA, independently re-verify the recorded source hashes, and continue normalization/extraction. A second chat attachment is no longer required.

### Production blockers

No full-roster sprite fan-out and no production fighter-body cutover until:
1. El Toro LEFT-FACING body set is complete and contract-green;
2. the El Toro pilot is integrated and independently audited;
3. the pilot is a clear visual win at gameplay scale;
4. target-device memory/performance is acceptable;
5. user physical-device acceptance is green.


## Current sprite-pilot QA blocker — V07-SPR-G1

Germinator audited exact integrated candidate:
`5c76664fb95ac9c1da019636ce3ad974c214d84c`

Verdict: **BLOCK**.

The verified bilateral package/anchors remain accepted, but the exact candidate is not a live V0.7 sprite pilot:
- El Toro is absent from the default playable/presentation composition;
- the default sprite package registry is empty;
- no build-served runtime `assets/` package is materialized;
- the sprite candidate diverges from the approved four-fighter V0.7 product lineage at frozen base `378a991d55bed03e6237a03fdf6dfe96653fae72`.

Repair loop:
**Mario-A V07-SPR-MI live integration repair → Germinator V07-SPR-G1 rerun → Gonza V07-SPR-Z0**.

Mario-A must preserve the accepted RIGHT/LEFT sources and anchors, compose the sprite/runtime deltas onto the approved V0.7 four-fighter product line, register/materialize the El Toro sprite package in the actual browser build, and return one replacement exact SHA.

Gonza remains blocked until Germinator approves that replacement.


## Sprite-pilot live integration repair — replacement ready for QA

The prior V07-SPR-G1 blocker on `5c76664fb95ac9c1da019636ce3ad974c214d84c` is superseded for audit by a replacement integration.

Approved V0.7 product lineage:
`f34760948cb2024c0c83f4a02202117a8ad3bf2f`

Mario-A repair branch/head:
- branch: `round/r005-sprite-mario-a-live-repair`;
- exact repair head: `4ee68f1cfe5ed06f9da5e547aadf71bb54cd32fd`.

Exact replacement integration candidate:
`fe2b505639d8ebf2dc4ab204b545233d96f214f2`

Exact candidate tree:
`ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a`

The candidate has two parents:
- current coordination/main base: `ce5920b1211e47f38f7ee1e5b6340a200c55d331`;
- repair head: `4ee68f1cfe5ed06f9da5e547aadf71bb54cd32fd`.

The candidate is intentionally isolated on:
`round/r005-sprite-mario-integration-repair`

Resolved Germinator blockers:
1. the approved four-fighter V0.7 roster/presentation lineage is preserved;
2. El Toro's live presentation selects `bodyBackend:'sprite'` and `spritePackageKey:'el-toro'`;
3. the default sprite package registry resolves `el-toro`;
4. deterministic runtime manifest + body atlas are materialized under `assets/fighters/el-toro/` and copied to `dist/assets/` by the normal build;
5. backend-neutral render anchors are used where runtime attachments depend on fighter anatomy.

Preserved:
- canonical RIGHT/LEFT source art;
- verified bilateral anchors;
- `mirrorSafe:false`;
- authored LEFT rendering rather than runtime mirroring;
- V0.7 gameplay/balance/CPU contracts.

Verification:
- materialization run `35782862607`: generator PASS, 422/422 tests PASS, build + runtime-asset gate PASS;
- PR #59 Repository verification run `35783156610`: coordination + full suite + build PASS;
- PR #59 Character Pipeline V2 run `35783156710`: full tests + build + visual evidence + runtime raster-reference guard PASS;
- tested GitHub synthetic merge: `d0adc829e81810a69ba13acffe8257441d14a2f8`;
- synthetic tested tree: `ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a`;
- replacement candidate tree: `ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a`.

PR #59 was verification-only and was closed without merging to production/main.

Active order now:
**Germinator V07-SPR-G1 fresh audit of `fe2b505639d8ebf2dc4ab204b545233d96f214f2` → Gonza V07-SPR-Z0 only if approved**.

Gonza remains blocked until that independent audit is green.


## V07-SPR-G1 replacement audit — GREEN

The earlier blocker on `5c76664fb95ac9c1da019636ce3ad974c214d84c` remains historical/rejected.

Germinator independently audited replacement exact product candidate:
`fe2b505639d8ebf2dc4ab204b545233d96f214f2`

Product tree:
`ed5ee226bca6c5da6c4c4769f14ccf7e2316c31a`

Verdict:
**APPROVE — SPRITE PILOT LIVE INTEGRATION GREEN**

Fresh evidence:
- Repository verification #1720 / `35788754170`: 433/433 tests + build PASS;
- Character Pipeline V2 #72 / `35788754059`: 433/433 + build + deterministic sprite visual evidence + runtime raster/reference guard PASS;
- visual artifact `10721170926`, digest `sha256:6ca46fa33819251b1811e1b1027c5ce4e069bf5e18990344789d05bd77cc1f60`;
- RIGHT/LEFT authored sprite facings visually checked from the exact runtime atlas;
- readable garment text is correctly oriented on both facings;
- Topete/Ultimate effects-off body poses remain readable at normal and 844×390 evidence scale.

Active sequence:
**Gonza V07-SPR-Z0 isolated sprite preview → user physical-phone acceptance → canonical production-package reconciliation → explicit production-cutover decision**.

Gonza is eligible now, but only for the isolated preview. Production root must remain unchanged.

### Production-format gate

The pilot currently serves `el-toro-body.png` + `el-toro-animations.json`.

The authoritative sprite architecture/plan still specifies canonical production `body.webp` + `animations.json`. This naming/encoding mismatch does not block the pre-cutover isolated pilot preview, but it must be reconciled (or explicitly amended by Neureon) before production/full-roster sprite cutover.
