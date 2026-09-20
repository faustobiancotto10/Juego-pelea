# Agent Rules

1. Supplied fighter images and sprite sheets are visual references only. Never crop, embed, or load them as runtime fighter sprites/textures.
2. Fighters are reconstructed as procedural articulated 2D vector rigs. If a change turns them into flat moving stickers, reject it.
3. Simulation owns combat truth. Renderer animations never determine hitboxes, damage, stun, or move legality.
4. Logical combat runs at fixed 60 Hz. Do not use wall-clock timers for move frames, stun, cooldowns, or hitstop.
5. Mobile landscape is primary. Keep the playfield clear and controls usable on a phone.
6. Update `docs/CURRENT_MILESTONE.md` when meaningful progress or blockers change.
7. Every animation must physically communicate the action it represents. Position translation alone does not constitute a valid animation. Apply the reusable [animation-quality contract](docs/superpowers/specs/2026-09-20-v06-animation-quality-contract.md); preparation, force production, movement/contact and recovery must remain readable without effects.

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

If CURRENT_ROUND declares `Execution mode: AUTO_CHAIN`, there is no per-task CHECK_IN or Neureon gate. Synchronize, verify the written dependencies for your assigned task, and begin immediately when they are satisfied.

A green verified handoff automatically unlocks its downstream task. If you discover a blocker, contract contradiction, regression or scope-changing requirement, stop the affected chain, record it in the active findings thread and tell the user. The user decides whether Neureon audits/replans.

Finishing your own task does not authorize unrelated scope. Remain available for targeted repairs/reviews until `ROUND_COMPLETE`.

Everything under `coordination/` is coordination data only. Never import, bundle or execute it from the game runtime.
