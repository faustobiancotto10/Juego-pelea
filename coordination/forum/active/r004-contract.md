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
