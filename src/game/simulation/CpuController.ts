import { EMPTY_INPUT, type FighterIndex, type InputFrame, type MatchSnapshot } from '../types.js';

const THREAT_MOVES = new Set([
  'claw1', 'claw2', 'tongueStraight', 'tongueLow', 'coletazo',
  'nose1', 'nose2', 'nose3', 'tramontana',
]);

type CpuIntent = 'neutral' | 'approach' | 'retreat' | 'guard';

function toward(selfX: number, otherX: number): Pick<InputFrame, 'left' | 'right'> {
  return selfX > otherX ? { left: true, right: false } : { left: false, right: true };
}

function away(selfX: number, otherX: number): Pick<InputFrame, 'left' | 'right'> {
  return selfX > otherX ? { left: false, right: true } : { left: true, right: false };
}

function dashAway(selfX: number, otherX: number): Pick<InputFrame, 'dashLeft' | 'dashRight'> {
  return selfX > otherX ? { dashLeft: false, dashRight: true } : { dashLeft: true, dashRight: false };
}

export class CpuController {
  private intent: CpuIntent = 'neutral';
  private intentUntil = -1;

  constructor(private readonly cpuIndex: FighterIndex) {}

  nextInput(snapshot: MatchSnapshot): InputFrame {
    const out: InputFrame = { ...EMPTY_INPUT };
    if (snapshot.phase !== 'fight') {
      this.intent = 'neutral';
      this.intentUntil = -1;
      return out;
    }

    const self = snapshot.fighters[this.cpuIndex];
    const otherIndex: FighterIndex = this.cpuIndex === 0 ? 1 : 0;
    const foe = snapshot.fighters[otherIndex];
    const distance = Math.abs(foe.x - self.x);

    if (self.health <= 0 || self.stunFrames > 0 || self.guardBreakFrames > 0) return out;

    if (self.blockstunFrames > 0) {
      // Push Guard is intentionally imperfect and deterministic rather than an automatic escape.
      if (self.guard >= 34 && distance < 155 && (snapshot.frame + this.cpuIndex * 7) % 23 === 0) {
        out.pushGuard = true;
      } else {
        Object.assign(out, away(self.x, foe.x));
        if (foe.moveId === 'tongueLow') out.down = true;
      }
      return out;
    }

    // Ultimates are unblockable: the CPU answers the visible capture phase with movement,
    // never by reading raw input or pretending guard can stop it.
    if (foe.ultimatePhase === 'capture' && distance < (foe.id === 'supernariz' ? 360 : 245)) {
      if (self.grounded && (snapshot.frame + this.cpuIndex) % 3 === 0) out.jump = true;
      else Object.assign(out, dashAway(self.x, foe.x));
      this.intentUntil = snapshot.frame + 12;
      return out;
    }

    const threatRange = foe.id === 'chameleon' && foe.moveId?.startsWith('tongue') ? 405 : 185;
    const reactionFrame = foe.moveId?.startsWith('tongue') ? 8 : 8;
    const foeThreatening = foe.moveId !== null
      && THREAT_MOVES.has(foe.moveId)
      && foe.moveFrame >= reactionFrame
      && foe.moveFrame <= 14
      && distance < threatRange;
    const recognizesThreat = foeThreatening && ((snapshot.frame + this.cpuIndex * 3) % 5 !== 0);

    if (recognizesThreat) {
      this.intent = 'guard';
      this.intentUntil = snapshot.frame + 12;
      Object.assign(out, away(self.x, foe.x));
      if (foe.moveId === 'tongueLow') out.down = true;
      return out;
    }

    if (self.moveId !== null) {
      if (self.id === 'supernariz' && (self.moveId === 'nose1' || self.moveId === 'nose2') && self.moveFrame === 11) {
        out.attack = true;
      }
      if (self.id === 'chameleon' && self.moveId === 'claw1' && self.moveFrame === 11) out.attack = true;
      return out;
    }

    if (!self.grounded) {
      if (distance < 115 && snapshot.frame % 18 === 0) out.attack = true;
      return out;
    }

    if (snapshot.frame < this.intentUntil) {
      if (this.intent === 'approach') Object.assign(out, toward(self.x, foe.x));
      if (this.intent === 'retreat' || this.intent === 'guard') Object.assign(out, away(self.x, foe.x));
      return out;
    }

    this.intent = 'neutral';

    // Full meter is an opportunity, not an automatic button press.
    if (self.superReady && foe.ultimatePhase === 'idle') {
      const goodRange = self.id === 'chameleon'
        ? distance >= 120 && distance <= 255
        : distance >= 95 && distance <= 285;
      const committedFoe = foe.moveId !== null || foe.dashKind === 'forward' || foe.blockstunFrames > 0;
      const cadence = self.id === 'chameleon' ? 97 : 83;
      if (goodRange && (committedFoe || snapshot.frame % cadence === this.cpuIndex * 3)) {
        out.ultimate = true;
        this.intentUntil = snapshot.frame + 28;
        return out;
      }
    }

    // Low guard encourages space-making instead of perfect passive defense.
    if (self.guard < 30 && distance < 150 && snapshot.frame % 3 === this.cpuIndex) {
      Object.assign(out, dashAway(self.x, foe.x));
      this.intentUntil = snapshot.frame + 18;
      return out;
    }

    if (self.id === 'supernariz') {
      if (distance > 360 && self.projectileCooldown <= 0 && snapshot.frame > 0 && snapshot.frame % 120 === 0) {
        out.special = true;
        this.intentUntil = snapshot.frame + 24;
        return out;
      }
      if (distance >= 135 && distance <= 225 && snapshot.frame % 150 === 0) {
        out.down = true;
        out.special = true;
        this.intentUntil = snapshot.frame + 25;
        return out;
      }
      if (distance < 118) {
        out.attack = true;
        this.intentUntil = snapshot.frame + 18;
        return out;
      }
      this.intent = 'approach';
      this.intentUntil = snapshot.frame + 14;
      Object.assign(out, toward(self.x, foe.x));
      return out;
    }

    // Camaleoni prefers control: close pressure gets Coletazo, mid/far space gets Lengua.
    if (distance < 142 && snapshot.frame % 44 === 0) {
      out.special = true;
      this.intentUntil = snapshot.frame + 24;
      return out;
    }
    if (distance >= 165 && distance <= 390 && snapshot.frame % 72 === 0) {
      out.special = true;
      this.intentUntil = snapshot.frame + 28;
      return out;
    }
    if (distance < 88) {
      out.attack = true;
      this.intentUntil = snapshot.frame + 18;
      return out;
    }
    if (distance < 145) {
      this.intent = 'retreat';
      this.intentUntil = snapshot.frame + 14;
      Object.assign(out, away(self.x, foe.x));
      return out;
    }
    this.intent = 'approach';
    this.intentUntil = snapshot.frame + 14;
    Object.assign(out, toward(self.x, foe.x));
    return out;
  }
}
