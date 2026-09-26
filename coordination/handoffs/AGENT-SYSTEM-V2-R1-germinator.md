# Handoff — Agent Orchestration V2 R1 / Germinator fresh QA

Program: Agent Orchestration V2  
Live product round: R005 remains ACTIVE and untouched  
From: Germinator  
To: Neureon → larger isolated V2 trial  
Audited implementation PR: #65  
Rejected predecessor: `d6804e5a05adb4263a741115352320d7b722fbf9`  
Audited replacement exact head: `083d4715223bb041b59e97b10b6bb973ed3fa665`  
Gonza repair-code head: `7dfa45db6bdb934a29f5bec93138489470434558`  
Validation PR: #68  
QA test head: `31935176dff9cac5886d9269b908ed0888d20abe`

## Verdict

**APPROVE — V2 R1 BLOCKER REPAIR GREEN FOR THE NEXT ISOLATED MULTI-INSTANCE TRIAL**

This approval supersedes Germinator's BLOCK on exact head `d6804e5a...` only.

It does not declare V2 ready for broad adoption.

## Exact replacement verification

PR #65 replacement head:
`083d4715223bb041b59e97b10b6bb973ed3fa665`

GitHub re-check at closeout:
- PR head = audited replacement head;
- compare replacement → current PR head = IDENTICAL.

Repository verification #1791 / `36277447588`:
- coordination contract: **12/12 PASS**;
- full suite: **296/296 PASS**;
- build: **PASS**.

Global remote workflow #8 / `36277447683`:
- reconstructs current state from declared remote slot refs;
- live task = CLAIMED;
- live slot = CLAIMED;
- winner = `gonza-v2-a` ACTIVE;
- loser = `gonza-v2-b` UNASSIGNED;
- marker: `GLOBAL_REMOTE_CLAIM_PROJECTION_PASS`;
- strict marker: `Agent Orchestration V2 global invariants PASS across remote origin`.

## Prior Blocker 1 — required input SHAs

**CLOSED.**

Replacement behavior:
- `task.inputShas` must be an array;
- malformed SHA is an error;
- strict validation requires the commit to exist;
- every required input must descend from `task.lineageBaseSha`, or `task.baseSha` when no lineage base is declared;
- claim client fetches required base/lineage/input commits when needed;
- claim client invokes global model validation with `strictGit:true` before eligibility.

Independent Germinator probes:
1. malformed required input SHA → rejected;
2. missing 40-char required input commit → rejected under strict validation;
3. real orphan input commit outside task lineage → rejected.

## Prior Blocker 2 — no global view across dedicated claim refs

**CLOSED for the next isolated trial.**

Replacement behavior:
- committed `coordination/v2/CURRENT.json` authority was removed;
- each slot's declared remote `claimRef` is resolved;
- every live claim is aggregated into one in-memory model;
- remote-ref resolution errors fail validation closed;
- duplicate instance ownership and active owned-path conflicts are evaluated over the aggregate model;
- claim records are bound to their declared slot refs;
- claim `expectedParentSha` is checked against the actual remote ref parent;
- BOOT requires remote global reconstruction for current truth.

Independent Germinator probes:
1. two disjoint remote claims are both visible simultaneously and both derive CLAIMED/ACTIVE state;
2. the same instance occupying two remote slots is rejected;
3. overlapping active owned paths across two remote refs are rejected;
4. one unresolved declared claim ref makes the global model invalid;
5. claim stored on the wrong slot ref is rejected;
6. expected-parent mismatch against the real ref parent is rejected;
7. no committed V2 CURRENT authority remains.

## Claim primitive regression

The original same-slot fast-forward proof remains accepted.

Germinator previously reproduced independently:
- first sibling update with `force:false` = SUCCESS;
- second sibling update to the same ref = HTTP 422 `Update is not a fast forward`.

Replacement claim client still:
- uses global remote preflight;
- rejects already-claimed slot;
- rejects instance already occupying another slot;
- runs strict Git validation;
- contains no `--force` / `force-with-lease` path.

## Fresh independent QA

Validation PR #68 adds only:
`tests/agent-system-v2-r1-germinator.test.mjs`

Run #1792 / `36277764395`:
- coordination: **12/12 PASS**;
- seven independent R1 adversarial probes: **7/7 PASS**;
- complete suite: **303/303 PASS**;
- build: **PASS**.

## R005 / product isolation

The V2 repair remains coordination/tooling-only.

No R005 product acceptance gate is waived.

Still true:
- R005 remains the only live product round;
- physical iPhone/user acceptance remains separate;
- sprite production-format reconciliation remains separate;
- production root remains unchanged;
- no live R005 task is auto-claimed.

## Remaining trial boundary

This approval authorizes progression to the **larger isolated V2 multi-instance trial** described by the frozen design.

It does not prove:
- cross-ref atomicity for conflicting different-slot claims;
- checkpoint → worker disappearance → replacement;
- branch-without-handoff downstream blocking;
- real stale BLOCK → approved replacement behavior;
- ASTRA post-implementation audit;
- broad V2 adoption.

The larger trial must exercise those behaviors rather than infer them from this gate.

## Downstream

Neureon may accept the R1 repair and start/authorize the next isolated multi-instance trial according to the frozen design.

Do not treat this as Phase-5 adoption approval.

## Identity Learning Review

Receipt: **PROPOSAL**

Durable Germinator lesson for Neureon/consolidation:

> In ref-distributed coordination systems, QA must distinguish global visibility from cross-ref atomicity. Aggregating every live claim before a claim attempt closes stale-view and cross-slot validation gaps, but only an adversarial multi-ref concurrency trial can prove how conflicting claims behave between preflight and commit.
