import type { FighterSnapshot } from '../types.js';
import type { LocomotionPose, Point2 } from './LocomotionPose.js';
import {
  drawFacingReadableText,
  sampleBaseRigAnchors,
  solveTwoBoneLeg,
  type RigAnchors,
} from './RigAnchors.js';
import { GROUND_Y, clamp01, ellipse, lerp, pulse, roundedLine } from './drawUtils.js';

interface JuanchiActionPose {
  lean: number;
  drop: number;
  frontHand: Point2;
  backHand: Point2;
  frontFoot: Point2;
  backFoot: Point2;
  shoulderDrive: number;
  rage: number;
  rush: number;
  finisher: number;
  rub: number;
  palmRelease: number;
  throwPose: number;
}

function movePulse(
  fighter: FighterSnapshot,
  id: string,
  start: number,
  peak: number,
  end: number,
): number {
  return fighter.moveId === id ? pulse(fighter.moveFrame, start, peak, end) : 0;
}

function frictionFactors(frame: number): { rub: number; load: number; release: number } {
  if (frame < 4) {
    return { rub: frame / 4 * 0.35, load: 0, release: 0 };
  }
  if (frame <= 12) {
    const rub = frame <= 7
      ? lerp(0.45, 1, (frame - 4) / 3)
      : 0.78 + 0.22 * Math.abs(Math.sin(frame * Math.PI * 0.75));
    return { rub, load: 0, release: 0 };
  }
  if (frame <= 15) return { rub: lerp(0.55, 0.1, (frame - 12) / 3), load: (frame - 12) / 3, release: 0 };
  if (frame <= 20) return { rub: 0, load: 0, release: clamp01(1 - (frame - 16) / 5) };
  return { rub: 0, load: 0, release: 0 };
}

function ultimateFactors(fighter: FighterSnapshot): {
  retrieve: number;
  rage: number;
  rush: number;
  barrageA: number;
  barrageB: number;
  finisher: number;
} {
  if (fighter.ultimatePhase === 'startup') {
    const retrieve = clamp01(fighter.ultimatePhaseFrame / 12);
    return { retrieve, rage: 0, rush: 0, barrageA: 0, barrageB: 0, finisher: 0 };
  }
  if (fighter.ultimatePhase === 'capture') {
    return { retrieve: 1, rage: 0, rush: 0, barrageA: 0, barrageB: 0, finisher: 0 };
  }
  if (fighter.ultimatePhase !== 'sequence') {
    return { retrieve: 0, rage: 0, rush: 0, barrageA: 0, barrageB: 0, finisher: 0 };
  }

  const frame = fighter.ultimatePhaseFrame;
  const rage = frame >= 4 && frame <= 17
    ? frame <= 11 ? clamp01((frame - 4) / 4) : clamp01(1 - (frame - 11) / 7)
    : 0;
  const rush = frame >= 18 && frame <= 23 ? clamp01((frame - 18) / 5) : 0;
  const barrageA = Math.max(pulse(frame, 22, 24, 26), pulse(frame, 28, 30, 32));
  const barrageB = Math.max(pulse(frame, 25, 27, 29), pulse(frame, 31, 33, 35));
  const finisher = frame >= 34 ? pulse(frame, 33, 40, 43) : 0;
  return { retrieve: 0, rage, rush, barrageA, barrageB, finisher };
}

function withAirLegPose(
  base: Point2,
  side: -1 | 1,
  pose: LocomotionPose,
  airStrike: number,
): Point2 {
  const airborneLift =
    pose.preparation * -2
    + pose.extension * 4
    + pose.tuck * 28
    + pose.descentBrace * 10;
  return {
    x: base.x + side * (pose.tuck * 7 + airStrike * 38),
    y: base.y + airborneLift + airStrike * 22,
  };
}

function computeActionPose(fighter: FighterSnapshot, locomotion: LocomotionPose): JuanchiActionPose {
  const jab = movePulse(fighter, 'juanchiJab', 1, 6, 15);
  const shoulder = movePulse(fighter, 'juanchiShoulder', 1, 7, 18);
  const low = movePulse(fighter, 'juanchiLow', 1, 8, 18);
  const air = movePulse(fighter, 'juanchiAir', 1, 7, 16);
  const throwPose = movePulse(fighter, 'rugbyBoomerangThrow', 1, 12, 25);
  const friction = fighter.moveId === 'friccion'
    ? frictionFactors(fighter.moveFrame)
    : { rub: 0, load: 0, release: 0 };
  const ultimate = ultimateFactors(fighter);
  const block = fighter.blocking ? 1 : 0;
  const hurt = fighter.stunFrames > 0 ? 1 : 0;
  const ko = fighter.health <= 0 ? 1 : 0;

  const ordinaryTravel =
    fighter.moveId === null
    && fighter.ultimatePhase === 'idle'
    && !fighter.blocking
    && fighter.stunFrames === 0
    && fighter.blockstunFrames === 0;
  const gaitSwing = ordinaryTravel ? locomotion.freeArmSwing : 0;
  const ballArmConstrained = fighter.rangedAvailability === 'ready';

  let frontHand: Point2 = {
    x: 31 + gaitSwing,
    y: 111 + Math.abs(gaitSwing) * 0.12,
  };
  let backHand: Point2 = {
    x: -30 - gaitSwing * (ballArmConstrained ? 0.16 : 0.72),
    y: 109 - Math.abs(gaitSwing) * (ballArmConstrained ? 0.03 : 0.1),
  };

  frontHand = {
    x:
      frontHand.x
      + jab * 54
      + shoulder * 18
      + low * 50
      + throwPose * 55
      + ultimate.rush * 30
      + ultimate.barrageA * 58
      + ultimate.finisher * 72
      - block * 10,
    y:
      frontHand.y
      + jab * 4
      + shoulder * 4
      - low * 49
      + throwPose * 23
      + ultimate.rage * 27
      + ultimate.barrageA * 7
      + ultimate.finisher * 12
      + block * 30,
  };
  backHand = {
    x:
      backHand.x
      + shoulder * 26
      + ultimate.rush * 22
      + ultimate.barrageB * 64
      + ultimate.finisher * 48
      + block * 29,
    y:
      backHand.y
      + shoulder * 7
      + ultimate.rage * 31
      + ultimate.barrageB * 5
      + ultimate.finisher * 2
      + block * 34,
  };

  if (friction.rub > 0) {
    const rubOffset = Math.sin(fighter.moveFrame * Math.PI * 0.9) * 4 * friction.rub;
    frontHand = { x: 22 + rubOffset, y: 118 + friction.rub * 2 };
    backHand = { x: 16 - rubOffset, y: 115 - friction.rub * 2 };
  } else if (friction.load > 0) {
    frontHand = { x: 15, y: 119 + friction.load * 9 };
    backHand = { x: 9, y: 116 + friction.load * 8 };
  } else if (friction.release > 0) {
    frontHand = { x: 35 + friction.release * 58, y: 119 };
    backHand = { x: 25 + friction.release * 55, y: 113 };
  }

  if (fighter.ultimatePhase === 'startup') {
    const t = ultimate.retrieve;
    frontHand = {
      x: lerp(31, 22, t),
      y: lerp(111, 169, t),
    };
    backHand = {
      x: lerp(-30, 4, t),
      y: lerp(109, 139, t),
    };
  } else if (fighter.ultimatePhase === 'capture') {
    frontHand = { x: 92, y: 158 };
    backHand = { x: -12, y: 128 };
  } else if (ultimate.rage > 0) {
    frontHand = { x: 23, y: 157 + ultimate.rage * 16 };
    backHand = { x: -22, y: 154 + ultimate.rage * 15 };
  }

  const frontFoot = withAirLegPose(locomotion.frontFoot, 1, locomotion, air);
  const backFoot = withAirLegPose(locomotion.backFoot, -1, locomotion, air * 0.45);

  return {
    lean:
      locomotion.torsoLean
      + jab * 0.075
      + shoulder * 0.21
      + low * 0.08
      + throwPose * 0.12
      + friction.load * -0.08
      + friction.release * 0.19
      + ultimate.rush * 0.24
      + ultimate.finisher * 0.28
      - hurt * 0.16
      - ko * 1.02,
    drop:
      locomotion.pelvisDrop
      + (fighter.crouching ? 28 : 0)
      + low * 25
      + friction.rub * 7
      + friction.load * 16
      + ultimate.rage * 7
      + ultimate.rush * 8
      + ko * 42,
    frontHand,
    backHand,
    frontFoot,
    backFoot,
    shoulderDrive: shoulder,
    rage: ultimate.rage,
    rush: ultimate.rush,
    finisher: ultimate.finisher,
    rub: friction.rub,
    palmRelease: friction.release,
    throwPose,
  };
}

export function sampleJuanchiAnchors(
  fighter: FighterSnapshot,
  locomotion: LocomotionPose,
): RigAnchors {
  const action = computeActionPose(fighter, locomotion);
  const base = sampleBaseRigAnchors('juanchi', locomotion);
  return {
    ...base,
    head: { x: 3 + action.shoulderDrive * 8 + action.finisher * 10, y: 181 - action.drop * 0.34 },
    chest: { x: action.shoulderDrive * 8 + action.finisher * 7, y: 126 - action.drop * 0.55 },
    frontHand: action.frontHand,
    backHand: action.backHand,
    belt: { x: -17, y: 72 - action.drop * 0.82 },
    frontFoot: action.frontFoot,
    backFoot: action.backFoot,
  };
}

export function drawRugbyBallProp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ellipse(ctx, 0, 0, 18, 10, '#9b5d31', 0, '#3e2417', 2);
  roundedLine(ctx, -7, 0, 7, 0, 1.8, '#f5e6ca');
  for (const lx of [-4, 0, 4]) roundedLine(ctx, lx, -3, lx, 3, 1, '#f5e6ca');
  ctx.restore();
}

export function drawPoliceCapProp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle = 0,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#151922';
  ctx.strokeStyle = '#05070a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 9, 0, Math.PI, Math.PI * 2);
  ctx.lineTo(13, 4);
  ctx.quadraticCurveTo(0, 9, -13, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#272d38';
  ctx.beginPath();
  ctx.ellipse(8, 5, 12, 4, 0.08, -0.2, Math.PI * 0.92);
  ctx.fill();
  ellipse(ctx, 0, -2, 2.4, 2.4, '#d8b65c');
  ctx.restore();
}

export function drawJuanchiRageAura(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  rush: number,
  finisher: number,
  frame: number,
): void {
  const raw = clamp01(Math.max(intensity, rush * 0.82));
  const collapse = clamp01(1 - finisher * 0.78);
  const aura = raw * collapse;
  if (aura <= 0.02) return;

  ctx.save();

  // Faint floor / ground edge glow stays behind the body and never fills the screen.
  ctx.save();
  ctx.globalAlpha = 0.08 + aura * 0.16;
  ctx.scale(1 + rush * 0.38, 1);
  ellipse(ctx, -4, 2, 58 + aura * 26, 10 + aura * 5, '#b51f31');
  ctx.restore();

  // Layered crimson flame wisps around shoulders/torso: a genuine aura outside silhouette.
  ctx.lineCap = 'round';
  const pulseBeat = 0.78 + 0.22 * Math.sin(frame * 0.82);
  for (let i = 0; i < 6; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const tier = Math.floor(i / 2);
    const baseX = side * (33 + tier * 7);
    const baseY = -74 - tier * 22;
    const stretch = 1 + rush * 0.8;
    const wispLean = side * (10 + tier * 4) - rush * 20;
    ctx.globalAlpha = aura * pulseBeat * (0.28 - tier * 0.035);
    ctx.strokeStyle = tier === 0 ? '#ef334d' : tier === 1 ? '#d11b31' : '#8e1627';
    ctx.lineWidth = 5 - tier * 0.8;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.bezierCurveTo(
      baseX + wispLean * 0.35 * stretch,
      baseY - 20,
      baseX - wispLean * 0.2 * stretch,
      baseY - 43 - aura * 9,
      baseX + wispLean * stretch,
      baseY - 62 - aura * 14,
    );
    ctx.stroke();
  }

  ctx.globalAlpha = aura * 0.18;
  ctx.strokeStyle = '#ff5266';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(-2 - rush * 16, -116, 50 + rush * 20, 82, -0.08, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

export function drawJuanchi(
  ctx: CanvasRenderingContext2D,
  fighter: FighterSnapshot,
  locomotion: LocomotionPose,
  combatTimeSeconds: number,
): void {
  const feetY = GROUND_Y - fighter.y;
  const action = computeActionPose(fighter, locomotion);
  const anchors = sampleJuanchiAnchors(fighter, locomotion);
  const idle = Math.sin(combatTimeSeconds * 4.8 + fighter.x * 0.004) * 1.1;

  ctx.save();
  ctx.translate(fighter.x, feetY);
  ctx.scale(fighter.facing, 1);
  ctx.rotate(action.lean);

  ctx.save();
  ctx.rotate(-action.lean);
  ctx.globalAlpha = 0.23 * (1 - Math.min(0.68, fighter.y / 260));
  ellipse(ctx, 0, fighter.y, 49, 10, '#030407');
  ctx.restore();

  drawJuanchiRageAura(
    ctx,
    action.rage,
    action.rush,
    action.finisher,
    fighter.ultimatePhaseFrame,
  );

  const hipTwist = locomotion.hipCounterRotation * 42;
  const frontHip: Point2 = { x: 13 + hipTwist, y: 72 - action.drop };
  const backHip: Point2 = { x: -12 - hipTwist, y: 72 - action.drop };
  const frontKnee = solveTwoBoneLeg(frontHip, action.frontFoot, 39, 41, 1);
  const backKnee = solveTwoBoneLeg(backHip, action.backFoot, 39, 41, -1);

  // Black cargo pants: thicker thighs, articulated knees and visible pocket/gold accents.
  roundedLine(ctx, frontHip.x, -frontHip.y, frontKnee.x, -frontKnee.y, 22, '#171a1e');
  roundedLine(ctx, frontKnee.x, -frontKnee.y, action.frontFoot.x, -action.frontFoot.y, 18, '#111419');
  roundedLine(ctx, backHip.x, -backHip.y, backKnee.x, -backKnee.y, 22, '#121519');
  roundedLine(ctx, backKnee.x, -backKnee.y, action.backFoot.x, -action.backFoot.y, 18, '#0d1014');
  ellipse(ctx, frontKnee.x + 4, -frontKnee.y + 2, 9, 6, '#22262c');
  ellipse(ctx, backKnee.x - 4, -backKnee.y + 2, 9, 6, '#20242a');
  roundedLine(ctx, 11, -75 + action.drop, 28, -74 + action.drop, 2.2, '#d8b65c');

  // Black/white sneakers with a restrained gold stripe.
  ellipse(ctx, action.frontFoot.x + 5, -action.frontFoot.y + 1, 19, 7, '#f4f5f2', 0.03, '#090b0e', 2);
  ellipse(ctx, action.frontFoot.x + 1, -action.frontFoot.y - 2, 14, 5, '#171a1f', 0.02);
  roundedLine(ctx, action.frontFoot.x - 7, -action.frontFoot.y - 3, action.frontFoot.x + 9, -action.frontFoot.y - 1, 2, '#d8b65c');
  ellipse(ctx, action.backFoot.x + 5, -action.backFoot.y + 1, 19, 7, '#f4f5f2', 0.03, '#090b0e', 2);
  ellipse(ctx, action.backFoot.x + 1, -action.backFoot.y - 2, 14, 5, '#15181d', 0.02);
  roundedLine(ctx, action.backFoot.x - 7, -action.backFoot.y - 3, action.backFoot.x + 9, -action.backFoot.y - 1, 2, '#c6a553');

  ctx.save();
  ctx.translate(locomotion.weightTransfer * 1.55, -94);
  ctx.rotate(locomotion.chestCounterRotation);
  ctx.translate(0, 94);

  const torsoY = -119 + action.drop * 0.58 + idle;
  // Oversized black shirt silhouette.
  ctx.save();
  ctx.fillStyle = '#101318';
  ctx.strokeStyle = '#05070a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-37, torsoY - 34);
  ctx.quadraticCurveTo(-51, torsoY - 21, -43, torsoY + 35);
  ctx.quadraticCurveTo(0, torsoY + 48, 45, torsoY + 34);
  ctx.quadraticCurveTo(51, torsoY - 17, 36, torsoY - 35);
  ctx.quadraticCurveTo(0, torsoY - 49, -37, torsoY - 34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Gold chain/details.
  ctx.save();
  ctx.strokeStyle = '#d8b65c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(2, torsoY - 31, 19, 0.28, Math.PI - 0.28);
  ctx.stroke();
  ellipse(ctx, 2, torsoY - 10, 4, 6, '#d8b65c', 0.08, '#6b5524', 1);
  ctx.restore();

  // "La 56" is drawn in an unmirrored local subpass so both facings stay readable.
  ctx.save();
  ctx.fillStyle = '#f1f1e9';
  ctx.font = '800 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawFacingReadableText(ctx, fighter.facing, 7, torsoY + 3, 'La 56');
  ctx.restore();

  const shoulderY = torsoY - 23;
  const frontElbow = {
    x: lerp(21, action.frontHand.x, 0.52),
    y: lerp(128 - action.drop * 0.45, action.frontHand.y, 0.5),
  };
  const backElbow = {
    x: lerp(-20, action.backHand.x, 0.52),
    y: lerp(126 - action.drop * 0.45, action.backHand.y, 0.5),
  };

  roundedLine(ctx, 26, shoulderY, frontElbow.x, -frontElbow.y, 16, '#111419');
  roundedLine(ctx, frontElbow.x, -frontElbow.y, action.frontHand.x, -action.frontHand.y, 13, '#bd805f');
  roundedLine(ctx, -26, shoulderY + 2, backElbow.x, -backElbow.y, 16, '#0d1014');
  roundedLine(ctx, backElbow.x, -backElbow.y, action.backHand.x, -action.backHand.y, 13, '#b87859');
  ellipse(ctx, action.frontHand.x, -action.frontHand.y, 7.5, 7, '#c98a67');
  ellipse(ctx, action.backHand.x, -action.backHand.y, 7.5, 7, '#c38563');

  // Heat only lives between the hands during Fricción; body pose remains readable without it.
  if (action.rub > 0.05) {
    const hx = (action.frontHand.x + action.backHand.x) * 0.5;
    const hy = -(action.frontHand.y + action.backHand.y) * 0.5;
    ctx.save();
    ctx.globalAlpha = 0.18 + action.rub * 0.26;
    ellipse(ctx, hx, hy, 9 + action.rub * 5, 6 + action.rub * 3, '#ffb24d');

    // Fricción sparks originate between the hands and rise with the rub beat.
    ctx.strokeStyle = '#ffd27a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i += 1) {
      const sparkPhase = combatTimeSeconds * 17 + fighter.moveFrame * 0.63 + i * 1.17;
      const sx = hx + Math.sin(sparkPhase) * (4 + i * 0.7);
      const sy = hy - 3 - i * 3.4;
      ctx.globalAlpha = action.rub * (0.32 + (i % 3) * 0.1);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(sparkPhase) * 5, sy - 7 - (i % 2) * 3);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (action.palmRelease > 0.05) {
    ctx.save();
    ctx.globalAlpha = action.palmRelease * 0.36;
    ctx.strokeStyle = '#ffcc77';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(action.frontHand.x + 4, -action.frontHand.y, 24 + action.palmRelease * 24, -0.75, 0.75);
    ctx.stroke();
    ctx.restore();
  }

  const headX = anchors.head.x + action.shoulderDrive * 4;
  const headY = -anchors.head.y + idle;
  ellipse(ctx, headX, headY, 35, 39, '#c88c68', -0.035, '#5c382a', 2.3);
  ellipse(ctx, headX - 31, headY + 2, 6, 10, '#b97b5b');

  // Close/faded sides under a dense dark curly top.
  ctx.save();
  ctx.fillStyle = '#171819';
  ctx.beginPath();
  ctx.moveTo(headX - 34, headY - 19);
  ctx.quadraticCurveTo(headX - 26, headY - 41, headX - 17, headY - 43);
  ctx.lineTo(headX - 13, headY - 9);
  ctx.quadraticCurveTo(headX - 27, headY - 8, headX - 34, headY - 19);
  ctx.fill();
  const curls: readonly [number, number, number][] = [
    [-22, -38, 10], [-10, -45, 11], [3, -48, 12], [17, -44, 11], [28, -35, 10],
    [-28, -29, 9], [-15, -31, 11], [0, -34, 12], [15, -32, 11], [30, -24, 8],
  ];
  for (const [dx, dy, radius] of curls) {
    ctx.beginPath();
    ctx.arc(headX + dx, headY + dy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  roundedLine(ctx, headX + 4, headY - 7, headX + 18, headY - 8, 3, '#432b24');
  ellipse(ctx, headX + 15, headY - 1, 2.6, 2.2, '#0b0e12');
  ctx.save();
  ctx.strokeStyle = '#6f4435';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(headX + 15, headY + 6);
  ctx.quadraticCurveTo(headX + 23, headY + 10, headX + 21, headY + 16);
  ctx.stroke();
  ctx.restore();

  if (action.rage > 0.12) {
    // Modest warm body treatment supports the external aura; it is not the aura itself.
    ctx.save();
    ctx.globalAlpha = 0.08 + action.rage * 0.16;
    ellipse(ctx, headX + 5, headY - 2, 40, 45, '#a22f24');
    ctx.restore();
    ellipse(ctx, headX + 20, headY + 19, 7, 9, '#451615', 0.05, '#1c0909', 1.5);
  } else {
    roundedLine(ctx, headX + 8, headY + 22, headX + 22, headY + 22, 2.4, '#5d2b28');
  }

  const ballReady = fighter.rangedAvailability === 'ready' && fighter.ultimatePhase === 'idle';
  if (ballReady) {
    const ballHand = fighter.moveId === 'rugbyBoomerangThrow'
      ? action.frontHand
      : action.backHand;
    drawRugbyBallProp(
      ctx,
      ballHand.x + (fighter.moveId === 'rugbyBoomerangThrow' ? 5 : -1),
      -ballHand.y - 2,
      -0.34 + action.throwPose * 0.72,
    );
  }

  ctx.restore();

  const beltCapVisible =
    fighter.ultimatePhase === 'idle'
    || (fighter.ultimatePhase === 'recovery' && fighter.ultimatePhaseFrame >= 8);
  if (beltCapVisible) {
    drawPoliceCapProp(ctx, anchors.belt.x - 6, -anchors.belt.y + 7, -0.42);
  } else if (fighter.ultimatePhase === 'startup' && fighter.ultimatePhaseFrame < 16) {
    drawPoliceCapProp(ctx, action.frontHand.x + 2, -action.frontHand.y - 4, 0.18);
  }

  if (fighter.blocking) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = '#e6cf83';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(20, torsoY - 4, 48, -1.05, 1.05);
    ctx.stroke();
    ctx.restore();
  }

  if (fighter.guardBreakFrames > 0) {
    ctx.save();
    ctx.globalAlpha = 0.46;
    ctx.strokeStyle = '#ff7c66';
    ctx.lineWidth = 4;
    ctx.setLineDash([9, 7]);
    ctx.beginPath();
    ctx.arc(2, torsoY - 8, 60, -1.4, 2.0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  ctx.restore();
}
