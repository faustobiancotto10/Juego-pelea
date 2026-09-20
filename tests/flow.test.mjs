import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialFlowState,
  beginSelection,
  chooseFighter,
  chooseStage,
  startFight,
  finishFight,
  rematch,
  changeFighters,
  changeStage,
  backFlow,
} from '../dist/game/ui/flow.js';

test('V0.6 flow goes title -> player -> CPU -> stage -> VS -> fight -> result', () => {
  let state = initialFlowState();
  assert.equal(state.phase, 'title');

  state = beginSelection(state);
  assert.equal(state.phase, 'select-player');

  state = chooseFighter(state, 'chameleon');
  assert.equal(state.phase, 'select-cpu');

  state = chooseFighter(state, 'supernariz');
  assert.equal(state.phase, 'select-stage');

  state = chooseStage(state, 'cancha-56');
  assert.equal(state.phase, 'vs');
  assert.equal(state.stage, 'cancha-56');

  state = startFight(state);
  assert.equal(state.phase, 'fight');

  state = finishFight(state, 0);
  assert.equal(state.phase, 'result');
  assert.equal(state.winner, 0);

  state = rematch(state);
  assert.equal(state.phase, 'vs');
  assert.equal(state.stage, 'cancha-56');
});

test('V0.6 result change actions preserve the setup pieces they should preserve', () => {
  let state = initialFlowState();
  state = beginSelection(state);
  state = chooseFighter(state, 'juanchi');
  state = chooseFighter(state, 'juanchi');
  state = chooseStage(state, 'cancha-56');
  state = startFight(state);
  state = finishFight(state, 1);

  const fighters = changeFighters(state);
  assert.equal(fighters.phase, 'select-player');
  assert.equal(fighters.stage, 'cancha-56');

  const stage = changeStage(state);
  assert.equal(stage.phase, 'select-stage');
  assert.equal(stage.player, 'juanchi');
  assert.equal(stage.cpu, 'juanchi');
  assert.equal(stage.stage, 'cancha-56');
});

test('V0.6 backFlow is deterministic across selection screens', () => {
  let state = initialFlowState();
  state = beginSelection(state);
  state = chooseFighter(state, 'supernariz');
  state = chooseFighter(state, 'chameleon');

  state = backFlow(state);
  assert.equal(state.phase, 'select-cpu');
  state = backFlow(state);
  assert.equal(state.phase, 'select-player');
  state = backFlow(state);
  assert.deepEqual(state, initialFlowState());
});
