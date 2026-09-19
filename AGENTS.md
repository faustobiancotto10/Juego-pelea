# Agent Rules

1. Supplied fighter images and sprite sheets are visual references only. Never crop, embed, or load them as runtime fighter sprites/textures.
2. Fighters are reconstructed as procedural articulated 2D vector rigs. If a change turns them into flat moving stickers, reject it.
3. Simulation owns combat truth. Renderer animations never determine hitboxes, damage, stun, or move legality.
4. Logical combat runs at fixed 60 Hz. Do not use wall-clock timers for move frames, stun, cooldowns, or hitstop.
5. Mobile landscape is primary. Keep the playfield clear and controls usable on a phone.
6. Update `docs/CURRENT_MILESTONE.md` when meaningful progress or blockers change.

## Multi-Agent Coordination

When participating in the repository's multi-agent workflow, **before modifying the project** read:

1. `coordination/PROTOCOL.md`
2. `coordination/CURRENT_ROUND.md`
3. `coordination/STATUS.md`
4. `coordination/LOCKS.md`
5. your identity file under `coordination/agents/`
6. assigned task files under `coordination/tasks/`
7. relevant threads under `coordination/forum/active/`

Repository coordination state outranks chat memory.

Do not begin active-round work until the required CHECK_IN is complete and Neureon has posted `START_ROUND`.

Finishing your own task does not end your participation. Continue synchronizing, answering teammates, reviewing and repairing work until Neureon posts `ROUND_COMPLETE`.

Everything under `coordination/` is coordination data only. Never import, bundle or execute it from the game runtime.
