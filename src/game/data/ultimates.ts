export type UltimateKind = 'dashCapture' | 'suctionCapture';

export interface UltimateHitBeat {
  frame: number;
  damage: number;
  knockback: number;
}

export interface UltimateDefinition {
  key: string;
  kind: UltimateKind;
  startupFrames: number;
  captureFrames: number;
  recoveryFrames: number;
  /** Successful captures may recover faster than committed whiffs. */
  successRecoveryFrames?: number;
  captureReach: number;
  captureVertical: number;
  dashSpeed?: number;
  suctionRange?: number;
  suctionSpeed?: number;
  captureDistance?: number;
  sequenceFrames: number;
  sequenceOffsetX: number;
  sequenceHits: readonly UltimateHitBeat[];
  releaseKnockback: number;
  /** Authoritative successful-exit state. Optional for injected legacy fixtures. */
  releaseSeparation?: number;
  releaseVx?: number;
  releaseVy?: number;
  releaseHitstun?: number;
  finalHitstop?: number;
  visualKey: string;
}

export const ULTIMATES: Readonly<Record<string, UltimateDefinition>> = Object.freeze({
  camaleoniUltimate: {
    key: 'camaleoniUltimate',
    kind: 'dashCapture',
    startupFrames: 22,
    captureFrames: 8,
    recoveryFrames: 24,
    successRecoveryFrames: 16,
    captureReach: 138,
    captureVertical: 82,
    dashSpeed: 18,
    sequenceFrames: 24,
    sequenceOffsetX: 62,
    sequenceHits: [
      { frame: 6, damage: 70, knockback: 6.5 },
      { frame: 16, damage: 120, knockback: 13.5 },
    ],
    releaseKnockback: 13.5,
    releaseSeparation: 200,
    releaseVx: 14,
    releaseVy: 5,
    releaseHitstun: 30,
    finalHitstop: 10,
    visualKey: 'camaleoni',
  },
  supernarizUltimate: {
    key: 'supernarizUltimate',
    kind: 'suctionCapture',
    startupFrames: 24,
    captureFrames: 18,
    recoveryFrames: 28,
    successRecoveryFrames: 16,
    captureReach: 90,
    captureVertical: 96,
    suctionRange: 330,
    suctionSpeed: 12,
    captureDistance: 90,
    sequenceFrames: 22,
    sequenceOffsetX: 74,
    sequenceHits: [
      { frame: 14, damage: 190, knockback: 15.5 },
    ],
    releaseKnockback: 15.5,
    releaseSeparation: 200,
    releaseVx: 14,
    releaseVy: 5,
    releaseHitstun: 30,
    finalHitstop: 10,
    visualKey: 'supernariz',
  },
});
