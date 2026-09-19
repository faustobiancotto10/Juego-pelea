# R001 / V0.3 Combat Expansion — Multi-Agent Implementation Plan

Round: R001-V03-COMBAT-EXPANSION
Product spec: `docs/superpowers/specs/2026-09-19-combat-expansion-v03-design.md`

## Purpose

Ship V0.3 while deliberately exercising cross-agent contracts, forum discussion, branch isolation, QA feedback loops and integration/release.

## Required team

All six roles are required: Neureon, Ricardo, Mario, Brancaforte, Germinator and Gonza.

## Workstreams

- N-001 — coordination, decision promotion, state transitions and closure.
- R-101 — simulation, fighter kits, SUPER/ultimates, corner defense, balance and CPU.
- M-201 — procedural fighter animation/effects/camera/game-feel presentation.
- B-301 — input chord/context handling, HUD, controls/help and mobile UX.
- G-401 — adversarial QA, deterministic/balance scenarios and coordination audit.
- Z-501 — integration planning, accepted-commit integration, standalone build, Pages release.

## Dependency shape

Ricardo owns combat truth and must publish a minimal stable state/action/event contract early in ACTIVE.

Mario and Brancaforte may explore/read immediately after START_ROUND, but state-dependent implementation must follow the agreed contract rather than infer simulation behavior.

Germinator audits from the beginning, not only at the end, and may return findings to any owner.

Gonza reviews integration risk early and performs final integration only from accepted handoffs after Germinator's required validation evidence.

## Branch policy for this round

Authoritative coordination files are read from and written to `main`.

Product implementation uses isolated branches:
- `round/r001-ricardo`
- `round/r001-mario`
- `round/r001-brancaforte`
- `round/r001-germinator`
- `round/r001-integration` (Gonza)

Neureon does not own a product-code branch.

Agents must not commit feature code directly to `main`. Forum/status/task/lock/handoff coordination updates go to `main` so every chat sees the same live state.

Before product commits, agents re-read coordination state from `main`.

Gonza must not allow stale coordination copies from feature branches to overwrite authoritative `main` coordination state during integration.

## Phase A — CHECK_IN

No product implementation.

All required agents read role/protocol/round/status/locks/tasks/forum and append PRESENT with READY or WAITING to the check-in thread.

When all six are present, Neureon posts START_ROUND and changes global state to ACTIVE.

## Phase B — contract convergence

Ricardo proposes:
- snapshot fields;
- action intents;
- SUPER/capture/Push Guard state;
- move/event hooks needed by render/UI;
- initial tuning values.

Mario and Brancaforte review only the contracts they consume.
Germinator challenges ambiguity, dominance and testability.
Neureon resolves product-intent disputes and promotes durable decisions.

## Phase C — parallel implementation

Ricardo, Mario and Brancaforte implement on their branches with local/targeted tests.
Germinator builds/extends adversarial test scenarios and audits cross-branch assumptions.
Agents keep live forum conversations for questions, discoveries, bugs and interface requests.

## Phase D — VALIDATION

Neureon moves global state to VALIDATION only when implementation handoffs/evidence are sufficient.

Germinator runs regression, interaction and balance scenarios and posts an explicit verdict/blocker list.
Owners repair findings on their branches and remain available.

## Phase E — RELEASE

After QA acceptance, Neureon moves to RELEASE.
Gonza integrates accepted SHAs to `round/r001-integration`, resolves conflicts with owners, runs the full suite/build/smoke path, updates standalone play.html and publishes/synchronizes GitHub Pages.

Gonza may issue BLOCK_RELEASE.

## Phase F — closure

Neureon verifies all required evidence, promotes durable decisions, records workflow retrospective, archives the round, posts ROUND_COMPLETE and resets active coordination surfaces to IDLE.

## Workflow success criteria

The game feature set ships, and the round leaves evidence that:
- every required agent checked in;
- cross-role contracts were discussed rather than guessed;
- at least the required task evidence exists;
- no unowned overlapping edit silently bypassed locks;
- QA findings had explicit owners/resolutions;
- integration used accepted SHAs;
- the public artifact matches approved source;
- workflow problems discovered during the round are captured for protocol improvement.
