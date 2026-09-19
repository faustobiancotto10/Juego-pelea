export type HorizontalDirection = 'left' | 'right';

export class DoubleTapTracker {
  private lastDirection: HorizontalDirection | null = null;
  private lastTime = Number.NEGATIVE_INFINITY;

  constructor(private readonly windowMs = 230) {}

  tap(direction: HorizontalDirection, nowMs: number): boolean {
    const isDouble = direction === this.lastDirection && nowMs - this.lastTime <= this.windowMs;
    this.lastDirection = direction;
    this.lastTime = nowMs;
    if (isDouble) {
      this.lastDirection = null;
      this.lastTime = Number.NEGATIVE_INFINITY;
    }
    return isDouble;
  }

  reset(): void {
    this.lastDirection = null;
    this.lastTime = Number.NEGATIVE_INFINITY;
  }
}
