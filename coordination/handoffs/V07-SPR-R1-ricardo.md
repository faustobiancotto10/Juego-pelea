# Handoff — V07-SPR-R1

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-SPR-R1 — Generic Sprite Runtime Backend  
From: Ricardo  
To: Mario-A sprite integrator + Germinator V07-SPR-G1  
Branch: `round/r005-sprite-ricardo-runtime`  
Exact candidate SHA: `d07cba1231fbb571dfe5d344487251f88dec797c`  
Starting SHA: `e3d29807acab6ce4c87fd7e04069fcb4b98c6a65`  
Validation PR: #51 (draft only; do not merge directly)  
Status: GREEN / HANDOFF_READY

## Runtime contract

This candidate adds the generic presentation-only sprite foundation without modifying combat simulation or balance.

### Manifest

`SpriteAnimationSetDefinition` v1 now requires:
- `atlas`;
- explicit `mirrorSafe: boolean`;
- authored RIGHT-facing `animations`;
- `leftAnimations` with the exact same animation-key set when `mirrorSafe === false`.

A non-mirror-safe package without authored LEFT animation data is rejected visibly. Mirroring is never an implicit default.

### Animation authority

`AnimationResolver` derives presentation only from existing `FighterSnapshot` state plus authoritative `combatTick`.

There is:
- no generic `fighter.state`;
- no wall-clock animation authority;
- no renderer-owned hit/damage/stun/legality state.

Integer frame sampling uses cumulative `durationTicks`; loops wrap deterministically and non-looping animations hold their final frame.

### Facing / anchors

RIGHT-facing authored frames draw without a flip.

LEFT-facing behavior:
- `mirrorSafe: true` -> reuse RIGHT frames with explicit horizontal canvas flip;
- `mirrorSafe: false` -> select `leftAnimations` and draw without mirroring.

Authored LEFT anchors are normalized back into canonical fighter-local coordinates before backend-neutral attachment consumers use them.

This resolves the Mario-B El Toro conflict: readable/directional costume text is never mirrored by the runtime when the package declares `mirrorSafe: false`.

### Asset lifecycle

`FightSpriteAssetStore`:
- deduplicates package loads;
- surfaces missing/load failures;
- keeps only selected-fight package keys;
- reuses cache on rematch.

`AppController` waits for selected sprite packages before entering live combat. Menu/roster browsing does not preload body atlases. Async VS preparation is generation-guarded so stale loads cannot start a fight after navigation changed.

### Dual renderer

Current procedural rigs remain intact.

`FighterRenderer` routes by:
- default / `procedural` -> existing procedural rig;
- `sprite` -> `SpriteFighterRenderer`.

Juanchi rugby-ball/police-cap props were extracted to `src/game/render/props/JuanchiProps.ts` so identity props do not depend on retaining the procedural body rig.

## Files changed

Product/runtime:
- `package.json`
- `scripts/copy-runtime-assets.mjs`
- `src/game/data/characterContent.ts`
- `src/game/data/presentationRegistry.ts`
- `src/game/render/FightRenderer.ts`
- `src/game/render/FighterRenderer.ts`
- `src/game/render/JuanchiRig.ts`
- `src/game/render/props/JuanchiProps.ts`
- `src/game/render/sprites/AnimationResolver.ts`
- `src/game/render/sprites/SpriteAnchorSampler.ts`
- `src/game/render/sprites/SpriteAssetStore.ts`
- `src/game/render/sprites/SpriteFightAssetLifecycle.ts`
- `src/game/render/sprites/SpriteFighterRenderer.ts`
- `src/game/render/sprites/SpriteFrameSampler.ts`
- `src/game/render/sprites/SpriteManifest.ts`
- `src/game/render/sprites/SpritePackageRegistry.ts`
- `src/game/ui/AppController.ts`

Tests:
- `tests/render-v06.test.mjs`
- `tests/renderer-contract.test.mjs`
- `tests/sprite-animation-resolver.test.mjs`
- `tests/sprite-asset-store.test.mjs`
- `tests/sprite-fight-lifecycle.test.mjs`
- `tests/sprite-fighter-renderer.test.mjs`
- `tests/sprite-manifest.test.mjs`

No `src/game/simulation/**`, combat balance, hitbox, damage, stun, projectile-rule or CPU-policy files changed.

## Verification

Final repository verification:
- workflow run: `35669435920`
- job: `106562356524`
- coordination contract: 10/10 PASS
- recursively discovered test files: 41
- full suite: 306/306 PASS
- build: PASS
- branch is 19 commits ahead / 0 behind its exact frozen sprite-runtime base at final audit.

TDD receipts also include explicit RED before each new runtime block and RED/GREEN for the authored-LEFT amendment.

## Integration instructions

Mario-A integrator:
1. consume this exact SHA/delta, not a moving branch head;
2. adapt El Toro's generated runtime manifest to this v1 contract;
3. set El Toro `mirrorSafe: false`;
4. provide authored RIGHT frames in `animations`;
5. provide authored LEFT frames in `leftAnimations` with identical resolver-key coverage;
6. register the package key only after both facing maps are valid.

Mario-B's current right-only package remains useful authoring evidence, but it cannot become a valid non-mirror-safe runtime manifest until the authored LEFT source gate is satisfied.

Germinator should audit the integrated candidate, not this isolated backend alone, for final visual/asset correctness.

## Known gates / risks

- Authored LEFT-facing El Toro IMG-00 + IMG-01..12 are still a hard asset dependency.
- `DEFAULT_SPRITE_PACKAGE_REGISTRY` intentionally has no fighter package registrations in this generic lane; integration owns package registration.
- The preload gate adds a visible VS loading/error message. It does not alter gameplay/input/HUD behavior, but because it is a UI-visible loading contract, Brancaforte should receive a targeted review during integration under the round's conditional UI rule.
- No production-root publish is authorized by this handoff.

## Identity Learning Review

**UPDATED**

Durable Ricardo learning added to `coordination/agents/ricardo.md`:

> For sprite-backed fighters, never infer that horizontal mirroring is visually safe: require an explicit mirror-safety contract, use authored opposite-facing frames when it is false, and normalize authored-facing anchors back into canonical fighter-local coordinates before renderer/UI consumers use them.

## Requested next action

Mario-A may consume exact candidate SHA `d07cba1231fbb571dfe5d344487251f88dec797c` for sprite integration.

Do not mark the integrated El Toro pilot complete until authored LEFT assets exist and the resulting package passes this manifest/runtime contract. Germinator remains downstream of the single integrated candidate.
