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
  private readonly actionPointers: Record<ActionName, Set<number>> = {
    attack: new Set(),
    special: new Set(),
    jump: new Set(),
  };
  private readonly ultimatePointers = new Set<number>();
  private dpadPointer: number | null = null;
  private dpadElement: HTMLElement | null = null;
  private readonly actionButtons = new Set<HTMLButtonElement>();
  private readonly cleanupCallbacks: Array<() => void> = [];
  private readonly doubleTap = new DoubleTapTracker(230);
  private readonly actionChord = new ActionChordBuffer(55);
  private touchUltimateQueued = false;
  private dashLeft = false;
  private dashRight = false;

  constructor(private readonly root: HTMLElement) {
    this.bindKeyboard();
    this.bindTouchControls();
    this.bindLifecycle();
  }

  getFrame(context: CombatInputContext = { superReady: false, defensiveContext: false }): InputFrame {
    const keyboard = inputFromKeyboard(this.keys);
    const touch = composeInputFrame(this.touchDirection, this.touchActions);
    let buffered: BufferedCombatActions;
    if (context.superReady) {
      const keyboardActions = this.actionChord.sample(
        keyboard.attack,
        keyboard.special,
        context.nowMs ?? performance.now(),
      );
      buffered = {
        attack: keyboardActions.attack || touch.attack,
        special: keyboardActions.special || touch.special,
        ultimate: keyboardActions.ultimate || this.touchUltimateQueued,
      };
    } else {
      this.actionChord.sync(keyboard.attack, keyboard.special);
      buffered = {
        attack: keyboard.attack || touch.attack,
        special: keyboard.special || touch.special,
        ultimate: false,
      };
    }
    this.touchUltimateQueued = false;
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

  reset(): void {
    this.keys.clear();
    this.touchDirection = { ...NEUTRAL };
    this.touchActions = { attack: false, special: false, jump: false };
    for (const pointers of Object.values(this.actionPointers)) pointers.clear();
    this.ultimatePointers.clear();
    this.dpadPointer = null;
    this.doubleTap.reset();
    this.actionChord.reset();
    this.touchUltimateQueued = false;
    this.dashLeft = false;
    this.dashRight = false;

    if (this.dpadElement) this.paintDpad(this.dpadElement);
    for (const button of this.actionButtons) button.classList.remove('is-pressed');
  }

  destroy(): void {
    this.reset();
    for (const cleanup of this.cleanupCallbacks.splice(0)) cleanup();
    this.dpadElement = null;
    this.actionButtons.clear();
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
      this.reset();
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

  private bindLifecycle(): void {
    const onPageHide = () => this.reset();
    const onOrientationChange = () => this.reset();
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('orientationchange', onOrientationChange);
    this.cleanupCallbacks.push(
      () => window.removeEventListener('pagehide', onPageHide),
      () => window.removeEventListener('orientationchange', onOrientationChange),
    );

    if (typeof document !== 'undefined') {
      const onVisibilityChange = () => {
        if (document.hidden) this.reset();
      };
      document.addEventListener('visibilitychange', onVisibilityChange);
      this.cleanupCallbacks.push(() => document.removeEventListener('visibilitychange', onVisibilityChange));
    }
  }

  private tryCapture(element: HTMLElement, pointerId: number): boolean {
    try {
      element.setPointerCapture(pointerId);
      return true;
    } catch {
      return false;
    }
  }

  private bindTouchControls(): void {
    const dpad = this.root.querySelector<HTMLElement>('[data-dpad]');
    if (dpad) {
      this.dpadElement = dpad;
      const update = (event: PointerEvent) => {
        const rect = dpad.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        this.touchDirection = directionFromPoint(event.clientX - cx, event.clientY - cy, rect.width / 2, rect.width * 0.16);
        this.paintDpad(dpad);
      };
      const down = (event: PointerEvent) => {
        event.preventDefault();
        if (this.dpadPointer !== null) return;
        if (!this.tryCapture(dpad, event.pointerId)) {
          this.touchDirection = { ...NEUTRAL };
          this.paintDpad(dpad);
          return;
        }
        this.dpadPointer = event.pointerId;
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
      dpad.addEventListener('lostpointercapture', release);
      this.cleanupCallbacks.push(
        () => dpad.removeEventListener('pointerdown', down),
        () => dpad.removeEventListener('pointermove', move),
        () => dpad.removeEventListener('pointerup', release),
        () => dpad.removeEventListener('pointercancel', release),
        () => dpad.removeEventListener('lostpointercapture', release),
      );
    }

    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action]')) {
      this.actionButtons.add(button);
      const action = button.dataset.action;
      if (action === 'ultimate') {
        const down = (event: PointerEvent) => {
          event.preventDefault();
          if (!this.tryCapture(button, event.pointerId)) return;
          this.ultimatePointers.add(event.pointerId);
          this.touchUltimateQueued = true;
          button.classList.add('is-pressed');
        };
        const release = (event: PointerEvent) => {
          event.preventDefault();
          if (!this.ultimatePointers.delete(event.pointerId)) return;
          if (this.ultimatePointers.size === 0) button.classList.remove('is-pressed');
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
        continue;
      }

      if (!['attack', 'special', 'jump'].includes(action ?? '')) continue;
      const touchAction = action as ActionName;
      const pointers = this.actionPointers[touchAction];
      const down = (event: PointerEvent) => {
        event.preventDefault();
        if (!this.tryCapture(button, event.pointerId)) return;
        pointers.add(event.pointerId);
        this.touchActions[touchAction] = true;
        button.classList.add('is-pressed');
      };
      const release = (event: PointerEvent) => {
        event.preventDefault();
        if (!pointers.delete(event.pointerId)) return;
        this.touchActions[touchAction] = pointers.size > 0;
        if (pointers.size === 0) button.classList.remove('is-pressed');
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
