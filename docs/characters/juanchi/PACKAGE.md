# Juanchi Character Package

ID: `juanchi`  
Version: 1.0  
Round: `R004-V06-CONTENT-EXPANSION`  
Status: CONTRACT_READY / VISUAL_REFERENCE_SUPPLIED  
User authority: direct visual references supplied 2026-09-20.

## Authoritative references

Identity master source SHA-256:
`05c1f7107c49caa65bb719ce6ca17c45f47f2667523f77d7214ed82b6d3226b8`

Pose/action sprite-sheet source SHA-256:
`981912f6c3aed94dd51ccef0356045ffa5395814daeb559bf264cb59692e8639`

Repository authoring copies:
- `docs/characters/juanchi/references/master-reference.webp` — 500×375 derivative, SHA-256 `861d41dcb54e6dea03ba928d74c255f5a95f565121aecdfdb0b5570eec222be6`
- `docs/characters/juanchi/references/action-sheet-reference.webp` — 320×240 derivative, SHA-256 `0f82c25b04731485e58960fa342b898033692de1e834c0f2389bc6e1b77fa00b`

The original user-supplied source hashes above remain the authority; the WebP copies are compact derivatives for agent access.

The identity master has priority for face, hair, proportions, clothing and prop identity. The action sheet has priority for pose language/action intent when it does not contradict the identity master.

Reference images are authoring-only. They must never be imported, bundled, cropped or rendered as runtime fighter sprites/textures.

## Frozen identity

- dark curly hair with close/faded sides;
- oversized black `La 56` shirt;
- black cargo pants;
- black/white sneakers with gold accents;
- gold chain/details;
- rugby ball when available;
- dark police-style cap stored at belt outside Ultimate;
- athletic youthful stylized fighter silhouette;
- black/gold visual identity with enough edge separation for night stages.

## Contracts

- gameplay/system: ../../superpowers/specs/2026-09-20-v06-content-expansion-design.md
- gameplay detail: ../../superpowers/specs/2026-09-20-v06-juanchi-character-contract.md
- animation: ../../superpowers/specs/2026-09-20-v06-animation-quality-contract.md
- Clash: ../../superpowers/specs/2026-09-20-v06-ultimate-clash-contract.md
- package pipeline: ../../superpowers/specs/2026-09-20-v06-character-package-pipeline.md
- stage: ../../superpowers/specs/2026-09-20-v06-cancha56-stage-contract.md
- UI: ../../superpowers/specs/2026-09-20-v06-fighting-game-ui-flow.md

## Runtime deliverables

- typed `CombatCharacterContent` registration;
- procedural articulated Juanchi rig;
- boomerang projectile handler;
- Fricción authored multi-contact presentation;
- Police Cap Rage presentation/capture integration;
- CPU tactics/availability data;
- fighter-select metadata;
- ball availability UI;
- tests and integrated acceptance evidence.

## Likeness gate

Mario may implement against these references immediately. Final visual acceptance still requires a rendered comparison against the identity master and user-visible phone evidence; the master itself is never runtime art.
