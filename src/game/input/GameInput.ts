import { composeInputFrame, directionFromPoint, type DirectionState } from './dpad.js';
import { inputFromKeyboard } from './keyboard.js';
import type { InputFrame } from '../types.js';

const NEUTRAL: DirectionState = { left: false, right: false, up: false, down: false };

type ActionName = 'attack' | 'special' | 'jump';

export class GameInput {
  private readonly keys = new Set<string>();
  private touchDirection: DirectionState = { ...NEUTRAL };
  private touchActions: Record<ActionName, boolean> = { attack: false, special: false, jump: false };
  private dpadPointer: number | null = null;
  private readonly cleanupCallbacks: Array<() => void> = [];

  constructor(private readonly root: HTMLElement) {
    this.bindKeyboard();
    this.bindTouchControls();
  }

  getFrame(): InputFrame {
    const keyboard = inputFromKeyboard(this.keys);
    const touch = composeInputFrame(this.touchDirection, this.touchActions);
    return {
      left: keyboard.left || touch.left,
      right: keyboard.right || touch.right,
      down: keyboard.down || touch.down,
      up: keyboard.up || touch.up,
      jump: keyboard.jump || touch.jump,
      attack: keyboard.attack || touch.attack,
      special: keyboard.special || touch.special,
    };
  }

  destroy(): void {
    for (const cleanup of this.cleanupCallbacks.splice(0)) cleanup();
    this.keys.clear();
    this.touchDirection = { ...NEUTRAL };
    this.touchActions = { attack: false, special: false, jump: false };
  }

  private bindKeyboard(): void {
    const relevant = new Set(['KeyA', 'KeyD', 'KeyS', 'KeyW', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space', 'KeyJ', 'KeyK']);
    const onDown = (event: KeyboardEvent) => {
      if (!relevant.has(event.code)) return;
      event.preventDefault();
      this.keys.add(event.code);
    };
    const onUp = (event: KeyboardEvent) => {
      if (!relevant.has(event.code)) return;
      event.preventDefault();
      this.keys.delete(event.code);
    };
    const onBlur = () => this.keys.clear();
    window.addEventListener('keydown', onDown, { passive: false });
    window.addEventListener('keyup', onUp, { passive: false });
    window.addEventListener('blur', onBlur);
    this.cleanupCallbacks.push(
      () => window.removeEventListener('keydown', onDown),
      () => window.removeEventListener('keyup', onUp),
      () => window.removeEventListener('blur', onBlur),
    );
  }

  private bindTouchControls(): void {
    const dpad = this.root.querySelector<HTMLElement>('[data-dpad]');
    if (dpad) {
      const update = (event: PointerEvent) => {
        const rect = dpad.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        this.touchDirection = directionFromPoint(event.clientX - cx, event.clientY - cy, rect.width / 2, rect.width * 0.16);
        this.paintDpad(dpad);
      };
      const down = (event: PointerEvent) => {
        if (this.dpadPointer !== null) return;
        this.dpadPointer = event.pointerId;
        dpad.setPointerCapture(event.pointerId);
        update(event);
      };
      const move = (event: PointerEvent) => {
        if (this.dpadPointer === event.pointerId) update(event);
      };
      const release = (event: PointerEvent) => {
        if (this.dpadPointer !== event.pointerId) return;
        this.dpadPointer = null;
        this.touchDirection = { ...NEUTRAL };
        this.paintDpad(dpad);
      };
      dpad.addEventListener('pointerdown', down);
      dpad.addEventListener('pointermove', move);
      dpad.addEventListener('pointerup', release);
      dpad.addEventListener('pointercancel', release);
      this.cleanupCallbacks.push(
        () => dpad.removeEventListener('pointerdown', down),
        () => dpad.removeEventListener('pointermove', move),
        () => dpad.removeEventListener('pointerup', release),
        () => dpad.removeEventListener('pointercancel', release),
      );
    }

    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action]')) {
      const action = button.dataset.action as ActionName;
      if (!['attack', 'special', 'jump'].includes(action)) continue;
      const down = (event: PointerEvent) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        this.touchActions[action] = true;
        button.classList.add('is-pressed');
      };
      const release = (event: PointerEvent) => {
        event.preventDefault();
        this.touchActions[action] = false;
        button.classList.remove('is-pressed');
      };
      button.addEventListener('pointerdown', down);
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
      this.cleanupCallbacks.push(
        () => button.removeEventListener('pointerdown', down),
        () => button.removeEventListener('pointerup', release),
        () => button.removeEventListener('pointercancel', release),
        () => button.removeEventListener('lostpointercapture', release),
      );
    }
  }

  private paintDpad(dpad: HTMLElement): void {
    dpad.dataset.direction = [
      this.touchDirection.up ? 'u' : '',
      this.touchDirection.down ? 'd' : '',
      this.touchDirection.left ? 'l' : '',
      this.touchDirection.right ? 'r' : '',
    ].join('');
  }
}
