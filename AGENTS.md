# Agent Rules

1. Supplied fighter images and sprite sheets are visual references only. Never crop, embed, or load them as runtime fighter sprites/textures.
2. Fighters are reconstructed as procedural articulated 2D vector rigs. If a change turns them into flat moving stickers, reject it.
3. Simulation owns combat truth. Renderer animations never determine hitboxes, damage, stun, or move legality.
4. Logical combat runs at fixed 60 Hz. Do not use wall-clock timers for move frames, stun, cooldowns, or hitstop.
5. Mobile landscape is primary. Keep the playfield clear and controls usable on a phone.
6. Update `docs/CURRENT_MILESTONE.md` when meaningful progress or blockers change.
