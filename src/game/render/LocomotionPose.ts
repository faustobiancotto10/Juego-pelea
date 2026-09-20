import type { FighterIndex, FighterSnapshot } from '../types.js';
import { clamp01, lerp } from './drawUtils.js';

export interface Point2 {
  x: number;
  y: number;
}

export type TravelIntent = 'idle' | 'forward' | 'back';

export interface LocomotionPose {
  phase: number;
  frontFoot: Point2;
  backFoot: Point2;
  pelvisDrop: number;
  torsoLean: number;
  preparation: number;
  extension: number;
  tuck: number;
  descentBrace: number;
  landingAbsorption: number;
  movementBlend: number;
  dashCompression: number;
  dashDrive: number;
  travelIntent: TravelIntent;
  actualTravel: number;
}

interface TrackerState {
  fighterId: string;
  lastFrame: number;
  lastCombatTick: number;
  lastX: number;
  gaitCycles: number;
  movementBlend: number;
  travelSign: -1 | 0 | 1;
  cached: LocomotionPose;
}

const STRIDE_BY_FIGHTER: Readonly<Record<string, number>> = Object.freeze({
  chameleon: 58,
  supernariz: 70,
  juanchi: 66,
});

const NEUTRAL_FRONT_X = 16;
const NEUTRAL_BACK_X = -16;
const STANCE_FRACTION = 0.55;

function mod1(value: number): number {
  return ((value % 1) + 1) % 1;
}

function baseStride(fighterId: string): number {
  return STRIDE_BY_FIGHTER[fighterId] ?? 64;
}

function footForCycle(
  phase: number,
  offset: number,
  stride: number,
  travelSign: -1 | 0 | 1,
  movementBlend: number,
  neutralX: number,
): Point2 {
  if (travelSign === 0 || movementBlend <= 0.0001) return { x: neutralX, y: 0 };

  const u = mod1(phase + offset);
  const stanceTravel = stride * STANCE_FRACTION;
  const halfTravel = stanceTravel * 0.5;

  let x: number;
  let y = 0;
  if (u < STANCE_FRACTION) {
    const t = u / STANCE_FRACTION;
    // Root translation plus this opposite local translation produces a
    // near-planted support foot in world space.
    x = travelSign * lerp(halfTravel, -halfTravel, t);
  } else {
    const t = (u - STANCE_FRACTION) / (1 - STANCE_FRACTION);
    x = travelSign * lerp(-halfTravel, halfTravel, t);
    y = Math.sin(Math.PI * t) * 8;
  }

  return {
    x: lerp(neutralX, x, movementBlend),
    y: y * movementBlend,
  };
}

function neutralPose(fighter: FighterSnapshot): LocomotionPose {
  const preparation = fighter.grounded && fighter.jumpStartupFrames > 0
    ? fighter.jumpStartupFrames >= 2 ? 0.55 : 1
    : 0;
  const landingAbsorption = fighter.grounded
    ? clamp01(fighter.landingRecoveryFrames / 4)
    : 0;
  const airborne = fighter.grounded ? 0 : 1;
  const extension = airborne && fighter.airborneTicks <= 2
    ? clamp01(1 - fighter.airborneTicks / 3)
    : 0;
  const tuck = airborne
    ? clamp01((fighter.airborneTicks - 1) / 6) * (fighter.vy >= 0 ? 1 : 0.55)
    : 0;
  const descentBrace = airborne && fighter.vy < 0
    ? clamp01(-fighter.vy / 12.5)
    : 0;
  return {
    phase: 0,
    frontFoot: { x: NEUTRAL_FRONT_X, y: 0 },
    backFoot: { x: NEUTRAL_BACK_X, y: 0 },
    pelvisDrop: preparation * 18 + landingAbsorption * 20 + tuck * 5,
    torsoLean: descentBrace * 0.035,
    preparation,
    extension,
    tuck,
    descentBrace,
    landingAbsorption,
    movementBlend: 0,
    dashCompression: 0,
    dashDrive: 0,
    travelIntent: 'idle',
    actualTravel: 0,
  };
}

function isOrdinaryGroundTravel(fighter: FighterSnapshot): boolean {
  return fighter.grounded
    && fighter.jumpStartupFrames === 0
    && fighter.moveId === null
    && fighter.ultimatePhase === 'idle'
    && fighter.capturedBy === null
    && fighter.clashRecoveryFrames === 0
    && fighter.stunFrames === 0
    && fighter.blockstunFrames === 0
    && fighter.guardBreakFrames === 0
    && fighter.dashKind === null;
}

export class LocomotionPoseTracker {
  private readonly slots: [TrackerState | null, TrackerState | null] = [null, null];

  reset(): void {
    this.slots[0] = null;
    this.slots[1] = null;
  }

  sample(
    slot: FighterIndex,
    fighter: FighterSnapshot,
    frame: number,
    combatTick: number,
  ): LocomotionPose {
    let state = this.slots[slot];

    if (
      state === null
      || state.fighterId !== fighter.id
      || frame < state.lastFrame
      || combatTick < state.lastCombatTick
    ) {
      const pose = neutralPose(fighter);
      state = {
        fighterId: fighter.id,
        lastFrame: frame,
        lastCombatTick: combatTick,
        lastX: fighter.x,
        gaitCycles: 0,
        movementBlend: 0,
        travelSign: 0,
        cached: pose,
      };
      this.slots[slot] = state;
      return pose;
    }

    // Several RAF renders of one simulation snapshot must be identical.
    if (combatTick === state.lastCombatTick) {
      state.lastFrame = Math.max(state.lastFrame, frame);
      return state.cached;
    }

    const advancingTicks = Math.max(1, combatTick - state.lastCombatTick);
    const dx = fighter.x - state.lastX;
    const travel = Math.abs(dx);
    const plausibleTravel = travel <= 64 * advancingTicks;
    const ordinaryTravel = isOrdinaryGroundTravel(fighter) && plausibleTravel;
    const localTravel = dx * fighter.facing;
    const moving = ordinaryTravel && travel > 0.025;

    if (moving) {
      state.travelSign = localTravel >= 0 ? 1 : -1;
      const effectiveStride = baseStride(fighter.id) * (state.travelSign < 0 ? 0.82 : 1);
      state.gaitCycles += travel / effectiveStride;
      state.movementBlend = clamp01(state.movementBlend + advancingTicks / 3);
    } else {
      state.movementBlend = clamp01(state.movementBlend - advancingTicks / 4);
      if (state.movementBlend <= 0.001) state.travelSign = 0;
    }

    const phase = mod1(state.gaitCycles);
    const effectiveStride = baseStride(fighter.id) * (state.travelSign < 0 ? 0.82 : 1);
    const frontFoot = footForCycle(
      phase,
      0,
      effectiveStride,
      state.travelSign,
      state.movementBlend,
      NEUTRAL_FRONT_X,
    );
    const backFoot = footForCycle(
      phase,
      0.5,
      effectiveStride,
      state.travelSign,
      state.movementBlend,
      NEUTRAL_BACK_X,
    );

    const preparation = fighter.grounded && fighter.jumpStartupFrames > 0
      ? fighter.jumpStartupFrames >= 2 ? 0.55 : 1
      : 0;
    const landingAbsorption = fighter.grounded
      ? clamp01(fighter.landingRecoveryFrames / 4)
      : 0;
    const airborne = fighter.grounded ? 0 : 1;
    const extension = airborne && fighter.airborneTicks <= 2
      ? clamp01(1 - fighter.airborneTicks / 3)
      : 0;
    const ascentTuck = airborne && fighter.vy >= 0
      ? clamp01((fighter.airborneTicks - 1) / 6)
      : 0;
    const apexTuck = airborne ? clamp01(1 - Math.abs(fighter.vy) / 4.5) : 0;
    const tuck = Math.max(ascentTuck * 0.8, apexTuck);
    const descentBrace = airborne && fighter.vy < 0
      ? clamp01(-fighter.vy / 12.5)
      : 0;

    const dashCompression = fighter.dashKind === null
      ? 0
      : clamp01(1 - Math.abs(fighter.dashFrame - 3) / 4);
    const dashDrive = fighter.dashKind === null
      ? 0
      : clamp01(fighter.dashFrame / 6);

    const walkBob = state.movementBlend * Math.sin(phase * Math.PI * 4) * 2.1;
    const travelLean = state.movementBlend
      * (state.travelSign > 0 ? 0.045 : state.travelSign < 0 ? -0.07 : 0);
    const dashLean = fighter.dashKind === 'forward'
      ? 0.16 * dashDrive
      : fighter.dashKind === 'back'
        ? -0.13 * dashDrive
        : 0;

    const pose: LocomotionPose = {
      phase,
      frontFoot,
      backFoot,
      pelvisDrop:
        walkBob
        + preparation * 18
        + landingAbsorption * 20
        + tuck * 5
        + dashCompression * 10,
      torsoLean:
        travelLean
        + dashLean
        - preparation * 0.035
        + extension * 0.045
        + descentBrace * 0.04,
      preparation,
      extension,
      tuck,
      descentBrace,
      landingAbsorption,
      movementBlend: state.movementBlend,
      dashCompression,
      dashDrive,
      travelIntent:
        state.travelSign > 0 ? 'forward' : state.travelSign < 0 ? 'back' : 'idle',
      actualTravel: moving ? travel : 0,
    };

    state.lastFrame = frame;
    state.lastCombatTick = combatTick;
    state.lastX = fighter.x;
    state.cached = pose;
    return pose;
  }
}
