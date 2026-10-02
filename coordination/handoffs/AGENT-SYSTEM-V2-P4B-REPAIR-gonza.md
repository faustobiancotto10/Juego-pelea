# Handoff — Agent Orchestration V2 P4-B atomicity repair / Gonza

Program: Agent Orchestration V2  
Live product round: R005 remains ACTIVE and untouched  
From: Gonza  
To: Germinator fresh independent QA  
Repair PR: #73  
Failed trial source: PR #72 / `coordination/v2/trials/P4-B/FAILURE.md`  
Exact repair candidate / live claim-authority head: `fc8d65c2a71059768f9d91b597370e4d4d1cd940`  
Claim authority ref: `refs/heads/coord-v2-claims/authority`

## Root cause

P4-B proved that the previous model did not provide cross-slot atomicity.

The old design reconstructed all slot claim refs before a claim, but the final compare-and-swap happened only on the **target slot ref**. The invariant under test — one INSTANCE may occupy only one SLOT — spans more than one independently writable ref.

Therefore two workers could both read a globally valid unassigned snapshot and then successfully fast-forward two different refs with the same instance. Global validation detected the split-brain only after both writes had already become authoritative.

This was an architectural concurrency defect, not a missing validation rule.

## Repair

Current occupancy is now serialized through one shared mutable authority:

`refs/heads/coord-v2-claims/authority`

`coordination/v2/config.json` declares that ref.

For every claim or reassignment:

1. reconstruct the complete active claim ledger from the exact shared authority head;
2. run strict global validation;
3. verify target slot, instance, dependencies and global owned-path invariants;
4. create the occupancy mutation as a child of that exact authority head;
5. push the mutation only to the shared authority ref using a normal fast-forward update;
6. if another occupancy mutation advanced the authority first, lose the race and reconstruct current state before retrying.

Two concurrent occupancy mutations from one parent are now sibling commits targeting **the same ref**. They cannot both fast-forward.

The work refs remain independent. Only claim/reassignment admission is globally serialized.

## Failure evidence preserved

The original unsafe winners remain unchanged and are no longer read as current authority:

- `refs/heads/coord-v2-claims/p4-b-one` → `1c9af565548364800928ca013d8b52917ce87928`
- `refs/heads/coord-v2-claims/p4-b-two` → `47ce3ceb3346a916d5d6a6e7c341bb2b0dabd7e6`

CI explicitly verifies both refs still resolve to those exact failure heads.

No manual cleanup/reset was used to manufacture a green result.

## Files / surfaces changed

- `coordination/v2/config.json`
- `coordination/BOOT.md`
- `coordination/v2/README.md`
- `coordination/v2/claims/README.md`
- `scripts/lib/coord-v2-model.mjs`
- `scripts/coord-v2-claim.mjs`
- `scripts/coord-v2-reassign.mjs`
- `tests/coord-v2-model.test.mjs`
- `tests/coord-v2-phase4-setup.test.mjs`
- `.github/workflows/coord-v2-global-remote.yml`
- `.github/workflows/coord-v2-phase4-setup.yml`
- Gonza durable role learning / repair lock history
- implementation plan under `docs/superpowers/plans/`

No `src/**`, gameplay, renderer, UI, game runtime, sprite asset, release artifact or R005 product surface changed.

## TDD evidence

RED — commit `dea6e08693d37014e7106131d01b901f3dbd6d61`:
- Repository verification run #1809 / `37046266394`: expected FAILURE;
- 307 total tests;
- 305 PASS / 2 FAIL;
- the two failures were the new regression requirements:
  - one globally serialized remote claim snapshot;
  - claim/reassign clients mutate shared authority rather than per-slot refs.

GREEN / final repair candidate `fc8d65c2a71059768f9d91b597370e4d4d1cd940`:

Repository verification #1821 / `37047516796`:
- coordination contract: 12/12 PASS;
- full suite: **307/307 PASS**;
- build: PASS.

Agent V2 global remote projection #31 / `37047516793`:
- `GLOBAL_REMOTE_PROJECTION_PASS tasks=9 slots=9 active=0`;
- `Agent Orchestration V2 global invariants PASS across remote origin`.

Phase 4 repaired authority preflight #14 / `37047516745`:
- `PHASE4_REPAIRED_AUTHORITY_PASS head=fc8d65c2a71059768f9d91b597370e4d4d1cd940`;
- `PHASE4_FAILURE_EVIDENCE_PRESERVED_PASS`;
- all eight declared P4 work refs resolve;
- P4-A remains VERIFIED;
- P4-B/C/D/E derive the expected post-stop readiness/dependency states under the empty repaired authority ledger;
- all P4 disposable instances derive UNASSIGNED.

## Known tradeoff

Occupancy admission is intentionally serialized globally. In a future very large worker fleet, claim throughput is bounded by the shared authority ref and contending workers may need to reread/retry.

That is an accepted safety tradeoff for the current Git-native design. Work execution after admission remains parallel and independent by slot/work ref.

## Stop boundary

**P4-B has NOT been rerun.**

The frozen routing remains:

Gonza repair → **Germinator independent audit** → only after APPROVE may the same adversarial P4-B race be rerun.

P4-C, P4-D and P4-E remain downstream of a green P4-B rerun.

No broad V2 adoption and no merge to main are authorized by this handoff.

## Requested Germinator audit

Audit exact candidate `fc8d65c2a71059768f9d91b597370e4d4d1cd940` and the live authority ref. Specifically verify:

1. the remote model reads exactly one claim-authority snapshot, not the legacy per-slot refs;
2. claim and reassignment both require local HEAD to equal the fetched authority head;
3. both mutation paths push only by normal fast-forward to the authority ref;
4. same-instance/different-slot, same-slot/different-instance and overlapping-owned-path conflicts cannot both become authoritative from one parent;
5. historical P4-B failure refs remain intact but state-ineffective;
6. strict task/input SHA, dependency, QA and handoff invariants remain intact;
7. no R005/product/runtime/assets mutation occurred.

If APPROVE, hand control back for the frozen P4-B adversarial rerun. Do not skip directly to P4-C.

## Identity Learning Review

Receipt: **UPDATED**

Durable Gonza learning added:

When an invariant spans more than one independently writable resource, global read-time validation plus per-resource CAS is insufficient. All mutations that can violate that invariant must serialize through one shared fast-forward authority or another genuinely transactional primitive.
