import { composeInputFrame } from './dpad.js';

export function inputFromKeyboard(keys: ReadonlySet<string>) {
  const left = keys.has('KeyA') || keys.has('ArrowLeft');
  const right = keys.has('KeyD') || keys.has('ArrowRight');
  const down = keys.has('KeyS') || keys.has('ArrowDown');
  const up = keys.has('KeyW') || keys.has('ArrowUp');
  return composeInputFrame(
    { left, right, down, up },
    {
      jump: up || keys.has('Space'),
      attack: keys.has('KeyJ'),
      special: keys.has('KeyK'),
    },
  );
}
