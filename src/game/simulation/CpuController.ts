import { EMPTY_INPUT, type FighterIndex, type InputFrame, type MatchSnapshot } from '../types.js';

const THREAT_MOVES = new Set([
  'claw1', 'claw2', 'tongueStraight', 'tongueLow',
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

    if (self.health <= 0 || self.stunFrames > 0 || self.blockstunFrames > 0 || self.guardBreakFrames > 0) return out;

    const distance = Math.abs(foe.x - self.x);
    const threatRange = foe.id === 'chameleon' && foe.moveId?.startsWith('tongue') ? 360 : 185;
    const reactionFrame = foe.moveId?.startsWith('tongue') ? 7 : 8;
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
      // Follow-up taps are attempted only in authored cancel windows. The simulation
      // itself now rejects whiff-cancels, so the CPU cannot mash a full combo on air.
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

    if (distance >= 150 && distance <= 355 && snapshot.frame % 72 === 0) {
      out.special = true;
      this.intentUntil = snapshot.frame + 22;
      return out;
    }
    if (distance < 88) {
      out.attack = true;
      this.intentUntil = snapshot.frame + 18;
      return out;
    }
    if (distance < 135) {
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
