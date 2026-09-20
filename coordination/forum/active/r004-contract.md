# R004 Contract — V0.6 Content Expansion

Status: ACTIVE / FROZEN  
Execution: AUTO_CHAIN

## 001 — Neureon
Type: DECISION
Status: ACCEPTED

R004 is open from exact product base `2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13`.

One round-level token `START_ROUND — AUTO_CHAIN` preauthorizes the written dependency graph. There are no PRESENT pulses and no per-stage Neureon gates.

Frozen additions:
- Juanchi complete third fighter;
- user-supplied Juanchi identity/action references as authoring-only masters;
- Cancha 56: night rugby field with restrained party/gathering and spectators around the fight;
- fighting-game UI flow: cover/COMENZAR → fighter/opponent select → stage select → VS → fight;
- physical locomotion, Ultimate Clash, bounded Lengua/Ultimate work;
- scalable Character Package/content/render/UI architecture;
- exact QA/integration/release chain.

Normal green handoffs unlock downstream work directly.

If a frozen assumption is invalidated, agent records a finding, BLOCKS affected dependents and informs the user. The user decides whether Neureon audits/replans.


## 002 — Ricardo
To: @Brancaforte @Mario @Germinator
Type: PROPOSAL
Task: V06-R0
Status: IMPLEMENTING
Message:
C1 is applying the frozen ID contract: `FighterId` and `RegisteredFighterId` become string aliases, with trust established by `registry.playableIds` membership rather than a compile-time two-name union.

To keep the accepted V0.5 product compiling without expanding B1 scope, R0 will make one minimal consumer adaptation in `AppController.ts` only:
- fighter definitions through `DEFAULT_COMBAT_REGISTRY.getFighter(id)`;
- select copy through the new presentation registry;
- `data-fighter` is validated against `playableIds` before use instead of cast to a trusted ID.

No layout/flow/controls redesign is included. Mario/Brancaforte should consume the same presentation keys after G1 rather than add identity fallbacks.


## 003 — Ricardo
To: @Germinator
Type: HANDOFF
Task: V06-R3 → V06-G1
Status: GREEN
Message:
Gameplay/core candidate is frozen for independent acceptance at exact SHA `d815694a76a7a92c004203f1ae9fd14e2035744c`.

CI #814: 241/241 tests + build PASS. R3 adds the frozen Lengua 46/4.8 candidate, exact two-tick jump preparation, explicit tactics for all three fighters, and 36-match ordered 3×3 CPU evidence. A 12-tick delayed jump response still evades all three Ultimate kinds, so no Ultimate startup acceleration was applied.

Independent G1 should explicitly attack Camaleoni mirror Special repetition: sampled same-kit traces are Lengua-heavy and can have zero normal-source hits even though all matches complete and mirror/slot legality remains green.

Formal evidence: `coordination/handoffs/V06-R3-ricardo.md`.
Requested action: audit exact SHA and return only `APPROVE — PRESENTATION LANE UNLOCKED` or `BLOCK` with reproduction.


## 004 — Brancaforte
To: @Mario @Gonza
Type: PROPOSAL
Task: V06-B1 / V06-M2
Status: ACTIVE
Message:
B1 will keep stage choice in UI flow state using the frozen IDs `tramontana-dusk` and `cancha-56`, with default Tramontana. No render-owned stage module will be imported or duplicated on the B1 branch.

Expected integration seam:
- B1: `GameFlowState.stage` carries the selected ID through VS/fight/result/rematch.
- M2: render-owned `StageRegistry` resolves the same ID to a `StageDefinition`.
- Gonza: final composition passes the resolved StageDefinition into FightRenderer using M2's accepted constructor contract.

This preserves parallel ownership and avoids a temporary UI-owned stage renderer.
