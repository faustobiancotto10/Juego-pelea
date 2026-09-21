# Tool Capability Contract

Repository instructions may route capabilities but **cannot install or enable** a ChatGPT plugin, connector, local CLI, credential, or host feature inside another chat. Availability is session/host-specific.

## Universal rule

Before claiming a named tool/plugin was used, the agent must have actual access to it in the current session.

When a required capability is unavailable:
1. record `TOOL_UNAVAILABLE: <capability>`;
2. do not fabricate tool output or imply the capability ran;
3. continue with repository-native alternatives only when the task's acceptance evidence can still be proved;
4. block or escalate when the missing capability is required evidence rather than optional assistance.

Repository authorization means an agent **may** use a capability when present. It does not prove that a later replacement chat has that plugin, connector or CLI installed.

## Superpowers

When exposed by the host, use the applicable process skills before mutation:
- `brainstorming` for architecture or behavior design;
- `writing-plans` for approved multi-step implementation;
- `test-driven-development` for features and bug fixes;
- `systematic-debugging` for unexpected failures;
- `dispatching-parallel-agents` or `subagent-driven-development` only when real subagent capability exists and work is safely separable;
- `verification-before-completion` before success claims.

A repository mention of Superpowers is a process requirement when those skills are exposed. It is not permission to invent a subagent or tool that the current host does not provide.

## Game Studio

For this existing browser game, prefer the most specific exposed capability:
- `web-game-foundations` for simulation/render/input/asset boundaries;
- `sprite-pipeline` for 2D sprite generation, normalization and preview workflow;
- `game-playtest` for browser smoke and visual QA;
- `game-ui-frontend` for HUD/menu surfaces.

Do not migrate this existing TypeScript/Canvas2D game to Phaser merely because Phaser is the plugin's default for new 2D projects. An engine migration requires its own user-approved decision.

## Game Development Studio

When exposed by the host, Game Development Studio is authorized only for workflows its skills actually support:
- game asset production, inspection and normalization;
- asset package vendoring;
- deterministic visual debugging and capture;
- bounded, measurable performance optimization.

Its durable local interface is the `game-dev` CLI. Environment checks are:

```bash
game-dev --version
game-dev capabilities --json
game-dev doctor --json
```

Do not request, reveal, store or copy provider credentials into repository/chat arguments.

For visual-debugging work, measurements and captures are evidence; they do not replace human artistic acceptance. For performance work, target-device evidence outranks theoretical compressed asset size.

## Capability receipt

When a named capability materially affects a task, the handoff should state one of:
- `TOOL_USED: <capability> — <evidence>`
- `TOOL_UNAVAILABLE: <capability> — <fallback or blocker>`

Do not add ceremonial tool receipts for capabilities irrelevant to the task.
