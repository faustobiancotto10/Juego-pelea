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
