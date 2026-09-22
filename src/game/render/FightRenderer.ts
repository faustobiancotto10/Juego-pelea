import type { CombatEvent, MatchSnapshot, ProjectileSnapshot } from '../types.js';
import { DEFAULT_FIGHTER_PRESENTATION_REGISTRY } from '../data/presentationRegistry.js';
import {
  drawCamaleoniSequenceCuts,
  drawCamaleoniVeil,
  drawClashOpposingTrails,
  drawCaptureStartup,
  drawCapturedLock,
  drawColetazoTrail,
  drawDashAfterimage,
  drawLaunchTrail,
  drawNazazoArc,
  drawPushGuardBurst,
  drawReappearanceFlash,
  drawSuctionField,
  drawSupernarizInhalePulse,
  drawUltimateClashEffect,
  drawUltimateImpact,
  getColetazoPresentation,
} from './CombatEffects.js';
import { drawFighter, resetFighterPresentation, sampleFighterAnchor } from './FighterRenderer.js';
import { drawPoliceCapProp, drawRugbyBallProp } from './props/JuanchiProps.js';
import { localAnchorToWorld } from './RigAnchors.js';
import { drawStage } from './StageRenderer.js';
import { DEFAULT_STAGE_REGISTRY, type StageDefinition } from './StageRegistry.js';
import type { SpriteAssetStore } from './sprites/SpriteAssetStore.js';
import { SpriteFighterRenderer } from './sprites/SpriteFighterRenderer.js';
import { GROUND_Y, WORLD_HEIGHT, WORLD_WIDTH, ellipse } from './drawUtils.js';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  tone: 'warm' | 'cold' | 'block' | 'break' | 'ultimate' | 'tail';
}

interface PushGuardFlash {
  x: number;
  y: number;
  facing: -1 | 1;
  life: number;
  maxLife: number;
}

interface UltimateFlash {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  accent: string;
}

interface UltimateReleaseTrail {
  x: number;
  y: number;
  facing: -1 | 1;
  life: number;
  maxLife: number;
  accent: string;
}

interface ClashFlash {
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

export class FightRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private pushGuardFlashes: PushGuardFlash[] = [];
  private ultimateFlashes: UltimateFlash[] = [];
  private ultimateReleaseTrails: UltimateReleaseTrail[] = [];
  private clashFlashes: ClashFlash[] = [];
  private stageReactionTicks = 0;
  private shakeFrames = 0;
  private shakeStrength = 0;
  private lastSnapshot: MatchSnapshot | null = null;
  private lastConsumedEventFrame: number | null = null;
  private lastRenderedSimulationFrame: number | null = null;
  private lastRenderedCombatTick: number | null = null;
  private stage: StageDefinition;
  private readonly spriteFighterRenderer: SpriteFighterRenderer | null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    stage: StageDefinition = DEFAULT_STAGE_REGISTRY.get('tramontana-dusk'),
    spriteAssets?: SpriteAssetStore,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas2D unavailable');
    this.ctx = ctx;
    this.stage = stage;
    this.spriteFighterRenderer = spriteAssets ? new SpriteFighterRenderer(spriteAssets) : null;
  }

  setStage(stage: StageDefinition): void {
    this.stage = stage;
  }

  consumeEvents(snapshot: MatchSnapshot): void {
    this.lastSnapshot = snapshot;
    if (this.lastConsumedEventFrame === snapshot.frame) return;
    this.lastConsumedEventFrame = snapshot.frame;
    for (const event of snapshot.events) this.consumeEvent(event, snapshot);
  }

  private consumeEvent(event: CombatEvent, snapshot: MatchSnapshot): void {
    if (event.type === 'round-start') {
      resetFighterPresentation();
      this.spriteFighterRenderer?.resetPresentation();
      this.clashFlashes = [];
      this.stageReactionTicks = 0;
      this.lastRenderedCombatTick = null;
      return;
    }

    if (event.type === 'ultimate-clash') {
      this.clashFlashes.push({
        x: event.x,
        y: GROUND_Y - event.y,
        life: 24,
        maxLife: 24,
      });
      if (this.clashFlashes.length > 6) {
        this.clashFlashes.splice(0, this.clashFlashes.length - 6);
      }
      this.stageReactionTicks = Math.max(this.stageReactionTicks, 30);
      this.shakeFrames = Math.max(this.shakeFrames, 12);
      this.shakeStrength = Math.max(this.shakeStrength, 8.4);
      return;
    }

    if (event.type === 'push-guard') {
      const defender = snapshot.fighters[event.defender];
      this.pushGuardFlashes.push({
        x: defender.x,
        y: GROUND_Y - defender.y,
        facing: defender.facing,
        life: 14,
        maxLife: 14,
      });
      if (this.pushGuardFlashes.length > 6) this.pushGuardFlashes.splice(0, this.pushGuardFlashes.length - 6);
      this.shakeFrames = Math.max(this.shakeFrames, 2);
      this.shakeStrength = Math.max(this.shakeStrength, 1.6);
      return;
    }

    if (event.type === 'ultimate-capture') {
      const attacker = snapshot.fighters[event.attacker];
      const defender = snapshot.fighters[event.defender];
      this.ultimateFlashes.push({
        x: defender.x,
        y: GROUND_Y - defender.y - 96,
        life: 16,
        maxLife: 16,
        accent: this.accentForFighter(attacker.id),
      });
      if (this.ultimateFlashes.length > 6) this.ultimateFlashes.splice(0, this.ultimateFlashes.length - 6);
      this.shakeFrames = Math.max(this.shakeFrames, 4);
      this.shakeStrength = Math.max(this.shakeStrength, 3.4);
      return;
    }

    if (event.type === 'ultimate-release') {
      const attacker = snapshot.fighters[event.attacker];
      const defender = snapshot.fighters[event.defender];
      const accent = this.accentForFighter(attacker.id);
      this.ultimateReleaseTrails.push({
        x: defender.x,
        y: GROUND_Y - defender.y,
        facing: attacker.facing,
        life: 22,
        maxLife: 22,
        accent,
      });
      if (this.ultimateReleaseTrails.length > 6) {
        this.ultimateReleaseTrails.splice(0, this.ultimateReleaseTrails.length - 6);
      }
      this.shakeFrames = Math.max(this.shakeFrames, 10);
      this.shakeStrength = Math.max(this.shakeStrength, 7.2);
      this.stageReactionTicks = Math.max(this.stageReactionTicks, 18);
      return;
    }

    if (event.type === 'guard-break') {
      const defender = snapshot.fighters[event.defender];
      const centerX = defender.x;
      const centerY = GROUND_Y - defender.y - (defender.crouching ? 72 : 112);
      const count = 24;
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + (snapshot.frame % 5) * 0.08;
        const speed = 4.2 + ((i * 29) % 9) * 0.28;
        this.particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.8,
          life: 24,
          maxLife: 24,
          radius: 4.6,
          tone: 'break',
        });
      }
      this.shakeFrames = Math.max(this.shakeFrames, 6);
      this.shakeStrength = Math.max(this.shakeStrength, 4.2);
      this.trimParticles();
      return;
    }
    if (event.type !== 'hit') return;
    const defender = snapshot.fighters[event.defender];
    const attacker = snapshot.fighters[event.attacker];
    const centerX = defender.x - defender.facing * 22;
    const centerY = GROUND_Y - defender.y - (defender.crouching ? 64 : 100);
    const ultimateHit = event.source === 'ultimate';
    const ultimateFinisher = ultimateHit && event.finisher;
    const majorImpact = ultimateHit && event.majorImpact === true;
    const peakImpact = majorImpact || ultimateFinisher;
    const tone: Particle['tone'] = event.blocked
      ? 'block'
      : ultimateHit
        ? 'ultimate'
        : attacker.moveId === 'tramontana'
          ? 'cold'
          : attacker.moveId === 'coletazo'
            ? 'tail'
            : 'warm';
    const count = peakImpact ? 28 : event.strong ? 18 : 10;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + (snapshot.frame % 7) * 0.1;
      const speed = (event.strong ? 5.5 : 3.6) * (0.65 + ((i * 37) % 10) / 20);
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        life: peakImpact ? 30 : event.strong ? 22 : 15,
        maxLife: peakImpact ? 30 : event.strong ? 22 : 15,
        radius: peakImpact ? 5.6 : event.strong ? 4.2 : 3.1,
        tone,
      });
    }
    if (ultimateHit && !event.blocked) {
      this.ultimateFlashes.push({
        x: centerX,
        y: centerY,
        life: 18,
        maxLife: 18,
        accent: this.accentForFighter(attacker.id),
      });
      if (this.ultimateFlashes.length > 6) this.ultimateFlashes.splice(0, this.ultimateFlashes.length - 6);
      this.shakeFrames = Math.max(this.shakeFrames, peakImpact ? 11 : 7);
      this.shakeStrength = Math.max(this.shakeStrength, peakImpact ? 8.1 : 5.8);
      if (peakImpact) this.stageReactionTicks = Math.max(this.stageReactionTicks, 24);
    } else if (event.strong && !event.blocked) {
      this.shakeFrames = 7;
      this.shakeStrength = 5.5;
    } else if (!event.blocked) {
      this.shakeFrames = Math.max(this.shakeFrames, 3);
      this.shakeStrength = Math.max(this.shakeStrength, 2.5);
    }
    this.trimParticles();
  }

  private trimParticles(): void {
    const maxParticles = 120;
    if (this.particles.length > maxParticles) {
      this.particles.splice(0, this.particles.length - maxParticles);
    }
  }

  render(snapshot: MatchSnapshot, timeSeconds: number): void {
    void timeSeconds;
    this.lastSnapshot = snapshot;
    const simulationDelta = this.consumeSimulationFrameDelta(snapshot.frame);
    const combatDelta = this.consumeCombatTickDelta(snapshot.combatTick);
    const simulationTimeSeconds = snapshot.frame / 60;
    const combatTimeSeconds = snapshot.combatTick / 60;
    if (combatDelta > 0) {
      this.stageReactionTicks = Math.max(0, this.stageReactionTicks - combatDelta);
    }
    this.resize();
    const ctx = this.ctx;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cssW = this.canvas.clientWidth || window.innerWidth;
    const cssH = this.canvas.clientHeight || window.innerHeight;
    const pxW = cssW * dpr;
    const pxH = cssH * dpr;
    const scale = Math.min(pxW / WORLD_WIDTH, pxH / WORLD_HEIGHT);
    const offsetX = (pxW - WORLD_WIDTH * scale) * 0.5;
    const offsetY = (pxH - WORLD_HEIGHT * scale) * 0.5;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#07090e';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeFrames > 0) {
      const seed = snapshot.frame * 12.9898;
      shakeX = Math.sin(seed) * this.shakeStrength;
      shakeY = Math.cos(seed * 1.37) * this.shakeStrength * 0.6;
      if (simulationDelta > 0) {
        this.shakeFrames = Math.max(0, this.shakeFrames - simulationDelta);
        this.shakeStrength *= Math.pow(0.82, simulationDelta);
      }
    }

    ctx.setTransform(scale, 0, 0, scale, offsetX + shakeX * scale, offsetY + shakeY * scale);
    const clashDarkening = snapshot.clash === null
      ? 0
      : snapshot.clash.phase === 'freeze'
        ? 1
        : Math.min(0.45, snapshot.clash.remainingLaunchTicks / 30 * 0.45);
    drawStage(ctx, combatTimeSeconds, this.stage, {
      reaction: this.stageReactionTicks / 30,
      clashDarkening,
    });

    this.syncAuthoritativeUltimateEffects(snapshot);
    this.drawClashState(snapshot);

    for (const projectile of snapshot.projectiles) this.drawProjectile(projectile);

    for (const fighter of snapshot.fighters) {
      if (fighter.moveId !== 'coletazo') continue;
      drawColetazoTrail(
        ctx,
        fighter.x,
        GROUND_Y - fighter.y,
        fighter.facing,
        getColetazoPresentation(fighter.moveFrame),
      );
    }

    this.drawUltimateFields(snapshot, simulationTimeSeconds);

    // Draw farther/airborne fighter first while preserving stable slot identity
    // for mirrored matchups and per-slot locomotion histories.
    const ordered = ([0, 1] as const)
      .map((index) => ({ index, fighter: snapshot.fighters[index] }))
      .sort((a, b) => (b.fighter.y - a.fighter.y) || (a.fighter.x - b.fighter.x));
    for (const { index, fighter } of ordered) {
      if (fighter.capturedBy !== null) {
        const captor = snapshot.fighters[fighter.capturedBy];
        drawCapturedLock(
          ctx,
          fighter.x,
          GROUND_Y - fighter.y,
          captor.id === 'chameleon' ? '#9ef5a5' : captor.id === 'juanchi' ? '#d8b65c' : '#ffd0a1',
          simulationTimeSeconds,
        );
      }
      drawFighter(
        ctx,
        fighter,
        index,
        snapshot.frame,
        snapshot.combatTick,
        combatTimeSeconds,
        this.spriteFighterRenderer,
      );
    }

    this.updateAndDrawTransientCombatEffects(simulationDelta);
    this.updateAndDrawParticles(simulationDelta);
    this.drawPhaseText(snapshot);
  }

  private syncAuthoritativeUltimateEffects(snapshot: MatchSnapshot): void {
    const hasAuthoritativeUltimateState = snapshot.fighters.some(
      (fighter) => fighter.ultimatePhase !== 'idle' || fighter.capturedBy !== null,
    );
    if (!hasAuthoritativeUltimateState) {
      // Capture/sequence flashes end with authoritative state. Release trails are
      // separate and may finish their bounded impact after ultimate-release.
      this.ultimateFlashes = [];
    }
  }

  private consumeSimulationFrameDelta(frame: number): number {
    if (this.lastRenderedSimulationFrame === null || frame < this.lastRenderedSimulationFrame) {
      this.lastRenderedSimulationFrame = frame;
      return 0;
    }
    const delta = frame - this.lastRenderedSimulationFrame;
    this.lastRenderedSimulationFrame = frame;
    return Math.max(0, delta);
  }

  private consumeCombatTickDelta(combatTick: number): number {
    if (this.lastRenderedCombatTick === null || combatTick < this.lastRenderedCombatTick) {
      this.lastRenderedCombatTick = combatTick;
      return 0;
    }
    const delta = combatTick - this.lastRenderedCombatTick;
    this.lastRenderedCombatTick = combatTick;
    return Math.max(0, delta);
  }

  private accentForFighter(id: string): string {
    try {
      return DEFAULT_FIGHTER_PRESENTATION_REGISTRY.getPresentation(id).effectAccent;
    } catch {
      return '#fff0a8';
    }
  }

  private drawClashState(snapshot: MatchSnapshot): void {
    if (!snapshot.clash) return;
    const left = snapshot.fighters[0].x <= snapshot.fighters[1].x ? snapshot.fighters[0] : snapshot.fighters[1];
    const right = left === snapshot.fighters[0] ? snapshot.fighters[1] : snapshot.fighters[0];
    const intensity = snapshot.clash.phase === 'freeze'
      ? 1
      : Math.max(0.12, snapshot.clash.remainingLaunchTicks / 30);
    drawClashOpposingTrails(
      this.ctx,
      left.x,
      GROUND_Y - left.y,
      right.x,
      GROUND_Y - right.y,
      intensity,
    );
  }

  private drawUltimateFields(snapshot: MatchSnapshot, timeSeconds: number): void {
    const ctx = this.ctx;

    for (const attackerIndex of [0, 1] as const) {
      const fighter = snapshot.fighters[attackerIndex];
      if (fighter.ultimatePhase === 'idle') continue;
      if (fighter.id !== 'chameleon' && fighter.id !== 'supernariz' && fighter.id !== 'juanchi') continue;

      const feetY = GROUND_Y - fighter.y;
      const accent = this.accentForFighter(fighter.id);
      const target = fighter.ultimateTarget === null ? null : snapshot.fighters[fighter.ultimateTarget];
      const targetIsAuthoritativelyCaptured =
        target !== null
        && target.capturedBy === attackerIndex;

      if (fighter.ultimatePhase === 'startup') {
        const startupProgress = fighter.id === 'chameleon'
          ? Math.min(1, fighter.ultimatePhaseFrame / 22)
          : Math.min(1, fighter.ultimatePhaseFrame / 24);
        drawCaptureStartup(ctx, fighter.x, feetY, fighter.facing, 0.5 + startupProgress * 0.5, accent);
        if (fighter.id === 'chameleon') {
          drawCamaleoniVeil(ctx, fighter.x, feetY, fighter.facing, 0.22 + startupProgress * 0.32, timeSeconds);
        } else if (fighter.id === 'supernariz') {
          drawSupernarizInhalePulse(ctx, fighter.x, feetY, fighter.facing, 0.48 + startupProgress * 0.5, timeSeconds);
        } else {
          drawCaptureStartup(ctx, fighter.x, feetY, fighter.facing, 0.42 + startupProgress * 0.38, accent);
        }
        this.drawUltimateProbe(fighter);
        continue;
      }

      if (fighter.ultimatePhase === 'capture') {
        if (fighter.id === 'chameleon') {
          drawCamaleoniVeil(ctx, fighter.x, feetY, fighter.facing, 1, timeSeconds);
          drawDashAfterimage(ctx, fighter.x, feetY, fighter.facing, 1, '#a5f7ad');
        } else if (fighter.id === 'supernariz') {
          drawSupernarizInhalePulse(ctx, fighter.x, feetY, fighter.facing, 1, timeSeconds);
          drawSuctionField(ctx, fighter.x, feetY, fighter.facing, 1, timeSeconds);
        } else {
          this.drawUltimateProbe(fighter);
        }
        continue;
      }

      if (fighter.ultimatePhase === 'sequence') {
        if (!targetIsAuthoritativelyCaptured || !fighter.ultimateConnected) continue;

        if (fighter.id === 'chameleon') {
          const finisherApproach = Math.min(1, Math.max(0, (fighter.ultimatePhaseFrame - 8) / 8));
          drawCamaleoniVeil(ctx, fighter.x, feetY, fighter.facing, 0.2 + (1 - finisherApproach) * 0.24, timeSeconds);
          drawDashAfterimage(ctx, fighter.x, feetY, fighter.facing, 0.35 + (1 - finisherApproach) * 0.28, '#c2ffb8');
          drawCamaleoniSequenceCuts(ctx, fighter.x, feetY, fighter.facing, 0.7 + finisherApproach * 0.3, timeSeconds);
        } else if (fighter.id === 'supernariz') {
          const nazazoBeat = Math.max(0, 1 - Math.abs(fighter.ultimatePhaseFrame - 14) / 9);
          drawSupernarizInhalePulse(ctx, fighter.x, feetY, fighter.facing, 0.46, timeSeconds);
          drawSuctionField(ctx, fighter.x, feetY, fighter.facing, 0.38, timeSeconds);
          drawNazazoArc(ctx, fighter.x, feetY, fighter.facing, nazazoBeat);
        } else if (fighter.ultimateTarget !== null) {
          this.drawJuanchiCaptureCap(snapshot, fighter.ultimateTarget);
        }
        continue;
      }

      if (fighter.ultimatePhase === 'recovery' && fighter.id !== 'juanchi') {
        const recoveryPulse = Math.max(0.2, 1 - fighter.ultimatePhaseFrame / 16);
        drawReappearanceFlash(
          ctx,
          fighter.x + (fighter.id === 'supernariz' ? fighter.facing * 24 : 0),
          feetY - (fighter.id === 'supernariz' ? 118 : 98),
          fighter.id === 'chameleon' ? recoveryPulse : recoveryPulse * 0.44,
        );
      }
    }
  }

  private drawUltimateProbe(fighter: MatchSnapshot['fighters'][number]): void {
    const probe = fighter.ultimateProbe;
    if (!probe || probe.visualKey !== 'police-cap') return;

    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = this.accentForFighter(fighter.id);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(probe.previousX, GROUND_Y - probe.previousY);
    ctx.lineTo(probe.x, GROUND_Y - probe.y);
    ctx.stroke();
    ctx.restore();

    drawPoliceCapProp(
      ctx,
      probe.x,
      GROUND_Y - probe.y,
      probe.x >= probe.previousX ? 0.13 : Math.PI - 0.13,
    );
  }

  private drawJuanchiCaptureCap(snapshot: MatchSnapshot, targetIndex: 0 | 1): void {
    const target = snapshot.fighters[targetIndex];
    const headAnchor = sampleFighterAnchor(
      targetIndex,
      target,
      snapshot.frame,
      snapshot.combatTick,
      'head',
      this.spriteFighterRenderer,
    );
    if (!headAnchor) return;
    const head = localAnchorToWorld(target, headAnchor);
    drawPoliceCapProp(this.ctx, head.x, GROUND_Y - head.y - 18, target.facing * -0.04);
  }

  private updateAndDrawTransientCombatEffects(simulationDelta: number): void {
    const ctx = this.ctx;

    const pushGuardKept: PushGuardFlash[] = [];
    for (const flash of this.pushGuardFlashes) {
      flash.life -= simulationDelta;
      if (flash.life <= 0) continue;
      pushGuardKept.push(flash);
      const progress = 1 - flash.life / flash.maxLife;
      drawPushGuardBurst(ctx, flash.x, flash.y, flash.facing, progress);
    }
    this.pushGuardFlashes = pushGuardKept;

    const ultimateKept: UltimateFlash[] = [];
    for (const flash of this.ultimateFlashes) {
      flash.life -= simulationDelta;
      if (flash.life <= 0) continue;
      ultimateKept.push(flash);
      const progress = 1 - flash.life / flash.maxLife;
      drawUltimateImpact(ctx, flash.x, flash.y, progress, flash.accent);
    }
    this.ultimateFlashes = ultimateKept;

    const clashKept: ClashFlash[] = [];
    for (const flash of this.clashFlashes) {
      flash.life -= simulationDelta;
      if (flash.life <= 0) continue;
      clashKept.push(flash);
      drawUltimateClashEffect(ctx, flash.x, flash.y, flash.life / flash.maxLife);
    }
    this.clashFlashes = clashKept;

    const releaseKept: UltimateReleaseTrail[] = [];
    for (const trail of this.ultimateReleaseTrails) {
      trail.life -= simulationDelta;
      if (trail.life <= 0) continue;
      releaseKept.push(trail);
      const intensity = trail.life / trail.maxLife;
      drawLaunchTrail(ctx, trail.x, trail.y, trail.facing, intensity);
      if (intensity > 0.62) {
        drawUltimateImpact(ctx, trail.x, trail.y - 88, intensity * 0.55, trail.accent);
      }
    }
    this.ultimateReleaseTrails = releaseKept;
  }

  private drawProjectile(projectile: ProjectileSnapshot): void {
    const y = GROUND_Y - projectile.y;
    if (projectile.visualKey === 'rugby-ball') {
      const ctx = this.ctx;
      if (projectile.phase === 'return') {
        ctx.save();
        ctx.globalAlpha = 0.24;
        ctx.strokeStyle = '#d8b65c';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = 1; i <= 3; i += 1) {
          ctx.beginPath();
          ctx.moveTo(projectile.x - projectile.vx * i * 2.5, y + i * 2);
          ctx.lineTo(projectile.x - projectile.vx * i * 5.5, y + i * 3);
          ctx.stroke();
        }
        ctx.restore();
      } else if (projectile.phase === 'turn') {
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.strokeStyle = '#f0d785';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(projectile.x, y, 27 + projectile.phaseTick * 1.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      drawRugbyBallProp(
        ctx,
        projectile.x,
        y,
        projectile.age * 0.3 * (projectile.vx >= 0 ? 1 : -1),
      );
      return;
    }

    if (projectile.visualKey !== 'chorizo') {
      this.ctx.save();
      this.ctx.globalAlpha = 0.75;
      ellipse(this.ctx, projectile.x, y, 12, 12, '#f2f3f5', 0, '#ff365f', 2);
      this.ctx.restore();
      return;
    }

    const ctx = this.ctx;
    ctx.save();
    ctx.translate(projectile.x, y);
    ctx.rotate(projectile.vx >= 0 ? -0.08 : Math.PI + 0.08);
    ctx.fillStyle = '#a84f31';
    ctx.strokeStyle = '#5a2b22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-25, -7, 50, 14, 7);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#ef9d68';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-18, -3);
    ctx.lineTo(16, -3);
    ctx.stroke();
    ctx.strokeStyle = '#e2c598';
    ctx.beginPath();
    ctx.moveTo(-25, 0);
    ctx.lineTo(-31, -4);
    ctx.moveTo(25, 0);
    ctx.lineTo(31, 4);
    ctx.stroke();
    ctx.restore();
  }

  private updateAndDrawParticles(simulationDelta: number): void {
    const ctx = this.ctx;
    const kept: Particle[] = [];
    for (const p of this.particles) {
      if (simulationDelta > 0) {
        const decay = Math.pow(0.94, simulationDelta);
        const distanceScale = (1 - decay) / (1 - 0.94);
        p.x += p.vx * distanceScale;
        p.y += p.vy * simulationDelta + 0.18 * simulationDelta * (simulationDelta - 1) * 0.5;
        p.vx *= decay;
        p.vy += 0.18 * simulationDelta;
        p.life -= simulationDelta;
      }
      if (p.life <= 0) continue;
      kept.push(p);
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      const color =
        p.tone === 'cold'
          ? '#b8edff'
          : p.tone === 'block'
            ? '#f1f4ff'
            : p.tone === 'break'
              ? '#ff6b65'
              : p.tone === 'ultimate'
                ? '#fff0a8'
                : p.tone === 'tail'
                  ? '#d9f58f'
                  : '#ffcf7e';
      ellipse(ctx, p.x, p.y, p.radius * alpha + 1, p.radius * 0.65 * alpha + 0.8, color);
      ctx.restore();
    }
    this.particles = kept;
  }

  private drawPhaseText(snapshot: MatchSnapshot): void {
    const ctx = this.ctx;
    if (snapshot.phase !== 'intro' && snapshot.phase !== 'round-over') return;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,.55)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#f6e8c9';
    ctx.font = '900 64px system-ui, sans-serif';
    if (snapshot.phase === 'intro') {
      ctx.fillText(`ROUND ${snapshot.round}`, WORLD_WIDTH / 2, 285);
      ctx.font = '800 28px system-ui, sans-serif';
      ctx.fillStyle = '#d8b676';
      ctx.fillText('PREPARADOS', WORLD_WIDTH / 2, 338);
    } else {
      const label = snapshot.roundWinner === null ? 'DRAW' : snapshot.roundTimerFrames <= 0 ? 'TIME' : 'K.O.';
      ctx.fillText(label, WORLD_WIDTH / 2, 302);
    }
    ctx.restore();
  }

  private resize(): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round((this.canvas.clientWidth || window.innerWidth) * dpr));
    const height = Math.max(1, Math.round((this.canvas.clientHeight || window.innerHeight) * dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }
}
