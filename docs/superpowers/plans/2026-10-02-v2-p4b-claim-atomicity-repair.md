# Agent V2 P4-B Claim Atomicity Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace per-slot claim authority with one globally serialized claim authority ref so concurrent claims cannot violate cross-slot instance or owned-path invariants.

**Architecture:** Preserve every failed P4-B per-slot ref as immutable evidence, but stop treating those refs as current authority. Add one V2 claim-authority ref containing the complete active claim set; every claim and reassignment mutates that shared ledger with a normal fast-forward-only push. Because every occupancy mutation contends on one ref, any concurrent sibling mutation has one winner and one non-fast-forward loser before it becomes authoritative.

**Tech Stack:** Node.js ESM, Git refs/fast-forward semantics, node:test, GitHub Actions.

**Spec:** `coordination/v2/trials/PHASE4-MULTI-INSTANCE-CONTRACT.md`

## Global Constraints

- R005/product/runtime/assets remain untouched.
- Preserve the two failed P4-B refs and `coordination/v2/trials/P4-B/FAILURE.md` as evidence.
- No force push or force-with-lease.
- Current state stays derived; no editable CURRENT authority.
- P4-B must be rerun only after Germinator independently approves the replacement exact head.
- Existing slot/work refs remain reconstructable historical evidence.

## Review Focus

- Two concurrent claims by the same instance against different slots: only one authority push can win.
- Two different instances racing the same slot: only one authority push can win.
- Disjoint claims from different instances still succeed sequentially after loser/retry reconstruction.
- Reassignment uses the same global authority ref and cannot race around instance uniqueness.
- Historical per-slot P4-B failure refs never become current occupancy after migration.

### Task 1: RED regression for one global claim authority

**Files:**
- Modify: `tests/coord-v2-model.test.mjs`

**Interfaces:**
- Consumes: existing `loadV2Model`, `withResolvedRemoteClaims`, claim/reassign script source.
- Produces: tests requiring `configDoc.claimAuthorityRef`, one authority reconstruction call, and shared-ref pushes.

- [ ] Write regression tests that fail on the current per-slot architecture.
- [ ] Run repository verification and confirm the failure is caused by the new atomicity assertions.
- [ ] Commit the RED test state.

### Task 2: Implement shared claim authority

**Files:**
- Create: `coordination/v2/config.json`
- Modify: `scripts/lib/coord-v2-model.mjs`
- Modify: `scripts/coord-v2-claim.mjs`
- Modify: `scripts/coord-v2-reassign.mjs`

**Interfaces:**
- Consumes: `configDoc.claimAuthorityRef`.
- Produces: one remote authority head plus the complete active claim set reconstructed from that head.

- [ ] Load and validate V2 config.
- [ ] Reconstruct all claims from one authority ref.
- [ ] Make claim and reassignment commits require checkout at the authority head.
- [ ] Push every occupancy mutation to the authority ref with normal fast-forward only.
- [ ] Run targeted + complete repository verification.

### Task 3: Update evidence/docs/workflows and seed authority

**Files:**
- Modify: `coordination/v2/README.md`
- Modify: `coordination/v2/claims/README.md`
- Modify: `.github/workflows/coord-v2-global-remote.yml`
- Modify: `.github/workflows/coord-v2-phase4-setup.yml` or supersede its obsolete pre-execution assertions for the repaired phase.
- Create: `coordination/handoffs/AGENT-SYSTEM-V2-P4B-REPAIR-gonza.md`

**Interfaces:**
- Produces: exact replacement head, authority ref seed, CI evidence, and Germinator audit request.

- [ ] Document that legacy per-slot refs are historical evidence only.
- [ ] Seed `refs/heads/coord-v2-claims/authority` at the repair head without rewriting failed refs.
- [ ] Verify global projection and strict validation from the authority ref.
- [ ] Record Identity Learning Review.
- [ ] Handoff exact head to Germinator; do not rerun P4-B yet.
