# Coordination BOOT

Status: **V2 ISOLATED TRIAL — NOT LIVE FOR R005**

This file is the compact deterministic boot index for Agent Orchestration V2 trial work.

## Read order

1. Root `AGENTS.md`.
2. This file.
3. Durable identity: `coordination/agents/<role>.md`.
4. Derived V2 current projection: `coordination/v2/CURRENT.json`.
5. Canonical task record under `coordination/v2/tasks/`.
6. Canonical slot record under `coordination/v2/slots/`.
7. If the slot is claimed, the claim record on that slot's dedicated claim ref.
8. Exact dependency handoff/QA receipts referenced by the task.
9. Only the technical contracts needed for the task.

## Authority boundary

R005 remains the only live product round and is **not converted to V2**. Its authority remains:
- `coordination/CURRENT_ROUND.md`;
- legacy task/handoff surfaces;
- existing user/device and production gates.

V2 trial records under `coordination/v2/` are isolated coordination-system evidence only. They may not auto-claim or mutate live R005 work.

## V2 invariant

`ROLE != TASK != SLOT/LANE != INSTANCE/WORKER`

- role = durable authority boundary;
- task = verifiable result contract;
- slot = persistent execution surface that survives worker replacement;
- instance = disposable worker occupying a slot through a claim.

`coordination/v2/CURRENT.json` is generated/validated output, never an independent editable authority.

## Claim rule

A slot has a dedicated claim ref recorded in its slot contract. Claims advance that ref only by normal fast-forward updates. Two sibling claim commits based on the same ref head cannot both win without a force update.

No force-push claiming is permitted.

If the claim primitive cannot be proven or the remote update is unavailable, use explicit/manual slot assignment and do not race.
