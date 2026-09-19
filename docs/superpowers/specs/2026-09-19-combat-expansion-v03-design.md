# V0.3 Combat Expansion — Approved Product Design

Status: approved by user for Round R001
Scope owner: Neureon
Implementation owners: Ricardo, Mario, Brancaforte, Germinator, Gonza

## Intent

V0.3 expands the two-fighter prototype into a materially deeper combat slice while stress-testing the repository multi-agent workflow. The round must improve combat fairness, character identity, supers/ultimates, corner defense, CPU behavior, feedback, mobile UX, automated balance coverage and release discipline without adding a third fighter, story mode, progression, saves or a new stage.

V0.2 remains the baseline: deterministic fixed 60 Hz simulation, simulation-owned combat truth, procedural articulated Canvas2D fighters, mobile-landscape-first controls, contextual guard, GUARD meter, dash/backdash and non-frame-perfect CPU.

## Character naming

The fighter previously displayed as Camaleón is renamed:

- full name: **Camaleoni Cagoni**
- normal short display name: **Camaleoni**

Existing internal IDs may remain stable if changing them would create unnecessary save/test migration risk. User-facing text should use Camaleoni.

## Universal fighter kit contract

Every fighter in this roster follows the same high-level capability slots:

1. melee attack/chain;
2. long-range special;
3. close-range special;
4. ultimate;
5. universal movement/defense: walk, jump, dash, backdash, guard, crouch guard and Push Guard.

The slots are structurally comparable, not mechanically identical.

### Camaleoni

- melee: claw/garras chain;
- long special: **Lengua**;
- close special: **Coletazo**;
- ultimate: **Invisibilidad + Dash de captura**.

### Supernariz

- melee: nose/nariz chain;
- long special: **Chorizo**;
- close special: **Tramontana**;
- ultimate: **Aspiración + Nazazo**.

## Balance rule: no free advantages

Base melee reach should live inside a comparable band. Exact ranges do not need to be identical, but a meaningful reach advantage must be paid for elsewhere through startup, recovery, damage, knockback, cancelability, movement commitment or another observable drawback.

No fighter may be strictly better merely because it has:
- longer melee reach with no cost;
- better close pressure and equally strong zoning;
- a longer long-range tool with no compensating weakness.

Ricardo authors the first numerical tuning; Germinator must challenge strict dominance with matchup scenarios rather than only isolated unit tests.

## Long-range specials

### Camaleoni — Lengua

The tongue is physically connected to Camaleoni and is not a free-moving projectile. It may have straight and low authored variants.

Design goals:
- excellent space control;
- range comparable to or slightly better than Chorizo when measured as threat reach;
- meaningful startup/recovery/commitment on a miss;
- remains connected to the fighter and therefore cannot remain active while Camaleoni freely advances behind it.

The current situation where Camaleoni's long-range threat is simply shorter/worse than Supernariz's must not survive V0.3.

### Supernariz — Chorizo

Chorizo is an independent projectile.

Design goals:
- strong long-range threat;
- the projectile can continue while Supernariz regains movement according to authored timing;
- visible startup;
- authored cooldown;
- jump/position counterplay;
- it does not also need an uncompensated range advantage over Lengua.

## Close specials

### Camaleoni — Coletazo

Close/short-mid special centered on separation.

Design goals:
- moderate damage;
- high knockback / space reset;
- useful when pressured;
- punishable recovery on whiff;
- does not turn Camaleoni into the stronger close-range pressure character.

### Supernariz — Tramontana

Close special centered on pressure and disruption.

Design goals:
- moderate damage;
- controlled pushback;
- authored hitstun/chill/disruption;
- can support Supernariz's pressure identity without being a universal escape or infinite-pressure tool.

Coletazo and Tramontana occupy the same kit slot but intentionally solve different problems.

## SUPER meter

Add a SUPER resource separate from HP and GUARD.

- capacity: one full ultimate charge;
- fills through active combat, using damage dealt and damage received as the primary sources;
- no passive time charging;
- no manual charge button;
- exact gain formula and weighting are delegated to Ricardo and audited by Germinator;
- must be deterministic at fixed 60 Hz;
- reaching full meter exposes a clear READY state to UI/render consumers;
- successful or failed ultimate activation consumes the full meter once the committed capture attempt begins.

The losing player should still have a path to meter through receiving damage, but taking damage must not be the optimal meter strategy.

## Ultimate universal capture contract

Both ultimates are **unblockable capture attacks**.

They are evaded through positioning/movement, not guard.

Universal rules:
- each ultimate has visible authored startup;
- each checks only a considerable but finite forward-facing capture region;
- being behind the attacker or outside the valid capture region avoids it;
- jumping/crossing over can evade if it moves the defender out of the valid capture region before capture;
- guard and crouch guard do not block a valid capture;
- once capture succeeds, the authored combo/sequence is guaranteed until completion;
- the defender cannot break out in the middle of the sequence;
- whiff/miss consumes the meter and leaves authored recovery;
- neither ultimate covers the entire arena;
- both should land in a similar total-damage band even though their behavior differs.

Exact damage, range, startup and recovery are tuning values, not product decisions. Germinator must verify neither ultimate becomes a low-risk full-screen checkmate.

## Camaleoni ultimate — Invisibilidad + Dash

Activation:
1. short readable startup;
2. Camaleoni becomes visually invisible/near-invisible for the dash presentation;
3. a forward dash performs the capture check;
4. if the capture region contains the opponent, the ultimate enters a guaranteed short combo;
5. Camaleoni visibly returns/reappears for the finishing impact;
6. if the dash misses or the opponent has crossed behind/out of range, the ultimate whiffs, meter is lost and recovery applies.

The renderer presents invisibility; simulation still owns position, capture validity, damage and timeline.

## Supernariz ultimate — Aspiración + Nazazo

Activation:
1. short readable inhale startup;
2. a forward-facing suction field attempts to pull an opponent who remains inside its authored capture region;
3. if the capture condition is reached, the sequence locks;
4. Supernariz delivers a heavy nazazo;
5. the opponent is launched a large distance, strongly resetting spacing;
6. if the opponent escapes the capture region/crosses behind before capture, it whiffs, meter is lost and recovery applies.

The suction must be simulation-authored. Renderer effects only visualize it.

## Corner and defense rework

The corner remains advantageous for the attacker but may not become an unavoidable prison.

### Corner pushback transfer

When a blocked hit attempts to push a defender farther into an arena wall and that displacement cannot occur, authored excess separation should transfer to the attacker so correctly blocking a pressure string can eventually create space.

The exact transfer curve is delegated to Ricardo and balance QA.

### Push Guard

Universal defensive mechanic using the existing Special input while in a valid blocking/blockstun context.

Goals:
- consumes a meaningful amount of GUARD;
- creates strong separation;
- deals zero or negligible damage;
- unavailable during Guard Break or without enough GUARD;
- cannot be spammed as a free neutral tool;
- no new permanent mobile action button.

Initial tuning target may start around 30–35 GUARD but is explicitly subject to Ricardo/Germinator testing.

## Movement/guard review

V0.3 must re-check, not replace:
- dash/backdash commitment and corner behavior;
- short backdash strike-evasion window;
- jumping over lows/projectiles;
- crossover/facing behavior;
- landing vulnerability/commitment;
- standing/crouching guard;
- Guard Break;
- interaction of all above with close specials and ultimates.

No universal invulnerability is added merely to solve corner pressure.

## Input contract

Keep the permanent mobile layout:
- 8-direction D-pad;
- ATTACK;
- SPECIAL;
- JUMP.

No fourth persistent action button.

Required contextual intents include:
- long/close/air/directional special resolution;
- Push Guard while actually blocking;
- Ultimate through ATTACK + SPECIAL chord when SUPER is full.

Input priority must be explicit and tested so one physical gesture does not accidentally fire multiple actions. A small input buffer/chord tolerance may be added, but input plumbing does not decide combat outcomes.

## CPU V0.3

CPU must understand the new legal action/state model without reading the player's raw input.

Required behavior:
- character-specific range preferences;
- uses/answers close specials;
- can reason about SUPER and ultimate opportunities;
- can sometimes use Push Guard when pressured;
- can miss reactions and make deterministic imperfect decisions;
- does not fire ultimate immediately at 100 meter regardless of context;
- preserves short commitment windows instead of frame-perfect switching.

Camaleoni CPU should generally value space/control. Supernariz CPU should generally value approach/pressure.

## HUD / onboarding

HUD must communicate HP, GUARD and SUPER for both fighters while protecting the mobile landscape playfield.

Required:
- SUPER fill and READY state;
- existing GUARD/Guard Break clarity;
- restrained cooldown feedback where useful, especially Chorizo;
- controls/help updated for Push Guard and Ultimate chord;
- first-use/first-ready hint for SUPER without a mandatory tutorial.

UI may read simulation snapshots and pause help overlays, but never decide combat truth.

## Rendering / game feel

Procedural rendering must cover:
- Coletazo;
- Tramontana close-special presentation;
- ultimate startup/capture/sequence for both fighters;
- Camaleoni invisibility/reappearance;
- Supernariz suction/nazazo/launch;
- Push Guard;
- differentiated normal hit, heavy hit, block, Guard Break and ultimate feedback;
- authored hitstop intensity;
- restrained screen shake;
- optional micro camera emphasis for ultimates if mobile readability remains good.

All supplied character imagery remains visual reference only. No reference PNG/sprite sheet may become runtime fighter frames/textures.

## QA / balance harness

The round requires repeatable scenario coverage, not only manual impressions.

At minimum cover:
- Camaleoni cornered by Supernariz;
- blocked Supernariz pressure string against wall;
- Push Guard valid/invalid/low-GUARD/Guard-Break cases;
- melee reach/tradeoff comparison;
- Lengua versus Chorizo threat-space comparison;
- both ultimates: valid capture, block attempt, behind-attacker, out-of-range, crossover/jump evade, whiff meter consumption, recovery and guaranteed sequence;
- CPU use/non-use of meter and defense;
- deterministic replay/state outcome;
- regression of V0.2 guard/dash/jump/CPU rules.

## Performance

More effects may not compromise mobile-first play.

Prefer bounded particles/effects, avoid unbounded per-frame allocations, and keep combat simulation independent of render load.

## Release target

The accepted round ships:
- tested TypeScript/source;
- updated standalone play.html;
- synchronized GitHub Pages build;
- public build matching the approved integrated source.

## Explicitly out of scope

- third fighter;
- new stage;
- Story Mode;
- progression/economy;
- save-system expansion;
- online multiplayer;
- new permanent action button;
- migration to another engine;
- runtime use of supplied character images/sprite sheets.
