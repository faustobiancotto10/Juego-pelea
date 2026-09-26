# Coordination BOOT

Status: **V2 ISOLATED TRIAL — NOT LIVE FOR R005**

This file is the compact deterministic boot index for Agent Orchestration V2 trial work.

## Read order

1. Root `AGENTS.md`.
2. This file.
3. Durable identity: `coordination/agents/<role>.md`.
4. Reconstruct the **global V2 current projection**:
   `node scripts/coord-v2-project.mjs --remote origin --strict-git`
5. Canonical task record under `coordination/v2/tasks/`.
6. Canonical slot record under `coordination/v2/slots/`.
7. If claimed, read the claim record from that slot's declared remote claim ref.
8. Exact dependency handoff/QA receipts referenced by the task.
9. Only the technical contracts needed for the task.

Do not use a branch-local claim directory as current truth when remote claim refs exist. Boot truth is the aggregate of **all declared slot claim refs**.

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

Global current state is generated from canonical records and remote claims; it is never an independent editable authority.

## Claim rule

A slot has a dedicated claim ref recorded in its slot contract. Before claiming, fetch and validate **all** slot claim refs plus required task base/input SHAs. Claims advance only the target ref by normal fast-forward update.

No force-push claiming is permitted.

If remote claim aggregation or strict SHA validation is unavailable, use explicit/manual slot assignment and do not race.
