import { DEFAULT_COMBAT_REGISTRY, type CombatRegistry } from '../data/combatRegistry.js';
import { EMPTY_INPUT, type FighterIndex, type InputFrame, type MatchSnapshot } from '../types.js';

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

export interface CpuControllerOptions {
  registry?: CombatRegistry;
}

export class CpuController {
  private intent: CpuIntent = 'neutral';
  private intentUntil = -1;
  private lastMoveId: string | null = null;
  private postCommitUntil = -1;
  private readonly registry: CombatRegistry;

  constructor(private readonly cpuIndex: FighterIndex, options: CpuControllerOptions = {}) {
    this.registry = options.registry ?? DEFAULT_COMBAT_REGISTRY;
  }

  nextInput(snapshot: MatchSnapshot): InputFrame {
    const out: InputFrame = { ...EMPTY_INPUT };
    if (snapshot.phase !== 'fight') {
      this.intent = 'neutral';
      this.intentUntil = -1;
      this.lastMoveId = null;
      this.postCommitUntil = -1;
      return out;
    }

    const self = snapshot.fighters[this.cpuIndex];
    const otherIndex: FighterIndex = this.cpuIndex === 0 ? 1 : 0;
    const foe = snapshot.fighters[otherIndex];
    const distance = Math.abs(foe.x - self.x);
    const selfKit = this.registry.getKit(self.id);
    const selfProfile = selfKit.cpu;

    const moveJustEnded = this.lastMoveId !== null && self.moveId === null;
    if (moveJustEnded) {
      const baseGap = selfProfile.decisionTicks;
      const deterministicVariation = (snapshot.frame + this.cpuIndex * 5) % 4;
      this.postCommitUntil = snapshot.frame + baseGap + deterministicVariation;
      this.intent = 'neutral';
      this.intentUntil = -1;
    }
    this.lastMoveId = self.moveId;

    if (self.health <= 0 || self.stunFrames > 0 || self.guardBreakFrames > 0) return out;

    // A committed attack creates an authored punish/reaction gap. During this
    // window the CPU does not immediately block, counterattack or special.
    if (snapshot.frame < this.postCommitUntil) return out;

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

    const foeMove = foe.moveId === null ? null : this.registry.getMove(foe.id, foe.moveId);
    const threatRange = foeMove?.cpuThreatRange ?? 0;
    const reactionFrame = foeMove?.cpuReactionFrame ?? 8;
    const foeThreatening = foeMove?.cpuThreatRange !== undefined
      && foe.moveFrame >= reactionFrame
      && foe.moveFrame <= 15
      && distance < threatRange;
    const recognizesThreat = foeThreatening && ((snapshot.frame + this.cpuIndex * 3) % 5 !== 0);

    if (recognizesThreat) {
      this.intent = 'guard';
      this.intentUntil = snapshot.frame + 12;
      Object.assign(out, away(self.x, foe.x));
      if (foeMove?.hitbox?.level === 'low') out.down = true;
      return out;
    }

    if (self.moveId !== null) {
      const standing = selfKit.standing;
      const firstMove = this.registry.getMove(self.id, standing);
      const secondMove = firstMove.nextAttack ?? null;

      if (selfProfile.archetype === 'pressure' && self.moveFrame === 11) {
        if (self.moveId === standing) {
          // Preserve the V0.4 deterministic imperfect first confirm until R5.
          out.attack = (snapshot.frame + this.cpuIndex * 3) % 4 !== 0;
        } else if (secondMove !== null && self.moveId === secondMove) {
          // Preserve the V0.4 deeper conversion pattern until R5.
          out.attack = (snapshot.frame + this.cpuIndex * 5) % 3 !== 1;
        }
      }
      if (selfProfile.archetype === 'control' && self.moveId === standing && self.moveFrame === 11) out.attack = true;
      return out;
    }

    if (!self.grounded) {
      if (distance < 115 && snapshot.frame % 18 === 0) out.attack = true;
      return out;
    }

    if (self.superReady) {
      const control = selfProfile.archetype === 'control';
      const cadence = control ? 210 : 180;
      const offset = control ? 90 : 60;
      const goodRange = control
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

    if (selfProfile.archetype === 'pressure') {
      if (distance > 360 && self.projectileCooldown <= 0 && snapshot.frame > 0 && snapshot.frame % 120 === 0 && Math.floor(snapshot.frame / 120) % 3 !== 2) {
        out.special = true;
        this.intentUntil = snapshot.frame + 24;
        return out;
      }
      if (distance >= 135 && distance <= 235 && snapshot.frame % 150 === 0 && Math.floor(snapshot.frame / 150) % 3 !== 2) {
        out.down = true;
        out.special = true;
        this.intentUntil = snapshot.frame + 25;
        return out;
      }
      if (distance < 118) {
        const presses = (snapshot.frame + this.cpuIndex * 7) % 5 !== 4;
        if (presses) {
          out.attack = true;
          this.intentUntil = snapshot.frame + 18;
        } else {
          // Deliberately leave a small close-range decision gap instead of
          // converting every eligible pressure restart.
          this.intent = 'neutral';
          this.intentUntil = snapshot.frame + 6;
        }
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
