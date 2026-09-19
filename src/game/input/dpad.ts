import { EMPTY_INPUT, type InputFrame } from '../types.js';

export interface DirectionState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

const NEUTRAL_DIRECTION: DirectionState = { left: false, right: false, up: false, down: false };

export function directionFromPoint(dx: number, dy: number, radius: number, deadZone: number): DirectionState {
  const distance = Math.hypot(dx, dy);
  if (distance < deadZone || radius <= 0) return { ...NEUTRAL_DIRECTION };

  const angle = Math.atan2(dy, dx);
  const eighth = Math.PI / 8;
  const right = angle >= -eighth && angle < eighth;
  const downRight = angle >= eighth && angle < 3 * eighth;
  const down = angle >= 3 * eighth && angle < 5 * eighth;
  const downLeft = angle >= 5 * eighth && angle < 7 * eighth;
  const left = angle >= 7 * eighth || angle < -7 * eighth;
  const upLeft = angle >= -7 * eighth && angle < -5 * eighth;
  const up = angle >= -5 * eighth && angle < -3 * eighth;
  const upRight = angle >= -3 * eighth && angle < -eighth;

  return {
    left: left || downLeft || upLeft,
    right: right || downRight || upRight,
    up: up || upLeft || upRight,
    down: down || downLeft || downRight,
  };
}

export function composeInputFrame(
  direction: Partial<DirectionState> = {},
  actions: Partial<Pick<InputFrame, 'attack' | 'special' | 'jump'>> = {},
): InputFrame {
  return {
    ...EMPTY_INPUT,
    ...direction,
    ...actions,
  };
}
