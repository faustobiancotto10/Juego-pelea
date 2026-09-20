# V0.6 — Fighting Game Front-End / Flow Contract

Date: 2026-09-20  
Status: FROZEN FOR IMPLEMENTATION

## Objective

Replace the current utility-like two-card entry screen with a real fighting-game flow.

Official V0.6 flow:

`TITLE / COVER → FIGHTER SELECT → STAGE SELECT → VS → FIGHT → RESULT`

Rematch may return directly to the fight with the same selections. Change fighter/stage returns to the appropriate selection screen.

## 1. Title / Cover

This becomes the first interactive screen.

Required:
- strong game title/logo treatment;
- one dominant `COMENZAR` button;
- secondary `CONTROLES` access;
- background/art direction that reads as a fighting game, not a website or settings page;
- mobile-landscape safe-area support;
- keyboard activation/focus parity.

Do not expose the old fighter cards as the first screen.

The cover must remain lightweight and instantly actionable. No story mode, account system, shop or online menu in V0.6.

## 2. Fighter Select

V0.6 selectable roster:
- Camaleoni;
- Supernariz;
- Juanchi.

The layout must feel like a fighter-select screen rather than an e-commerce/card catalogue.

Required:
- compact scalable fighter portraits/tiles;
- strong selected state;
- selected fighter information panel;
- name, archetype/role and concise signature-move summary;
- confirm action;
- back action;
- support at least 3 without crowding;
- layout tests with 5 and 10 metadata-only entries.

Reference art is authoring guidance only. Runtime fighter portraits/previews must respect the project's procedural/no-reference-raster rule. A rig-driven preview, procedural portrait or non-reference UI mark is acceptable.

The UI may use each fighter's presentation metadata, but cannot hardcode `if camaleoni else supernariz` assumptions.

## 3. Opponent selection

For the current single-player flow, after player fighter confirmation the user chooses the opponent from the same scalable roster.

Prevent accidental duplicate-selection restrictions unless game design explicitly requires them; mirror matches are valid unless a task contract says otherwise.

Keep player/opponent ownership visually unambiguous.

## 4. Stage Select

Show the two V0.6 stages:
- existing stage;
- Cancha 56.

Required:
- compact preview or procedural thumbnail;
- stage name;
- strong selected state;
- confirm/back;
- stage choice stored in match setup;
- no combat semantics in UI.

## 5. VS transition

Short fighting-game pre-fight transition.

Required:
- player fighter name/visual identity;
- opponent fighter name/visual identity;
- `VS`;
- selected stage name;
- brief transition into fight.

It is presentation only and cannot delay/alter simulation beyond the explicit flow transition.

## 6. Fight HUD / controls help

Preserve the current four mobile actions plus dedicated Ultimate model already established by project decisions.

Update controls/help copy for:
- Attack;
- Special;
- Jump;
- Ultimate;
- D-pad / guard behavior;
- down inputs for low/close Special;
- Juanchi's ball availability state when relevant.

Controls/help must not become a permanent large overlay over the playfield.

## 7. Juanchi UI state

Juanchi ranged availability metadata exposes a readable state such as:
- `LISTA`;
- `EN VUELO`;
- short rearm/cooldown state.

No fifth action button or bespoke meter is added.

## 8. Result / rematch

Result screen offers:
- Rematch;
- Change fighter;
- Change stage / return to selection as appropriate.

Rematch retains fighter and stage selection.

## Visual direction

Target: premium, readable mobile fighting-game front end.

Use:
- strong typography hierarchy;
- clear focus states;
- larger-than-web interaction affordances;
- restrained animation/transitions;
- fighter-specific accents without letting one character's palette own the whole system.

Avoid:
- dashboard look;
- generic web cards;
- dense settings-page composition;
- excessive text;
- UI that only works with exactly two roster entries.

## Navigation / state contract

Flow state belongs to app/UI setup, not combat simulation.

Back navigation must never leave stale touch/input ownership in GameInput.

Starting/restarting a fight resets transient combat/input state through existing authoritative reset paths.

## Acceptance

- app opens on cover/title, not fighter cards;
- `COMENZAR` enters fighter select;
- Camaleoni/Supernariz/Juanchi can be selected as player and CPU;
- fighter select remains usable with 3, synthetic 5 and synthetic 10 entries;
- two stages can be selected;
- VS screen reflects exact chosen fighters/stage;
- fight starts with correct setup;
- rematch retains selections;
- back navigation does not create stuck input;
- physical iPhone landscape readability/reachability review passes;
- no runtime use of Juanchi reference images as fighter sprites/textures.
