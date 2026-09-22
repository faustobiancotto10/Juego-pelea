# Handoff — V07-SPR-R1

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-SPR-R1 — Generic Sprite Runtime Backend  
From: Ricardo  
To: Mario-A sprite integrator + Germinator V07-SPR-G1  
Branch: `round/r005-sprite-ricardo-runtime`  
Exact candidate SHA: `5b20c351e75a45460b3f76416d41424f10e43a1f`  
Supersedes: `79f8d81c2db75eebc595a93668e7332a9f429373` (which already superseded `d07cba1231fbb571dfe5d344487251f88dec797c`)  
Starting SHA: `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`  
Validation PR: #51 (draft only; do not merge directly)  
Status: GREEN / HANDOFF_READY

## Runtime contract

This candidate adds the generic presentation-only sprite foundation without modifying combat simulation or balance.

### Manifest / facing

`SpriteAnimationSetDefinition` v1 requires:
- `atlas`;
- explicit `mirrorSafe: boolean`;
- authored RIGHT-facing `animations`;
- `leftAnimations` with the exact same animation-key set when `mirrorSafe === false`.

RIGHT frames draw without a flip. LEFT + `mirrorSafe: true` may reuse RIGHT frames with explicit horizontal mirroring. LEFT + `mirrorSafe: false` selects authored `leftAnimations` with no horizontal mirroring. Authored LEFT anchors normalize back into canonical fighter-local coordinates.

### Animation authority

`AnimationResolver` remains snapshot-driven. Ordinary moves, dash, airborne and Ultimate phases use their simulation-owned forward counters. Neutral/locomotion loops use authoritative `combatTick`.

Reaction/transition states now pass through `SpriteAnimationTimeline`, a presentation-only per-fighter-slot state-entry clock for:
- `hurt`;
- `guard-break`;
- `jump-startup`;
- `land`;
- `captured`;
- `knockdown`;
- `crouch`;
- `block`;
- `block-crouch`.

The timeline:
- starts transition age at 0 on state entry;
- advances only when authoritative `combatTick` advances;
- therefore freezes during hitstop/repeated renders;
- restarts a same-key reaction when its authoritative remaining counter increases;
- resets at round start and also handles combatTick regression;
- is keyed by fighter slot, so mirror-match fighters never share presentation age.

This fixes Mario-B's verified clock-direction conflict without adding gameplay state to the renderer. Decrementing durations such as `stunFrames` and `guardBreakFrames` are no longer treated as forward animation age, and a late-round knockdown no longer samples a non-looping sequence at its terminal frame.

### Asset lifecycle / dual renderer

`FightSpriteAssetStore` deduplicates loads, surfaces failures, retains only selected-fight packages and reuses cached packages on rematch. `AppController` preloads selected sprite fighters before live combat and generation-guards stale async VS loads.

Procedural rigs remain intact. `FighterRenderer` routes `procedural` vs `sprite` bodies and forwards the actual fighter slot into sprite body/anchor sampling. Juanchi body-independent props remain extracted under `src/game/render/props/JuanchiProps.ts`.

## Repair delta from superseded SHA

Exact diff `d07cba... -> 79f8d81...` is 6 commits ahead / 0 behind and touches only:
- `src/game/render/FightRenderer.ts`;
- `src/game/render/FighterRenderer.ts`;
- `src/game/render/sprites/SpriteAnimationTimeline.ts` (new);
- `src/game/render/sprites/SpriteFighterRenderer.ts`;
- `tests/sprite-fighter-renderer.test.mjs`.

No `src/game/simulation/**`, combat balance, hitbox, damage, stun, projectile-rule or CPU-policy files changed.

Latest narrow amendment `79f8d81... -> 5b20c351...` is 2 commits ahead / 0 behind and changes only `SpriteAnimationTimeline.ts` plus the targeted sprite renderer regression test. No simulation/balance files changed.

Full lane audit from the frozen starting SHA is 27 commits ahead / 0 behind.

## Verification

TDD RED proof:
- workflow run: `35673297473`;
- job: `106574354315`;
- coordination contract: PASS;
- full suite: 306 PASS / 2 FAIL;
- the two failures were exactly the new transition-clock regressions:
  - reaction/terminal timeline entered at terminal atlas frame instead of frame 0;
  - decrementing transition counters drove guard-break/jump-startup/landing forward sampler incorrectly.

Prior reaction-clock GREEN:
- workflow run: `35673440101`;
- job: `106574802177`;
- coordination contract: 10/10 PASS;
- full suite: 308/308 PASS;
- build: PASS.

Stance-clock amendment RED:
- workflow run: `35675340097`;
- job: `106580577710`;
- coordination contract: PASS;
- full suite: 308 PASS / 1 FAIL;
- failure was exactly the new crouch/block state-entry regression (`crouch` sampled terminal frame 187 instead of entry frame 27).

Final GREEN:
- workflow run: `35675383264`;
- job: `106580714122`;
- coordination contract: PASS;
- full suite: 309/309 PASS;
- build: PASS.

## Integration instructions

Mario-A integrator:
1. consume exact SHA `5b20c351e75a45460b3f76416d41424f10e43a1f`, not the moving branch and not superseded `79f8d81...` / `d07cba...`;
2. adapt El Toro's generated runtime manifest to this v1 contract;
3. set El Toro `mirrorSafe: false`;
4. provide RIGHT frames in `animations`;
5. provide authored LEFT frames in `leftAnimations` with identical resolver-key coverage;
6. register the package only after both maps and anchors validate;
7. preserve the per-slot SpriteAnimationTimeline path when integrating package/runtime changes.

Germinator should audit the single integrated candidate, not this isolated backend alone.

## Known gates / risks

- Authored LEFT-facing El Toro IMG-00 + IMG-01..12 remain a hard asset dependency.
- `DEFAULT_SPRITE_PACKAGE_REGISTRY` intentionally has no concrete fighter package registrations in this generic lane.
- The VS preload path exposes a visible loading/error state; Brancaforte's targeted integration review remains requested.
- No production-root publish is authorized by this handoff.

## Identity Learning Review

**UPDATED previously; latest stance-clock amendment: NO_CHANGE**

Existing durable Ricardo learning already covers the generalized rule:

> For sprite presentation, never use a decrementing simulation duration or absolute match clock as transition animation age: derive a per-fighter-slot state-entry age only from authoritative combatTick, freeze it when that tick freezes, and restart it when the authoritative reaction duration is renewed.

## Requested next action

Mario-A / Mario-B may consume exact candidate SHA `5b20c351e75a45460b3f76416d41424f10e43a1f` for sprite integration. The `79f8d81...` and `d07cba...` handoffs are superseded.

Do not mark the integrated El Toro pilot complete until authored LEFT assets exist and the resulting package passes this runtime contract. Germinator remains downstream of the single integrated candidate.
