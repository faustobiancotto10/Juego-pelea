# Task M-201 — Procedural combat presentation

Round: R001-V03-COMBAT-EXPANSION
Owner: Mario
Status: VERIFIED

## Goal

Render the V0.3 mechanics as readable, performant procedural 2D character animation/effects without owning combat truth.

## Dependencies

- START_ROUND
- Ricardo's reviewed render-facing state/event contract for state-dependent behavior

## Allowed files / subsystems

- src/game/render/
- renderer-specific visual helpers/effects
- visual smoke evidence
- branch: round/r001-mario

## Prohibited scope

- deciding hit validity, damage, capture or move legality
- using supplied/reference character images or sprite sheets as runtime fighter frames/textures
- HUD/DOM layout
- release/publishing

## Required collaborators / reviewers

- @Ricardo for authoritative state/timeline events
- @Brancaforte for avoiding HUD/playfield conflicts
- @Germinator for readability/regression review

## Acceptance criteria

- [x] Coletazo has a readable procedural startup/strike/recovery presentation
- [x] Tramontana reads as Supernariz's close special
- [x] Camaleoni ultimate shows startup, invisibility/near-invisibility, dash, guaranteed-sequence presentation and reappearance
- [x] Supernariz ultimate shows inhale/suction, capture sequence, nazazo and launch
- [x] Push Guard, Guard Break, normal/heavy/block/ultimate impacts are visually distinguishable
- [x] hitstop/screen shake/camera emphasis are restrained and event-driven
- [x] renderer never changes simulation outcome
- [x] effects are bounded for mobile performance
- [x] fighters remain procedural articulated rigs, not flat imported stickers

## Required tests / evidence

- [x] typecheck/build on branch
- [x] visual smoke for both fighters and new states
- [x] evidence no forbidden runtime reference-image loading was introduced
- [x] mobile-landscape readability check
- [x] commit SHA + render contract handoff

## Related forum threads

- coordination/forum/active/r001-combat-contract.md
- coordination/forum/active/r001-integration-release.md

## Checkpoints

- first checkpoint: answer/review Ricardo's proposed render-facing contract
