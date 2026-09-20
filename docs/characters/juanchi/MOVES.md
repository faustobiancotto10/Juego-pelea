# Juanchi Moves

Authoritative timing/numeric source: [complete Juanchi contract](../../superpowers/specs/2026-09-20-v06-juanchi-character-contract.md).

## Normal package

| ID | Input | Timeline | Damage | Role |
| --- | --- | --- | ---: | --- |
| `juanchiJab` | ATTACK | active 5–7, total 20 | 44 | mid opener; clean cancel to shoulder |
| `juanchiShoulder` | confirmed ATTACK | active 6–8, total 25 | 64 | route finisher |
| `juanchiLow` | DOWN+ATTACK | active 7–9, total 25 | 36 | low |
| `juanchiAir` | airborne ATTACK | active 5–9, total 24 | 62 | overhead |

Clean jab→shoulder total: 108. No block cancel.

## SPECIAL — Rugby Boomerang

Move `rugbyBoomerangThrow`: spawn frame 12, total 34.

Projectile `juanchiRugby`, `visualKey:'rugby-ball'`, `kind:'returnToOwner'`.

Frozen lifecycle:
- outbound speed 12/tick for 18 advancing updates;
- 4-tick non-damaging turn;
- return speed 12 toward current owner anchor;
- max 42 return updates;
- catch radius 24;
- outbound damage 34;
- return damage 30;
- at least 10 advancing ticks between contacts on same defender;
- one hit maximum per leg;
- 30-tick rearm after catch/despawn;
- one active ball maximum.

No manual recall, charge or jump throw.

## DOWN+SPECIAL — Fricción

Contacts at frames 7, 10 and 16; total move 36.

Damage:
- 14
- 14
- 32

Total 60.

Three authored hit identities, no projectile, no hidden flame orb, no cancel tree. Push Guard/spacing may escape later beats according to the system contract.

## ULTIMATE — Police Cap Rage

`policeCapRage` / `capCapture`.

- startup 20;
- committed cap probe travels forward up to 20 movements;
- probe speed 14;
- no homing;
- only valid head capture confirms;
- whiff recovery 30;
- success sequence 40 + common success recovery 16;
- total damage 190;
- final impact 130 after four 15-damage sequence hits;
- common V0.6 successful launch/release.

Cap prop exclusivity: belt → hand → flight → opponent head → cleared. It is not a normal attack weapon.
