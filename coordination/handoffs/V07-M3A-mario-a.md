# V07-M3A — Mario-A Visual Architecture / Lead Handoff

Task: `V07-M3A`  
Round: `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION`  
Sender: Mario-A / Character & Rendering Engineer  
Recipient: Mario-A / `V07-M3I` temporary squad integrator  
Branch: `round/r005-mario-squad-architect`  
Exact candidate SHA: `d6d1e074526cd1674af4e6103995eda19ab5a46b`  
Base: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`  
Result: **GREEN / HANDOFF_READY**

## Files changed

- `src/game/render/CharacterStructure.ts`
- `src/game/render/RigAnchors.ts`
- `src/game/render/VisualQualityGates.ts` — new
- `tests/v07-m3a-visual-architecture.test.mjs` — new
- `tests/v07-m3-character-pipeline.test.mjs` — shared reference gate repaired to follow Juanchi's authoritative package

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

## Shared Juanchi gate repair

During audit, Mario-A found a stale shared assertion that required the literal renderer cue `Jacket tied around the waist`. That contradicted the authoritative `docs/characters/juanchi/PACKAGE.md`, which fixes the current identity as oversized black `La 56` shirt, black cargos, gold details and belt-stored police cap.

Mario-B correctly removed the legacy waist-jacket treatment at its lane SHA `823589d3707aa2cedbe3b0dd8b946cdc56c4400d`, causing the old shared test to fail. The B failure log confirms test #311 failed exactly on the obsolete jacket regex after the preceding V07-M3 tests passed.

M3A therefore repairs `tests/v07-m3-character-pipeline.test.mjs` to validate the canonical `La 56` / cargo presentation and the authoritative Juanchi package instead of preserving a stale visual cue.

## Verification

### Repository verification

Run `35570843279` / #1252 on exact candidate `d6d1e074526cd1674af4e6103995eda19ab5a46b`:

- coordination contract: PASS;
- full test suite: PASS;
- build: PASS.

A duplicate recheck (#1253) also completed successfully.

### Character Pipeline V2

Run `35570843094` / #45 on the same exact candidate:

- full tests: PASS;
- build: PASS;
- deterministic visual-evidence capture: PASS;
- visual artifact upload: PASS;
- runtime raster/reference guard: PASS.

Evidence artifact:

- artifact ID: `10625618561`;
- SHA-256 digest: `647aef50a584429280301edb7abdbabb3756d5c7ab0f17bf17d0220e59f82073`.

Baseline artifact from base run #36 / `35567747782` was downloaded and compared file-by-file against this final M3A candidate. All five PNGs are byte-identical:

- `normal-color.png`;
- `neutral-silhouette.png`;
- `juanchi-vs-el-toro.png`;
- `el-toro-actions.png`;
- `phone-landscape.png`.

That proves M3A introduced no accidental raster regression. It also means M3A by itself is an architecture/gate improvement, not a claim of visible fighter-quality improvement; the visible reconstruction work belongs to B/C/D and the combined M3I candidate.

## Game Development Studio evidence

The authorized local `game-dev` CLI is not installed in this execution environment, so no sealed Game Development Studio run was fabricated or claimed. Repository Character Pipeline V2 CI supplied the deterministic capture/build/raster evidence above. Human artistic acceptance still remains downstream.

## Cross-lane consumption

Mario-B may consume the exact shared gate repair from M3A commit `d6d1e074526cd1674af4e6103995eda19ab5a46b` for `tests/v07-m3-character-pipeline.test.mjs` only. This does not transfer ownership of A's shared architecture and does not authorize B to modify other A-owned files.

## Integration notes for V07-M3I

- Accept the exact M3A candidate above rather than a moving branch head.
- Preserve B/C fighter-specific construction; do not use the new metadata to collapse fighters into a shared body implementation.
- Use the new derived anchors only where they materially help D's secondary motion/effects.
- Re-run all four squad visual gates on the integrated candidate.
- M3A green **does not unlock Germinator**. M3I remains blocked until green exact-SHA handoffs exist for M3B, M3C and M3D as well.

## Known risks

- Metadata gates can verify explicit differentiation but cannot judge whether a face actually resembles its reference.
- Phone-scale and reference-fidelity still require the combined rendered candidate and user-visible evidence.
- Any B/C/D semantic conflict with the new shared interfaces must be resolved during M3I rather than silently choosing a merge winner.
