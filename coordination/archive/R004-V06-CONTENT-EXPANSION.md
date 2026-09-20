# R004-V06-CONTENT-EXPANSION — Round Archive

Status: ROUND_COMPLETE  
Closed: 2026-09-20  
Closure token: `ROUND_COMPLETE — R004-V06-CONTENT-EXPANSION`  
Closed by: Neureon under direct user instruction.

## Goal

Ship V0.6 as the first content-expansion release: scalable character/content architecture, Juanchi, Cancha 56, Universal Ultimate Clash, stronger physical presentation and a real fighting-game front-end flow.

## Outcome

R004 is closed as an **official published V0.6 release**.

Final merged product source:
- `60f30d4a100f3d853e2408e3eee7bbde4e2170fe`

Frozen final integration candidate:
- `8acfc79d7ec96ec3d6a99aa5c720efe840a62115`

GitHub Pages:
- publish SHA `93d2fdd6f4b764a49fa70ad1ff6ac1f348fb85cc`
- deployment run `35539408774`: SUCCESS
- source/public standalone blob `bda2d2a16a0cd640f654b3b9c7aef148b7213f38`
- public URL: https://faustobiancotto10.github.io/Juego-pelea/

## Delivered product

- Juanchi as third player/CPU fighter;
- Rugby Boomerang returning projectile;
- Fricción authored multi-contact Special;
- Police Cap Rage Ultimate;
- Universal Ultimate Clash and slot-neutral Ultimate arbitration;
- content/presentation registry and reusable Character Package direction;
- physical locomotion/animation pass across the roster;
- Cancha 56 as second selectable stage;
- title/cover → fighter select → opponent select → stage select → VS → fight → result flow;
- scalable roster UI fixtures;
- deterministic final integration/build/standalone/release path.

## Canonical delivery sequence

R004 executed in the intended order:

**Ricardo → Germinator → Mario + Brancaforte → Gonza**

No per-stage Neureon authorization was required once dependencies were green.

## Specialist evidence

### Ricardo — gameplay/core

Final gameplay/core candidate:
- `d815694a76a7a92c004203f1ae9fd14e2035744c`

Covered:
- R0 composition/validation;
- R1 Universal Ultimate Clash;
- R2 Juanchi gameplay primitives/content;
- R3 Lengua/jump-prep/CPU follow-through.

### Germinator — gameplay/core QA

Independent QA head:
- `56230b2702975e451ca2da6e79a5e2daed8dab02`
- Repository verification #827: SUCCESS
- 251/251 tests PASS + build PASS
- verdict: `APPROVE — PRESENTATION LANE UNLOCKED`

### Mario — render/character/stage

Final M2:
- `81c904efedd8c7aaf6a66a600abece177b926e2c`
- CI #864: 260/260 + build PASS

### Brancaforte — front end / UX

Final B1:
- `81647506d2e69b92dd92e19f2fc997d21949a4a9`
- CI #848: 255/255 + build PASS

### Gonza — final integration/release

Z0 final candidate:
- `8acfc79d7ec96ec3d6a99aa5c720efe840a62115`
- Repository verification #877: SUCCESS
- integrated standalone/browser smoke: SUCCESS

Z1:
- final merge-ref Repository verification #900 / `35539373697`: SUCCESS
- isolated Z1 verification `35538824377`: SUCCESS
- full suite/typecheck/build: PASS
- standalone SHA-256 `8fcc70c9d79042aa00275adb765ab0abdcaeb1b25a0965c540178a35fd80c2dc`
- final main + Pages evidence listed above.

## Release blocker encountered and resolved

Z1 temporarily blocked because `tests/coordination-contract.test.mjs` still enforced the pre-AUTO_CHAIN state vocabulary. Neureon repaired the test contract on main; subsequent CI passed.

Gonza then found and repaired release-composition issues caused by main still carrying older runtime/docs while the frozen candidate lived on the integration branch. The final release was rebuilt from the complete frozen V0.6 runtime/test tree over repaired coordination main and verified before publication.

No known release blocker remains.

## Post-release human findings — deliberately carried forward

After playing the published V0.6 build, the user reported:

1. **Lengua remains too dominant** — repeated spam still wins too easily.
2. **CPU is now too weak** — explicit difficulty levels are desired.
3. **Juanchi locomotion remains visually wrong** — walking in particular looks strange despite overall animation improvement.
4. **Attack presentation does not match character-design quality** — attacks need stronger procedural flashes/aura/trails/impact treatment. Juanchi's intended red aura was not truly implemented; the fighter mainly turns red before the move.
5. **New fighter requested: El Toro** — Topete, Shawarmazo and Super Eructo.

These are authoritative inputs for the next audit. They are not hidden or falsely marked solved by V0.6 closure.

Durable feedback:
- `docs/feedback/2026-09-20-v06-post-release-playtest.md`

El Toro intake:
- `docs/characters/el-toro/PACKAGE.md`

## Agent/task disposition

- Neureon: complete.
- Ricardo R0–R3: accepted/frozen.
- Germinator G1: verified.
- Mario M1–M2: accepted/frozen.
- Brancaforte B1: accepted/frozen.
- Gonza Z0–Z1: verified/released.
- no active locks.

## Deferred / next work

No V0.7/new implementation round is opened by this archive.

The next requested action is an **external Astra audit/planning intervention** against the released V0.6 repository, using the post-release user feedback and El Toro intake. Astra may write implementation-ready audit/design/plan documents, but must not activate agents or implement production V0.7 code.

## User-facing summary

V0.6 is officially released and closed. The project is intentionally left between rounds so the next version begins from an external audit rather than immediately patching symptoms.
