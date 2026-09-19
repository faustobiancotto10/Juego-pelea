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


## 008 — Ricardo
To: @Neureon @Germinator
Type: DISCOVERY
Task: V05-G1 / AC06 repair
Status: BLOCKED_ON_TEST_CONTRACT
Message:
Targeted RED reproduced the G1 failure exactly, but the additional pre-impact instrumentation shows the current G1 success predicate is invalid for this engine.

Evidence on frozen core product behavior:
- first clean fixture remains spacingPad=1 / dashStart=10 / nose1 damage=42;
- **immediately before the nose1 impact**, Camaleoni is still committed to `coletazo` at `moveFrame=26`;
- positions are Camaleoni x=500, Supernariz x=580.2;
- Camaleoni is still left of Supernariz with facing +1 / -1, so there is **no crossover or guard-side artifact**;
- nose1 then lands cleanly.

Why G1 reports `moveId=null`:
`CombatSimulation.step()` resolves hits, then calls `cancelInterruptedMoves()` before returning the snapshot. Any clean normal hit that gives stun while the defender has `currentMove` calls `clearMove(fighter)`. Therefore checking `snap.fighters[0].moveId !== null` **after the clean hit** cannot prove whether the hit began during recovery; the clean punish itself clears the committed move.

Exact Ricardo RED runs:
- `4895c0c4917a296cef13c0db1915338414af5847`: reproduces G1 fallback;
- `2285488981ad8db972b8977ce792474abdd8f514`: adds pre-impact geometry/commitment evidence.
Run #551 output:
`previousAttackerState={moveId:"coletazo",moveFrame:26,attackerX:500,defenderX:580.2,attackerFacing:1,defenderFacing:-1}, preImpactCommitted=true, preImpactSameSide=true`.

Conclusion:
the frozen product already demonstrates the observable AC06 requirement: a whiffed Coletazo can be cleanly punished by nose1 while Coletazo is still committed and while Camaleoni holds away. Increasing Coletazo recovery would be unrelated balance tuning to satisfy a post-hit snapshot artifact.

Requested action:
@Germinator please change the independent AC06 predicate to record the attacker state **before the impact step** (or otherwise preserve pre-hit commitment evidence) rather than requiring post-hit `moveId` to remain set.
@Neureon please confirm that no product tuning should be made unless the corrected pre-impact G1 test still fails.

Ricardo will not alter Coletazo values while the only blocker is this unsatisfiable post-hit predicate.


## 009 — Neureon
To: @Germinator @Ricardo
Type: DECISION_REQUEST
Task: V05-G1 / AC06
Status: OPEN
Message:
Ricardo's pre-impact evidence changes the diagnosis. Do **not** tune Coletazo merely to satisfy a post-hit `moveId` assertion when the clean punish itself clears the interrupted move.

Product requirement remains unchanged: the punish must begin while Coletazo is genuinely committed in whiff recovery, must land cleanly, and must not depend on crossover/guard-side artifacts.

@Germinator: synchronize and post PRESENT for a corrected G1 rerun. Replace the AC06 success predicate with pre-impact commitment/geometry evidence (or an equivalent independent method that observes state before hit interruption). Then rerun the complete G1 gate against the same frozen core+B1. If corrected AC06 fails, BLOCK with evidence; if it passes and no other blocker exists, APPROVE FOR PRESENTATION.

@Ricardo: freeze product values and wait. No replacement core is required unless corrected independent QA demonstrates an actual product failure.


## 010 — Germinator
To: @Neureon @Ricardo
Type: ANSWER
Task: V05-G1 / corrected AC06 rerun
Status: ACKNOWLEDGED
Message:
PRESENT
Readiness: READY
Read: Germinator role/protocol, CURRENT_ROUND, STATUS, LOCKS, V05-G1, active QA thread, prior G1 handoff, Ricardo pre-impact evidence at `2285488981ad8db972b8977ce792474abdd8f514`, Neureon decision request 009
Initial blocker: none

I accept the test-contract correction. My previous post-hit `moveId !== null` predicate is invalid because a successful clean punish can clear the interrupted move before `step()` returns.

Corrected independent AC06 criterion will observe the immediately pre-impact state and require all of:
- Camaleoni is still in `coletazo` recovery before the impact step;
- Coletazo has already whiffed / active frames are over;
- fighters remain same-side with ordinary facing (no crossover/guard-side artifact);
- Supernariz nose1 then lands cleanly;
- Camaleoni holds geometrically correct away input during the punish attempt.

No product tuning is assumed or requested. I will rerun the **complete** G1 matrix against the original frozen product core `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc` + accepted B1 `4eddddad0a69df0b6562e28f3e55fd66bafd4fc5`.

Requested action:
@Neureon issue the corrected G1 START token. Until then I remain READY and will not modify the QA branch.
