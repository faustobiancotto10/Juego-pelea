# Handoff — V05-M1

Round: R003-V05-COMBAT-LOOP
From: Mario
To: Neureon, Germinator, Gonza
Task: V05-M1
Status: HANDOFF_READY
Commit SHA: e567fce333f535e21583cbef0ab46e300b089b0a
Frozen core base: 8e74d1e7ac34ac6524d725553b01b32bb3ff33bc
Branch: round/r003-mario

## Files changed versus frozen core

- src/game/render/ChameleonRig.ts
- src/game/render/FightRenderer.ts
- src/game/render/FighterRenderer.ts
- src/game/render/PresentationPose.ts
- src/game/render/SupernarizRig.ts
- tests/render-v05.test.mjs

No simulation, gameplay values, shared types, input, UI, CSS, CPU or release artifacts changed.

## Presentation contract consumed

Read-only authoritative state/events:
- moveId / moveFrame / moveContact
- grounded / vy / landingRecoveryFrames
- ultimatePhase / ultimatePhaseFrame / ultimateConnected
- ultimateTarget / capturedBy
- hit.source / hit.finisher
- ultimate-release
- MatchSnapshot.frame for simulation-frame visual aging

Readonly timing/geometry:
- getMoveDefinition(...) hitbox start/end/totalFrames
- ULTIMATES Camaleoni startup timing

The renderer does not infer hit validity, capture legality, launch, damage, guard state or move selection.

## Delivered behavior

### Explicit fighter rigs
- released fighters use an explicit rig map;
- unknown registered fighter IDs no longer fall through to Supernariz;
- missing visual registration renders a visible MISSING RIG development placeholder and logs once.

### Jump / landing
- procedural rigs now distinguish ascent, apex and descent from authoritative vertical velocity;
- the four simulation-owned landing recovery frames produce a visible compression/recovery pose;
- rendering does not create or modify landing state.

### Low / standing / air attacks
- pose phase derives from the real readonly move hitbox timeline rather than duplicated hard-coded active windows;
- clawLow and noseLow visibly lower the attacking limb/character profile;
- airClaw / airNose motion combines authoritative move phase with ascent/apex/descent posture;
- existing standing and Coletazo vocabulary remains procedural.

### Camaleoni Ultimate
- startup disappearance is deliberate and reaches alpha 0.12 early;
- committed capture dash is near-invisible at alpha 0.08;
- ultimatePhaseFrame controls reappearance before the finisher;
- sequence effects require ultimateConnected plus authoritative captured target;
- recovery/reappearance follows authoritative Ultimate state.

### Supernariz Ultimate
- startup/capture/sequence intensity follows authoritative phase and phase frame;
- nazazo emphasis is centered on the configured sequence beat;
- launch trail is no longer inferred during capture: it starts from the authoritative ultimate-release event.

### Contact / finisher feedback
- Ultimate hit styling uses hit.source === 'ultimate', not a possibly-cleared move/phase;
- final emphasis uses event.finisher;
- ultimate-release owns the bounded release trail/final impact cue;
- capture-linked flashes clear when no fighter has active Ultimate/capturedBy state, while release trails may finish their bounded post-release presentation.

### Render-cadence invariance
- particles, flashes, release trails and camera shake age by consumed simulation-frame deltas;
- rendering the same snapshot repeatedly does not age combat feedback;
- same-frame event consumption is idempotent;
- simulation-derived animation time uses snapshot.frame / 60 instead of render-call count.

## Boundedness / asset policy

- particles remain capped at 120;
- Push Guard flashes remain capped at 6;
- Ultimate flashes remain capped at 6;
- Ultimate release trails are capped at 6;
- runtime fighter presentation remains Canvas2D procedural;
- no new Image(), drawImage(), PNG/JPG runtime fighter source or spritesheet dependency.

## Verification

CI-only verification PR #20 uses a dedicated base branch pinned exactly to the accepted frozen core:
- base: ci/r003-m1-frozen-core
- base SHA: 8e74d1e7ac34ac6524d725553b01b32bb3ff33bc
- head: e567fce333f535e21583cbef0ab46e300b089b0a

GitHub Actions:
- run 35466955050 (#599): SUCCESS
- coordination contract: 6/6 PASS
- full npm test: 169/169 PASS
- npm run build: PASS

New tests/render-v05.test.mjs verifies:
- explicit rig mapping and no silent Supernariz fallback;
- readonly move geometry drives active pose phase;
- ascent/apex/descent and all four landing-recovery values;
- one render vs four renders of the same snapshot does not age particles/shake;
- same-frame event consumption does not duplicate feedback;
- 1x/2x/4x render schedules over the same simulation snapshots converge to identical transient state;
- render/consumeEvents does not mutate authoritative snapshots;
- hit.source / finisher / ultimate-release own Ultimate feedback;
- procedural/no-raster and transient-budget constraints remain intact.

Historical V0.4 renderer contracts also pass unchanged.

## Verification history note

Earlier PR #19 runs were invalid verification vehicles because GitHub's synthetic merge retained a moving Ricardo-branch merge ref containing a superseded AC06 test. No gameplay/test workaround was made for that false red.

PR #20 was created fresh against the dedicated frozen-core base and is the authoritative M1 CI evidence.

## Required visual evidence not available in this execution environment

The plan requires actual screenshots/video at startup/active/recovery, jump apex/landing, both Ultimates, capture release/KO and 852x393 landscape, including hitbox/pose comparison.

This chat execution environment has no usable local browser/headless pixel-capture path for the repository. I therefore do NOT claim the pixel/device portion of AC10 is complete.

Stage 5 G2 must close this gap on the assembled candidate with actual browser/device pixel evidence and small-landscape readability/performance review. If G2 finds an art/readability issue, return it to Mario under V05-M1.

## Requested next action

- Neureon: accept this as the M1 implementation checkpoint, with pixel evidence explicitly pending Stage 5.
- Brancaforte: finish B2 independently.
- Germinator: after M1+B2 assembly, validate cadence invariance, pose/contact agreement, actual pixels/device and no stale capture/release presentation in G2.
- Gonza: do not integrate/release until G2 + Neureon release gate.

Mario remains available until ROUND_COMPLETE.
