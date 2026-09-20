import { DEFAULT_COMBAT_REGISTRY, type CombatRegistry } from '../data/combatRegistry.js';
import type { CpuProfile } from '../data/fighterKits.js';
import { EMPTY_INPUT, type FighterIndex, type InputFrame, type MatchSnapshot } from '../types.js';

type CpuIntent = 'neutral' | 'approach' | 'retreat' | 'guard' | 'guard-low';
type ThreatKind = 'ultimate' | 'strike' | 'projectile' | 'air';
type ThreatLevel = 'mid' | 'low' | 'overhead' | null;

interface ThreatCue {
  key: string;
  kind: ThreatKind;
  level: ThreatLevel;
  foeX: number;
  threatRange: number;
}

interface PublicObservation {
  tick: number;
  foeX: number;
  foeY: number;
  foeGrounded: boolean;
  foeCrouching: boolean;
  foeSuperReady: boolean;
  cues: readonly ThreatCue[];
}

interface PendingThreat {
  cue: ThreatCue;
  observedTick: number;
  expiresTick: number;
}

function toward(selfX: number, otherX: number): Pick<InputFrame, 'left' | 'right'> {
  return selfX > otherX ? { left: true, right: false } : { left: false, right: true };
}

function away(selfX: number, otherX: number): Pick<InputFrame, 'left' | 'right'> {
  return selfX > otherX ? { left: false, right: true } : { left: true, right: false };
}

function dashAway(selfX: number, otherX: number): Pick<InputFrame, 'dashLeft' | 'dashRight'> {
  return selfX > otherX ? { dashLeft: false, dashRight: true } : { dashLeft: true, dashRight: false };
}

function awayFromFacing(facing: 1 | -1): Pick<InputFrame, 'left' | 'right'> {
  return facing === 1 ? { left: true, right: false } : { left: false, right: true };
}

function cloneInput(input: InputFrame): InputFrame {
  return { ...input };
}

export interface CpuControllerOptions {
  registry?: CombatRegistry;
  seed?: number;
}

export class CpuController {
  private readonly registry: CombatRegistry;
  private readonly initialSeed: number;
  private rngState: number;

  private intent: CpuIntent = 'neutral';
  private intentUntilTick = -1;
  private nextDecisionTick = -1;
  private pendingThreat: PendingThreat | null = null;

  private observationHistory: PublicObservation[] = [];
  private processedObservationTick = -1;
  private handledCueKeys = new Set<string>();
  private seenProjectileCueKeys = new Set<string>();
  private cueSerial = 0;
  private lastFoeMoveId: string | null = null;
  private lastFoeMoveFrame = -1;
  private lastFoeUltimatePhase = 'idle';

  private lastSelfMoveId: string | null = null;
  private lastSelfMoveFrame = -1;
  private selfMoveSerial = 0;
  private confirmSerial = -1;
  private confirmChosen = false;
  private confirmEmitted = false;

  private lastCombatTick: number | null = null;
  private cachedOutput: InputFrame = { ...EMPTY_INPUT };
  private lastRound: number | null = null;

  constructor(private readonly cpuIndex: FighterIndex, options: CpuControllerOptions = {}) {
    this.registry = options.registry ?? DEFAULT_COMBAT_REGISTRY;
    this.initialSeed = (options.seed ?? (0x51f15e5d ^ ((cpuIndex + 1) * 0x9e3779b9))) >>> 0;
    this.rngState = this.initialSeed;
  }

  reset(seed = this.initialSeed): void {
    this.rngState = seed >>> 0;
    this.intent = 'neutral';
    this.intentUntilTick = -1;
    this.nextDecisionTick = -1;
    this.pendingThreat = null;
    this.observationHistory = [];
    this.processedObservationTick = -1;
    this.handledCueKeys.clear();
    this.seenProjectileCueKeys.clear();
    this.cueSerial = 0;
    this.lastFoeMoveId = null;
    this.lastFoeMoveFrame = -1;
    this.lastFoeUltimatePhase = 'idle';
    this.lastSelfMoveId = null;
    this.lastSelfMoveFrame = -1;
    this.selfMoveSerial = 0;
    this.confirmSerial = -1;
    this.confirmChosen = false;
    this.confirmEmitted = false;
    this.lastCombatTick = null;
    this.cachedOutput = { ...EMPTY_INPUT };
    this.lastRound = null;
  }

  nextInput(snapshot: MatchSnapshot): InputFrame {
    if (snapshot.phase !== 'fight') {
      if (this.lastCombatTick !== snapshot.combatTick || this.lastRound !== snapshot.round) {
        this.clearRoundState(snapshot.round);
        this.lastCombatTick = snapshot.combatTick;
      }
      this.cachedOutput = { ...EMPTY_INPUT };
      return cloneInput(this.cachedOutput);
    }

    if (this.lastRound !== snapshot.round) this.clearRoundState(snapshot.round);

    // Render calls, hitstop samples and any other duplicate reads of the same
    // advancing combat tick are observationally idempotent.
    if (this.lastCombatTick === snapshot.combatTick) return cloneInput(this.cachedOutput);

    this.lastCombatTick = snapshot.combatTick;
    const self = snapshot.fighters[this.cpuIndex];
    const otherIndex: FighterIndex = this.cpuIndex === 0 ? 1 : 0;
    const profile = this.registry.getKit(self.id).cpu;

    const observation = this.projectObservation(snapshot, otherIndex);
    this.observationHistory.push(observation);
    if (this.observationHistory.length > 96) this.observationHistory.shift();

    this.processDelayedObservations(snapshot.combatTick, profile);
    const delayed = this.latestDelayedObservation(snapshot.combatTick, profile.reactionTicks);

    const out: InputFrame = { ...EMPTY_INPUT };

    if (self.health <= 0 || self.stunFrames > 0 || self.guardBreakFrames > 0 || self.capturedBy !== null) {
      return this.rememberOutput(out);
    }

    // Own blockstun is current legality, not hidden opponent perception.
    if (self.blockstunFrames > 0) {
      if (delayed) Object.assign(out, away(self.x, delayed.foeX));
      else Object.assign(out, awayFromFacing(self.facing));
      if (self.guard >= 34 && this.isDecisionTick(snapshot.combatTick, profile) && this.nextRandom() < 0.22) {
        out.pushGuard = true;
      }
      return this.rememberOutput(out);
    }

    if (self.moveId !== null) {
      this.updateSelfMoveSerial(self.moveId, self.moveFrame);
      const move = this.registry.getMove(self.id, self.moveId);
      if (
        self.moveContact === 'hit'
        && move.nextAttack
        && move.cancelStart !== undefined
        && move.cancelEnd !== undefined
      ) {
        if (this.confirmSerial !== this.selfMoveSerial) {
          this.confirmSerial = this.selfMoveSerial;
          this.confirmChosen = this.nextRandom() < profile.confirmChance;
          this.confirmEmitted = false;
        }
        if (
          this.confirmChosen
          && !this.confirmEmitted
          && self.moveFrame >= move.cancelStart
          && self.moveFrame <= move.cancelEnd
        ) {
          out.attack = true;
          this.confirmEmitted = true;
        }
      }
      return this.rememberOutput(out);
    }

    this.updateSelfMoveSerial(null, 0);

    if (
      self.dashKind !== null
      || self.ultimatePhase !== 'idle'
      || self.pushGuardRecoveryFrames > 0
      || self.landingRecoveryFrames > 0
    ) {
      return this.rememberOutput(out);
    }

    if (!self.grounded) {
      if (this.isDecisionTick(snapshot.combatTick, profile) && delayed) {
        const distance = Math.abs(delayed.foeX - self.x);
        if (distance < 125 && this.nextRandom() < 0.45) out.attack = true;
      }
      return this.rememberOutput(out);
    }

    if (snapshot.combatTick < this.intentUntilTick) {
      this.applyIntent(out, self.x, delayed?.foeX ?? self.x - self.facing * 100);
      return this.rememberOutput(out);
    }
    this.intent = 'neutral';

    if (!this.isDecisionTick(snapshot.combatTick, profile)) return this.rememberOutput(out);

    if (this.pendingThreat && this.pendingThreat.expiresTick >= snapshot.combatTick) {
      const threat = this.pendingThreat;
      this.pendingThreat = null;
      this.respondToThreat(out, self.x, threat.cue, snapshot.combatTick, profile);
      return this.rememberOutput(out);
    }
    if (this.pendingThreat && this.pendingThreat.expiresTick < snapshot.combatTick) this.pendingThreat = null;

    if (!delayed) return this.rememberOutput(out);

    const ownReturningProjectile = snapshot.projectiles.some(
      (projectile) => projectile.owner === this.cpuIndex && projectile.phase === 'return',
    );
    this.chooseNeutralPlan(out, self, delayed, snapshot.combatTick, profile, ownReturningProjectile);
    return this.rememberOutput(out);
  }

  private clearRoundState(round: number): void {
    this.intent = 'neutral';
    this.intentUntilTick = -1;
    this.nextDecisionTick = -1;
    this.pendingThreat = null;
    this.observationHistory = [];
    this.processedObservationTick = -1;
    this.handledCueKeys.clear();
    this.seenProjectileCueKeys.clear();
    this.cueSerial = 0;
    this.lastFoeMoveId = null;
    this.lastFoeMoveFrame = -1;
    this.lastFoeUltimatePhase = 'idle';
    this.lastSelfMoveId = null;
    this.lastSelfMoveFrame = -1;
    this.selfMoveSerial = 0;
    this.confirmSerial = -1;
    this.confirmChosen = false;
    this.confirmEmitted = false;
    this.lastCombatTick = null;
    this.cachedOutput = { ...EMPTY_INPUT };
    this.lastRound = round;
    // Deterministic but round-distinct sequence; explicit reset() restores match seed.
    this.rngState = (this.initialSeed ^ Math.imul(round, 0x85ebca6b)) >>> 0;
  }

  private rememberOutput(out: InputFrame): InputFrame {
    this.cachedOutput = cloneInput(out);
    return cloneInput(out);
  }

  private nextRandom(): number {
    // Mulberry32: deterministic integer state, compact and stable across JS engines.
    this.rngState = (this.rngState + 0x6d2b79f5) >>> 0;
    let t = this.rngState;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  }

  private projectObservation(snapshot: MatchSnapshot, foeIndex: FighterIndex): PublicObservation {
    const foe = snapshot.fighters[foeIndex];
    const cues: ThreatCue[] = [];

    const moveRestarted = foe.moveId !== null
      && (
        foe.moveId !== this.lastFoeMoveId
        || (foe.moveId === this.lastFoeMoveId && this.lastFoeMoveFrame >= 0 && foe.moveFrame < this.lastFoeMoveFrame)
      );

    if (moveRestarted && foe.moveId !== null) {
      const move = this.registry.getMove(foe.id, foe.moveId);
      if (move.category !== 'ultimate') {
        this.cueSerial += 1;
        const airborne = !foe.grounded || move.bindingRole === 'air';
        cues.push({
          key: `move:${this.cueSerial}`,
          kind: airborne ? 'air' : 'strike',
          level: move.hitbox?.level ?? (airborne ? 'overhead' : 'mid'),
          foeX: foe.x,
          threatRange: move.cpuThreatRange ?? (airborne ? 260 : 220),
        });
      }
    }

    if (foe.ultimatePhase === 'startup' && this.lastFoeUltimatePhase !== 'startup') {
      this.cueSerial += 1;
      cues.push({
        key: `ultimate:${this.cueSerial}`,
        kind: 'ultimate',
        level: null,
        foeX: foe.x,
        threatRange: 360,
      });
    }

    for (const projectile of snapshot.projectiles) {
      if (!projectile.active || projectile.owner !== foeIndex || projectile.phase === 'turn') continue;
      const leg = projectile.phase === 'return' ? 'return' : 'outbound';
      const cueKey = `${projectile.id}:${leg}`;
      if (this.seenProjectileCueKeys.has(cueKey)) continue;
      this.seenProjectileCueKeys.add(cueKey);
      this.cueSerial += 1;
      cues.push({
        key: `projectile:${cueKey}:${this.cueSerial}`,
        kind: 'projectile',
        level: 'mid',
        foeX: projectile.x,
        threatRange: 520,
      });
    }

    this.lastFoeMoveId = foe.moveId;
    this.lastFoeMoveFrame = foe.moveFrame;
    this.lastFoeUltimatePhase = foe.ultimatePhase;

    return {
      tick: snapshot.combatTick,
      foeX: foe.x,
      foeY: foe.y,
      foeGrounded: foe.grounded,
      foeCrouching: foe.crouching,
      foeSuperReady: foe.superReady,
      cues,
    };
  }

  private processDelayedObservations(currentTick: number, profile: CpuProfile): void {
    const targetTick = currentTick - profile.reactionTicks;
    if (targetTick < 0) return;

    for (const observation of this.observationHistory) {
      if (observation.tick <= this.processedObservationTick || observation.tick > targetTick) continue;
      this.processedObservationTick = observation.tick;
      for (const cue of observation.cues) {
        if (this.handledCueKeys.has(cue.key)) continue;
        this.handledCueKeys.add(cue.key);
        const recognized = this.nextRandom() >= profile.missChance;
        if (!recognized) continue;
        this.pendingThreat = {
          cue,
          observedTick: currentTick,
          expiresTick: currentTick + 24,
        };
      }
    }
  }

  private latestDelayedObservation(currentTick: number, reactionTicks: number): PublicObservation | null {
    const targetTick = currentTick - reactionTicks;
    for (let i = this.observationHistory.length - 1; i >= 0; i -= 1) {
      const observation = this.observationHistory[i];
      if (observation && observation.tick <= targetTick) return observation;
    }
    return null;
  }

  private isDecisionTick(tick: number, profile: CpuProfile): boolean {
    if (this.nextDecisionTick < 0) this.nextDecisionTick = tick;
    if (tick < this.nextDecisionTick) return false;
    this.nextDecisionTick = tick + profile.decisionTicks;
    return true;
  }

  private updateSelfMoveSerial(moveId: string | null, moveFrame: number): void {
    if (
      moveId !== null
      && (
        moveId !== this.lastSelfMoveId
        || (moveId === this.lastSelfMoveId && this.lastSelfMoveFrame >= 0 && moveFrame < this.lastSelfMoveFrame)
      )
    ) {
      this.selfMoveSerial += 1;
      this.confirmSerial = -1;
      this.confirmChosen = false;
      this.confirmEmitted = false;
    }
    this.lastSelfMoveId = moveId;
    this.lastSelfMoveFrame = moveFrame;
  }

  private respondToThreat(
    out: InputFrame,
    selfX: number,
    cue: ThreatCue,
    tick: number,
    profile: CpuProfile,
  ): void {
    const distance = Math.abs(cue.foeX - selfX);
    if (distance > cue.threatRange) return;

    if (cue.kind === 'ultimate') {
      if (this.nextRandom() < 0.52) {
        out.jump = true;
      } else {
        Object.assign(out, dashAway(selfX, cue.foeX));
      }
      return;
    }

    if (cue.kind === 'air') {
      Object.assign(out, away(selfX, cue.foeX));
      this.commitIntent('guard', tick, profile);
      return;
    }

    if (cue.kind === 'projectile') {
      Object.assign(out, away(selfX, cue.foeX));
      this.commitIntent('guard', tick, profile);
      return;
    }

    const intent: CpuIntent = cue.level === 'low' ? 'guard-low' : 'guard';
    this.intent = intent;
    this.intentUntilTick = tick + Math.min(12, profile.commitmentTicks[0]);
    this.applyIntent(out, selfX, cue.foeX);
  }

  private chooseNeutralPlan(
    out: InputFrame,
    self: MatchSnapshot['fighters'][FighterIndex],
    observed: PublicObservation,
    tick: number,
    profile: CpuProfile,
    ownReturningProjectile: boolean,
  ): void {
    const distance = Math.abs(observed.foeX - self.x);
    const kit = this.registry.getKit(self.id);
    const tactics = profile.tactics;

    if (tactics) {
      if (
        self.superReady
        && distance >= tactics.ultimateRange[0]
        && distance <= tactics.ultimateRange[1]
        && this.nextRandom() < 0.28
      ) {
        out.ultimate = true;
        return;
      }

      if (
        ownReturningProjectile
        && distance > profile.pressureRange
        && this.nextRandom() < tactics.advanceBehindReturningProjectile
      ) {
        this.commitIntent('approach', tick, profile);
        this.applyIntent(out, self.x, observed.foeX);
        return;
      }

      if (distance < profile.pressureRange) {
        this.chooseWeightedCloseAction(out, self.x, observed.foeX, tick, profile);
        return;
      }

      if (
        self.rangedAvailability === 'ready'
        && distance >= tactics.rangedRange[0]
        && distance <= tactics.rangedRange[1]
        && this.nextRandom() < tactics.rangedChance
      ) {
        out.special = true;
        return;
      }

      if (distance >= profile.preferredRange[0] && distance <= profile.preferredRange[1]) {
        if (this.nextRandom() < tactics.retreatAtPreferredRange) {
          this.commitIntent('retreat', tick, profile);
          this.applyIntent(out, self.x, observed.foeX);
        }
        return;
      }

      if (distance > profile.preferredRange[1]) {
        this.commitIntent('approach', tick, profile);
        this.applyIntent(out, self.x, observed.foeX);
        return;
      }

      this.chooseWeightedCloseAction(out, self.x, observed.foeX, tick, profile);
      return;
    }

    // Preserve the released V0.5 seeded policy byte-for-byte when no V0.6
    // tactics block is authored.
    if (self.superReady && distance >= 105 && distance <= 300 && this.nextRandom() < 0.28) {
      out.ultimate = true;
      return;
    }

    if (profile.archetype === 'pressure') {
      if (distance < profile.pressureRange) {
        const choice = this.nextRandom();
        if (choice < 0.62) out.attack = true;
        else if (choice < 0.82) {
          out.down = true;
          out.attack = true;
        } else {
          out.down = true;
          out.special = true;
        }
        return;
      }

      if (distance > 360 && self.projectileCooldown <= 0 && this.nextRandom() < 0.48) {
        const ranged = this.registry.getMove(self.id, kit.rangedSpecial);
        if (!ranged.projectileKey || self.projectileCooldown <= 0) out.special = true;
        if (out.special) return;
      }

      this.commitIntent('approach', tick, profile);
      this.applyIntent(out, self.x, observed.foeX);
      return;
    }

    // Camaleoni: control space but do not automatically retreat from every close state.
    if (distance < 145) {
      const choice = this.nextRandom();
      if (choice < 0.42) {
        this.commitIntent('retreat', tick, profile);
        this.applyIntent(out, self.x, observed.foeX);
      } else if (choice < 0.67) {
        out.attack = true;
      } else if (choice < 0.84) {
        out.down = true;
        out.attack = true;
      } else {
        out.jump = true;
      }
      return;
    }

    if (distance >= profile.preferredRange[0] && distance <= profile.preferredRange[1]) {
      const choice = this.nextRandom();
      if (choice < 0.55) out.special = true;
      else if (choice < 0.72) {
        this.commitIntent('retreat', tick, profile);
        this.applyIntent(out, self.x, observed.foeX);
      }
      return;
    }

    if (distance > profile.preferredRange[1]) {
      this.commitIntent('approach', tick, profile);
      this.applyIntent(out, self.x, observed.foeX);
      return;
    }

    // Just inside control range: sometimes contest, sometimes create space.
    if (this.nextRandom() < 0.45) {
      this.commitIntent('retreat', tick, profile);
      this.applyIntent(out, self.x, observed.foeX);
    } else {
      out.attack = true;
    }
  }

  private chooseWeightedCloseAction(
    out: InputFrame,
    selfX: number,
    foeX: number,
    tick: number,
    profile: CpuProfile,
  ): void {
    const weights = profile.tactics?.closeWeights;
    if (!weights) return;
    const entries = [
      ['standing', weights.standing],
      ['low', weights.low],
      ['closeSpecial', weights.closeSpecial],
      ['jump', weights.jump],
      ['retreat', weights.retreat],
    ] as const;
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = this.nextRandom() * total;
    let choice: (typeof entries)[number][0] = 'standing';
    for (const [name, weight] of entries) {
      if (roll < weight) {
        choice = name;
        break;
      }
      roll -= weight;
    }

    if (choice === 'standing') out.attack = true;
    else if (choice === 'low') {
      out.down = true;
      out.attack = true;
    } else if (choice === 'closeSpecial') {
      out.down = true;
      out.special = true;
    } else if (choice === 'jump') out.jump = true;
    else {
      this.commitIntent('retreat', tick, profile);
      this.applyIntent(out, selfX, foeX);
    }
  }

  private commitIntent(intent: CpuIntent, tick: number, profile: CpuProfile): void {
    const [minTicks, maxTicks] = profile.commitmentTicks;
    const span = Math.max(0, maxTicks - minTicks);
    const duration = minTicks + Math.floor(this.nextRandom() * (span + 1));
    this.intent = intent;
    this.intentUntilTick = tick + duration;
  }

  private applyIntent(out: InputFrame, selfX: number, foeX: number): void {
    if (this.intent === 'approach') Object.assign(out, toward(selfX, foeX));
    else if (this.intent === 'retreat' || this.intent === 'guard' || this.intent === 'guard-low') {
      Object.assign(out, away(selfX, foeX));
      if (this.intent === 'guard-low') out.down = true;
    }
  }
}
