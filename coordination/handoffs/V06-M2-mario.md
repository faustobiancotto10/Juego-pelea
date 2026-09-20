# Handoff — V06-M2

Round: R004-V06-CONTENT-EXPANSION
From: Mario
To: Gonza, Neureon, Germinator, Brancaforte
Task: V06-M2
Status: GREEN / FINAL MARIO HANDOFF
Branch: round/r004-mario
M1 base: 554d5a38688121f2fd6ca0ad0e90a25b5b2a1132
Exact M2 SHA: 81c904efedd8c7aaf6a66a600abece177b926e2c

## Delivered

### Stage contract / integration seam
- Added render-owned `StageRegistry` / `StageDefinition`.
- Frozen IDs:
  - `tramontana-dusk`
  - `cancha-56`
- `FightRenderer` constructor accepts a resolved `StageDefinition` and defaults safely to Tramontana for legacy consumers.
- `setStage(stage)` is presentation-only.
- This matches B1's frozen UI seam: B1 owns `GameFlowState.stage`; Gonza resolves that ID through `DEFAULT_STAGE_REGISTRY.get(...)` and passes the result to the renderer.
- No stage state enters CombatSimulation.

### Cancha 56
- Procedural night rugby field with:
  - rugby posts;
  - field/touch markings;
  - club/fence boundary;
  - floodlights and restrained light pools;
  - low bleachers;
  - asynchronous clustered spectators with visible gaps;
  - restrained cooler/speaker/bench/La 56 sideline details;
  - clean central combat corridor;
  - contrast pool for Juanchi's black outfit.
- Crowd budget remains deliberately small and bounded; no stadium wall, no runtime raster.
- Major-impact/Clash reactions are presentation-owned and fed only from published events/state.
- Final layering keeps turf behind crowd/edge props so the gathering remains visible.

### Projectile visual routing
- Replaced Chorizo-only projectile assumption with `ProjectileSnapshot.visualKey` routing.
- `chorizo` preserves the existing presentation.
- `rugby-ball` uses Juanchi's procedural ball prop.
- Ball outbound/turn/return visuals read published `phase`, `phaseTick`, `age`; renderer does not derive projectile physics.
- Unknown visual keys render a visible development fallback instead of silently becoming Chorizo.

### Police Cap Rage presentation
- Juanchi cap probe renders only from published `ultimateProbe` and `visualKey === 'police-cap'`.
- Successful capture sequence uses authoritative `ultimateConnected`, `ultimateTarget` and target `capturedBy`.
- Cap attachment is positioned from reusable render anchors; capture legality/head hit geometry is never recomputed.
- Clash cancellation therefore cannot accidentally enter a solo cap-attachment pose unless authoritative capture state exists.

### Universal Ultimate Clash
- `ultimate-clash` event spawns one bounded two-sided ring/impact accent.
- `snapshot.clash` drives brief darkening and opposing trails.
- Optional `CHOQUE` label is short-lived and canvas-local.
- Both fighters consume published `clashRecoveryFrames`:
  - freeze starts in a grounded braced pose even though simulation has already staged outbound velocities;
  - launch uses recoil language rather than jump-prep language.
- The renderer never evaluates effective-entry timing, confrontation volumes or Clash eligibility.
- Clash flashes remain capped at six and existing particle budget stays 120.

### Common Ultimate impact
- Common peak treatment consumes published `hit.majorImpact === true`; `finisher` remains the terminal fallback.
- Fighter effect accents come from the presentation registry rather than two-fighter hardcoding.
- Stage crowd reaction is bounded and advances by `combatTick`, so hitstop does not animate combat-reactive ambience forward.

## Files changed in M2 vs green M1

- src/game/render/CombatEffects.ts
- src/game/render/FightRenderer.ts
- src/game/render/JuanchiRig.ts
- src/game/render/LocomotionPose.ts
- src/game/render/StageRegistry.ts
- src/game/render/StageRenderer.ts
- tests/render-v06.test.mjs

No simulation, gameplay data, shared types, CPU, input, UI or tuning files changed in M2.

## Verification

Isolated M2 CI PR #25:
- base branch: `ci/r004-m2-m1`
- exact base SHA: `554d5a38688121f2fd6ca0ad0e90a25b5b2a1132`
- exact head: `81c904efedd8c7aaf6a66a600abece177b926e2c`
- GitHub Actions run `35538017393` (#864): SUCCESS
- coordination contract: 6/6 PASS
- full suite: **260/260 PASS**
- build: PASS

M2-specific regressions verify:
- stage registry exact frozen IDs and no simulation dependency;
- deterministic CombatSimulation snapshots remain identical regardless of stage presentation choice;
- Cancha 56 rugby/night/gathering anchors and bounded/no-raster crowd;
- B1↔M2 StageDefinition constructor seam;
- projectile routing by visualKey/phase;
- cap probe/capture presentation from authoritative state only;
- Clash presentation from event/snapshot only, bounded to six;
- major-impact treatment from published `majorImpact`;
- Clash freeze brace and launch recoil semantics.

## Evidence boundary

This execution environment does not provide trustworthy physical-iPhone/Safari performance or pixel-reference capture. Therefore this handoff does **not** claim final phone readability, tactile overlap or pixel likeness approval.

Final Z0/Z1 served-product verification must still check:
- Cancha 56 phone frame pacing/readability;
- crowd/effects vs HUD/touch-control obstruction;
- Juanchi likeness against the frozen master while preserving no-raster runtime policy;
- B1 stage flow actually resolves through M2 StageRegistry;
- Clash/ball/cap visuals in the integrated served artifact.

## Integration instruction

R004 AUTO_CHAIN dependencies are now satisfied:
- Ricardo R3 green;
- Germinator G1 APPROVE;
- Brancaforte B1 green `81647506d2e69b92dd92e19f2fc997d21949a4a9`;
- Mario M2 green `81c904efedd8c7aaf6a66a600abece177b926e2c`.

@Gonza may start V06-Z0 immediately. Integrate exact accepted deltas only; do not merge coordination files from feature branches over current main.

Mario remains available only for bounded renderer findings from final integration.
