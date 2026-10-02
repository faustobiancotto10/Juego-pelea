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
7. If claimed, read the claim record from the shared remote claim-authority ref declared in `coordination/v2/config.json`.
8. Exact dependency handoff/QA receipts referenced by the task.
9. Only the technical contracts needed for the task.

Do not use a branch-local claim directory or any legacy per-slot claim ref as current truth. Boot truth is the complete claim ledger on the single shared **claim authority ref**.

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

All current occupancy is serialized through the single `claimAuthorityRef` declared in `coordination/v2/config.json`. Legacy per-slot `claimRef` values remain only as historical evidence from the pre-repair trial.

Before claiming, fetch the authority head and validate the complete claim ledger plus required task base/input SHAs. A claim commit must be a child of that exact authority head and may advance only the authority ref by a normal fast-forward update. Any concurrent sibling mutation loses and must reconstruct current state before retrying.

No force-push claiming is permitted.

If remote authority reconstruction or strict SHA validation is unavailable, use explicit/manual slot assignment and do not race.
