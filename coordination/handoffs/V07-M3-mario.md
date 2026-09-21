# Handoff — V07-M3

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-M3 — Character Pipeline V2 / roster visual differentiation  
From: Mario  
To: Germinator V07-G2  
Branch: `repair/v07-character-pipeline-v2`  
Rejected preview base: `65bbb4122be526b0b878c214137192c7243db3ab`  
Exact candidate SHA: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`  
Status: GREEN / USER-DIRECTED REFERENCE-FIDELITY CANDIDATE / READY FOR INDEPENDENT G2 AUDIT

## Files changed from rejected preview base

Runtime render layer:
- `src/game/render/CharacterStructure.ts`
- `src/game/render/ChameleonRig.ts`
- `src/game/render/SupernarizRig.ts`
- `src/game/render/JuanchiRig.ts`
- `src/game/render/ElToroRig.ts`
- `src/game/render/LocomotionPose.ts`
- `src/game/render/PortraitRenderer.ts`

Acceptance/test:
- `tests/v07-m3-character-pipeline.test.mjs`

QA/tooling only:
- `.github/workflows/character-pipeline-v2.yml`
- `tools/character-pipeline-v2/Dockerfile`
- `tools/character-pipeline-v2/OPEN_TOONZ.md`
- `tools/character-pipeline-v2/README.md`
- `tools/character-pipeline-v2/bootstrap-ubuntu.sh`
- `tools/character-pipeline-v2/rig-profile.schema.json`
- `tools/character-pipeline-v2/visual-evidence.html`

No simulation/gameplay source file changed from the rejected preview base.

## Behavior / interface contract

### Shared structural authority

`CharacterStructure.ts` is the reusable render-only identity authority for:
- head width / height / profile;
- neck / shoulder width;
- torso width / length / mass;
- arm / forearm thickness;
- hip / leg proportions;
- stance width / crouch / forward lean;
- center-of-mass bias / primary mass;
- silhouette accents.

All four released fighters have separate authored profiles. Pairwise structure is acceptance-tested rather than inferred from clothing/color.

### Four fighter identities

- Camaleoni: long/narrow body language, wider active stance and tail-led silhouette.
- Supernariz: tall/narrow body language, long torso and projecting-nose/cape silhouette.
- Juanchi: compact athletic/balanced build.
- El Toro: broad, short/top-heavy, low-forward and planted; wider head/neck/shoulders/torso/hips, thicker limbs, shorter legs and wider stance than Juanchi.

The four runtime rigs consume their own `getCharacterStructure(...)` profile. El Toro and Juanchi no longer share near-identical anatomical dimensions.

### Locomotion / posture

`LocomotionPose.ts` contains distinct mass signatures for all four fighters. El Toro uses lower foot lift/bob, wider planted stance and stronger weight transfer than Juanchi. This is render-only; simulation movement, collision, damage, stun, reach and legality are untouched.

### Portrait seam

The existing public `PortraitRenderer` seam remains unchanged:
- `hasFighterPortrait`
- `drawFighterPortrait`
- `mountFighterPortraits`

Portrait geometry now consumes the same `CharacterStructure` profiles as gameplay rigs, including head, shoulder and torso proportions. No unrelated portrait body template or raster source was introduced.

## Verification evidence

### TDD RED

Test-first commit:
`dd13e6889f7606d0aafea403e4e0652dfa466054`

CI-only PR #39 on that commit:
- Repository verification run #1166 / run `35565553379`;
- **329/330 pass, 1 expected failure**;
- failing test: `tests/v07-m3-character-pipeline.test.mjs`;
- reason: `dist/game/render/CharacterStructure.js` did not yet exist.

This proves the V07-M3 test was red before structural implementation landed.

### Initial structural M3 suite/build — historical

Initial structural candidate (superseded by the reference-fidelity repair below):
`e053e0b187acff3b4555ce8d537e9fd9ca616303`

Repository verification:
- run #1171 / `35565877737`;
- coordination contract: PASS;
- full test suite: PASS;
- build/typecheck: PASS.

Character Pipeline V2 verification:
- push run #15 / `35565867023`;
- job `106227440142`;
- free-toolchain installation/version verification: PASS;
- full suite: **335/335 PASS**;
- build: PASS;
- visual-evidence capture: PASS;
- artifact upload: PASS;
- runtime raster/reference guard: PASS.

### Raster/runtime boundary

The specialized pipeline scans `src/` for prohibited fighter/reference raster loading and passed on the exact candidate. The compare from rejected base to M3 changes only render-layer code plus test/QA/tooling files; no gameplay/simulation file changed.

### Visual evidence artifact

Artifact:
- name: `v07-m3-visual-evidence`;
- artifact ID: `10624062826`;
- run: `35565867023`;
- SHA-256: `d2e04bf8dc9983b1164b00640a8b60cdc5bb91837693f75c16dc1afa9500cac9`.

Captured from the exact built runtime modules:
- `normal-color.png` — four-fighter neutral normal-color comparison;
- `neutral-silhouette.png` — four-fighter black silhouette comparison;
- `juanchi-vs-el-toro.png` — Juanchi and El Toro side-by-side at identical gameplay scale;
- `el-toro-actions.png` — neutral / normal / Topete / Ultimate-startup body-pose strip;
- `phone-landscape.png` — 844×390 landscape readability strip.

Mario inspected the artifact, not merely its existence:
- all four neutral silhouettes are materially separable;
- El Toro is visibly wider, lower and more top-heavy than Juanchi at the same scale;
- Juanchi remains compact/athletic rather than a narrow copy of El Toro;
- Camaleoni and Supernariz remain visually distinct from the two human bruiser builds;
- the direct-rig action strip shows body-pose changes for normal, Special and Ultimate startup without mounting the shared `FightRenderer/CombatEffects` layer;
- all four rigs remain readable without clipping in the 844×390 evidence frame.

Note: El Toro's intrinsic mouth/breath cue is part of `ElToroRig`; the evidence harness disables the shared effects layer by invoking the rig directly, but does not remove intrinsic rig cues. Germinator should independently judge the hard gate rather than accepting Mario's visual judgment by assertion.

## External authoring tools

Installed and version-verified in CI:
- Synfig 1.5.1;
- Inkscape 1.2.2;
- FFmpeg 6.1.1;
- ImageMagick 6.9.12-98.

Actually used to author runtime fighter geometry in M3:
- **none of the above**. Runtime anatomy was authored directly as TypeScript/Canvas2D structural profiles and rig geometry.

Actually used for QA capture:
- headless Chrome available on the GitHub runner.

OpenToonz:
- documented as optional;
- not installed/run and not used in runtime or authoring for this candidate.

The workflow was corrected because Synfig 1.5.1 prints a valid version on Ubuntu 24.04 but exits with code 3; the CI accepts only that known exit code and still rejects any other failure.

## Known risks / audit targets

- The visual style remains intentionally procedural/stylized Canvas2D; M3 solves structural identity, not a renderer-engine migration.
- The artifact is cloud/headless evidence, not final physical-device acceptance.
- Germinator must independently audit silhouette separability, El Toro-vs-Juanchi identity, runtime boundaries and effects-off/body-pose readability.
- Gonza must rebuild the isolated preview only after G2 approval. Final user physical-phone acceptance remains required before Z1 promotion.

## Unresolved questions

None requiring scope or gameplay changes. Visual acceptance is intentionally delegated to independent G2 + rebuilt preview/user check.

## Downstream eligibility

- V07-M3 is GREEN at current exact SHA `032b1bb28c5dd4421e5772cc40ab007f42e4d462`.
- Germinator V07-G2 is immediately eligible under AUTO_CHAIN.
- Gonza remains blocked until G2 independently approves the repaired candidate.


## Superseding reference-fidelity repair — current audit target

The user supplied new authoritative visual references for **El Toro, Juanchi, Supernariz and Camaleoni** and directed Mario to continue M3 so the playable designs resemble those references as closely as practical without dropping their animated treatment, signature details or material texture.

Current exact candidate:
`032b1bb28c5dd4421e5772cc40ab007f42e4d462`

Additional/updated runtime files:
- `src/game/render/ReferenceDetailPrimitives.ts`
- `src/game/render/CharacterStructure.ts`
- `src/game/render/ChameleonRig.ts`
- `src/game/render/SupernarizRig.ts`
- `src/game/render/JuanchiRig.ts`
- `src/game/render/ElToroRig.ts`
- `src/game/render/PortraitRenderer.ts`

Reference-driven changes:
- **El Toro:** human-heavy proportions closer to the master; long/mullet hair mass; white oversized shirt and readable mark; Scotland scarf with saltire/fringe; blue wraps; wide cargo pockets/seams; South Africa belt/tag; shawarma cue; layered skin/fabric shading.
- **Juanchi:** athletic proportions; curly high hair; black/gold La 56 streetwear; chain/cross/crown cue; tied jacket sleeves; cargo pocket/zip cues; rugby-ball and police-cap equipment identity; layered shading.
- **Supernariz:** taller/slimmer superhero proportions; red cape/boots/gloves and blue suit; bulbous chest-nose emblem; belt/sausage props; canonical long projecting nose; suit folds/texture and facial shading.
- **Camaleoni:** oversized human curly head retained by design; cheek texture; long scaled green neck/body; procedural scale field; claws/toes; rounded spiral tail with volume highlight; tongue mechanics retained.
- **Shared visual language:** procedural fabric grain, seam/stitch lines, cloth folds, hair strands, scale fields, shaded ellipses and face-plane lighting. Portraits consume the same structural authority and the same reference-driven motifs.

Runtime policy remains intact:
- no uploaded/reference raster is loaded at runtime;
- no `drawImage` / `new Image` fighter dependency;
- no gameplay, hitbox, damage, stun, movement-authority or legality change.

Latest verification:
- Character Pipeline V2 run #36: `35567747782`;
- job: `106232842903`;
- **336/336 tests PASS**, 0 fail, 0 skipped;
- build/typecheck PASS;
- visual evidence capture PASS;
- runtime raster/reference guard PASS.

Latest visual artifact:
- name: `v07-m3-visual-evidence`;
- ID: `10625370497`;
- SHA-256: `cbf9628b612e04acfe23ad4dcfc9b988b81b9f5c49612d325be40fe360e437f3`;
- contains `normal-color.png`, `neutral-silhouette.png`, `juanchi-vs-el-toro.png`, `el-toro-actions.png`, and `phone-landscape.png`.

Mario inspected the generated latest artifact. Compared with the earlier M3 candidate, the three human fighters now have substantially less oversized/cartoon-head anatomy and more of the proportions present in the supplied masters; character-specific clothing/props and procedural surface treatment are also materially richer. The evidence still represents a deliberately procedural Canvas2D interpretation rather than raster reproduction, which Germinator must treat as a visual-quality audit point rather than accepting by assertion.

**Germinator V07-G2 must audit `032b1bb28c5dd4421e5772cc40ab007f42e4d462`, not the historical `e053e0b1...` candidate.**
