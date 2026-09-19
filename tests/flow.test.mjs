import test from 'node:test';
import assert from 'node:assert/strict';
import { initialFlowState, chooseFighter, startFight, finishFight, rematch, backToSelect } from '../dist/game/ui/flow.js';

test('selection flow goes player -> CPU -> VS -> fight -> result and supports rematch/select', () => {
  let state = initialFlowState();
  state = chooseFighter(state, 'chameleon');
  assert.equal(state.phase, 'select-cpu');
  state = chooseFighter(state, 'supernariz');
  assert.equal(state.phase, 'vs');
  assert.equal(state.player, 'chameleon');
  assert.equal(state.cpu, 'supernariz');
  state = startFight(state);
  assert.equal(state.phase, 'fight');
  state = finishFight(state, 0);
  assert.equal(state.phase, 'result');
  assert.equal(state.winner, 0);
  state = rematch(state);
  assert.equal(state.phase, 'vs');
  state = backToSelect(state);
  assert.deepEqual(state, initialFlowState());
});
