# Handoff — Agent System Phase 0 / Neureon

Program: Agent Orchestration V2 migration proposal  
Live product round: R005 remains ACTIVE and unchanged in scope  
From: Neureon  
To: Germinator independent coordination QA  
Branch: `coordination/neureon-phase0-astra-handoff`  
Draft PR: #63  
Phase-0 coordination candidate: `53429b5f5cc2069ea1057715958cf98ce8f9b6a8`

## Inputs incorporated

- ASTRA product/master audit draft PR #61: only its coordination finding A-001/M-002 is consumed here; product sprite findings remain separate and are not silently implemented.
- ASTRA agent-system audit draft PR #62: state drift, current-vs-history ambiguity, multi-instance design and migration proposal are accepted as design inputs, not merged operational rules.

## Phase 0 changes

- coordination test now validates every STATUS instance row, not only the six durable-role rows;
- coordination test now validates every task `Status:` token against the protocol vocabulary;
- `HANDOFF_CONSUMED` was removed from STATUS as a state:
  - Mario → VERIFIED;
  - Mario-A → VERIFIED;
  - Mario-B → HANDOFF_READY;
- V07-SPR-MB informal state token normalized to `HANDOFF_READY`; consumption preserved as an event/evidence note;
- CURRENT_ROUND now has an explicit current operational snapshot before preserved execution history;
- LOCKS now has an explicit live-lock projection before preserved lock/claim history;
- no product/runtime/source/asset file was changed;
- no R005 human/device, QA, package-format or production-cutover gate was waived.

## TDD evidence

RED 1:
- PR #63 run `36270029240` / Repository verification #1760;
- coordination contract: 9 pass / 2 fail after coverage expansion;
- failures:
  - `invalid state HANDOFF_CONSUMED for Mario`;
  - `invalid task state HANDOFF_READY_BILATERAL_ANCHOR_REVIEW in coordination/tasks/V07-SPR-MB.md`.

GREEN 1:
- run `36270080814` / Repository verification #1761 on `4965285d...`;
- complete workflow SUCCESS after state normalization.

RED 2:
- run `36270120679` / Repository verification #1762;
- new current-vs-history structural gate fails as intended:
  - `CURRENT_ROUND missing current operational snapshot`.

Final exact-head verification is still required after the snapshot/locks/spec/identity commits. Germinator must not infer green from earlier runs.

## Frozen V2 design

Neureon design:
`docs/superpowers/specs/2026-09-26-agent-orchestration-v2-design.md`

Core frozen distinction:

**ROLE ≠ TASK ≠ SLOT/LANE ≠ INSTANCE/WORKER**

Corrections to ASTRA proposal frozen by Neureon:
- slot IDs must survive instance replacement and must not reuse worker labels;
- current STATUS/queue/locks are derived or mechanically checked views, not extra editable authorities;
- checkpoints and handoff consumption are evidence/events, not mandatory task states;
- GitHub CAS/fast-forward claiming is a hypothesis until Gonza proves a real single-winner race in an isolated trial;
- R005 is compatibility input, not a target for wholesale V2 conversion.

## Germinator requested QA

1. Review PR #63 diff and verify no product/runtime paths changed.
2. Verify every STATUS/task state is protocol-valid.
3. Verify Mario/Mario-A/Mario-B semantic states do not change current downstream eligibility or resurrect stale work.
4. Verify CURRENT_ROUND snapshot agrees with G1 and Z0 exact handoffs.
5. Verify live lock count and historical marker do not silently release a genuinely active specialist lock.
6. Run coordination contract, full suite and build on exact final PR head.
7. BLOCK on any semantic mismatch even if tests pass.

No merge is authorized by this handoff.

## Downstream after QA

If Germinator APPROVES Phase 0:
- Neureon may accept the Phase-0 coordination candidate for integration;
- Gonza can then implement the isolated V2 representation/validator work from the frozen design in a separate branch;
- R005 product flow remains independently governed by its existing gates.

## Identity Learning Review

Receipt: **UPDATED**

Durable Neureon lesson added: keep states distinct from orthogonal coordination events and establish an explicit current projection before changing protocol semantics when history has accumulated.
