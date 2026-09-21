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
  clashBrace: number;
  clashRecoil: number;
  travelIntent: TravelIntent;
  actualTravel: number;
  hipCounterRotation: number;
  chestCounterRotation: number;
  freeArmSwing: number;
  weightTransfer: number;
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

export interface LocomotionStyle {
  stride: number;
  backStrideMultiplier: number;
  stanceFraction: number;
  swingFootLift: number;
  pelvisBobAmplitude: number;
  forwardTorsoLean: number;
  backwardTorsoLean: number;
  hipCounterRotationAmplitude: number;
  chestCounterRotationAmplitude: number;
  freeArmSwingAmplitude: number;
  weightTransferScale: number;
}

const DEFAULT_LOCOMOTION_STYLE: LocomotionStyle = Object.freeze({
  stride: 64,
  backStrideMultiplier: 0.82,
  stanceFraction: 0.55,
  swingFootLift: 8,
  pelvisBobAmplitude: 2.1,
  forwardTorsoLean: 0.045,
  backwardTorsoLean: -0.07,
  hipCounterRotationAmplitude: 0,
  chestCounterRotationAmplitude: 0,
  freeArmSwingAmplitude: 0,
  weightTransferScale: 0,
});

export const LOCOMOTION_STYLES: Readonly<Record<string, LocomotionStyle>> = Object.freeze({
  chameleon: Object.freeze({
    ...DEFAULT_LOCOMOTION_STYLE,
    stride: 58,
  }),
  supernariz: Object.freeze({
    ...DEFAULT_LOCOMOTION_STYLE,
    stride: 70,
  }),
  juanchi: Object.freeze({
    stride: 54,
    backStrideMultiplier: 0.80,
    stanceFraction: 0.62,
    swingFootLift: 6,
    pelvisBobAmplitude: 1.3,
    forwardTorsoLean: 0.035,
    backwardTorsoLean: -0.055,
    hipCounterRotationAmplitude: 0.032,
    chestCounterRotationAmplitude: 0.046,
    freeArmSwingAmplitude: 12,
    weightTransferScale: 8,
  }),
});

export function getLocomotionStyle(fighterId: string): LocomotionStyle {
  return LOCOMOTION_STYLES[fighterId] ?? DEFAULT_LOCOMOTION_STYLE;
}

const NEUTRAL_FRONT_X = 16;
const NEUTRAL_BACK_X = -16;

function mod1(value: number): number {
  return ((value % 1) + 1) % 1;
}

function footForCycle(
  phase: number,
  offset: number,
  stride: number,
  travelSign: -1 | 0 | 1,
  movementBlend: number,
  neutralX: number,
  stanceFraction: number,
  swingFootLift: number,
): Point2 {
  if (travelSign === 0 || movementBlend <= 0.0001) return { x: neutralX, y: 0 };

  const u = mod1(phase + offset);
  const stanceTravel = stride * stanceFraction;
  const halfTravel = stanceTravel * 0.5;

  let x: number;
  let y = 0;
  if (u < stanceFraction) {
    const t = u / stanceFraction;
    // Root translation plus this opposite local translation produces a
    // near-planted support foot in world space.
    x = travelSign * lerp(halfTravel, -halfTravel, t);
  } else {
    const t = (u - stanceFraction) / (1 - stanceFraction);
    x = travelSign * lerp(-halfTravel, halfTravel, t);
    y = Math.sin(Math.PI * t) * swingFootLift;
  }

  return {
    x: lerp(neutralX, x, movementBlend),
    y: y * movementBlend,
  };
}

function neutralPose(fighter: FighterSnapshot): LocomotionPose {
  const clashBrace = fighter.clashRecoveryFrames > 0 && fighter.y <= 0.001 ? 1 : 0;
  const clashRecoil = fighter.clashRecoveryFrames > 0 && fighter.y > 0.001 ? 1 : 0;
  const preparation = !clashBrace && fighter.grounded && fighter.jumpStartupFrames > 0
    ? fighter.jumpStartupFrames >= 2 ? 0.55 : 1
    : 0;
  const landingAbsorption = fighter.grounded
    ? clamp01(fighter.landingRecoveryFrames / 4)
    : 0;
  const airborne = fighter.grounded || clashBrace ? 0 : 1;
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
    pelvisDrop: preparation * 18 + landingAbsorption * 20 + tuck * 5 + clashBrace * 11,
    torsoLean: descentBrace * 0.035 + clashBrace * 0.13 - clashRecoil * 0.11,
    preparation,
    extension,
    tuck,
    descentBrace,
    landingAbsorption,
    movementBlend: 0,
    dashCompression: 0,
    dashDrive: 0,
    clashBrace,
    clashRecoil,
    travelIntent: 'idle',
    actualTravel: 0,
    hipCounterRotation: 0,
    chestCounterRotation: 0,
    freeArmSwing: 0,
    weightTransfer: 0,
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
    const style = getLocomotionStyle(fighter.id);
    const previousBlend = state.movementBlend;

    if (moving) {
      state.travelSign = localTravel >= 0 ? 1 : -1;
      const effectiveStride = style.stride * (state.travelSign < 0 ? style.backStrideMultiplier : 1);
      state.gaitCycles += travel / effectiveStride;
      state.movementBlend = clamp01(state.movementBlend + advancingTicks / 3);
    } else {
      state.movementBlend = clamp01(state.movementBlend - advancingTicks / 4);
      if (state.movementBlend <= 0.001) state.travelSign = 0;
    }

    const blendDelta = state.movementBlend - previousBlend;
    const phase = mod1(state.gaitCycles);
    const effectiveStride = style.stride * (state.travelSign < 0 ? style.backStrideMultiplier : 1);
    const frontFoot = footForCycle(
      phase,
      0,
      effectiveStride,
      state.travelSign,
      state.movementBlend,
      NEUTRAL_FRONT_X,
      style.stanceFraction,
      style.swingFootLift,
    );
    const backFoot = footForCycle(
      phase,
      0.5,
      effectiveStride,
      state.travelSign,
      state.movementBlend,
      NEUTRAL_BACK_X,
      style.stanceFraction,
      style.swingFootLift,
    );

    const clashBrace = fighter.clashRecoveryFrames > 0 && fighter.y <= 0.001 ? 1 : 0;
    const clashRecoil = fighter.clashRecoveryFrames > 0 && fighter.y > 0.001 ? 1 : 0;
    const preparation = !clashBrace && fighter.grounded && fighter.jumpStartupFrames > 0
      ? fighter.jumpStartupFrames >= 2 ? 0.55 : 1
      : 0;
    const landingAbsorption = fighter.grounded
      ? clamp01(fighter.landingRecoveryFrames / 4)
      : 0;
    const airborne = fighter.grounded || clashBrace ? 0 : 1;
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

    const walkBob = state.movementBlend * Math.sin(phase * Math.PI * 4) * style.pelvisBobAmplitude;
    const travelLean = state.movementBlend
      * (state.travelSign > 0 ? style.forwardTorsoLean : state.travelSign < 0 ? style.backwardTorsoLean : 0);
    const gaitWave = Math.sin(phase * Math.PI * 2) * state.movementBlend;
    const hipCounterRotation = gaitWave * style.hipCounterRotationAmplitude;
    const chestCounterRotation = -gaitWave * style.chestCounterRotationAmplitude;
    const freeArmSwing = -gaitWave * style.freeArmSwingAmplitude;
    const weightTransfer = blendDelta * style.weightTransferScale * (state.travelSign || 1);
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
        + dashCompression * 10
        + clashBrace * 11,
      torsoLean:
        travelLean
        + dashLean
        + clashBrace * 0.13
        - clashRecoil * 0.11
        - preparation * 0.035
        + extension * 0.045
        + descentBrace * 0.04
        + weightTransfer * 0.006,
      preparation,
      extension,
      tuck,
      descentBrace,
      landingAbsorption,
      movementBlend: state.movementBlend,
      dashCompression,
      dashDrive,
      clashBrace,
      clashRecoil,
      travelIntent:
        state.travelSign > 0 ? 'forward' : state.travelSign < 0 ? 'back' : 'idle',
      actualTravel: moving ? travel : 0,
      hipCounterRotation,
      chestCounterRotation,
      freeArmSwing,
      weightTransfer,
    };

    state.lastFrame = frame;
    state.lastCombatTick = combatTick;
    state.lastX = fighter.x;
    state.cached = pose;
    return pose;
  }
}
