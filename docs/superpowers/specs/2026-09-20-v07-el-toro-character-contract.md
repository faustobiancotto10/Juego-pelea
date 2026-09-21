# V0.7 — El Toro Character Contract

Status: FROZEN IMPLEMENTATION CANDIDATE  
ID: `el-toro`  
Display: **EL TORO**

## Identity

Archetype: **Heavy bruiser / line breaker**.

El Toro wins by taking space with a committed body charge, forcing respect with a slow heavy projectile, then cashing out with high-impact close pressure.

Strengths:
- highest base health in V0.7;
- strong single-hit pressure and knockback;
- threatening committed forward burst;
- heavy ranged projectile;
- large forward Ultimate.

Weaknesses:
- slowest walk;
- obvious commitment/recovery;
- large hurtbox;
- no armor or invulnerability by default;
- projectile is slow/jumpable;
- Super Eructo has long telegraph.

## Fighter stats

- maxHealth: **1100**
- walkSpeed: **3.90**
- jumpSpeed: **11.50**
- gravity: **0.78**
- width: **64**
- height: **124**
- capture head: standY **208**, crouchY **192**, halfWidth **28**, halfHeight **23**
- accent: blue/white; effect accent blue-gold.

## Normal route

### `toroJab`
- binding: standing
- total: 22
- active: 6–8
- damage: 50
- hitstun: 17
- blockstun: 8
- knockback: 3.2
- guard damage: 10
- clean-confirm cancel: frames 10–13 → `toroShoulder`

### `toroShoulder`
- chain finisher
- total: 28
- active: 7–10
- damage: 70
- hitstun: 18
- blockstun: 9
- knockback: 7.2
- guard damage: 16

Maximum clean short route: **120**.

### `toroLow`
- total: 28
- active: 8–10
- damage: 42
- low
- hitstun: 14
- blockstun: 8
- knockback: 4.0

### `toroAir`
- total: 26
- active: 6–10
- damage: 68
- overhead
- hitstun: 15
- blockstun: 9
- knockback: 6.0

## Close Special — Topete

Move ID: `topete`.

Concept: low explosive rugby-style body charge.

### Lifecycle
- totalFrames: **42**
- preparation: 0–7
- authored forward drive: **8–16**
- active hit window: **10–16**
- recovery: 17–41

### Movement primitive
Add one small data-driven move field, e.g.:
`movement: { start: 8, end: 16, speed: 11, kind: 'forward', stopAtWall: true }`.

It is simulation-owned and may be reused by future committed movement Specials. Do not create a generic scripting engine.

### Contact
- width: ~100
- vertical body band: grounded torso
- damage: **88**
- chip: 5
- guard damage: 18
- hitstun: 18
- blockstun: 10
- knockback: **10.5**
- block knockback: ~3
- hitstop: 7
- strong mid

### Rules
- no armor;
- no invulnerability;
- does not pass through defender;
- stops/bounds at arena wall;
- one contact per use;
- on whiff or block the remaining recovery is punishable;
- receiving a clean interrupt before contact ends the move normally.

Topete is not a capture and not an Ultimate.

## Long Special — Shawarmazo

Move ID: `shawarmazoThrow`.  
Projectile key: `toroShawarma`.  
Kind: existing `linear`.  
Visual key: `shawarma`.

Throw:
- spawn frame: **13**
- totalFrames: **41**
- spawn offsetX: ~62
- spawn offsetY: ~70

Projectile:
- speed: **7.6/tick**
- ttl: **64**
- half-size: **20×12**
- damage: **62**
- chip: 4
- guard damage: 13
- hitstun: 16
- blockstun: 9
- knockback: **8.0**
- block knockback: 2.4
- corner transfer: 6
- hitstop: 5
- cooldown: **96**
- one impact; no return/homing.

Identity versus other ranged tools:
- slower and visually heavier than Chorizo;
- far less instantaneous reach than Lengua;
- no return/path manipulation like Rugby Boomerang;
- rewards prediction but is visibly jumpable.

## Ultimate — Super Eructo

Ultimate key: `toroSuperEructo`.  
New bounded kind: **`forwardBlast`**.  
Visual key: `super-eructo`.

This is the only new Ultimate primitive required by El Toro.

### Lifecycle
- startup: **26**
- committed forward blast phase: **18**
- recovery: **30**
- meter is spent at commitment under the common Ultimate rules.

### Geometry
- forward range: **390**
- grounded blast band: approximately y 20–145 above floor;
- no homing;
- no rear hitbox;
- no fullscreen reach.

The blast expands/exists from authoritative simulation geometry. Green gas rendering does not decide collision.

### Damage
Authored maximum clean sequence:
- blast beat A: 45
- blast beat B: 45
- final beat: 90
- total: **180**

Final clean beat:
- strong knockback/launch;
- target vx about **15** away;
- vy **5**;
- hitstun **28**;
- major hitstop **10**.

Blocking is allowed:
- each beat uses reduced chip;
- substantial but finite guard damage;
- no unblockable capture semantics.

### Counterplay
Before blast commitment:
- interrupt startup;
- leave forward range;
- jump sufficiently above the authored blast band.

After emission:
- blocking is valid;
- the field is directional and does not turn/hunt the defender.

### Clash
`forwardBlast` participates in Universal Ultimate Clash.

Confrontation volume during effective ages 0–3:
- forward rectangle from El Toro center to current blast frontier/range;
- grounded vertical band matching the logical blast;
- positive-area overlap/opposing-facing/effective-entry rules remain identical.

On accepted Clash, the common V0.6 zero-damage bilateral Clash result wins over blast hits for that arbitration point.

## CPU identity

Preferred range: roughly **125–215**.  
Pressure range: ~115.

CPU tendencies:
- walk/guard into threatening midrange;
- Topete only when commitment is plausible;
- Shawarmazo primarily at ~210–390;
- do not chain projectiles mindlessly;
- Ultimate only within viable forward range/telegraph context;
- difficulty modifies decision quality but not El Toro's authored identity.

## Presentation metadata

Suggested:
- `rigKey: 'el-toro'`
- `portraitKey: 'el-toro'`
- `ultimateVisualKey: 'super-eructo'`
- projectile `visualKey: 'shawarma'`
- select kicker: `FUERZA Y EMPUJE`
- role: `Bruiser`
- moves: `Combo · Low · Shawarmazo / Topete`
- ranged availability label: `SHAWARMA`

## Package / validation

R005 must extend validators for:
- move movement primitive finite frames/speed and frame bounds;
- `forwardBlast` required geometry/beat fields;
- portraitKey non-empty/registered at presentation QA;
- no duplicate fighter/projectile/Ultimate keys.

## Acceptance

- player and CPU El Toro are selectable;
- all **16 ordered matchups** among four fighters execute/reset/rematch;
- Topete is interruptible and punishable on whiff/block;
- Shawarmazo has exactly one legal contact and obeys cooldown;
- Super Eructo cannot hit behind, cannot home and never exceeds defined field;
- all 4×4 Ultimate pairings are tested for Clash eligibility/tie/cleanup;
- no El Toro reference raster appears in runtime bundle;
- procedural likeness/effects are reviewed against repository references.
