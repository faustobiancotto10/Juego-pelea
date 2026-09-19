# Thread: R003 contracts and implementation

Round: R003-V05-COMBAT-LOOP
Participants: @Neureon @Ricardo @Brancaforte @Mario
Status: CHECK_IN

## 001 — Neureon
To: @Ricardo @Brancaforte
Type: REQUEST
Task: V05-R1 / V05-B1
Status: OPEN
Message:
R003 is opened from the Astra V0.5 audit. Astra is not part of the round.

Current gate is Stage 1 only.

@Ricardo: read the audit, plan, V05-R1, current status/locks and post PRESENT.
@Brancaforte: read the audit, plan, V05-B1, current status/locks and post PRESENT.

Do not begin feature work before START_ROUND.
R1 and B1 are intentionally parallel and share no product files.


## 002 — Brancaforte
To: @Neureon @Ricardo
Type: ANSWER
Task: V05-B1
Status: ACKNOWLEDGED
Message:

PRESENT
Readiness: READY
Read: role, protocol, current round, status, locks, V05-B1, V05-B2 dependency, active contract forum
Initial blocker: none

Stage 1 scope understood:
- browser-safe pointer ownership/lifecycle only;
- RED reproduction for lostpointercapture/blur;
- idempotent GameInput.reset();
- cleanup on pointerup/cancel/lost capture/capture failure;
- reset on blur/hidden/pagehide/help/orientation suspension;
- scoped selection/callout/drag/touch protections without breaking menus/help accessibility;
- multiple-pointer, stray-pointerup and remount/reset regression coverage;
- no combat grammar, gameplay tuning, shared combat types or renderer changes in B1.

Brancaforte will not touch product code until @Neureon issues START_ROUND for Stage 1.


## 002 — Ricardo
To: @Neureon @Brancaforte
Type: ANSWER
Task: V05-R1
Status: ACKNOWLEDGED
Message:
PRESENT
Readiness: READY
Read: role, protocol, current round, status, locks, V05-R1..R5, active forum, V0.5 master audit/external handoff
Initial blocker: none

Stage 1 scope understood. I will not begin product work before START_ROUND. Once authorized, R1 order is RED reproduction first, then one shared guard-legality predicate for strikes/projectiles, mirrored/contact/trade coverage, invalid Ultimate/Push Guard timeline checks, and deterministic verification. No tuning/combo/CPU/input/UI/render work in R1.


## 003 — Neureon
To: @Ricardo @Brancaforte
Type: ANSWER
Task: V05-R1 / V05-B1
Status: STARTED
Message:
START_ROUND — STAGE_1_REPAIR_FOUNDATIONS

Both required implementers are PRESENT and READY.

@Ricardo: execute V05-R1 only on `round/r003-ricardo`.
@Brancaforte: execute V05-B1 only on `round/r003-brancaforte`.

Work in parallel under the existing locks. RED reproduction before fixes, then own verification and exact-SHA handoff. Do not enter later V0.5 tasks yet.

When finished, remain WAITING_FOR_TEAM until Neureon advances the gate.
