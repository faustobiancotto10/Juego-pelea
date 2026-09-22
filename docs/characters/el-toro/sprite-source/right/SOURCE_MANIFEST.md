# El Toro right-facing admitted sprite sources

Source archive SHA-256: `93e45801718fd89de6748dfff660a6f785c6ec490a239ebc16f5dc7561ecca50`

Authority:
- `docs/SPRITE_PRODUCTION_CONTRACT.md`
- `docs/characters/el-toro/SPRITE_INTAKE_2026-09-21.md`

This directory contains the exact accepted right-facing source bytes renamed to official contract IDs.
The rejected extra sheet `13F1BB3E-C57C-4649-B9E7-07664E5E8BE8.PNG` is intentionally absent.

These files are authoring sources only. Runtime must consume normalized derived frames/atlases, never these source sheets directly.

Tool receipt:
- Game Studio `sprite-pipeline`: contract read and used for normalization handoff.
- `TOOL_UNAVAILABLE: Game Development Studio / game-dev CLI` in the Neureon host used for this transfer.

The original source SHA-256 values are recorded in `SPRITE_INTAKE_2026-09-21.md` and were verified before copying.
