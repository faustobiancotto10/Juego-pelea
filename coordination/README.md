# Multi-Agent Coordination

This directory is the persistent shared workspace for the Juego-pelea agent team.

It is **not part of the game runtime**. Nothing under `coordination/` may be imported, bundled, or executed by the browser game.

## Source of truth

Repository state outranks chat memory. A new or replacement chat must reconstruct the current situation from this directory before acting.

Start with:

1. `PROTOCOL.md`
2. `TOOLING.md`
3. `CURRENT_ROUND.md`
4. `STATUS.md`
5. `LOCKS.md`
6. your file under `agents/`
7. assigned files under `tasks/`
8. relevant threads under `forum/active/`
9. project rules in root `AGENTS.md` and `docs/DECISIONS.md`

## Surfaces

- `PROTOCOL.md` — team constitution and round lifecycle.
- `TOOLING.md` — host capability routing, required fallbacks and truthful tool-use rules.
- `CURRENT_ROUND.md` — only the current round; old instructions never live here.
- `STATUS.md` — current per-agent state.
- `LOCKS.md` — temporary file ownership while agents work.
- `agents/` — persistent identity and responsibilities for each role.
- `forum/active/` — live cross-agent conversations for the current round.
- `tasks/` — active task contracts.
- `handoffs/` — formal transfers between agents/stages.
- `templates/` — canonical structures for threads, tasks, handoffs, same-role squad lanes and archives.
- `archive/` — closed rounds and historical decisions.

When `CURRENT_ROUND.md` is `IDLE`, no agent should invent work. Wait for a new user-approved objective.


## Identity and instances

A durable identity is separate from a temporary chat instance. Any role may scale to N simultaneous instances when CURRENT_ROUND explicitly defines safely separable lanes. Temporary labels such as Mario-A or Ricardo-B inherit one shared durable identity; they are not new permanent roles.

Use `templates/squad-lane.md` for each lane. Every lane must have an exact base/branch, exclusive write surface, dependencies, integration target, exact-SHA handoff and Identity Learning Receipt. Cross-role QA consumes one integrated same-role candidate rather than arbitrary moving lane heads.
