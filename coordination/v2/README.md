# Agent Orchestration V2 — Isolated Trial Surface

Status: isolated implementation/trial only. R005 remains legacy-compatible and unchanged.

## Canonical records

- `config.json` — global V2 coordination primitives, including the single shared `claimAuthorityRef`.
- `roles.json` — role IDs mapped to durable identity files. It does not duplicate role authority prose.
- `tasks/*.json` — immutable task contracts.
- `slots/*.json` — persistent lane contracts.
- `instances/*.json` — disposable worker identity records; current instance state is derived.
- `claims/*.json` — mutable occupancy records stored together on the single shared claim-authority ref.
- `handoffs/*.json` — immutable exact-SHA handoff evidence.
- `qa/*.json` — immutable QA verdict evidence bound to one handoff/candidate.
- `transitions/*.json` — optional immutable transition receipts checked by the validator.
- `releases/*.json` — optional release eligibility receipts checked by the validator.

## Global derived current view

There is intentionally **no committed editable CURRENT authority** for V2.

Current state is reconstructed mechanically by fetching the single `claimAuthorityRef` declared in `config.json`, reading the complete active claim ledger at that exact head, combining it with the canonical task/slot/instance contracts, then deriving one projection.

Use:

```bash
node scripts/coord-v2-project.mjs --remote origin --strict-git
node scripts/coord-v2-validate.mjs --remote origin --strict-git
```

A local-only projection may be printed without `--remote` for fixtures/offline inspection, but it is not valid boot/current truth while the remote claim authority exists.

This design keeps `CURRENT` derived rather than creating another editable source of ownership truth.

## Required input SHA semantics

For V2 schema v1, every value in `task.inputShas[]` is a required Git commit:
- it must be a 40-character SHA;
- it must exist at claim time;
- it must descend from `task.lineageBaseSha`, or from `task.baseSha` when no lineage base is declared.

Claim-time validation runs with strict Git checks. Malformed, missing or wrong-lineage required inputs block the claim.

## Claim authority model

All current occupancy mutations share one Git ref:

`refs/heads/coord-v2-claims/authority`

The exact ref is declared by `coordination/v2/config.json`. Slot records retain their older per-slot `claimRef` values only so pre-repair trial evidence can be reconstructed; those refs are **historical evidence, not current occupancy authority**.

Before a claim or reassignment, the worker:
1. fetches the shared authority head and reconstructs the complete active claim ledger;
2. validates role/task/slot/instance relations, dependencies, required base/input SHAs and all global active-claim invariants;
3. verifies the target slot and worker are globally unoccupied;
4. creates one occupancy mutation commit whose parent is the exact fetched authority head;
5. updates only the shared authority ref by normal fast-forward.

Concurrent occupancy mutations from the same authority parent are sibling commits targeting the same ref. At most one can fast-forward. Every loser must reconstruct the new authority head and retry from current global state. This serializes global constraints such as one-instance/one-slot and active owned-path overlap without serializing the actual work branches after claims are admitted.

No force-push claiming is permitted. The failed P4-B per-slot refs remain untouched as architectural failure evidence.

This remains isolated until repaired Phase 4 is independently audited and the adversarial P4-B scenario is rerun successfully.

