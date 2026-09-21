# Agent Rules

1. Supplied/source fighter images, sprite sheets and general concept sheets are **authoring references only**. Never crop, embed or load them directly as runtime fighter textures.
2. During active R005/V0.7, procedural articulated fighter-body rigs remain the production runtime. After R005 closes, the user-approved sprite migration may create **derived normalized sprite** assets under the approved sprite architecture; final production cutover requires every currently playable fighter to pass the sprite-body acceptance contract.
3. Simulation owns combat truth. Renderer animations never determine hitboxes, damage, stun, move legality, projectile legality, CPU decisions or Clash outcomes.
4. Logical combat runs at fixed 60 Hz. Do not use wall-clock timers for move frames, stun, cooldowns, hitstop or sprite combat timing.
5. Mobile landscape is primary. Keep the playfield clear and controls usable on a phone.
6. Update `docs/CURRENT_MILESTONE.md` when meaningful progress or blockers change.
7. Every animation must physically communicate the action it represents. Position translation alone does not constitute a valid animation. Apply the reusable [animation-quality contract](docs/superpowers/specs/2026-09-20-v06-animation-quality-contract.md); preparation, force production, movement/contact and recovery must remain readable without effects.

## Multi-Agent Coordination

When participating in the repository's multi-agent workflow, **before modifying the project** read:

1. `coordination/PROTOCOL.md`
2. `coordination/TOOLING.md`
3. `coordination/CURRENT_ROUND.md`
4. `coordination/STATUS.md`
5. `coordination/LOCKS.md`
6. your identity file under `coordination/agents/`
7. assigned task files under `coordination/tasks/`
8. relevant threads under `coordination/forum/active/`

Repository coordination state outranks chat memory.

If CURRENT_ROUND declares `Execution mode: AUTO_CHAIN`, there is no per-task CHECK_IN or Neureon gate. Synchronize, verify the written dependencies for your assigned task, and begin immediately when they are satisfied.

A green verified handoff automatically unlocks its downstream task. If you discover a blocker, contract contradiction, regression or scope-changing requirement, stop the affected chain, record it in the active findings thread and tell the user. The user decides whether Neureon audits/replans.

Finishing your own task does not authorize unrelated scope. Remain available for targeted repairs/reviews until `ROUND_COMPLETE`.

### Durable role memory

Agent chats are replaceable execution instances; durable role identity lives in `coordination/agents/`.

After a meaningful completed task, each agent performs the identity-learning review defined in `coordination/PROTOCOL.md`. Only stable, evidence-backed, role-specific operational lessons may be added to that agent's own **Durable role learnings** section. This mechanism may not change authority, scope, mission, prohibitions, product decisions or current round state.

Everything under `coordination/` is coordination data only. Never import, bundle or execute it from the game runtime.
