import { EMPTY_INPUT, type FighterIndex, type InputFrame, type MatchSnapshot } from '../types.js';

const THREAT_MOVES = new Set([
  'claw1', 'claw2', 'tongueStraight', 'tongueLow',
  'nose1', 'nose2', 'nose3', 'tramontana',
]);

function toward(selfX: number, otherX: number): Pick<InputFrame, 'left' | 'right'> {
  return selfX > otherX ? { left: true, right: false } : { left: false, right: true };
}

function away(selfX: number, otherX: number): Pick<InputFrame, 'left' | 'right'> {
  return selfX > otherX ? { left: false, right: true } : { left: true, right: false };
}

export class CpuController {
  constructor(private readonly cpuIndex: FighterIndex) {}

  nextInput(snapshot: MatchSnapshot): InputFrame {
    const out: InputFrame = { ...EMPTY_INPUT };
    if (snapshot.phase !== 'fight') return out;

    const self = snapshot.fighters[this.cpuIndex];
    const otherIndex: FighterIndex = this.cpuIndex === 0 ? 1 : 0;
    const foe = snapshot.fighters[otherIndex];

    if (self.health <= 0 || self.stunFrames > 0 || self.blockstunFrames > 0) return out;

    const distance = Math.abs(foe.x - self.x);
    const foeThreatening = foe.moveId !== null
      && THREAT_MOVES.has(foe.moveId)
      && foe.moveFrame >= 3
      && foe.moveFrame <= 14
      && distance < (foe.id === 'chameleon' && foe.moveId.startsWith('tongue') ? 360 : 185);

    if (foeThreatening) {
      Object.assign(out, away(self.x, foe.x));
      if (foe.moveId === 'tongueLow') out.down = true;
      return out;
    }

    if (self.moveId !== null) {
      // Feed follow-up taps into combo windows rather than mashing every frame.
      if (self.id === 'supernariz' && (self.moveId === 'nose1' || self.moveId === 'nose2') && self.moveFrame === 11) {
        out.attack = true;
      }
      if (self.id === 'chameleon' && self.moveId === 'claw1' && self.moveFrame === 11) {
        out.attack = true;
      }
      return out;
    }

    if (!self.grounded) {
      if (distance < 115 && snapshot.frame % 12 === 0) out.attack = true;
      return out;
    }

    // Character-specific range game.
    if (self.id === 'supernariz') {
      if (distance > 360 && self.projectileCooldown <= 0 && snapshot.frame > 0 && snapshot.frame % 120 === 0) {
        out.special = true;
        return out;
      }
      if (distance >= 135 && distance <= 235 && snapshot.frame % 150 === 0) {
        out.down = true;
        out.special = true;
        return out;
      }
      if (distance < 118) {
        out.attack = true;
        return out;
      }
      Object.assign(out, toward(self.x, foe.x));
      return out;
    }

    // Camaleón prefers a tongue-control band instead of permanent rushdown.
    if (distance >= 150 && distance <= 355 && snapshot.frame % 72 === 0) {
      out.special = true;
      return out;
    }
    if (distance < 88) {
      out.attack = true;
      return out;
    }
    if (distance < 135) {
      Object.assign(out, away(self.x, foe.x));
      return out;
    }
    Object.assign(out, toward(self.x, foe.x));
    return out;
  }
}
