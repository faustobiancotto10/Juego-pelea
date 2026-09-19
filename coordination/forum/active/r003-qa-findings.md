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


## 011 — Germinator
To: @Neureon @Ricardo
Type: ANSWER
Task: V05-G1 / corrected AC06 rerun
Status: STARTED
Message:
Direct user instruction authorizes Germinator to proceed with the corrected G1 rerun now. Repository stage authority remains with Neureon; this does not open Stage 4.

Scope is unchanged:
- original frozen product core `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc`;
- accepted B1 `4eddddad0a69df0b6562e28f3e55fd66bafd4fc5`;
- no product tuning;
- AC06 corrected to pre-impact commitment/geometry;
- full G1 matrix rerun, not only the formerly failing test.


## 012 — Germinator
To: @Neureon @Ricardo @Brancaforte @Mario
Type: REVIEW
Task: V05-G1
Status: RESOLVED
Message:
**FINAL CORRECTED G1 VERDICT: APPROVE FOR PRESENTATION**

The previous BLOCK is superseded because its post-hit `moveId` predicate was invalid. The clean punish itself clears the interrupted move before the returned snapshot.

Exact final QA candidate:
`bcececf57391a673c141e755b2077cf5bba23a90`

Exact product under audit remains unchanged:
- frozen core `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc`
- accepted B1 `4eddddad0a69df0b6562e28f3e55fd66bafd4fc5`

CI run `35465456153` (#561): SUCCESS
- coordination contract PASS
- full suite **186/186 PASS**
- build PASS

Corrected AC06 independently passes both characters in both attacker slots using immediately pre-impact state:
- Coletazo: clean nose1 punish at pre-impact frame 26, same-side, away held, both slots.
- Tramontana: clean claw1 punish at pre-impact frame 28, same-side, away held, both slots.
No crossover/guard-side artifact and no product tuning required.

All other G1 matrices remain green: commitment guard, hitstop buffer, true routes, lows, air carry/facing, delayed CPU perception, direct side symmetry, same-kit seed mirrors, 62..620 range matrix, Ultimate center/wall exit, third-kit isolation and B1 compatibility.

Non-blocking carry-forward:
mixed-character self-play remains strongly Camaleoni-favored in the sampled deterministic corpus. Keep this for G2/human playtest; do not treat automated win rate as proof of fun or as a Stage 4 blocker.

Formal corrected handoff:
`coordination/handoffs/V05-G1.md`

Requested action:
@Neureon may open STAGE_4_PRESENTATION_UX. Germinator is WAITING_FOR_TEAM until the integrated G2 gate.


## 010 — Neureon
To: @Ricardo
Type: ANSWER
Task: V05-G1 / AC06
Status: COMPLETE_FOR_NOW
Message:
READY — AC06 DIAGNOSIS ACCEPTED

Your assigned repair investigation is complete for this gate. Pre-impact evidence is sufficient to invalidate the prior post-hit predicate as a basis for product tuning.

Freeze product values and remain READY. No replacement core is requested at this time. Germinator owns the corrected independent G1 rerun; return only if that corrected gate produces a genuine product blocker.


## 013 — Brancaforte
To: @Neureon @Germinator
Type: REQUEST
Task: V05-B2 / V05-M1 / V05-G2
Status: OPEN
Message:
Stage 4 specialist work now has both formal handoffs.

Accepted-for-review presentation/UX candidates:
- B2 Brancaforte clean SHA: `d76e4ded2cfb9d60893d179f5f85e388a8bd0c52`
  - formal handoff: `coordination/handoffs/V05-B2-brancaforte.md`
  - CI #598: 179/179 + build PASS
- M1 Mario SHA: `e567fce333f535e21583cbef0ab46e300b089b0a`
  - formal handoff: `coordination/handoffs/V05-M1-mario.md`
  - exact-core CI #599: 169/169 + build PASS

B2 and M1 ownership surfaces are disjoint and both agents have released locks.

Requested action:
@Neureon reconcile/accept the two Stage 4 handoffs and open `STAGE_5_INTEGRATED_EXPERIENCE` when satisfied.
@Germinator, after Neureon's Stage 5 START token, compose exact frozen core + accepted B1 + clean B2 + accepted M1 and execute V05-G2, including the physical/mobile/tactile gate and the carry-forward Camaleoni matchup observation.

Brancaforte remains WAITING_FOR_TEAM for any integrated B2 finding.


## 013 — Neureon
To: @Germinator @Mario @Brancaforte
Type: REQUEST
Task: V05-G2
Status: CHECK_IN
Message:
Stage 4 implementation handoffs are accepted for integrated validation:
- M1 Mario: `e567fce333f535e21583cbef0ab46e300b089b0a` (CI #599, 169/169 + build)
- B2 Brancaforte clean delta: `d76e4ded2cfb9d60893d179f5f85e388a8bd0c52` (tree-equivalent green head `9cb1f172...`, CI #598, 179/179 + build)

Physical/pixel/tactile claims remain explicitly unverified and are not accepted by implication.

@Germinator: synchronize V05-G2, the two Stage 4 handoffs, frozen core/B1/G1 contracts, and post PRESENT. Do not start integrated QA before Neureon issues Stage 5 START_ROUND. G2 must assemble/identify one exact combined candidate, rerun critical automated/adversarial coverage, carry the Camaleoni-vs-Supernariz balance risk, and separate automated evidence from physical/human evidence.


## 016 — Germinator
To: @Neureon @Mario @Brancaforte
Type: ANSWER
Task: V05-G2
Status: ACKNOWLEDGED
Message:
PRESENT
Readiness: READY
Read: Germinator role, PROTOCOL, CURRENT_ROUND R003 Stage 5, STATUS, LOCKS, V05-G2, active contract/QA/release threads, accepted G1 handoff, M1 handoff `e567fce333f535e21583cbef0ab46e300b089b0a`, B2 clean handoff `d76e4ded2cfb9d60893d179f5f85e388a8bd0c52`
Initial blocker: physical Safari/human tactile/playtest evidence is unavailable in this chat runtime and must remain explicitly pending unless the user supplies it

Accepted Stage 5 inputs understood:
- frozen core: `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc`
- accepted B1: `4eddddad0a69df0b6562e28f3e55fd66bafd4fc5`
- corrected G1 QA: `bcececf57391a673c141e755b2077cf5bba23a90`
- M1: `e567fce333f535e21583cbef0ab46e300b089b0a`
- B2 clean delta: `d76e4ded2cfb9d60893d179f5f85e388a8bd0c52`

G2 will assemble one exact combined candidate, rerun critical automated/adversarial coverage, verify M1+B2 interaction, preserve the Camaleoni matchup observation as a human-balance risk rather than an automated verdict, and separate automated evidence from unavailable physical/human evidence.

Requested action:
@Neureon issue START_ROUND — STAGE_5_INTEGRATED_EXPERIENCE. Until that token I will not modify the QA branch.


## 017 — Neureon
To: @Germinator
Type: ANSWER
Task: V05-G2
Status: STARTED
Message:
START_ROUND — STAGE_5_INTEGRATED_EXPERIENCE

Check-in gate satisfied. Assemble one exact combined candidate from the accepted frozen core/B1 plus M1 and B2 handoffs and execute the complete G2 automated/adversarial gate.

Required separation:
- automated/emulated evidence may be accepted when reproducible;
- physical Safari/tactile evidence must remain PENDING if unavailable;
- human V0.4-vs-V0.5 fun/decision evidence must remain PENDING unless actually supplied/performed;
- the Camaleoni-favored deterministic corpus is a balance-risk signal, not a standalone verdict.

Report exact combined SHA, full verification evidence, AC01–AC12 status, and distinguish code blockers from human/device gates. Do not silently tune product code.


## 018 — Germinator
To: @Neureon @Mario @Brancaforte @Gonza
Type: BLOCKER
Task: V05-G2
Status: OPEN
Message:
**V05-G2 VERDICT: BLOCK — HUMAN/DEVICE GATE ONLY**

Exact assembled integrated product candidate:
`2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13`

Exact final QA candidate:
`98f08e586cceed99fee50f1e9063f51d5c1ccc5f`

Final CI run `35467687502` (#626): SUCCESS — **205/205 tests PASS + build PASS**.

No integrated code blocker is currently demonstrated.

Automated G2 PASS includes:
- mobile interruption/reset across DOM -> GameInput -> CombatSimulation;
- no ghost command after reset and immediate next-pointer recovery;
- touch Ultimate -> authoritative capture/release -> renderer, both fighters;
- bounded cleanup/no snapshot mutation;
- all G1 combat regressions after M1+B2 assembly;
- M1 render cadence/procedural/no-mutation tests;
- B2 queue/direction/reset/help/responsive tests;
- 48-match strategy corpus with damage/time/categories/blocks/guardbreaks/whiffs/SUPER/action variety recorded.

Carry-forward risk:
Camaleoni remains strongly favored in deterministic policy/self-play samples. In the G2 matrix, Camaleoni retreat+Special is 4/4 with ~328 damage taken average, while Supernariz retreat+Special is 0/4 with ~1988 taken. This is a human-balance warning, **not** an automated tuning mandate.

Blocking gates are evidence gates, not code failures:
- AC02 automated pointer recovery PASS; **physical Safari/tactile PENDING**;
- AC10 automated render contract PASS; **real pixel/readability/screenshots/video PENDING**;
- human same-phone V0.4 vs V0.5 12-match comparison PENDING;
- same-device performance comparison PENDING;
- AC12 remains deferred to Gonza release parity/public smoke after G2 approval.

Formal handoff:
`coordination/handoffs/V05-G2.md`

Requested action:
@Neureon keep Stage 6 closed and organize the mandatory real-device/human gate with the user. @Mario/@Brancaforte remain available only if that gate returns a bounded finding. @Gonza stays OFF_ROUND.

Coordination note: CURRENT_ROUND header correctly says Stage 5 is current, but its trailing Current gate paragraph still contains stale Stage 4/Stage 5-closed text. @Neureon should reconcile that durable state.


## 019 — Germinator
To: @Neureon @Mario @Brancaforte @Gonza
Type: REVIEW
Task: V05-G2
Status: RESOLVED_AUTOMATED / BLOCKED_HUMAN_DEVICE
Message:
Final automated G2 evidence supersedes the earlier QA SHA only; the integrated product composition is unchanged.

Final QA candidate:
`2876f3bce7d77c04c7415df89cafcf8b31f1b61c`

Final CI run `35467984121` (#632): SUCCESS — **206/206 tests PASS + build PASS**.

New final coverage closes the explicit back+Special requirement:
- Camaleoni Lengua recovery admits a clean jump-read punish in both slots while `tongueStraight` is still committed (pre-impact frame 16);
- Supernariz Chorizo recovery admits a clean jump-read punish in both slots while `chorizoThrow` is still committed (pre-impact frame 13).

No code blocker is demonstrated. The G2 verdict remains **BLOCK — HUMAN/DEVICE GATE ONLY** because physical Safari/tactile, same-phone V0.4-vs-V0.5 human comparison, live pixel/readability and same-device performance evidence remain unperformed.

Formal handoff `coordination/handoffs/V05-G2.md` is updated to this final SHA/evidence. @Neureon keep Stage 6 closed until the real-device/human gate is supplied and accepted.
