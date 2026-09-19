import type { CombatEvent, MatchSnapshot } from '../types.js';
import {
  drawCamaleoniVeil,
  drawCaptureStartup,
  drawDashAfterimage,
  drawLaunchTrail,
  drawNazazoArc,
  drawPushGuardBurst,
  drawReappearanceFlash,
  drawSuctionField,
  drawUltimateImpact,
} from './CombatEffects.js';
import { drawFighter } from './FighterRenderer.js';
import { drawStage } from './StageRenderer.js';
import { GROUND_Y, WORLD_HEIGHT, WORLD_WIDTH, ellipse } from './drawUtils.js';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  tone: 'warm' | 'cold' | 'block' | 'break' | 'ultimate';
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

export class FightRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private pushGuardFlashes: PushGuardFlash[] = [];
  private ultimateFlashes: UltimateFlash[] = [];
  private shakeFrames = 0;
  private shakeStrength = 0;
  private lastSnapshot: MatchSnapshot | null = null;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas2D unavailable');
    this.ctx = ctx;
  }

  consumeEvents(snapshot: MatchSnapshot): void {
    this.lastSnapshot = snapshot;
    for (const event of snapshot.events) this.consumeEvent(event, snapshot);
  }

  private consumeEvent(event: CombatEvent, snapshot: MatchSnapshot): void {
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
        accent: attacker.id === 'chameleon' ? '#9df5a4' : '#ffc28e',
      });
      if (this.ultimateFlashes.length > 6) this.ultimateFlashes.splice(0, this.ultimateFlashes.length - 6);
      this.shakeFrames = Math.max(this.shakeFrames, 4);
      this.shakeStrength = Math.max(this.shakeStrength, 3.4);
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
    const ultimateHit = attacker.ultimatePhase === 'sequence';
    const tone: Particle['tone'] = event.blocked
      ? 'block'
      : ultimateHit
        ? 'ultimate'
        : attacker.moveId === 'tramontana'
          ? 'cold'
          : 'warm';
    const count = event.strong ? 18 : 10;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + (snapshot.frame % 7) * 0.1;
      const speed = (event.strong ? 5.5 : 3.6) * (0.65 + ((i * 37) % 10) / 20);
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        life: event.strong ? 22 : 15,
        maxLife: event.strong ? 22 : 15,
        radius: event.strong ? 4.2 : 3.1,
        tone,
      });
    }
    if (ultimateHit && !event.blocked) {
      this.ultimateFlashes.push({
        x: centerX,
        y: centerY,
        life: 18,
        maxLife: 18,
        accent: attacker.id === 'chameleon' ? '#a8ff9f' : '#ffb879',
      });
      if (this.ultimateFlashes.length > 6) this.ultimateFlashes.splice(0, this.ultimateFlashes.length - 6);
      this.shakeFrames = Math.max(this.shakeFrames, 8);
      this.shakeStrength = Math.max(this.shakeStrength, 6.2);
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
    this.lastSnapshot = snapshot;
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
      this.shakeFrames -= 1;
      this.shakeStrength *= 0.82;
    }

    ctx.setTransform(scale, 0, 0, scale, offsetX + shakeX * scale, offsetY + shakeY * scale);
    drawStage(ctx, timeSeconds);

    for (const projectile of snapshot.projectiles) this.drawChorizo(projectile.x, GROUND_Y - projectile.y, projectile.vx);

    this.drawUltimateFields(snapshot, timeSeconds);

    // Draw farther/airborne fighter first for a stable fighting-game layer order.
    const ordered = [...snapshot.fighters].sort((a, b) => (b.y - a.y) || (a.x - b.x));
    for (const fighter of ordered) drawFighter(ctx, fighter, timeSeconds);

    this.updateAndDrawTransientCombatEffects();
    this.updateAndDrawParticles();
    this.drawPhaseText(snapshot);
  }

  private drawUltimateFields(snapshot: MatchSnapshot, timeSeconds: number): void {
    const ctx = this.ctx;
    for (const fighter of snapshot.fighters) {
      if (fighter.ultimatePhase === 'idle') continue;
      const feetY = GROUND_Y - fighter.y;
      const accent = fighter.id === 'chameleon' ? '#9df5a4' : '#ffd0a1';

      if (fighter.ultimatePhase === 'startup') {
        drawCaptureStartup(ctx, fighter.x, feetY, fighter.facing, 0.78, accent);
        continue;
      }

      if (fighter.ultimatePhase === 'capture') {
        if (fighter.id === 'chameleon') {
          drawCamaleoniVeil(ctx, fighter.x, feetY, fighter.facing, 1, timeSeconds);
          drawDashAfterimage(ctx, fighter.x, feetY, fighter.facing, 1, '#a5f7ad');
        } else {
          drawSuctionField(ctx, fighter.x, feetY, fighter.facing, 1, timeSeconds);
        }
        continue;
      }

      if (fighter.ultimatePhase === 'sequence') {
        const target = fighter.ultimateTarget === null ? null : snapshot.fighters[fighter.ultimateTarget];
        if (fighter.id === 'chameleon') {
          drawCamaleoniVeil(ctx, fighter.x, feetY, fighter.facing, 0.42, timeSeconds);
          drawDashAfterimage(ctx, fighter.x, feetY, fighter.facing, 0.45, '#b8ffb2');
        } else {
          drawSuctionField(ctx, fighter.x, feetY, fighter.facing, 0.42, timeSeconds);
          drawNazazoArc(ctx, fighter.x, feetY, fighter.facing, 0.92);
          if (target) drawLaunchTrail(ctx, target.x, GROUND_Y - target.y, fighter.facing, 0.68);
        }
        continue;
      }

      if (fighter.ultimatePhase === 'recovery' && fighter.id === 'chameleon') {
        const pulse = 0.58 + Math.sin(timeSeconds * 18) * 0.16;
        drawReappearanceFlash(ctx, fighter.x, feetY - 98, pulse);
      }
    }
  }

  private updateAndDrawTransientCombatEffects(): void {
    const ctx = this.ctx;

    const pushGuardKept: PushGuardFlash[] = [];
    for (const flash of this.pushGuardFlashes) {
      flash.life -= 1;
      if (flash.life <= 0) continue;
      pushGuardKept.push(flash);
      const progress = 1 - flash.life / flash.maxLife;
      drawPushGuardBurst(ctx, flash.x, flash.y, flash.facing, progress);
    }
    this.pushGuardFlashes = pushGuardKept;

    const ultimateKept: UltimateFlash[] = [];
    for (const flash of this.ultimateFlashes) {
      flash.life -= 1;
      if (flash.life <= 0) continue;
      ultimateKept.push(flash);
      const progress = 1 - flash.life / flash.maxLife;
      drawUltimateImpact(ctx, flash.x, flash.y, progress, flash.accent);
    }
    this.ultimateFlashes = ultimateKept;
  }

  private drawChorizo(x: number, y: number, vx: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(vx >= 0 ? -0.08 : Math.PI + 0.08);
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

  private updateAndDrawParticles(): void {
    const ctx = this.ctx;
    const kept: Particle[] = [];
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy += 0.18;
      p.life -= 1;
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
