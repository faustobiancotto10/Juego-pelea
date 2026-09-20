# Current Round

Status: ACTIVE  
Round: R004-V06-CONTENT-EXPANSION  
Execution mode: AUTO_CHAIN  
Goal: ship V0.6 with Juanchi, Cancha 56, physical locomotion, Universal Ultimate Clash, targeted combat fixes, scalable content architecture and a real fighting-game front end.

Start token: `START_ROUND — AUTO_CHAIN`  
Issued: 2026-09-20  
Per-task Neureon gates: disabled  
Completion token: not issued

## Exact product baseline

Product base for every V0.6 feature branch:
`2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13`

QA reference:
`2876f3bce7d77c04c7415df89cafcf8b31f1b61c`

Do **not** use main's V0.4 runtime as the implementation base. Main remains coordination/document authority; product branches were created from the accepted V0.5 product SHA above.

## Branches

- Ricardo: `round/r004-ricardo`
- Mario: `round/r004-mario`
- Brancaforte: `round/r004-brancaforte`
- Germinator: `round/r004-germinator`
- Gonza/integration: `round/r004-integration`

## Frozen product scope

1. Juanchi as complete third player/CPU fighter.
2. Rugby Boomerang returning projectile.
3. Fricción authored three-contact close Special.
4. Police Cap Rage cap-capture Ultimate.
5. Universal Ultimate Clash across all three fighters.
6. Physical locomotion/jump quality pass across all three.
7. Targeted Lengua/Ultimate follow-through from V0.5 playtest.
8. Second stage `CANCHA 56`: night rugby field + restrained party/gathering + spectators around the field.
9. Fighting-game front-end:
   `TITLE/COVER → FIGHTER SELECT → OPPONENT SELECT → STAGE SELECT → VS → FIGHT → RESULT`.
10. Reusable Character Package/content/presentation architecture.
11. 3/5/10 roster scalability tests and fourth synthetic package fixture.
12. Reproducible source→standalone→served release parity.

Out of scope:
- fourth playable fighter;
- runtime raster fighter sprites;
- generic ECS/script/cinematic engine;
- fifth action button;
- stage gameplay hazards;
- online/story/shop/account systems.

## Authoritative V0.6 specs

- `docs/superpowers/specs/2026-09-20-v06-content-expansion-design.md`
- `docs/superpowers/specs/2026-09-20-v06-juanchi-character-contract.md`
- `docs/superpowers/specs/2026-09-20-v06-animation-quality-contract.md`
- `docs/superpowers/specs/2026-09-20-v06-ultimate-clash-contract.md`
- `docs/superpowers/specs/2026-09-20-v06-character-package-pipeline.md`
- `docs/superpowers/specs/2026-09-20-v06-cancha56-stage-contract.md`
- `docs/superpowers/specs/2026-09-20-v06-fighting-game-ui-flow.md`
- `docs/characters/juanchi/**`

## Juanchi visual authority

User-supplied identity master SHA-256:
`05c1f7107c49caa65bb719ce6ca17c45f47f2667523f77d7214ed82b6d3226b8`

User-supplied action-sheet SHA-256:
`981912f6c3aed94dd51ccef0356045ffa5395814daeb559bf264cb59692e8639`

Identity master governs likeness/outfit/proportions. Action sheet guides action/pose language. Both are authoring references only and must never be loaded as runtime fighter sprites/textures.

## Auto-chain dependency graph

Immediately eligible:
- V06-R0 — Ricardo
- V06-Z0 — Gonza

After green V06-R0:
- Ricardo continues directly V06-R1 → V06-R2 → V06-R3.
- Mario becomes eligible for V06-M1 → V06-M2.
- Brancaforte becomes eligible for V06-B1.
- Gonza continues Z0 integration as green exact-SHA handoffs arrive.

After R3 + M2 + B1 are assembled by Z0:
- V06-G1 — Germinator.

If G1 returns `APPROVE — V06-Z1 UNLOCKED`:
- V06-Z1 — Gonza starts directly and releases.

No agent waits for a new Neureon START/RELEASE token on the normal path.

## Deviation rule

If an agent discovers a blocker, reproducible regression, frozen-contract contradiction, missing authoritative input or required scope change:
1. stop the affected dependency chain;
2. record it in `r004-findings.md`;
3. mark BLOCKED;
4. tell the user directly with evidence.

The user decides whether to ask Neureon for audit/re-plan. Do not silently redesign the product and do not create a per-step coordinator gate.

## Completion

After successful V06-Z1, product work is finished. Neureon will archive/reset and issue `ROUND_COMPLETE` when the user asks for final closure.
