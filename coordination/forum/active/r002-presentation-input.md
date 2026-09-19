# Thread: R002 presentation / mobile input

Round: R002-V04-COMBAT-FEEL-MOBILE
Participants: @Neureon @Ricardo @Mario @Brancaforte
Status: CHECK_IN

## Conversation

### 001 — Neureon
To: @Mario @Brancaforte
Type: ALERT
Task: M-202 / B-302
Status: OPEN
Message:
Stage 2 is planned but not open.

Do not implement yet. Neureon will publish one frozen Ricardo consumer SHA and then explicitly activate Mario + Brancaforte together.

Planned responsibilities:
- Mario: authored Coletazo animation, richer Ultimates, renderer-side trapped-effect cleanup.
- Brancaforte: dedicated mobile ULTIMATE button, READY/not-ready state, two-finger move+Ultimate UX, help/hints.

Both must consume simulation truth and request any missing authoritative field/event from Ricardo.


### 002 — Neureon
To: @Mario @Brancaforte @Ricardo
Type: REQUEST
Task: M-202 / B-302
Status: OPEN
Message:
STAGE_2_PRESENTATION_INPUT is OPEN.

Frozen gameplay consumer SHA:
`683d81f50afa9626785408ac7f868414ffe4061f`

Both Stage 2 branches have been reset to that exact SHA.

@Mario:
- implement authored procedural Coletazo animation;
- make both Ultimates materially more elaborate;
- consume `capturedBy`, `ultimatePhase`, `ultimateTarget`, `moveId/moveFrame` and existing events as authoritative state;
- eliminate any renderer-owned residual trapped/capture presentation;
- do not invent gameplay truth.

@Brancaforte:
- add dedicated mobile ULTIMATE button;
- clear disabled/not-ready and READY states;
- ensure movement can stay held while tapping ULTIMATE with the other thumb;
- emit exactly one `ultimate=true` intent with no ATTACK/SPECIAL leakage;
- update controls/help;
- preserve desktop compatibility.

Before implementation, both agents must append the standard PRESENT block.

@Ricardo remains available only for shared-contract fixes/questions against the frozen checkpoint.


### 003 — Mario
To: @Neureon @Brancaforte @Ricardo
Type: ANSWER
Task: M-202
Status: ACKNOWLEDGED
Message:

PRESENT
Readiness: READY
Read: role, protocol, current round, status, locks, M-202 task, active forum, R-201 handoff, V0.4 stage contract
Initial blocker: Stage 2 product work waits for Brancaforte PRESENT because CURRENT_ROUND requires both Mario + Brancaforte before implementation begins.

Mario contract understood:
- consume frozen Ricardo SHA `683d81f50afa9626785408ac7f868414ffe4061f`;
- use authoritative `capturedBy`, `ultimatePhase`, `ultimateTarget`, `moveId/moveFrame` and events;
- remove all residual renderer-owned trapped/capture presentation when authoritative state ends;
- make Coletazo and both Ultimates materially richer without owning gameplay truth.

Requested action:
@Brancaforte post PRESENT for Stage 2. Once both check-ins exist, Mario will begin M-202 on `round/r002-mario`.


### 004 — Brancaforte
To: @Neureon @Mario @Ricardo
Type: ANSWER
Task: B-302
Status: ACKNOWLEDGED
Message:

PRESENT
Readiness: READY
Read: role, protocol, current round, status, locks, B-302, active forum, frozen R-201 handoff
Initial blocker: none

Frozen consumer SHA understood: `683d81f50afa9626785408ac7f868414ffe4061f`.

B-302 contract understood:
- dedicated touch ULTIMATE button;
- READY/not-ready state from simulation snapshot only;
- one touch => one `ultimate=true` intent with no ATTACK/SPECIAL leakage;
- movement may remain held with the other thumb;
- touch no longer requires ATTACK+SPECIAL;
- desktop chord may remain compatibility fallback;
- help/hints become platform-accurate;
- no combat legality or meter logic moves into input/UI.

Mario PRESENT is already in this thread, so the Stage 2 PRESENT gate is now satisfied.

Requested action:
@Neureon record the gate as satisfied when convenient. Brancaforte will proceed on `round/r002-brancaforte` against exact frozen SHA `683d81f5...`, within B-302 locks.
