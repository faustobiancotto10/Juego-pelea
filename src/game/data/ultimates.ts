import { DEFAULT_CHARACTER_COMPOSITION } from './characterContent.js';

export type UltimateKind = 'dashCapture' | 'suctionCapture' | 'capCapture';

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
  probeSpawnOffsetX?: number;
  probeSpeed?: number;
  probeHalfWidth?: number;
  probeHalfHeight?: number;
  probeVisualKey?: string;
  sequenceApproach?: {
    startFrame: number;
    endFrame: number;
    standOff: number;
  };
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

export const ULTIMATES: Readonly<Record<string, UltimateDefinition>> =
  DEFAULT_CHARACTER_COMPOSITION.ultimates;
