# R005 Mario Multi-Instance Squad

Status: ACTIVE / USER AUTHORIZED
Durable identity: Mario
Purpose: maximize visual quality of the four released fighters through isolated parallel same-role lanes.

## Registration

Temporary labels:
- Mario-A — Visual Architect / Lead
- Mario-B — El Toro + Juanchi
- Mario-C — Camaleoni + Supernariz
- Mario-D — Motion / Presentation / FX

Each chat instance must post/register its label before material edits and re-read CURRENT_ROUND, STATUS, LOCKS and its task.

## Branches

- Mario-A: `round/r005-mario-squad-architect`
- Mario-B: `round/r005-mario-squad-toro-juanchi`
- Mario-C: `round/r005-mario-squad-camaleoni-supernariz`
- Mario-D: `round/r005-mario-squad-motion-fx`
- integration: `round/r005-mario-squad-integration`

All lanes start from exact visual base:
`032b1bb28c5dd4421e5772cc40ab007f42e4d462`

## Ownership

### Mario-A
Shared structure, procedural anatomy/silhouette primitives, quality gates, integration contracts.

### Mario-B
El Toro + Juanchi fighter-specific reconstruction.

### Mario-C
Camaleoni + Supernariz fighter-specific reconstruction.

### Mario-D
Shared locomotion, presentation poses, attack body-language and effects.

## Rules

- Same durable identity does not mean same-file concurrent writes are safe.
- Every material shared-file edit requires a live LOCK.
- If a lane needs another lane's file/interface, post REQUEST/QUESTION here instead of editing across ownership.
- Same-role disagreement is resolved here; scope/authority disputes escalate through normal protocol.
- No lane may alter gameplay/balance.
- Reference images remain authoring authority only, never runtime fighter sprites.
- `@Game Development Studio` visual debugging/asset-production workflows are authorized as bounded authoring/evidence tools when available; their measurements do not substitute for human artistic acceptance.

## Quality procedure

REFERENCE ANALYSIS → STRUCTURE → LIKENESS → MOTION → EFFECTS → PHONE-SCALE VALIDATION

Mandatory gates:
1. Silhouette gate.
2. Identity/reference-fidelity gate.
3. Gameplay-scale gate.
4. Effects-off action-readability gate.

## Cross-instance requests

Use this section for QUESTION / REQUEST / ANSWER / DISCOVERY messages that affect another Mario lane.

## Integration

When A/B/C/D each leave a green exact-SHA handoff, Mario-A switches to V07-M3I and composes the integration branch. Germinator audits only the integrated candidate.
