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
      const canSpendGuard = self.guard >= 34;
      const choosesPushGuard = canSpendGuard
        && distance < 175
        && (snapshot.frame + this.cpuIndex * 7) % 19 === 0;
      if (choosesPushGuard) out.pushGuard = true;
      else Object.assign(out, away(self.x, foe.x));
      return out;
    }

    if (foe.ultimatePhase === 'startup' && distance < 360) {
      if ((snapshot.frame + this.cpuIndex) % 3 === 0 && self.grounded) {
        out.jump = true;
      } else {
        Object.assign(out, dashAway(self.x, foe.x));
      }
      this.intentUntil = snapshot.frame + 16;
      return out;
    }

    const threatRange = foe.id === 'chameleon' && foe.moveId?.startsWith('tongue') ? 405 : 190;
    const reactionFrame = foe.moveId?.startsWith('tongue') ? 8 : 8;
    const foeThreatening = foe.moveId !== null
      && THREAT_MOVES.has(foe.moveId)
      && foe.moveFrame >= reactionFrame
      && foe.moveFrame <= 15
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

    if (self.superReady) {
      const cadence = self.id === 'chameleon' ? 210 : 180;
      const offset = self.id === 'chameleon' ? 90 : 60;
      const goodRange = self.id === 'chameleon'
        ? distance >= 125 && distance <= 285
        : distance >= 95 && distance <= 300;
      if (goodRange && snapshot.frame % cadence === offset) {
        out.ultimate = true;
        this.intent = 'neutral';
        this.intentUntil = snapshot.frame + 28;
        return out;
      }
    }

    if (snapshot.frame < this.intentUntil) {
      if (this.intent === 'approach') Object.assign(out, toward(self.x, foe.x));
      if (this.intent === 'retreat' || this.intent === 'guard') Object.assign(out, away(self.x, foe.x));
      return out;
    }

    this.intent = 'neutral';

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
      if (distance >= 135 && distance <= 235 && snapshot.frame % 150 === 0) {
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

    if (distance >= 165 && distance <= 390 && snapshot.frame % 72 === 0) {
      out.special = true;
      this.intentUntil = snapshot.frame + 26;
      return out;
    }
    if (distance < 145 && snapshot.frame % 84 === 0) {
      out.up = true;
      out.special = true;
      this.intentUntil = snapshot.frame + 24;
      return out;
    }
    if (distance < 92) {
      out.attack = true;
      this.intentUntil = snapshot.frame + 18;
      return out;
    }
    if (distance < 145) {
      this.intent = 'retreat';
      this.intentUntil = snapshot.frame + 16;
      Object.assign(out, away(self.x, foe.x));
      return out;
    }
    this.intent = 'approach';
    this.intentUntil = snapshot.frame + 12;
    Object.assign(out, toward(self.x, foe.x));
    return out;
  }
}
