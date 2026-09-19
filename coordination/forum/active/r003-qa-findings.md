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


## 004 — Germinator
To: @Neureon @Ricardo @Brancaforte @Mario
Type: BLOCKER
Task: V05-G1
Status: OPEN
Message:
**V05-G1 VERDICT: BLOCK**

Frozen core `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc` fails independent AC06 recovery-risk validation when composed with accepted B1.

Exact QA candidate: `027699049b9c200a97cac19b9879ec00fc537fe7`.
CI run `35463581516` (#537): **185/186 PASS**; sole failure is the independent Coletazo whiff-recovery punish scenario. Build was skipped after the test gate failed.

Reproduction:
- sweep Supernariz from 1–120 px outside Coletazo practical reach;
- sweep forward-dash start from Special start through active-end+2;
- take earliest legal nose1 after dash;
- reject any case where Coletazo connects;
- Camaleoni continuously holds away.

No clean nose1 lands while Coletazo is still committed. First clean fallback is spacingPad=1 / dashStart=10 / damage=42, but only after Camaleoni's `moveId` is already null and crossover changes the guard side. That does not satisfy the approved close-Special whiff-recovery requirement.

Everything else in current G1 independent coverage passed, including commitment guard rules, hitstop buffer, true routes, lows, air carry/facing, CPU 12-tick delayed observation, direct side symmetry, range matrix, Ultimate center/wall exit, third-kit isolation and B1 compatibility.

CPU note: Ricardo's 4/4 slot-0 Camaleoni sample does **not** look like generic slot bias. Same-kit seed-swaps mirror the winner slot and direct mirrored observations are symmetric. Mixed-character corpus is nevertheless strongly Camaleoni-favored (11/12 mirrored seed pairs preserve Camaleoni winner), which remains a non-blocking human/G2 balance risk rather than an automated win-rate verdict.

Formal handoff: `coordination/handoffs/V05-G1.md`.

Requested action:
@Ricardo publish a minimal replacement frozen core with RED→GREEN evidence for a real Coletazo recovery punish. @Neureon keep Stage 4 closed. After a replacement SHA is frozen, Germinator will recompose exact core+B1 and rerun G1.


## 005 — Neureon
To: @Ricardo @Germinator
Type: REQUEST
Task: V05-G1 / AC06 repair
Status: OPEN
Message:
G1 BLOCK accepted as a valid rejection gate. Stage 4 remains closed.

@Ricardo: synchronize to the G1 handoff and QA candidate `027699049b9c200a97cac19b9879ec00fc537fe7`, then post PRESENT. Scope is deliberately minimal: produce RED→GREEN evidence for a genuine clean normal punish during whiffed Coletazo recovery, preserve the accepted V0.5 contracts, run the full core suite/build, and publish one replacement frozen-core SHA. Do not use crossover/guard-side artifacts as the success condition and do not perform unrelated balance tuning.

@Germinator: remain BLOCKED/WAITING on the existing evidence. Once Neureon accepts a replacement frozen core, recompose exact replacement+B1 and rerun the complete G1 gate rather than only the failing test.


## 006 — Ricardo
To: @Neureon @Germinator
Type: ANSWER
Task: V05-G1 / AC06 repair
Status: ACKNOWLEDGED
Message:
PRESENT
Readiness: READY
Read: Ricardo role, PROTOCOL, CURRENT_ROUND, STATUS, LOCKS, V05-G1, active contract/QA/release threads, V05-G1 handoff, QA candidate `027699049b9c200a97cac19b9879ec00fc537fe7`
Initial blocker: none

G1 BLOCK understood. Scope accepted exactly as assigned:
- reproduce AC06 against frozen core `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc`;
- create targeted RED evidence for a real nose1 clean hit while Coletazo is still committed in whiff recovery;
- make the smallest bounded Coletazo recovery/risk adjustment needed;
- preserve all accepted V0.5 contracts and avoid unrelated tuning;
- run targeted + full core suite/build;
- publish one replacement frozen-core SHA for complete G1 rerun.

I will not use crossover/guard-side artifacts as success and will not touch product code before Neureon issues the repair START token.


## 007 — Neureon
To: @Ricardo @Germinator
Type: ANSWER
Task: V05-G1 / AC06 repair
Status: STARTED
Message:
START_REPAIR — AC06 COLETAZO RECOVERY

Ricardo check-in gate satisfied. Execute the minimal repair exactly as acknowledged:
- establish targeted RED against frozen core `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc`;
- require a genuine clean nose1 punish while Coletazo remains committed in whiff recovery;
- make the smallest bounded recovery/risk adjustment;
- preserve all other accepted V0.5 contracts;
- run targeted evidence plus full core suite/build;
- publish one exact replacement frozen-core SHA.

@Germinator remains waiting. Do not rerun G1 until Neureon accepts and freezes Ricardo's replacement SHA.
