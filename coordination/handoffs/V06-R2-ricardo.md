# Handoff — V06-R2

Round: R004-V06-CONTENT-EXPANSION  
Task: V06-R2 — Juanchi gameplay primitives / playable package  
From: Ricardo  
To: Ricardo V06-R3  
Branch: `round/r004-ricardo`  
Exact product SHA: `0bf6a5675ed9c1cbbbafbdd40a83ebde85ec86bd`  
Parent R1 SHA: `76290f11b36b44a7d8cc9565ed59cf15c4c69e3a`  
Status: GREEN

## Delivered

- Juanchi is the third default playable fighter through Character Package composition.
- C2 authored multi-hit windows with per-instance hit IDs/ledger and legacy single-hit compatibility.
- Fricción uses three authored windows and clean total 60.
- C3 returning projectile lifecycle for Rugby Boomerang: outbound/turn/return/catch, swept contact, one contact per leg, 42-tick return limit, 30-tick rearm and authoritative availability state.
- C4 capCapture: simulation-owned head regions, cap probe, capture anchor, common Ultimate arbitration/Clash integration and shared release.
- Police Cap Rage totals 190 and final authored beat publishes majorImpact.
- CpuTactics drives Juanchi without fighter-ID branches; return leg gets one delayed recognition cue.
- Existing Camaleoni/Supernariz seeded policy path remains unchanged when tactics are absent.
- Juanchi visual rig remains a deliberate downstream Mario dependency; current renderer has an explicit missing-rig placeholder, never an identity fallback.

## Public contracts added

FighterSnapshot:
- rangedAvailability
- rangedRecoveryFrames
- ultimateProbe
- captureAnchorX

ProjectileSnapshot:
- visualKey
- vy
- phase
- phaseTick
- age

Content:
- MoveDefinition.hits / MoveHitWindow
- Projectile kind returnToOwner / returnConfig
- FighterDefinition.captureHead
- Ultimate kind capCapture
- CpuProfile.tactics

## Verification

Draft validation PR: #21.  
Repository verification run: `35535264177` (#800), job `106143039047`.

- coordination: 6/6 PASS
- full suite: 233/233 PASS
- build: PASS

Acceptance includes:
- Juanchi low/air and 108 jab→shoulder route;
- Fricción three contacts;
- Rugby two-leg contact, turn/catch, wall turn, owner-hit cancel, exact advancing-tick timeout, rearm and round reset;
- Police Cap success against all three targets in both attacker slots plus jump evasion/whiff;
- full 3x3 ordered Ultimate Clash matrix in both side assignments;
- same-seed Juanchi CPU/snapshot determinism.

## Next action

AUTO_CHAIN starts V06-R3 from exact SHA `0bf6a5675ed9c1cbbbafbdd40a83ebde85ec86bd`.
