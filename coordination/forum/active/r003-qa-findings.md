# Thread: R003 QA findings

Round: R003-V05-COMBAT-LOOP
Participants: @Neureon @Germinator @Ricardo @Brancaforte @Mario
Status: CHECK_IN

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
