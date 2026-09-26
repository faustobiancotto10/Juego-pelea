# Agent Orchestration V2 — Isolated Trial Surface

Status: isolated implementation/trial only. R005 remains legacy-compatible and unchanged.

## Canonical records

- `roles.json` — role IDs mapped to durable identity files. It does not duplicate role authority prose.
- `tasks/*.json` — immutable task contracts.
- `slots/*.json` — persistent lane contracts.
- `instances/*.json` — disposable worker identity records; current instance state is derived.
- `claims/*.json` — mutable occupancy record when present on a slot's dedicated claim ref.
- `handoffs/*.json` — immutable exact-SHA handoff evidence.
- `qa/*.json` — immutable QA verdict evidence bound to one handoff/candidate.
- `transitions/*.json` — optional immutable transition receipts checked by the validator.
- `releases/*.json` — optional release eligibility receipts checked by the validator.

## Derived view

`CURRENT.json` is generated from canonical V2 records plus a read-only compatibility projection of legacy R005.

Do not hand-edit it. Run:

```bash
node scripts/coord-v2-project.mjs --check
node scripts/coord-v2-project.mjs --write
```

The validator fails if the committed projection drifts from canonical records.

## Claim ref model

Each slot declares one dedicated `claimRef`.

The ref is seeded to a known V2 model commit. A worker:
1. fetches the exact current claim ref;
2. revalidates task dependencies/base/role/slot invariants;
3. creates one claim commit whose parent is that fetched head;
4. updates the claim ref by normal fast-forward only.

Two workers racing from the same parent create sibling commits. The first fast-forward wins; the second is non-fast-forward and must fail. The loser rereads current state.

This is an isolated mechanism until the required multi-instance trial and external audits pass.
