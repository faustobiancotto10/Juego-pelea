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
