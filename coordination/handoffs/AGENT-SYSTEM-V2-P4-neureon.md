# Handoff — Agent Orchestration V2 Phase 4 / Neureon

Program: Agent Orchestration V2  
Live product round: R005 remains ACTIVE and untouched  
From: Neureon  
To: Gonza trial materialization → Germinator setup preflight  
Contract PR: #69  
Base implementation: `083d4715223bb041b59e97b10b6bb973ed3fa665`  
Frozen contract: `coordination/v2/trials/PHASE4-MULTI-INSTANCE-CONTRACT.md`

## Authority consumed

Germinator R1 verdict:
**APPROVE — V2 R1 BLOCKER REPAIR GREEN FOR THE NEXT ISOLATED MULTI-INSTANCE TRIAL**

Independent QA:
- PR #68;
- QA head `31935176dff9cac5886d9269b908ed0888d20abe`;
- run #1792 / `36277764395`: 7/7 targeted R1 probes, complete suite PASS, build PASS.

This unlocks Phase 4 only; broad V2 adoption remains unauthorized.

## Neureon decision

Phase 4 is frozen as five synthetic scenarios:

- P4-A: Mario + Ricardo disjoint concurrent claims/work/handoffs;
- P4-B: one disposable instance races two different slot claim refs, proving or falsifying cross-ref conflict safety;
- P4-C: checkpoint → worker disappearance → explicit replacement on the same persistent slot;
- P4-D: work branch without canonical handoff cannot unlock a dependent task;
- P4-E: stale QA BLOCK remains bound to C1 while superseding C2 can receive an independent APPROVE.

The full acceptance/stop rules are in the frozen contract.

## Critical ruling

P4-B is deliberately adversarial.

If two different claim refs can both accept the same instance concurrently and the aggregate model becomes invalid, the trial is **FAIL**. Manual cleanup cannot convert that into PASS. Preserve the evidence and return to Gonza architecture repair.

This distinguishes “global preflight sees all refs” from “conflicting cross-ref claims are actually safe under concurrency.”

## Gonza requested work

1. Materialize the frozen trial into canonical V2 task/slot/instance records.
2. Seed every dedicated synthetic claim ref.
3. Add only the minimum tooling required to support explicit release/reassignment and evidence capture.
4. Do not execute the worker trial yet.
5. Return one exact setup head with:
   - global remote projection green;
   - strict validator green;
   - all trial refs resolvable;
   - no active synthetic claims unless explicitly required for setup;
   - no R005/product/runtime/assets mutation.
6. Handoff that setup to Germinator for preflight.

Mario/Ricardo activation occurs only after Germinator approves the materialized setup.

## Boundaries

Not authorized:
- merge to main;
- R005 conversion;
- live R005 auto-claim;
- product/gameplay/runtime/assets edits;
- broad V2 adoption;
- force push / force-with-lease claiming;
- skipping P4-B because earlier same-ref CAS proof was green.

## Identity Learning Review

Receipt: **NO_CHANGE**

The new trial contract applies existing durable Neureon lessons about exact evidence, separation of state/events, and safe same-role decomposition; no additional cross-round role learning is promoted yet.
