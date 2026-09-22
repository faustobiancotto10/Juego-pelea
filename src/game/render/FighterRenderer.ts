import type { FighterIndex, FighterSnapshot } from '../types.js';
import { ULTIMATES } from '../data/ultimates.js';
import { DEFAULT_FIGHTER_PRESENTATION_REGISTRY, type FighterPresentationDefinition } from '../data/presentationRegistry.js';
import { drawChameleon } from './ChameleonRig.js';
import { drawJuanchi, sampleJuanchiAnchors } from './JuanchiRig.js';
import { LocomotionPoseTracker, type LocomotionPose } from './LocomotionPose.js';
import { sampleBaseRigAnchors, type Point2, type RigAnchors } from './RigAnchors.js';
import { drawSupernariz } from './SupernarizRig.js';
import { SpriteFighterRenderer } from './sprites/SpriteFighterRenderer.js';
import { clamp01, lerp } from './drawUtils.js';

type RigRenderer = (
  ctx: CanvasRenderingContext2D,
  fighter: FighterSnapshot,
  locomotion: LocomotionPose,
  combatTimeSeconds: number,
) => void;

const RIGS: Readonly<Record<string, RigRenderer>> = Object.freeze({
  chameleon: drawChameleon,
  supernariz: drawSupernariz,
  juanchi: drawJuanchi,
});

const locomotionTracker = new LocomotionPoseTracker();
const missingRigWarnings = new Set<string>();

export function resetFighterPresentation(): void {
  locomotionTracker.reset();
}

function resolvePresentation(fighter: FighterSnapshot): FighterPresentationDefinition | null {
  try {
    return DEFAULT_FIGHTER_PRESENTATION_REGISTRY.getPresentation(fighter.id);
  } catch {
    return null;
  }
}

function resolveRigKey(fighter: FighterSnapshot): string | null {
  return resolvePresentation(fighter)?.rigKey ?? null;
}

function drawMissingRig(ctx: CanvasRenderingContext2D, fighter: FighterSnapshot, rigKey: string | null): void {
  ctx.save();
  ctx.translate(fighter.x, 650 - fighter.y);
  ctx.strokeStyle = '#ff365f';
  ctx.fillStyle = 'rgba(255,54,95,.14)';
  ctx.lineWidth = 5;
  ctx.strokeRect(-42, -178, 84, 178);
  ctx.fillRect(-42, -178, 84, 178);
  ctx.beginPath();
  ctx.moveTo(-34, -168);
  ctx.lineTo(34, -12);
  ctx.moveTo(34, -168);
  ctx.lineTo(-34, -12);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = '700 16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MISSING RIG', 0, -92);
  ctx.restore();

  const warningKey = `${fighter.id}:${rigKey ?? 'unregistered'}`;
  if (!missingRigWarnings.has(warningKey)) {
    missingRigWarnings.add(warningKey);
    console.error(`No procedural rig registered for fighter "${fighter.id}" (rigKey "${rigKey ?? 'unregistered'}")`);
  }
}

function camaleoniUltimateAlpha(fighter: FighterSnapshot): number {
  if (fighter.id !== 'chameleon') return 1;
  const definition = ULTIMATES.camaleoniUltimate!;

  if (fighter.ultimatePhase === 'startup') {
    const phaseProgress = clamp01(fighter.ultimatePhaseFrame / definition.startupFrames);
    const earlyDisappear = clamp01(fighter.moveFrame / 9);
    const progress = Math.max(phaseProgress, earlyDisappear);
    return lerp(1, 0.12, clamp01(progress * 1.35));
  }

  if (fighter.ultimatePhase === 'capture') return 0.08;

  if (fighter.ultimatePhase === 'sequence') {
    const frame = fighter.ultimatePhaseFrame;
    if (frame < 8) return 0.18;
    if (frame < 16) return lerp(0.18, 0.94, (frame - 8) / 8);
    return 1;
  }

  return 1;
}

export function sampleFighterLocomotion(
  slot: FighterIndex,
  fighter: FighterSnapshot,
  frame: number,
  combatTick: number,
): LocomotionPose {
  return locomotionTracker.sample(slot, fighter, frame, combatTick);
}

export function sampleFighterAnchors(
  slot: FighterIndex,
  fighter: FighterSnapshot,
  frame: number,
  combatTick: number,
): RigAnchors | null {
  const presentation = resolvePresentation(fighter);
  if (!presentation || (presentation.bodyBackend ?? 'procedural') === 'sprite') return null;
  const rigKey = presentation.rigKey;
  const locomotion = sampleFighterLocomotion(slot, fighter, frame, combatTick);
  if (rigKey === 'juanchi') return sampleJuanchiAnchors(fighter, locomotion);
  if (!RIGS[rigKey]) return null;
  return sampleBaseRigAnchors(rigKey, locomotion);
}

export function sampleFighterAnchor(
  slot: FighterIndex,
  fighter: FighterSnapshot,
  frame: number,
  combatTick: number,
  name: keyof RigAnchors,
  spriteRenderer: SpriteFighterRenderer | null = null,
): Point2 | null {
  const presentation = resolvePresentation(fighter);
  if (!presentation) return null;

  if ((presentation.bodyBackend ?? 'procedural') === 'sprite') {
    if (!spriteRenderer) {
      throw new Error(`Sprite renderer unavailable for fighter "${fighter.id}"`);
    }
    if (!presentation.spritePackageKey) {
      throw new Error(`Sprite fighter "${fighter.id}" has no spritePackageKey`);
    }
    return spriteRenderer.sampleAnchor(fighter, presentation.spritePackageKey, combatTick, name, slot);
  }

  return sampleFighterAnchors(slot, fighter, frame, combatTick)?.[name] ?? null;
}

export function drawFighter(
  ctx: CanvasRenderingContext2D,
  fighter: FighterSnapshot,
  slot: FighterIndex,
  frame: number,
  combatTick: number,
  combatTimeSeconds: number,
  spriteRenderer: SpriteFighterRenderer | null = null,
): void {
  const presentation = resolvePresentation(fighter);
  if (!presentation) {
    drawMissingRig(ctx, fighter, null);
    return;
  }

  if ((presentation.bodyBackend ?? 'procedural') === 'sprite') {
    if (!spriteRenderer) {
      throw new Error(`Sprite renderer unavailable for fighter "${fighter.id}"`);
    }
    if (!presentation.spritePackageKey) {
      throw new Error(`Sprite fighter "${fighter.id}" has no spritePackageKey`);
    }
    spriteRenderer.draw(
      ctx,
      fighter,
      presentation.spritePackageKey,
      combatTick,
      camaleoniUltimateAlpha(fighter),
      slot,
    );
    return;
  }

  const rigKey = presentation.rigKey;
  const rig = RIGS[rigKey];
  if (!rig) {
    drawMissingRig(ctx, fighter, rigKey);
    return;
  }

  const locomotion = sampleFighterLocomotion(slot, fighter, frame, combatTick);
  ctx.save();
  ctx.globalAlpha *= camaleoniUltimateAlpha(fighter);
  rig(ctx, fighter, locomotion, combatTimeSeconds);
  ctx.restore();
}
