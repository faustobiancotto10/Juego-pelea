import { composeInputFrame, directionFromPoint, type DirectionState } from './dpad.js';
import { DoubleTapTracker, type HorizontalDirection } from './doubleTap.js';
import { inputFromKeyboard } from './keyboard.js';
import type { InputFrame } from '../types.js';

const NEUTRAL: DirectionState = { left: false, right: false, up: false, down: false };

type ActionName = 'attack' | 'special' | 'jump';

export interface BufferedCombatActions {
  attack: boolean;
  special: boolean;
  ultimate: boolean;
}

export interface PrioritizedCombatActions extends BufferedCombatActions {
  pushGuard: boolean;
}

export interface CombatInputContext {
  superReady: boolean;
  defensiveContext: boolean;
  nowMs?: number;
}

export class ActionChordBuffer {
  private previousAttack = false;
  private previousSpecial = false;
  private attackStartedAt: number | null = null;
  private specialStartedAt: number | null = null;
  private chordConsumed = false;

  constructor(private readonly toleranceMs = 55) {}

  reset(): void {
    this.previousAttack = false;
    this.previousSpecial = false;
    this.attackStartedAt = null;
    this.specialStartedAt = null;
    this.chordConsumed = false;
  }

  sync(attackHeld: boolean, specialHeld: boolean): void {
    this.previousAttack = attackHeld;
    this.previousSpecial = specialHeld;
    this.attackStartedAt = null;
    this.specialStartedAt = null;
    this.chordConsumed = false;
  }

  sample(attackHeld: boolean, specialHeld: boolean, nowMs: number): BufferedCombatActions {
    if (attackHeld && !this.previousAttack) this.attackStartedAt = nowMs;
    if (specialHeld && !this.previousSpecial) this.specialStartedAt = nowMs;

    const quickAttackRelease =
      !attackHeld &&
      this.previousAttack &&
      this.attackStartedAt !== null &&
      nowMs - this.attackStartedAt < this.toleranceMs &&
      !this.chordConsumed;
    const quickSpecialRelease =
      !specialHeld &&
      this.previousSpecial &&
      this.specialStartedAt !== null &&
      nowMs - this.specialStartedAt < this.toleranceMs &&
      !this.chordConsumed;

    const withinChordWindow =
      attackHeld &&
      specialHeld &&
      this.attackStartedAt !== null &&
      this.specialStartedAt !== null &&
      Math.abs(this.attackStartedAt - this.specialStartedAt) <= this.toleranceMs;

    const ultimate = withinChordWindow && !this.chordConsumed;
    if (ultimate) this.chordConsumed = true;

    const suppressSingles = this.chordConsumed || ultimate;
    const attack =
      !suppressSingles &&
      (quickAttackRelease ||
        (attackHeld &&
          this.attackStartedAt !== null &&
          nowMs - this.attackStartedAt >= this.toleranceMs));
    const special =
      !suppressSingles &&
      (quickSpecialRelease ||
        (specialHeld &&
          this.specialStartedAt !== null &&
          nowMs - this.specialStartedAt >= this.toleranceMs));

    if (!attackHeld) this.attackStartedAt = null;
    if (!specialHeld) this.specialStartedAt = null;
    if (!attackHeld && !specialHeld) this.chordConsumed = false;

    this.previousAttack = attackHeld;
    this.previousSpecial = specialHeld;

    return { attack, special, ultimate };
  }
}

export function resolveActionButtons(
  buffered: BufferedCombatActions,
  defensiveContext: boolean,
): PrioritizedCombatActions {
  if (buffered.ultimate) {
    return { attack: false, special: false, ultimate: true, pushGuard: false };
  }
  if (buffered.special && defensiveContext) {
    return { attack: false, special: false, ultimate: false, pushGuard: true };
  }
  return { ...buffered, pushGuard: false };
}

export class GameInput {
  private readonly keys = new Set<string>();
  private touchDirection: DirectionState = { ...NEUTRAL };
  private touchActions: Record<ActionName, boolean> = { attack: false, special: false, jump: false };
  private dpadPointer: number | null = null;
  private readonly cleanupCallbacks: Array<() => void> = [];
  private readonly doubleTap = new DoubleTapTracker(230);
  private readonly actionChord = new ActionChordBuffer(55);
  private dashLeft = false;
  private dashRight = false;

  constructor(private readonly root: HTMLElement) {
    this.bindKeyboard();
    this.bindTouchControls();
  }

  getFrame(context: CombatInputContext = { superReady: false, defensiveContext: false }): InputFrame {
    const keyboard = inputFromKeyboard(this.keys);
    const touch = composeInputFrame(this.touchDirection, this.touchActions);
    const rawAttack = keyboard.attack || touch.attack;
    const rawSpecial = keyboard.special || touch.special;

    let buffered: BufferedCombatActions;
    if (context.superReady) {
      buffered = this.actionChord.sample(rawAttack, rawSpecial, context.nowMs ?? performance.now());
    } else {
      this.actionChord.sync(rawAttack, rawSpecial);
      buffered = { attack: rawAttack, special: rawSpecial, ultimate: false };
    }
    const actions = resolveActionButtons(buffered, context.defensiveContext);

    const frame: InputFrame = {
      left: keyboard.left || touch.left,
      right: keyboard.right || touch.right,
      down: keyboard.down || touch.down,
      up: keyboard.up || touch.up,
      jump: keyboard.jump || touch.jump,
      attack: actions.attack,
      special: actions.special,
      dashLeft: this.dashLeft,
      dashRight: this.dashRight,
      ultimate: actions.ultimate,
      pushGuard: actions.pushGuard,
    };
    this.dashLeft = false;
    this.dashRight = false;
    return frame;
  }

  destroy(): void {
    for (const cleanup of this.cleanupCallbacks.splice(0)) cleanup();
    this.keys.clear();
    this.touchDirection = { ...NEUTRAL };
    this.touchActions = { attack: false, special: false, jump: false };
    this.doubleTap.reset();
    this.actionChord.reset();
    this.dashLeft = false;
    this.dashRight = false;
  }

  private registerTap(direction: HorizontalDirection, nowMs: number): void {
    if (!this.doubleTap.tap(direction, nowMs)) return;
    if (direction === 'left') this.dashLeft = true;
    else this.dashRight = true;
  }

  private bindKeyboard(): void {
    const relevant = new Set(['KeyA', 'KeyD', 'KeyS', 'KeyW', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space', 'KeyJ', 'KeyK']);
    const onDown = (event: KeyboardEvent) => {
      if (!relevant.has(event.code)) return;
      event.preventDefault();
      const wasHeld = this.keys.has(event.code);
      this.keys.add(event.code);
      if (wasHeld || event.repeat) return;
      if (event.code === 'KeyA' || event.code === 'ArrowLeft') this.registerTap('left', performance.now());
      if (event.code === 'KeyD' || event.code === 'ArrowRight') this.registerTap('right', performance.now());
    };
    const onUp = (event: KeyboardEvent) => {
      if (!relevant.has(event.code)) return;
      event.preventDefault();
      this.keys.delete(event.code);
    };
    const onBlur = () => {
      this.keys.clear();
      this.doubleTap.reset();
    };
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
        if (this.touchDirection.left !== this.touchDirection.right) {
          this.registerTap(this.touchDirection.left ? 'left' : 'right', performance.now());
        }
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
