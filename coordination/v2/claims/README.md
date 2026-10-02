# Claims

Claim JSON files are the current occupancy ledger and exist together on the single shared claim-authority ref declared by `coordination/v2/config.json`.

A claim is current occupancy authority. Instance/task/slot files do not copy current occupancy or current state. Legacy per-slot claim refs are preserved only as historical evidence from the pre-repair architecture and MUST NOT be read as current ownership.

Claim schema fields:
- `id`;
- `slotId`;
- `taskId`;
- `roleId`;
- `instanceId`;
- `expectedParentSha` — the exact shared authority head that was parent of the occupancy mutation creating or replacing this claim.

The validator rejects mismatched role/task/slot relationships, duplicate occupancy, claims whose dependencies are not satisfied, claims loaded from a non-authority ref, and claim records whose expected parent does not match their actual authority-ref mutation parent.

Every occupancy mutation advances the same authority ref by normal fast-forward only. No force update may be used to resolve contention.
