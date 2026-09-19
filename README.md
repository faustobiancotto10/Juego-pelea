# Juego Pelea — V0.5

Mobile-first 2D fighting game prototype built with TypeScript, Canvas2D and browser DOM UI.

## Current playable loop

Character Select → CPU rival → VS → best-of-three fight → result → rematch / character select.

## Controls

- D-pad / A-D: move.
- Hold away: walk backward; compatible incoming attacks can be blocked when the fighter is legally able to guard.
- Down + away: crouch block.
- Double tap forward: dash.
- Double tap away: backdash.
- JUMP / W / Space: jump.
- ATTACK / J: standing normal; short routes chain only through authored windows.
- Abajo + ATTACK: grounded low normal.
- SPECIAL / K with no down direction: ranged Special — Lengua for Camaleoni, Chorizo for Supernariz.
- Abajo + SPECIAL: close Special — Coletazo for Camaleoni, Tramontana for Supernariz.
- SPECIAL while actually blocking/blockstunned: requests Push Guard; simulation validates GUARD cost and legality.
- ULTIMATE touch button / L on keyboard: requests Ultimate. SUPER readiness and all execution legality are simulation-owned.

Input action presses are queued as command edges so quick taps between simulation samples are not lost. Direction is captured when the action is pressed; input reset clears both physical state and pending simulation commands when play is suspended.

Blocking consumes GUARD only when a hit is actually blocked. If GUARD reaches zero, the fighter suffers guard break. Missed committed attacks and Specials expose recovery windows; successful short routes still require valid authored confirms.

## Development

```bash
npm test
npm run build
npm run serve
```

`CombatSimulation` owns gameplay truth at a fixed logical 60 Hz. Rendering is procedural Canvas2D; supplied character reference images are never used as runtime fighter sprites.
