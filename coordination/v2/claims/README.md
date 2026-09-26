# Claims

Claim JSON files exist only on the dedicated slot claim ref while a slot is occupied.

A claim is current occupancy authority. Instance/task/slot files do not copy current occupancy or current state.

Claim schema fields:
- `id`;
- `slotId`;
- `taskId`;
- `roleId`;
- `instanceId`;
- `expectedParentSha`.

The validator rejects mismatched role/task/slot relationships, duplicate occupancy and claims whose dependencies are not satisfied.
