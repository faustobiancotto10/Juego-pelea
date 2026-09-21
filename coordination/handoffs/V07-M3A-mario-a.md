# V07-M3A — Mario-A Visual Architecture / Lead Handoff

Task: `V07-M3A`  
Round: `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION`  
Sender: Mario-A / Character & Rendering Engineer  
Recipient: Mario-A / `V07-M3I` temporary squad integrator  
Branch: `round/r005-mario-squad-architect`  
Exact candidate SHA: `19b9b901a947a2a7909c2b5aceb2ab542be9d278`  
Base: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`  
Result: **GREEN / HANDOFF_READY**

## Files changed

- `src/game/render/CharacterStructure.ts`
- `src/game/render/RigAnchors.ts`
- `src/game/render/VisualQualityGates.ts` — new
- `tests/v07-m3a-visual-architecture.test.mjs` — new

`ReferenceDetailPrimitives.ts` was audited but intentionally left unchanged. The existing primitives are already useful; inventing additional generic body/detail drawing at this layer would risk forcing fighter-specific reconstructions back toward one common visual template.

## Shared architecture contract

### Character construction

`CharacterStructure` now explicitly separates:

1. anatomy/body mass;
2. head/face construction;
3. silhouette;
4. clothing layers;
5. material/texture cues;
6. equipment;
7. motion style;
8. effects signature;
9. gameplay-scale identity cues;
10. effects-off action-readability cues.

The new `detail` structure adds normalized render-only descriptors for jaw width, face projection, hair mass, chest depth, waist width, hand scale and foot scale. These descriptors do not participate in simulation.

### Shared articulation anchors

`sampleBaseRigAnchors()` keeps the existing fighter-authored head/chest/hand/belt/foot anchors and additionally exposes structure-derived:

- face;
- front/back shoulder;
- front/back hip;
- accessory root.

These are intended for later secondary motion/effect attachment during M3I without requiring Mario-D to guess anatomy or edit B/C fighter files.

### Inspectable quality gates

`VisualQualityGates.ts` supplies render-only inspection for:

- silhouette separation;
- layered identity coverage;
- gameplay-scale cue coverage;
- effects-off action readability;
- pairwise structural separation.

These are regression/architecture gates. They **do not** claim reference likeness or human artistic acceptance by themselves.

## Reference-authority discovery

During audit, Mario-A found a stale Juanchi cue in the existing renderer/test language: “Jacket tied around the waist.”

Authoritative `docs/characters/juanchi/PACKAGE.md` instead fixes the current identity as oversized black `La 56` shirt, black cargos, gold details and belt-stored police cap. This was posted to the squad forum. Mario-B acknowledged it and removed the legacy waist-jacket treatment at its own lane SHA `823589d3707aa2cedbe3b0dd8b946cdc56c4400d`.

## Verification

### Repository verification

Run `35570372141` / #1226 on exact candidate `19b9b901a947a2a7909c2b5aceb2ab542be9d278`:

- coordination contract: PASS;
- full test suite: PASS;
- build: PASS.

### Character Pipeline V2

Run `35570372172` / #39 on the same exact candidate:

- full tests: PASS;
- build: PASS;
- deterministic visual-evidence capture: PASS;
- visual artifact upload: PASS;
- runtime raster/reference guard: PASS.

Evidence artifact:

- artifact ID: `10625831268`;
- SHA-256 digest: `4be81672eff1cde36df6ff3c2ed0f426c62e3a4064c2fa057e5537871f4dd4b4`.

Baseline artifact from base run #36 / `35567747782` was also downloaded and compared file-by-file against M3A. All five PNGs are byte-identical:

- `normal-color.png`;
- `neutral-silhouette.png`;
- `juanchi-vs-el-toro.png`;
- `el-toro-actions.png`;
- `phone-landscape.png`.

That proves M3A introduced no accidental raster regression. It also means M3A by itself is an architecture/gate improvement, not a claim of visible fighter-quality improvement; the visible reconstruction work belongs to B/C/D and the combined M3I candidate.

## Game Development Studio evidence

The authorized local `game-dev` CLI is not installed in this execution environment, so no sealed Game Development Studio run was fabricated or claimed. Repository Character Pipeline V2 CI supplied the deterministic capture/build/raster evidence above. Human artistic acceptance still remains downstream.

## Integration notes for V07-M3I

- Accept the exact M3A delta above rather than a moving branch head.
- Preserve B/C fighter-specific construction; do not use the new metadata to collapse fighters into a shared body implementation.
- Use the new derived anchors only where they materially help D's secondary motion/effects.
- Re-run all four squad visual gates on the integrated candidate.
- M3A green **does not unlock Germinator**. M3I remains blocked until green exact-SHA handoffs exist for M3B, M3C and M3D as well.

## Known risks

- Metadata gates can verify explicit differentiation but cannot judge whether a face actually resembles its reference.
- Phone-scale and reference-fidelity still require the combined rendered candidate and user-visible evidence.
- Any B/C/D semantic conflict with the new shared interfaces must be resolved during M3I rather than silently choosing a merge winner.
