import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/game/ui/AppController.ts', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
const flow = await import('../dist/game/ui/flow.js');

test('V0.6 flow API starts on cover and carries fighter/opponent/stage through rematch', () => {
  assert.equal(typeof flow.beginSelection, 'function');
  assert.equal(typeof flow.chooseStage, 'function');
  assert.equal(typeof flow.changeStage, 'function');
  assert.equal(typeof flow.changeFighters, 'function');

  let state = flow.initialFlowState();
  assert.equal(state.phase, 'title');
  assert.equal(state.stage, 'tramontana-dusk');

  state = flow.beginSelection(state);
  assert.equal(state.phase, 'select-player');

  state = flow.chooseFighter(state, 'chameleon');
  assert.equal(state.phase, 'select-cpu');
  assert.equal(state.player, 'chameleon');

  state = flow.chooseFighter(state, 'juanchi');
  assert.equal(state.phase, 'select-stage');
  assert.equal(state.cpu, 'juanchi');

  state = flow.chooseStage(state, 'cancha-56');
  assert.equal(state.phase, 'vs');
  assert.equal(state.stage, 'cancha-56');

  state = flow.startFight(state);
  assert.equal(state.phase, 'fight');
  state = flow.finishFight(state, 0);
  assert.equal(state.phase, 'result');

  const rematch = flow.rematch(state);
  assert.equal(rematch.phase, 'vs');
  assert.equal(rematch.player, 'chameleon');
  assert.equal(rematch.cpu, 'juanchi');
  assert.equal(rematch.stage, 'cancha-56');

  const stageChange = flow.changeStage(state);
  assert.equal(stageChange.phase, 'select-stage');
  assert.equal(stageChange.player, 'chameleon');
  assert.equal(stageChange.cpu, 'juanchi');
  assert.equal(stageChange.stage, 'cancha-56');

  const fighterChange = flow.changeFighters(state);
  assert.equal(fighterChange.phase, 'select-player');
  assert.equal(fighterChange.stage, 'cancha-56');
});

test('V0.6 back navigation walks stage -> opponent -> fighter -> title without losing retained stage', () => {
  assert.equal(typeof flow.backFlow, 'function');

  let state = flow.initialFlowState();
  state = flow.beginSelection(state);
  state = flow.chooseFighter(state, 'supernariz');
  state = flow.chooseFighter(state, 'chameleon');
  assert.equal(state.phase, 'select-stage');

  state = flow.backFlow(state);
  assert.equal(state.phase, 'select-cpu');
  assert.equal(state.player, 'supernariz');

  state = flow.backFlow(state);
  assert.equal(state.phase, 'select-player');

  state = flow.backFlow(state);
  assert.equal(state.phase, 'title');
  assert.equal(state.stage, 'tramontana-dusk');
});

test('V0.6 roster density explicitly supports 3, 5 and 10 metadata entries', () => {
  assert.equal(typeof flow.rosterDensity, 'function');
  assert.equal(flow.rosterDensity(3), 'standard');
  assert.equal(flow.rosterDensity(5), 'compact');
  assert.equal(flow.rosterDensity(10), 'dense');
});

test('V0.6 AppController opens on a fighting-game cover with COMENZAR and controls', () => {
  assert.match(app, /showTitle\(\)/);
  assert.match(app, /data-start/);
  assert.match(app, />COMENZAR</);
  assert.match(app, /data-controls-button/);
  assert.match(app, /cover-screen|title-screen/);
  assert.doesNotMatch(app, /start\(\): void \{[\s\S]{0,900}showCharacterSelect\(\)/);
});

test('V0.6 fighter and opponent select use scalable registry metadata with selected info + confirm', () => {
  assert.match(app, /DEFAULT_COMBAT_REGISTRY\.playableIds/);
  assert.match(app, /DEFAULT_FIGHTER_PRESENTATION_REGISTRY/);
  assert.match(app, /rosterDensity\(FIGHTER_ORDER\.length\)/);
  assert.match(app, /data-fighter-confirm/);
  assert.match(app, /aria-pressed/);
  assert.match(app, /fighter-info|roster-info/);
  assert.doesNotMatch(app, /\['chameleon',\s*'supernariz'\]/);
  assert.doesNotMatch(app, /if\s*\([^)]*id\s*===\s*['"]juanchi['"]/);
});

test('V0.6 stage select exposes Tramontana and Cancha 56 with confirm/back and exact stage in VS', () => {
  assert.match(app, /tramontana-dusk/);
  assert.match(app, /cancha-56/);
  assert.match(app, /Tramontana/);
  assert.match(app, /Cancha 56/);
  assert.match(app, /data-stage-confirm/);
  assert.match(app, /data-stage/);
  assert.match(app, /data-stage-name|stageLabel\(/);
  assert.match(app, /VS/);
});

test('V0.6 result supports rematch, change fighter and change stage', () => {
  assert.match(app, /data-rematch/);
  assert.match(app, /data-change-fighter/);
  assert.match(app, /data-change-stage/);
});

test('V0.6 Juanchi ranged availability is metadata-driven and snapshot-readable', () => {
  assert.match(app, /rangedAvailabilityLabel/);
  assert.match(app, /rangedAvailability/);
  assert.match(app, /LISTA/);
  assert.match(app, /EN VUELO/);
  assert.match(app, /REARME/);
  assert.doesNotMatch(app, /if\s*\([^)]*id\s*===\s*['"]juanchi['"][\s\S]{0,200}ranged/i);
});

test('V0.6 controls copy is three-fighter-safe and keeps the established four action surface', () => {
  assert.match(app, /Abajo \+ ATTACK/);
  assert.match(app, /Abajo \+ SPECIAL/);
  assert.match(app, /SPECIAL sin dirección|SPECIAL neutro|Especial a distancia/);
  assert.match(app, /data-action="ultimate"/);
  assert.doesNotMatch(app, /data-action="pushGuard"/);
  assert.doesNotMatch(app, /quinto botón|fifth action/i);
});

test('V0.6 front-end CSS has safe-area, focus, roster density and phone-landscape rules', () => {
  assert.match(styles, /safe-area-inset-left/);
  assert.match(styles, /safe-area-inset-right/);
  assert.match(styles, /safe-area-inset-bottom/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /roster-grid--standard/);
  assert.match(styles, /roster-grid--compact/);
  assert.match(styles, /roster-grid--dense/);
  assert.match(styles, /@media \(max-height:\s*430px\)/);
  assert.match(styles, /touch-action:\s*manipulation/);
});

test('V0.6 front end uses procedural/DOM marks rather than runtime reference rasters', () => {
  assert.doesNotMatch(app, /<img\b/i);
  assert.doesNotMatch(app, /05c1f7107c49|981912f6c3aed9|juanchi.*\.(?:png|jpg|jpeg|webp)/i);
});
