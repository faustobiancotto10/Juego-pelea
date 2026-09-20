# Handoff — V06-M1

Round: R004-V06-CONTENT-EXPANSION
From: Mario
To: Germinator, Brancaforte, Gonza
Task: V06-M1
Status: GREEN / AUTO-CHAIN M2
Branch: round/r004-mario
Base: d815694a76a7a92c004203f1ae9fd14e2035744c
Exact M1 SHA: 554d5a38688121f2fd6ca0ad0e90a25b5b2a1132

## Delivered

- Added `LocomotionPoseTracker` driven by actual grounded root travel, not wall time or raw velocity.
- Per-slot histories preserve mirrors and repeated-render idempotence.
- 55/45 stance/swing gait with fighter-specific stride lengths and shorter backward cadence.
- Start/stop blend, dash compression/drive, two-tick jump preparation, extension/tuck/descent brace and four-tick landing absorption.
- Hitstop stability: repeated `frame` renders and frozen `combatTick` do not advance physical pose.
- Added reusable rig anchors, two-bone leg solver and facing-readable text helper.
- Retrofitted Camaleoni and Supernariz to travel-driven feet; removed their wall-time/vx treadmill leg oscillators while preserving authored attack identity.
- Added complete procedural Juanchi rig:
  - curly dark hair / faded sides;
  - oversized black `La 56` shirt with readable text in both facings;
  - black cargos;
  - black/white footwear with gold accents;
  - gold chain/details;
  - authoritative rugby-ball availability;
  - belt police cap outside committed Ultimate;
  - jab/shoulder/low/air poses;
  - Rugby Boomerang throw pose;
  - Fricción rub/load/two-palm release;
  - Police Cap Rage startup/capture/rage/rush/barrage/finisher vocabulary.
- FightRenderer now uses stable fighter slot identity and `combatTick / 60` for fighter body presentation; round-start resets renderer pose histories.
- Presentation registry `rigKey` routes all released rigs; unknown keys no longer silently become Supernariz.
- No simulation/gameplay/input/UI/tuning files changed.

## Files changed vs accepted gameplay core

- src/game/render/ChameleonRig.ts
- src/game/render/FightRenderer.ts
- src/game/render/FighterRenderer.ts
- src/game/render/JuanchiRig.ts
- src/game/render/LocomotionPose.ts
- src/game/render/RigAnchors.ts
- src/game/render/SupernarizRig.ts
- tests/render-v06.test.mjs

## Verification

Frozen-core CI PR #24:
- base: `ci/r004-m1-core`
- base SHA: `d815694a76a7a92c004203f1ae9fd14e2035744c`
- head: `554d5a38688121f2fd6ca0ad0e90a25b5b2a1132`
- Actions run `35537541667` (#847): SUCCESS
- coordination: 6/6 PASS
- full suite: 251/251 PASS
- build: PASS

New render-v06 coverage verifies:
- identical-snapshot pose idempotence;
- hitstop combatTick freeze;
- cadence equivalence;
- measurable planted-foot interval;
- wall-clamp no-treadmill behavior;
- jump preparation / ascent-apex-descent / landing cues;
- Juanchi frozen identity/action vocabulary and procedural/no-raster policy;
- explicit three-rig registry;
- snapshot immutability.

## Reference / evidence boundary

The rig was authored against the frozen identity description and repository reference authority in `docs/characters/juanchi/PACKAGE.md`. Runtime reference images are never loaded.

This execution environment cannot supply trustworthy live browser/device pixel comparison against the master image, so no claim of final likeness/phone acceptance is made. Actual pixel/reference comparison and physical-phone readability remain final integration evidence.

## Auto-chain

M1 is green. Per R004 AUTO_CHAIN, Mario proceeds directly to V06-M2 on this exact branch.
