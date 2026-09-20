# Handoff — V06-R1

Round: R004-V06-CONTENT-EXPANSION  
Task: V06-R1 — Universal Ultimate arbitration / Clash  
From: Ricardo  
To: Ricardo V06-R2  
Branch: `round/r004-ricardo`  
Exact product SHA: `76290f11b36b44a7d8cc9565ed59cf15c4c69e3a`  
R0 parent: `3cc43b031f62a6699a73d92a294c36504cda17e3`  
Status: GREEN

## Delivered

- common Ultimate proposal/arbitration path after ordinary strike/projectile contacts;
- first effective Ultimate tick recorded as `ultimateEffectiveTick`;
- four-effective-tick Clash eligibility and entry-difference window;
- typed confrontation-volume helper in `ultimateArbitration.ts`;
- dashCapture swept forward confrontation volume;
- suctionCapture forward field without pre-arbitration pull mutation;
- eligible Clash resolves before capture;
- outside Clash window earlier effective entry wins;
- exact mutual late capture tie becomes symmetric committed whiff;
- no slot-0 capture preference;
- accepted Clash clears moves/capture locks/projectiles/pending commands;
- exactly one `ultimate-clash` event;
- snapshot `clash` state and per-fighter `clashRecoveryFrames`;
- 12 fixed step hitstop calls followed by 30 advancing launch ticks;
- bilateral launch preserves pre-collision left/right order;
- base separation >=160 when necessary, with arena clamping/transfer;
- launch vx ±16, vy 8, 0.90 horizontal decay;
- landing during Clash does not add ordinary landing recovery;
- both fighters release together at tick30;
- action edges discarded during freeze and early launch; existing six-tick command buffer opens only in the final six launch ticks;
- existing successful Ultimate release path remains shared and unchanged.

## Public state additions

`FighterSnapshot`:
- `ultimateEffectiveTick:number|null`
- `clashRecoveryFrames:number`

`MatchSnapshot`:
- `clash:{id,phase:'freeze'|'launch',launchTick,remainingLaunchTicks}|null`

`CombatEvent`:
- `ultimate-clash` with `{clashId,fighters:[0,1],x,y}`

## Verification

Validation PR: #21, draft only.  
Repository verification run: `35534134955` (#777), job `106140000329`.

Results:
- coordination contract: 6/6 PASS;
- full suite: 218/218 PASS;
- build: PASS.

R1 acceptance coverage includes:
- all currently expressible ordered dash/suction pairings;
- mirrored slot geometry;
- exact 12-step freeze;
- exact 30 advancing launch ticks;
- center / left-wall / right-wall release;
- no damage/hit event/meter refund on Clash;
- entry difference 4 outside Clash;
- earlier effective entry capture winner;
- exact late mutual tie -> dual whiff;
- ordinary projectile interruption before arbitration;
- projectile/pending-command cleanup;
- superseded V0.5 same-kit slot-priority expectation replaced by symmetric Clash.

## Deferred to V06-R2

- `capCapture` confrontation/probe primitive;
- Juanchi package;
- Rugby Boomerang;
- authored multi-hit windows;
- Juanchi rearm/ranged availability;
- 3x3 Clash matrix including capCapture.

## Next action

AUTO_CHAIN advances directly to V06-R2 from exact SHA `76290f11b36b44a7d8cc9565ed59cf15c4c69e3a`.
