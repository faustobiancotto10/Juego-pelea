# Juego Pelea — V0.2

Mobile-first 2D fighting game prototype built with TypeScript, Canvas2D and browser DOM UI.

## Current playable loop

Character Select → CPU rival → VS → best-of-three fight → result → rematch / character select.

## Controls

- D-pad / A-D: move.
- Hold away: walk backward; compatible incoming attacks are blocked automatically.
- Down + away: crouch block.
- Double tap forward: dash.
- Double tap away: backdash with a short strike-evasion window.
- JUMP / W / Space: jump.
- ATTACK / J: normal attack.
- SPECIAL / K: special attack. Down + SPECIAL selects each fighter's alternate special.

Blocking consumes GUARD only when a hit is actually blocked. If GUARD reaches zero, the fighter suffers a short guard break. Missed light attacks cannot freely cancel into the rest of a combo, so whiffing creates a punish window.

## Development

```bash
npm test
npm run build
npm run serve
```

`CombatSimulation` owns gameplay truth at a fixed logical 60 Hz. Rendering is procedural Canvas2D; supplied character reference images are never used as runtime fighter sprites.
