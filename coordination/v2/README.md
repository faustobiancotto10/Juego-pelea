# Agent Orchestration V2 — Isolated Trial Surface

Status: isolated implementation/trial only. R005 remains legacy-compatible and unchanged.

## Canonical records

- `roles.json` — role IDs mapped to durable identity files. It does not duplicate role authority prose.
- `tasks/*.json` — immutable task contracts.
- `slots/*.json` — persistent lane contracts.
- `instances/*.json` — disposable worker identity records; current instance state is derived.
- `claims/*.json` — mutable occupancy record stored only on each slot's dedicated claim ref.
- `handoffs/*.json` — immutable exact-SHA handoff evidence.
- `qa/*.json` — immutable QA verdict evidence bound to one handoff/candidate.
- `transitions/*.json` — optional immutable transition receipts checked by the validator.
- `releases/*.json` — optional release eligibility receipts checked by the validator.

## Global derived current view

There is intentionally **no committed editable CURRENT authority** for V2.

Current state is reconstructed mechanically by fetching every `claimRef` declared by every slot, aggregating those claim records with the canonical task/slot/instance contracts, then deriving one projection.

Use:

```bash
node scripts/coord-v2-project.mjs --remote origin --strict-git
node scripts/coord-v2-validate.mjs --remote origin --strict-git
```

A local-only projection may be printed without `--remote` for fixtures/offline inspection, but it is not valid boot/current truth while remote claim refs exist.

This design keeps `CURRENT` derived rather than creating another editable source of ownership truth.

## Required input SHA semantics

For V2 schema v1, every value in `task.inputShas[]` is a required Git commit:
- it must be a 40-character SHA;
- it must exist at claim time;
- it must descend from `task.lineageBaseSha`, or from `task.baseSha` when no lineage base is declared.

Claim-time validation runs with strict Git checks. Malformed, missing or wrong-lineage required inputs block the claim.

## Claim ref model

Each slot declares one dedicated `claimRef`.

Before a claim, the worker:
1. reconstructs **all** declared slot claim refs, not only its target slot;
2. validates role/task/slot/instance relations, dependencies, required base/input SHAs and global active-claim invariants;
3. verifies the target slot and worker are globally unoccupied;
4. creates one claim commit whose parent is the fetched target claim-ref head;
5. updates that claim ref by normal fast-forward only.

Two workers racing from the same parent create sibling commits. The first fast-forward wins; the second is non-fast-forward and must fail. The loser reconstructs global current state and retries only if another eligible slot exists.

No force-push claiming is permitted.

This remains isolated until the required larger multi-instance/replacement trial and downstream audits pass.
