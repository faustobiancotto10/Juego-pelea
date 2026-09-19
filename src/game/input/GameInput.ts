import { composeInputFrame, directionFromPoint, type DirectionState } from './dpad.js';
import { DoubleTapTracker, type HorizontalDirection } from './doubleTap.js';
import { inputFromKeyboard } from './keyboard.js';
import type { CombatAction, CommandDirection, CommandIntent, InputFrame } from '../types.js';

const NEUTRAL: DirectionState = { left: false, right: false, up: false, down: false };
const MAX_COMMAND_QUEUE = 8;
const MAX_COMMANDS_PER_SAMPLE = 4;
const DOWN_GRACE_SAMPLES = 4;

type ActionName = 'attack' | 'special' | 'jump';

export interface CombatInputContext {
  superReady: boolean;
  defensiveContext: boolean;
  nowMs?: number;
}

export interface GameInputOptions {
  onReset?: () => void;
}

function cloneDirection(direction: CommandDirection): CommandDirection {
  return { ...direction };
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
  private readonly queuedCommands: CommandIntent[] = [];
  private latestContext: CombatInputContext = { superReady: false, defensiveContext: false };
  private downGraceSamples = 0;
  private dashLeft = false;
  private dashRight = false;

  constructor(
    private readonly root: HTMLElement,
    private readonly options: GameInputOptions = {},
  ) {
    this.bindKeyboard();
    this.bindTouchControls();
    this.bindLifecycle();
  }

  getFrame(context: CombatInputContext = { superReady: false, defensiveContext: false }): InputFrame {
    this.latestContext = { ...context };

    const keyboard = inputFromKeyboard(this.keys);
    const touch = composeInputFrame(this.touchDirection, this.touchActions);
    const direction: CommandDirection = {
      left: keyboard.left || touch.left,
      right: keyboard.right || touch.right,
      down: keyboard.down || touch.down,
      up: keyboard.up || touch.up,
    };

    const commands = this.queuedCommands
      .splice(0, MAX_COMMANDS_PER_SAMPLE)
      .map((command) => ({
        action: command.action,
        direction: cloneDirection(command.direction),
      }));

    const frame: InputFrame = {
      ...direction,
      jump: keyboard.jump || touch.jump,
      attack: keyboard.attack || touch.attack,
      special: keyboard.special || touch.special,
      dashLeft: this.dashLeft,
      dashRight: this.dashRight,
      ultimate: false,
      pushGuard: false,
      commands,
    };

    this.updateDownGrace(direction);
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
    this.queuedCommands.length = 0;
    this.latestContext = { superReady: false, defensiveContext: false };
    this.downGraceSamples = 0;
    this.dashLeft = false;
    this.dashRight = false;

    if (this.dpadElement) this.paintDpad(this.dpadElement);
    for (const button of this.actionButtons) button.classList.remove('is-pressed');
    this.options.onReset?.();
  }

  destroy(): void {
    this.reset();
    for (const cleanup of this.cleanupCallbacks.splice(0)) cleanup();
    this.dpadElement = null;
    this.actionButtons.clear();
  }

  private currentDirection(): CommandDirection {
    const keyboard = inputFromKeyboard(this.keys);
    return {
      left: keyboard.left || this.touchDirection.left,
      right: keyboard.right || this.touchDirection.right,
      up: keyboard.up || this.touchDirection.up,
      down: keyboard.down || this.touchDirection.down,
    };
  }

  private captureDirection(): CommandDirection {
    const direction = this.currentDirection();
    if (direction.up) return { ...direction, down: false };
    if (direction.down) return direction;
    if (this.downGraceSamples > 0) return { ...direction, down: true };
    return direction;
  }

  private updateDownGrace(direction: CommandDirection): void {
    if (direction.up) {
      this.downGraceSamples = 0;
      return;
    }
    if (direction.down) {
      this.downGraceSamples = DOWN_GRACE_SAMPLES;
      return;
    }
    if (this.downGraceSamples > 0) this.downGraceSamples -= 1;
  }

  private queueAction(action: CombatAction): void {
    const classified = action === 'special' && this.latestContext.defensiveContext
      ? 'pushGuard'
      : action;
    const command: CommandIntent = {
      action: classified,
      direction: this.captureDirection(),
    };
    if (this.queuedCommands.length >= MAX_COMMAND_QUEUE) this.queuedCommands.shift();
    this.queuedCommands.push(command);
  }

  private registerTap(direction: HorizontalDirection, nowMs: number): void {
    if (!this.doubleTap.tap(direction, nowMs)) return;
    if (direction === 'left') this.dashLeft = true;
    else this.dashRight = true;
  }

  private bindKeyboard(): void {
    const relevant = new Set([
      'KeyA', 'KeyD', 'KeyS', 'KeyW',
      'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp',
      'Space', 'KeyJ', 'KeyK', 'KeyL',
    ]);
    const actionForCode = (code: string): CombatAction | null => {
      if (code === 'KeyJ') return 'attack';
      if (code === 'KeyK') return 'special';
      if (code === 'KeyL') return 'ultimate';
      if (code === 'Space' || code === 'KeyW' || code === 'ArrowUp') return 'jump';
      return null;
    };

    const onDown = (event: KeyboardEvent) => {
      if (!relevant.has(event.code)) return;
      event.preventDefault();
      const wasHeld = this.keys.has(event.code);
      this.keys.add(event.code);
      if (wasHeld || event.repeat) return;

      if (event.code === 'KeyA' || event.code === 'ArrowLeft') this.registerTap('left', performance.now());
      if (event.code === 'KeyD' || event.code === 'ArrowRight') this.registerTap('right', performance.now());

      const action = actionForCode(event.code);
      if (action) this.queueAction(action);
    };

    const onUp = (event: KeyboardEvent) => {
      if (!relevant.has(event.code)) return;
      event.preventDefault();
      this.keys.delete(event.code);
    };

    const onBlur = () => this.reset();

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
        event.preventDefault();
        const rect = dpad.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        this.touchDirection = directionFromPoint(
          event.clientX - cx,
          event.clientY - cy,
          rect.width / 2,
          rect.width * 0.16,
        );
        if (this.touchDirection.up) this.downGraceSamples = 0;
        else if (this.touchDirection.down) this.downGraceSamples = DOWN_GRACE_SAMPLES;
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
        event.preventDefault();
        if (this.dpadPointer !== event.pointerId) return;
        this.dpadPointer = null;
        this.touchDirection = { ...NEUTRAL };
        this.paintDpad(dpad);
      };

      dpad.addEventListener('pointerdown', down, { passive: false });
      dpad.addEventListener('pointermove', move, { passive: false });
      dpad.addEventListener('pointerup', release, { passive: false });
      dpad.addEventListener('pointercancel', release, { passive: false });
      dpad.addEventListener('lostpointercapture', release, { passive: false });
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
          this.queueAction('ultimate');
          button.classList.add('is-pressed');
        };
        const release = (event: PointerEvent) => {
          event.preventDefault();
          if (!this.ultimatePointers.delete(event.pointerId)) return;
          if (this.ultimatePointers.size === 0) button.classList.remove('is-pressed');
        };
        button.addEventListener('pointerdown', down, { passive: false });
        button.addEventListener('pointerup', release, { passive: false });
        button.addEventListener('pointercancel', release, { passive: false });
        button.addEventListener('lostpointercapture', release, { passive: false });
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
        this.queueAction(touchAction);
        button.classList.add('is-pressed');
      };

      const release = (event: PointerEvent) => {
        event.preventDefault();
        if (!pointers.delete(event.pointerId)) return;
        this.touchActions[touchAction] = pointers.size > 0;
        if (pointers.size === 0) button.classList.remove('is-pressed');
      };

      button.addEventListener('pointerdown', down, { passive: false });
      button.addEventListener('pointerup', release, { passive: false });
      button.addEventListener('pointercancel', release, { passive: false });
      button.addEventListener('lostpointercapture', release, { passive: false });
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
