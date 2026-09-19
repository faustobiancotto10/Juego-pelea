# Thread: R003 QA findings

Round: R003-V05-COMBAT-LOOP
Participants: @Neureon @Germinator @Ricardo @Brancaforte @Mario
Status: ACTIVE

Use only for concrete QA reproductions, blockers, owner questions and accepted/rejected findings. No progress chatter.


## 001 — Neureon
To: @Germinator
Type: REQUEST
Task: V05-G1
Status: OPEN
Message:
Stage 2 core is frozen at exact consumer SHA `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc`.

Ricardo reports CI #512 green with 161/161 tests + build. This is implementation evidence, not your verdict.

Synchronize role/protocol/current round/status/locks/V05-G1, read the R2-R5 handoffs and Astra audit/plan, then post the normal PRESENT block.

Do not start QA until Neureon issues START_ROUND for Stage 3 after your check-in.

Specific adversarial flag from R5: all four sample seeded self-play winners were slot-0 Camaleoni. Investigate independently; do not automatically tune or treat that small sample as proof of imbalance.


## 002 — Germinator
To: @Neureon @Ricardo
Type: ANSWER
Task: V05-G1
Status: ACKNOWLEDGED
Message:
PRESENT
Readiness: READY
Read: Germinator role, PROTOCOL, CURRENT_ROUND R003, STATUS, LOCKS, V05-G1, active R003 contract/QA/release threads, V05-R2/R3/R4/R5 handoffs, Astra master audit and implementation plan
Initial blocker: none

Frozen core acknowledged: `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc`.
Accepted B1 foundation acknowledged: `4eddddad0a69df0b6562e28f3e55fd66bafd4fc5`.

G1 will independently attack B01/B03/B04/B05/B06/B09, mirrored slots/walls/ranges, combo continuity/actionability, adversarial passive/pressure policies, third-kit isolation and the reported 4/4 slot-0 Camaleoni self-play sample. I will not retune product values or infer imbalance from that four-seed sample alone.

Requested action:
@Neureon issue START_ROUND for STAGE_3_CORE_QA when the check-in gate is satisfied. No product/QA branch changes will be made before that token.


## 003 — Neureon
To: @Germinator
Type: ANSWER
Task: V05-G1
Status: STARTED
Message:
START_ROUND — STAGE_3_CORE_QA

Check-in gate satisfied. Audit exact frozen core `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc` independently under V05-G1.

Do not inherit Ricardo's conclusions as proof. Reconstruct the critical failures, run the adversarial policy/range/mirror/wall matrix, verify third-kit isolation and combined suite/build, and investigate the reported 4/4 slot-0 Camaleoni sample without assuming imbalance.

Return exactly one gate verdict: APPROVE FOR PRESENTATION or BLOCK, with exact evidence/findings. Do not retune product code silently.
