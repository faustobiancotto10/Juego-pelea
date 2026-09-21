# V0.7 — CPU Difficulty Contract

Status: FROZEN FOR R005

## User-facing levels

Exactly three released levels:
- **FÁCIL**
- **NORMAL**
- **DIFÍCIL**

Default: **NORMAL**.

Difficulty is selected during opponent selection and persists through stage select, VS and rematch.

## Fairness invariants — all levels

CPU may observe only the same delayed public snapshot model already used by `CpuController`.

No difficulty may:
- read current raw player input;
- inspect future inputs/state;
- bypass move/resource legality;
- alter fighter health/damage/guard/super;
- block perfectly by hidden knowledge;
- ignore startup/recovery/cooldowns;
- use a different simulation clock.

Same difficulty + same seed + same snapshots must replay identically.

## Policy model

Add a typed `CpuDifficulty = 'easy' | 'normal' | 'hard'`.

Keep fighter-specific `CpuProfile` as identity/tactics. Difficulty produces an **effective policy** from fighter profile + difficulty modifiers; it does not duplicate every fighter profile.

### Initial parameter table

| Parameter | Easy | Normal | Hard |
| --- | ---: | ---: | ---: |
| minimum reactionTicks | 18 | 12 | 8 |
| decisionTicks floor/target | 12 | 8 | 5 |
| added miss chance | +0.20 | +0.00 | -0.15 (floor 0.08) |
| confirm multiplier/addition | ×0.65 | ×1.00 | +0.10 (cap 0.95) |
| Ultimate attempt probability | 0.18 | 0.28 | 0.36 |
| Push Guard attempt probability | 0.12 | 0.22 | 0.30 |
| punish/spacing discipline | low | baseline | high |
| intentional suboptimal neutral choices | frequent | baseline | rare |

Fighter-authored reaction/decision values remain inputs; difficulty clamps/modifies them rather than erasing character identity.

## Hard difficulty improvement

Hard may improve:
- spacing target selection;
- punish selection after delayed observed recovery;
- probability of converting confirmed short routes;
- resource-aware Ultimate timing;
- repeated-move adaptation based on **already delayed observed history**;
- commitment quality.

Hard may not reduce observation delay below 8 ticks in V0.7.

## Anti-repetition

Maintain a short delayed history of opponent move IDs/categories.

Hard may modestly increase the weight of a valid counter-plan after observing repeated use at least twice. It cannot know a move will repeat before a new delayed cue/state makes that inference legal.

This specifically helps punish Lengua spam without giving the CPU privileged information.

## UI

Brancaforte exposes the three levels on the CPU/opponent selection screen.

The choice must be explicit, keyboard/touch reachable and visible again on VS/result where useful.

No separate settings screen is required.

## Tests

- deterministic trace per level and seed;
- before each level's observation delay expires, immediate hidden/current cues cannot change output;
- Hard must recognize/respond to more valid cues across a fixed corpus than Easy;
- Hard must produce more successful legal confirmations/punishes over a seeded corpus, without stat changes;
- all four fighters' CPU profiles work at all three levels;
- rematch preserves difficulty;
- changing fighters may preserve selected difficulty unless user explicitly changes it.

## Human acceptance

On the same matchup, a normal player should clearly perceive:
- Easy leaves punish opportunities and misses cues often;
- Normal resembles the V0.6 intended baseline;
- Hard pressures/defends more consistently but still makes visible mistakes and remains beatable without exploiting AI bugs.
