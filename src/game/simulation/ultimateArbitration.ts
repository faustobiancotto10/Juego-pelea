import type { UltimateDefinition } from '../data/ultimates.js';
import type { Facing, FighterIndex } from '../types.js';

export interface UltimateConfrontationVolume {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface UltimateConfrontationProposal {
  owner: FighterIndex;
  target: FighterIndex;
  definition: UltimateDefinition;
  effectiveTick: number;
  phaseFrame: number;
  currentX: number;
  currentY: number;
  plannedX: number;
  targetCurrentX: number;
  targetPlannedX: number;
  facing: Facing;
  confrontation: UltimateConfrontationVolume;
  wouldCapture: boolean;
  proposedTargetX: number | null;
}

export interface UltimateClashIntersection {
  x: number;
  y: number;
}

export function buildUltimateConfrontationVolume(
  definition: UltimateDefinition,
  currentX: number,
  plannedX: number,
  y: number,
  facing: Facing,
): UltimateConfrontationVolume {
  if (definition.kind === 'dashCapture') {
    const pathMin = Math.min(currentX, plannedX);
    const pathMax = Math.max(currentX, plannedX);
    return facing === 1
      ? { minX: pathMin, maxX: pathMax + definition.captureReach, minY: y, maxY: y + definition.captureVertical }
      : { minX: pathMin - definition.captureReach, maxX: pathMax, minY: y, maxY: y + definition.captureVertical };
  }

  if (definition.kind === 'suctionCapture') {
    const range = definition.suctionRange ?? 0;
    return facing === 1
      ? { minX: currentX, maxX: currentX + range, minY: y, maxY: y + definition.captureVertical }
      : { minX: currentX - range, maxX: currentX, minY: y, maxY: y + definition.captureVertical };
  }

  const exhaustive: never = definition.kind;
  throw new Error(`Unsupported Ultimate confrontation kind ${String(exhaustive)}`);
}

function targetIsForward(proposal: UltimateConfrontationProposal): boolean {
  const delta = proposal.targetCurrentX - proposal.currentX;
  if (delta === 0) return true;
  return delta * proposal.facing > 0;
}

export function findUltimateClashIntersection(
  first: UltimateConfrontationProposal,
  second: UltimateConfrontationProposal,
  combatTick: number,
): UltimateClashIntersection | null {
  const firstAge = combatTick - first.effectiveTick;
  const secondAge = combatTick - second.effectiveTick;
  if (firstAge < 0 || firstAge > 3 || secondAge < 0 || secondAge > 3) return null;
  if (Math.abs(first.effectiveTick - second.effectiveTick) > 3) return null;
  if (first.facing !== -second.facing) return null;
  if (!targetIsForward(first) || !targetIsForward(second)) return null;

  const corridorMin = Math.min(first.currentX, first.plannedX, second.currentX, second.plannedX);
  const corridorMax = Math.max(first.currentX, first.plannedX, second.currentX, second.plannedX);
  if (corridorMax <= corridorMin) return null;

  const firstMinX = Math.max(first.confrontation.minX, corridorMin);
  const firstMaxX = Math.min(first.confrontation.maxX, corridorMax);
  const secondMinX = Math.max(second.confrontation.minX, corridorMin);
  const secondMaxX = Math.min(second.confrontation.maxX, corridorMax);

  const overlapMinX = Math.max(firstMinX, secondMinX);
  const overlapMaxX = Math.min(firstMaxX, secondMaxX);
  const overlapMinY = Math.max(first.confrontation.minY, second.confrontation.minY);
  const overlapMaxY = Math.min(first.confrontation.maxY, second.confrontation.maxY);

  // Tangency is not a Clash. Both axes need positive-area overlap.
  if (overlapMaxX <= overlapMinX || overlapMaxY <= overlapMinY) return null;

  return {
    x: (overlapMinX + overlapMaxX) * 0.5,
    y: (overlapMinY + overlapMaxY) * 0.5,
  };
}
