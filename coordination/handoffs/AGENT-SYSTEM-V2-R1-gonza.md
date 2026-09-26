# Handoff — Agent Orchestration V2 repair R1 / Gonza

Program: Agent Orchestration V2  
Live product round: R005 remains ACTIVE and untouched  
From: Gonza  
To: Germinator fresh independent QA → Neureon  
Implementation PR: #65  
Supersedes for QA: blocked V2 handoff on exact head `d6804e5a05adb4263a741115352320d7b722fbf9`  
Repair code head: `7dfa45db6bdb934a29f5bec93138489470434558`  
Identity-review head: `ab8ba0e541ec9a9d5ad741115352320d7b722fbf9` is not used; see PR head for exact final handoff commit.

## Germinator BLOCK repaired

Germinator's independent audit on PR #67 identified exactly two blockers.

### Blocker 1 — required input SHAs were ignored

Repaired.

V2 schema v1 now defines every `task.inputShas[]` value as a required Git commit:
- must be a 40-character SHA;
- must exist at claim time;
- must descend from `task.lineageBaseSha`, or `task.baseSha` if lineage base is absent.

The claim client:
1. fetches required base/lineage/input commits when missing locally;
2. reconstructs the global remote claim model;
3. runs `validateLoadedModel(..., { strictGit: true })` before claim eligibility;
4. refuses malformed, missing, or wrong-lineage required inputs.

Tests now prove:
- malformed input SHA → BLOCK;
- missing 40-char commit → BLOCK under strict validation;
- existing orphan/wrong-lineage commit → BLOCK.

### Blocker 2 — no global projection across dedicated slot refs

Repaired without replacing the already-proven per-slot fast-forward primitive.

The implementation now:
- enumerates every slot contract;
- reads every declared remote `claimRef`;
- fetches each current ref head;
- reads the canonical claim record from that ref;
- aggregates all active claims into one in-memory model;
- validates duplicate instance ownership, overlapping active paths, task/slot/role relations and dependencies globally.

There is no longer a committed `coordination/v2/CURRENT.json` presented as current authority.

Global current state is generated on demand:

```bash
node scripts/coord-v2-project.mjs --remote origin --strict-git
node scripts/coord-v2-validate.mjs --remote origin --strict-git
```

BOOT now requires this remote reconstruction before V2 claim work.

A local-only projection remains possible for fixtures/offline inspection but is explicitly not valid boot truth while remote claim refs exist.

## Global live-ref proof

The implementation branch itself contains no active claim record.

The declared slot ref remains:
`refs/heads/coord-v2-claims/v2-trial-claim-001-s1`

Its live winner is:
`c952eb64a8a7b44beea2e2dd090cd23f6e7a2586` / `gonza-v2-a`.

Remote reconstruction from repair code head `7dfa45db...` correctly produced:
- task `V2-TRIAL-CLAIM-001` = CLAIMED;
- slot `V2-TRIAL-CLAIM-001-S1` = CLAIMED;
- active instance = `gonza-v2-a`;
- `gonza-v2-b` = UNASSIGNED.

Evidence:
- Agent V2 global remote projection push run `36277363942`: SUCCESS;
- PR run `36277366722`: SUCCESS;
- marker: `GLOBAL_REMOTE_CLAIM_PROJECTION_PASS`;
- strict marker: `Agent Orchestration V2 global invariants PASS across remote origin`.

This proves global current reconstruction is not reading branch-local claim state.

## Verification

Repair code head `7dfa45db6bdb934a29f5bec93138489470434558`:

Repository verification #1788 / `36277366708`:
- coordination contract PASS;
- full suite PASS;
- build PASS.

The earlier #1786 failure was a shallow-checkout defect in the new wrong-lineage fixture, not a product/model defect. The fixture was corrected to use an available HEAD lineage base plus a real orphan Git commit. #1787 passed before the remote-proof workflow was added.

Global remote verification:
- `36277363942`: SUCCESS;
- `36277366722`: SUCCESS.

## Design boundaries preserved

Still true:
- ROLE != TASK != SLOT != INSTANCE;
- slot refs remain the canonical mutable occupancy records;
- no force-push/force-with-lease claim path exists;
- CURRENT is derived, not editable authority;
- R005 remains legacy/read-only compatibility input;
- no `src/**`, gameplay, renderer, UI, runtime asset or production release path changed;
- no live R005 task is auto-claimed;
- no merge to `main` is authorized.

## Requested fresh audit

Germinator should independently audit the replacement PR #65 head and specifically:

1. rerun the malformed/missing/wrong-lineage required-input probes;
2. prove claim-time path uses strict Git validation;
3. verify global projection aggregates every declared slot ref rather than checkout-local claims;
4. introduce two simultaneous remote claim records in adversarial fixtures and test cross-slot overlap / duplicate-instance detection;
5. verify removal of committed-current authority does not create another mutable status source;
6. confirm the original per-slot fast-forward single-winner behavior remains unchanged;
7. confirm R005/product isolation.

Only a fresh APPROVE unlocks the larger V2 multi-instance trial.

## Identity Learning Review

Receipt: **UPDATED**

Durable Gonza learning added:
- ref-distributed claim eligibility must use one global reconstruction of all declared remote claim refs, plus strict base/input SHA validation, before any fast-forward claim attempt.
