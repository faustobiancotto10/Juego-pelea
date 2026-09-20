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


## 005 — Brancaforte
To: @Mario @Gonza @Neureon
Type: HANDOFF
Task: V06-B1
Status: GREEN
Message:
V06-B1 is complete on exact SHA `81647506d2e69b92dd92e19f2fc997d21949a4a9`, based directly on accepted G1 product `d815694a76a7a92c004203f1ae9fd14e2035744c`.

TDD evidence:
- RED run `35537255220` (#842): 10 intended V0.6 UI/flow failures.
- GREEN run `35537585227` (#848): **255/255 PASS + build PASS**.

Delivered:
- cover-first COMENZAR/CONTROLES front end;
- registry-driven player/opponent selection for Camaleoni/Supernariz/Juanchi;
- selected-state + info/confirm UI;
- standard/compact/dense 3/5/10 roster modes;
- stage select for `tramontana-dusk` / `cancha-56`;
- stage carried through VS/fight/result/rematch;
- result rematch/change-fighters/change-stage paths;
- metadata-driven ranged availability HUD (`LISTA / EN VUELO / REARME`);
- three-fighter control copy with the established four action buttons;
- safe-area/focus/touch/phone-landscape styling;
- no runtime Juanchi master/sheet raster use;
- no simulation/render/gameplay authority moved into UI.

Formal handoff:
`coordination/handoffs/V06-B1-brancaforte.md`.

Cross-role seam remains as message 004: B1 owns only the stage ID in match flow; M2 owns StageRegistry/StageDefinition; Gonza performs final renderer wiring after M2 green.

B1 locks are released. The G1+B1 dependency side is satisfied. Gonza remains blocked only on Mario M2.

Evidence boundary: physical iPhone Safari/tactile feel is not claimed by this runtime and remains a final served-product integration check.


## 006 — Mario
To: @Gonza @Brancaforte @Germinator @Neureon
Type: HANDOFF
Task: V06-M2 → V06-Z0
Status: GREEN
Message:
Exact M2 green SHA `81c904efedd8c7aaf6a66a600abece177b926e2c`.

Isolated verification:
- exact base M1: `554d5a38688121f2fd6ca0ad0e90a25b5b2a1132`
- CI run `35538017393` (#864): SUCCESS
- coordination 6/6 PASS
- full suite 260/260 PASS
- build PASS

Delivered final Mario lane:
- M1 physical locomotion + complete procedural Juanchi;
- M2 render-owned StageRegistry / StageDefinition seam;
- procedural Cancha 56;
- visualKey projectile routing for rugby ball vs Chorizo;
- police-cap probe/capture presentation from authoritative state;
- Universal Ultimate Clash ring/darkening/trails + brace/recoil;
- common published majorImpact treatment;
- bounded/no-raster/non-authoritative presentation.

Formal handoff:
`coordination/handoffs/V06-M2-mario.md`

All R004 upstream dependencies are now green. AUTO_CHAIN authorizes @Gonza to start V06-Z0 immediately. Mario is HANDOFF_READY and returns only for a bounded renderer finding from final integration.
