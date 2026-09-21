import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  beginSelection,
  chooseCpuDifficulty,
  chooseFighter,
  chooseStage,
  finishFight,
  initialFlowState,
  rematch,
  startFight,
  rosterDensity,
} from '../dist/game/ui/flow.js';
import { DEFAULT_CHARACTER_COMPOSITION } from '../dist/game/data/characterContent.js';

test('V07-B1 CPU difficulty defaults Normal and survives stage, VS, fight, result and rematch', () => {
  let flow = initialFlowState();
  assert.equal(flow.cpuDifficulty, 'normal');
  flow = beginSelection(flow);
  flow = chooseFighter(flow, 'chameleon');
  flow = chooseCpuDifficulty(flow, 'hard');
  assert.equal(flow.cpuDifficulty, 'hard');
  flow = chooseFighter(flow, 'el-toro');
  flow = chooseStage(flow, 'cancha-56');
  assert.equal(flow.cpuDifficulty, 'hard');
  flow = startFight(flow);
  assert.equal(flow.cpuDifficulty, 'hard');
  flow = finishFight(flow, 0);
  flow = rematch(flow);
  assert.equal(flow.phase, 'vs');
  assert.equal(flow.cpuDifficulty, 'hard');
});

test('V07-B1 difficulty can only change on CPU select', () => {
  const title = initialFlowState();
  assert.equal(chooseCpuDifficulty(title, 'easy'), title);
  const playerSelect = beginSelection(title);
  assert.equal(chooseCpuDifficulty(playerSelect, 'hard'), playerSelect);
});

test('V07-B1 released roster exposes four registered portrait keys and scales fixtures', () => {
  assert.equal(DEFAULT_CHARACTER_COMPOSITION.playableIds.length, 4);
  for (const id of DEFAULT_CHARACTER_COMPOSITION.playableIds) {
    const presentation = DEFAULT_CHARACTER_COMPOSITION.presentations[id];
    assert.ok(presentation?.portraitKey, id);
    assert.notEqual(presentation.portraitKey.trim(), '', id);
  }
  assert.equal(rosterDensity(5), 'compact');
  assert.equal(rosterDensity(10), 'dense');
});


test('V07-B1 portrait cards expose renderer-owned keyed canvas surfaces without fighter-specific CSS art', () => {
  const controller = readFileSync(new URL('../src/game/ui/AppController.ts', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(controller, /data-fighter-portrait/);
  assert.match(controller, /data-portrait-key=/);
  assert.match(controller, /fighter-portrait-canvas/);
  assert.match(controller, /fighter-portrait-fallback/);
  assert.doesNotMatch(css, /fighter-portrait-v07\[data-portrait-key=/);
  assert.doesNotMatch(css, /portrait-body|portrait-head|portrait-detail/);
});
