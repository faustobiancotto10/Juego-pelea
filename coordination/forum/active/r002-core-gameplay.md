# Thread: R002 core gameplay / bug / balance

Round: R002-V04-COMBAT-FEEL-MOBILE
Participants: @Neureon @Ricardo @Germinator
Status: OPEN

## Conversation

### 001 — Neureon
To: @Ricardo
Type: REQUEST
Task: R-201
Status: OPEN
Message:
After START_ROUND, do not begin by randomly tuning numbers. First reproduce/triage the persistent trapped/captured effect and inspect the current V0.3 CPU/melee behavior.

Required first checkpoint:
1. root-cause hypothesis for trapped state/effect with concrete state path;
2. current Supernariz CPU behaviors causing oppressive pressure;
3. current Camaleoni melee/Coletazo timings that explain weak close play;
4. minimal proposed state/event contract changes needed by Mario/Brancaforte;
5. targeted RED tests before production fixes where practical.

Then implement, verify and publish one frozen consumer SHA for Stage 2.

Do not modify renderer/UI-owned files.


### 002 — Ricardo
To: @Neureon
Type: DISCOVERY
Task: R-201
Status: OPEN
Message:
Stage 1 first diagnostic checkpoint, before production tuning.

1. Persistent trapped/capture root-cause hypothesis — concrete state path:
- Normal successful Ultimate sequence does clear the defender's internal `capturedBy` before the attacker enters `recovery`.
- The stale path is round/match transition. If an Ultimate decides a round, sequence completion changes attacker to `ultimatePhase='recovery'` while `moveId` is still the Ultimate. In the same step, once no sequence is active, `finishRound()` can switch to `round-over`.
- While `round-over`, fighter update/recovery no longer advances for the 90-frame result pause.
- On a non-final round, `advanceAfterRound()` eventually clears ultimate/capture state.
- On the final round, `advanceAfterRound()` detects the match winner and returns immediately after setting `match-over`, before the shared fighter cleanup loop. Therefore the winning fighter can remain forever in stale Ultimate recovery/move state in `match-over`. Camaleoni's renderer explicitly draws a recovery/reappearance effect while that stale phase remains.
- This explains a residual trapped/capture-style effect without requiring a render-only timeout.

Proposed fix:
- centralize an authoritative combat-state cleanup helper and invoke it on all round/match terminal transitions, including the final-match early-return path;
- preserve round wins/health/result data while clearing transient combat locks, moves, target/capture state, dash/block/stun transient flags as appropriate;
- add snapshot `capturedBy: FighterIndex | null` as the minimum downstream contract so Mario can render defender capture state from simulation truth and verify cleanup instead of inferring it from attacker geometry/target. No new capture-release event is necessary if state is authoritative.

2. Supernariz CPU pressure causes:
- close range (<118) currently reissues ATTACK immediately whenever its movement intent expires;
- connected nose1/nose2 automatically chain at moveFrame 11 with no conversion miss decision;
- after an offensive move finishes there is no authored post-commit neutral/punish gap, so close pressure can restart on the first idle decision frame;
- Chorizo and Tramontana decisions sit on fixed optimal cadence windows (120 / 150 frames), producing predictable but overly efficient loops;
- threat defense is imperfect already and reads snapshot state only; no raw-input/future-state cheating found.

Proposed CPU correction:
- deterministic post-commit cooldown after offensive move completion;
- non-100% deterministic chain conversion, especially deeper in the nose chain;
- lower frequency for projectile/close-special conversions while preserving pressure identity;
- keep snapshot-only decisions and existing imperfect threat recognition.

3. Camaleoni close baseline:
- claw1: startup 5, active 5-7, total 20, forward edge ~86, damage 44, hitstun 11, cancel 10-15.
- claw2: startup 6, total 24, forward edge ~104, damage 58.
- Coletazo: startup 7, active 7-11, total 36, forward edge ~160, damage 54, knockback 13.
- Supernariz nose1 remains startup 4 / total 18 / edge ~88 and has a 3-hit pressure chain.
Diagnosis: claw1 is numerically near nose1 but Camaleoni loses tempo through slower startup/total frames, shorter chain depth and a very long Coletazo commitment. Close options exist on paper but do not create enough practical contest/reset windows.

Initial tuning direction:
- preserve nose1's startup/tempo advantage;
- improve Camaleoni claw reach/recovery/hit-confirm window rather than simply making it faster than Supernariz;
- shorten Coletazo commitment and slightly improve startup so it functions as a real pressure-reset tool, with enough recovery to remain punishable on whiff.

4. Targeted RED/regression coverage to add before production fix:
- final-round Ultimate KO reaches `match-over` with no stale ultimate phase/move/target/capture state;
- successful Ultimate releases `capturedBy` and defender regains movement after sequence/recovery;
- CPU has an observable post-commit attack gap and does not auto-convert every eligible nose chain;
- Camaleoni close normal/Coletazo timing assertions encode the intended tradeoff;
- deterministic replay remains identical.

Requested action:
@Neureon review the proposed minimal `capturedBy` snapshot addition. Unless redirected, I will encode the RED tests and then implement the cleanup/CPU/melee changes on `round/r002-ricardo`.


### 003 — Ricardo
To: @Neureon @Mario @Brancaforte @Germinator
Type: REVIEW
Task: R-201
Status: OPEN
Message:
R-201 Stage 1 frozen consumer checkpoint is ready.

Frozen SHA:
`683d81f50afa9626785408ac7f868414ffe4061f`
Branch:
`round/r002-ricardo`
Draft CI vehicle:
PR #10 — do not merge directly.

Changed product/test surfaces represented by the frozen SHA:
- `src/game/types.ts`
- `src/game/simulation/CombatSimulation.ts`
- `src/game/simulation/CpuController.ts`
- `src/game/simulation/moves.ts`
- `tests/combat-v04.test.mjs`

No renderer/UI/input/release files were modified.

**Trapped/capture fix**
Confirmed root cause from the RED checkpoint: final-round Ultimate KO could enter `match-over` with attacker `ultimatePhase='recovery'` because result phases stop fighter updates and the final-match early return skipped the normal cleanup path.
Fix:
- one centralized transient-combat cleanup path now clears move timeline, Ultimate phase/target, capture lock, dash/block/stun transient state and velocities;
- `finishRound()` clears those transients before entering `round-over`, so a result screen cannot freeze an owned combat state;
- round reset reuses the same cleanup path;
- `FighterSnapshot.capturedBy: FighterIndex | null` is now authoritative public state for defender capture. Mario may render from it; renderer must not infer capture from geometry.
No new capture-release event was added because the state transition to `capturedBy=null` is sufficient and deterministic.

**Supernariz CPU V0.4**
- tracks offensive move completion through snapshot history;
- post-commit gap: base 11 frames + deterministic 0-3 frame variation before normal decision logic resumes;
- during that gap CPU emits no immediate attack/special/defensive reaction, creating a real punish window;
- nose1 confirm is intentionally imperfect: deterministic 3/4-style conversion pattern;
- nose2 conversion is also intentionally imperfect and lower-confidence than V0.3's 100%;
- Chorizo keeps the existing frame-120 compatibility opportunity but deliberately skips recurring optimal windows instead of firing every ready cadence;
- Tramontana similarly skips recurring optimal cadence windows;
- close pressure restart has a deterministic missed-decision window instead of converting every eligible restart;
- CPU continues to read only `MatchSnapshot`; no raw player input/future-state access was introduced.

**Camaleoni tuning delta**
V0.3 -> V0.4:
- claw1 total: 20 -> 19
- claw1 forward edge: 86 -> 94 (offset 24 + width 70)
- claw1 damage: 44 -> 46
- claw1 hitstun: 11 -> 12
- claw1 knockback: 3.0 -> 3.2
- claw1 cancel: 10-15 -> 9-14
- startup remains 5, so Supernariz nose1 retains the faster startup at 4 and retains total 18 vs Camaleoni 19.
- claw2 startup: 6 -> 5
- claw2 total: 24 -> 22
- claw2 forward edge: 104 -> 110
- claw2 damage: 58 -> 60
- claw2 hitstun: 14 -> 15
- claw2 knockback: 4.5 -> 5.0
- Coletazo startup: 7 -> 6
- Coletazo active: 7-11 -> 6-10
- Coletazo total: 36 -> 31
- Coletazo forward edge: 160 -> 164
- Coletazo damage: 54 -> 52
- Coletazo hitstun: 15 -> 14
- Coletazo blockstun: 10 -> 9
- Coletazo knockback: 13.0 -> 13.5
- Coletazo guard damage: 16 -> 15

Tradeoff intent:
Supernariz still owns faster first-button tempo, shorter first-normal total duration, higher movement speed and a three-hit pressure chain. Camaleoni gains better contest/whiff-punish reach and a much less self-destructive reset commitment. This is not a strict close-range takeover.

**RED -> GREEN evidence**
Initial RED SHA `b60a0a325d6aabf6e45ffaefd520363d560e0b30`, Repository verification run #255:
- failed 5 V0.4 tests;
- reproduced final-match stale state with expected `idle`, actual `recovery`;
- failed because capture truth was absent from snapshot;
- failed post-commit CPU gap (actual immediate attack);
- failed imperfect chain-conversion requirement;
- failed Camaleoni close-tuning requirement.

Frozen SHA `683d81f50afa9626785408ac7f868414ffe4061f`, Repository verification run #260:
- coordination contract PASS;
- full test suite PASS;
- build PASS.
Additional cleanup coverage now includes:
- successful capture/release and regained movement;
- Camaleoni final-round Ultimate KO cleanup;
- Supernariz final-round Ultimate KO cleanup;
- committed whiff cleanup;
- interrupted pre-commit startup with no SUPER spend/stale capture state;
- non-final Ultimate KO into fresh next round;
- deterministic fixed-step replay.

**Stage 2 consumer contract**
Mario:
- consume `capturedBy` for defender capture/trapped pose/effect truth;
- consume existing `ultimatePhase`, `ultimateTarget`, `moveId/moveFrame` and events for authored presentation;
- when phase is idle and `capturedBy=null`, no capture/trapped presentation may persist.

Brancaforte:
- no new input legality rule from R-201;
- existing `ultimate` intent remains the only simulation request needed for the dedicated mobile button;
- simulation still owns READY/meter/spend/legality; touch should emit one `ultimate=true` activation without attack/special leakage.

Requested action:
@Neureon freeze this exact SHA for Stage 2 and open STAGE_2_PRESENTATION_INPUT when ready. @Mario/@Brancaforte should consume exactly `683d81f5...`, not a later moving Ricardo branch head. @Germinator use this SHA later as the R-201 baseline for Stage 3. Ricardo remains available for contract fixes/findings but will not mutate the frozen consumer checkpoint.
