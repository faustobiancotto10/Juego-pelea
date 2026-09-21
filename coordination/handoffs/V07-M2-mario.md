# Handoff — V07-M2

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-M2 — El Toro procedural rig/effects + roster portraits  
From: Mario  
To: Brancaforte V07-B1 + Gonza V07-Z0  
Branch: `round/r005-mario`  
Base M1 SHA: `d55cce8ce7f03a60168697a5a5bbe1c8b5833a24`  
Exact candidate SHA: `a47326093ae004c602e00112ac2ed2226cf738c8`  
Status: GREEN

## Files changed from M1

- `src/game/render/AttackPresentation.ts`
- `src/game/render/CombatEffects.ts`
- `src/game/render/ElToroRig.ts`
- `src/game/render/FightRenderer.ts`
- `src/game/render/FighterRenderer.ts`
- `src/game/render/LocomotionPose.ts`
- `src/game/render/PortraitRenderer.ts`
- `src/game/render/RigAnchors.ts`
- `tests/v07-m2-render.test.mjs`

The temporary V07-M2 screenshot workflow was restored before this handoff; `.github/workflows/repository-verification.yml` is identical to the normal pre-QA workflow in the final candidate.

## Behavior / interface contract

### El Toro
- registered procedural articulated rig at `rigKey: "el-toro"`;
- heavy render-only locomotion style; simulation movement values remain untouched;
- defining procedural identity includes oversized white `TE VOY A CHOCAR` shirt, Scotland scarf, blue wraps, cargo silhouette and shawarma cue;
- Topete uses blue drive presentation while turf impact is emitted from authoritative hit/contact events, not move-frame timing;
- Shawarmazo uses a procedural shawarma projectile plus warm food/debris contact burst;
- projectile visual identity is cached from authoritative projectile spawn events so Shawarmazo contact presentation survives linear projectile despawn / throw recovery;
- Super Eructo uses a bounded translucent green forward blast driven from authoritative Ultimate phase/frame state;
- no renderer-owned collision, damage, hit legality, reach or gameplay tuning.

### Portrait consumer seam
Module: `src/game/render/PortraitRenderer.ts`

Public interface:
- `hasFighterPortrait(portraitKey: string): boolean`
- `drawFighterPortrait(ctx, portraitKey, width?, height?): boolean`
- `mountFighterPortraits(root?: ParentNode): number`

Registered portrait keys:
- `chameleon`
- `supernariz`
- `juanchi`
- `el-toro`

Expected Brancaforte host:
`[data-fighter-portrait][data-portrait-key] > .fighter-portrait-canvas`

Brancaforte owns DOM/card layout. Mario owns portrait pixels. Missing keys render an explicit `MISSING PORTRAIT` diagnostic. No reference raster is cropped, loaded or embedded.

## Verification evidence

TDD RED:
- run #1087 established missing El Toro rig/style/effects/portraits;
- later adversarial RED checks caught two presentation-authority defects before handoff:
  - Topete turf impact tied to move frames instead of contact;
  - Shawarmazo projectile identity lost after projectile despawn.

Final exact-SHA verification:
- candidate: `a47326093ae004c602e00112ac2ed2226cf738c8`;
- GitHub Actions repository verification run #1113 / job 106215359916;
- coordination contract: PASS;
- full suite: **314/314 PASS**;
- build/typecheck: PASS;
- normal CI workflow restored before final run;
- diff from M1 contains only render-layer files plus M2 render tests.

Phone-landscape visual evidence:
- 844×390 evidence run #1101 verified the four procedural portraits and in-fight El Toro presentation surfaces;
- 844×390 visual harness run #1108 verified the four portrait identities and Topete / Shawarmazo / Super Eructo procedural effect primitives;
- final post-visual repairs only changed authoritative contact dispatch/profile resolution; final run #1113 proves those repairs green without changing rig/portrait artwork.

## Known risks

- portrait artwork is intentionally procedural and stylized; it is not raster/source-image fidelity.
- Brancaforte must call the published mount/draw interface on its existing canvas hosts. Until B1 wires that seam, cards may still show its temporary fallback mark.
- final integrated mobile composition remains Gonza Z0 responsibility after B1 is green.

## Unresolved questions

None within frozen M2 scope.

## Downstream eligibility

- V07-M2 is GREEN.
- Brancaforte V07-B1 is now unblocked to consume Mario's portrait interface.
- Gonza V07-Z0 remains gated only by B1 becoming GREEN; Mario dependency is satisfied.
