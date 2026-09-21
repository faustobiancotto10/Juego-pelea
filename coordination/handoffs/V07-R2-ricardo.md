# Handoff — V07-R2

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-R2 — El Toro gameplay/core  
From: Ricardo  
To: Ricardo V07-R3  
Branch: `round/r005-ricardo`  
Exact candidate SHA: `3e8eca7d74247755faad0105e720cff1a94d5ced`  
Status: GREEN

## Delivered

- Released fighter four: `el-toro`, max health 1100, heavy bruiser movement/body contract.
- Complete normal/low/air/short route.
- Topete via reusable simulation-owned committed forward movement:
  - drive frames 8–16 at 11/tick;
  - hit frames 10–16;
  - one contact; drive stops after contact;
  - blockable, interruptible, wall-bounded, no armor/invulnerability.
- Shawarmazo via existing `linear` projectile:
  - speed 7.6, ttl 64, damage 62, cooldown 96, one legal contact.
- Super Eructo via `forwardBlast`:
  - startup 26, blast 18, recovery 30;
  - forward-only 390×(20–145) logical field;
  - authored beats 45/45/90 = 180 clean maximum;
  - blockable chip/guard behavior;
  - no capture semantics / no rear hit / no homing.
- `forwardBlast` confrontation volume participates in common Universal Ultimate Clash before blast contact resolution.
- El Toro CPU profile consumes the same Easy/Normal/Hard policy layer as the existing roster.
- Presentation metadata publishes `rigKey`, `portraitKey`, Ultimate/projectile visual keys for downstream roles.
- Simple hitboxes now type/validate optional authored `blockKnockback`, matching the engine behavior already used for multi-hit windows.

## Verification

Validation PR: #29 (draft only).  
Repository verification run: #1023 / job 106202559183.

Results:
- coordination contract: 6/6 PASS;
- full suite: 294/294 PASS;
- build: PASS.

Direct R2 evidence:
- El Toro release/stats: PASS;
- Topete drive/contact: PASS;
- Topete block/recovery/wall/interrupt: PASS;
- Shawarmazo one-contact/cooldown: PASS;
- Super Eructo front/block/180 sequence: PASS;
- forwardBlast Clash against every released Ultimate kind in both slot orders: PASS;
- El Toro CPU deterministic on Easy/Normal/Hard: PASS.

## Runtime boundary

Super Eructo remains a non-capture Ultimate. It shares startup/commit/arbitration phases with the common Ultimate state machine solely to preserve meter/timing/Clash semantics; blast beats resolve afterward from authoritative field geometry and never set `capturedBy`.

## Next

V07-R3 is automatically eligible: freeze one complete four-fighter gameplay/core candidate with 16 ordered matchups, 4×4 Ultimate matrix, difficulty matrix, cleanup/reset and existing schema/Lengua evidence.
