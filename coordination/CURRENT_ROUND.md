# Current Round

Status: ACTIVE
Round: R003-V05-COMBAT-LOOP
Goal: Repair combat commitment/input foundations and redesign the V0.5 combat loop so active fighting is more rewarding than passive guard + Special repetition.
Staged activation: enabled
Planned agents: Neureon, Ricardo, Brancaforte, Germinator, Mario, Gonza
Current activation gate: STAGE_3_CORE_QA
Required at current gate: Neureon, Germinator
Start token: START_REPAIR — AC06 COLETAZO RECOVERY
Completion token: not issued

## Product authority

External master audit:
- `docs/superpowers/specs/2026-09-19-v05-combat-loop-master-audit.md`

Implementation plan:
- `docs/superpowers/plans/2026-09-19-v05-combat-loop-implementation-plan.md`

External handoff:
- `coordination/forum/2026-09-19-v05-external-audit-handoff.md`

Astra is not part of this round and is not required for any gate.

## Selected V0.5 package

- repair attack+guard commitment bug;
- repair browser/pointer lifecycle and control selection/stuck-input bug;
- lossless action buffering through hitstop;
- reliable short melee routes;
- one grounded low normal per fighter;
- down/down-forward + SPECIAL = Coletazo/Tramontana;
- ranged Specials remain useful but carry real commitment/counterplay;
- repair airborne carry/facing/crossover behavior;
- real Ultimate launch/separation;
- delayed, seeded CPU perception instead of instant reaction;
- targeted procedural animation/game-feel pass;
- bounded character-kit extraction sufficient for imminent new fighters.

Explicitly deferred:
- grabs/throw-tech;
- blanket large cooldowns;
- new universal resources;
- long combo system;
- fifth action button;
- generic scripting engine;
- new playable fighter during this round.

## Stages

### STAGE_0_SCOPE — complete
Neureon converted the Astra audit into executable contracts and round ownership.

### STAGE_1_REPAIR_FOUNDATIONS — complete
Parallel:
- Ricardo R1: guard/commitment/contact invariants.
- Brancaforte B1: browser-safe pointer/control lifecycle.

No shared product files between them.

### STAGE_2_CORE — complete
Ricardo R2 → R3 → R4 → R5:
content boundary, command buffer/combos/grammar, air+Ultimate exit, CPU perception.
Freeze one exact core consumer SHA.

### STAGE_3_CORE_QA — current
Germinator G1 independently attacks the frozen core.

### STAGE_4_PRESENTATION_UX
Parallel on accepted core:
- Mario M1 presentation/animation.
- Brancaforte B2 final input grammar/UI responsiveness.

### STAGE_5_INTEGRATED_EXPERIENCE
Germinator G2 + Neureon: integrated adversarial QA and human/device playtest gate.

### STAGE_6_RELEASE
Gonza Z1 integrates accepted SHAs, regenerates standalone, verifies Pages and releases.

## Branches

- Ricardo: `round/r003-ricardo`
- Brancaforte: `round/r003-brancaforte`
- Mario: `round/r003-mario`
- Germinator: `round/r003-germinator`
- Gonza: `round/r003-integration`

Live coordination remains on `main`. Product code stays on assigned branches. Gonza integrates accepted SHAs/deltas only.

## Current gate

Stage 1 accepted checkpoints:
- R1 Ricardo: `5f6d59eb2dae2e386c55593a9af346e184d5611f`
- B1 Brancaforte: `4eddddad0a69df0b6562e28f3e55fd66bafd4fc5`

Stage 2 frozen core accepted for QA activation: `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc` (Ricardo R5; CI #512, 161/161 + build per handoff). Ricardo is WAITING_FOR_TEAM. G1 verdict on frozen core `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc`: BLOCK. Sole automated blocker is AC06: whiffed Coletazo lacks a clean normal recovery punish. Stage 4 remains closed. Ricardo must publish a minimal RED→GREEN replacement core; Germinator then reruns full G1.
