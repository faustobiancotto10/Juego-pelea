import { DEFAULT_COMBAT_REGISTRY, type CombatRegistry } from '../data/combatRegistry.js';
import type { UltimateDefinition } from '../data/ultimates.js';
import { EMPTY_INPUT, type CombatAction, type CombatEvent, type CommandIntent, type Facing, type HitSource, type RegisteredFighterId, type FighterIndex, type FighterSnapshot, type InputFrame, type MatchSnapshot, type MatchPhase, type ProjectileSnapshot } from '../types.js';
import type { MoveDefinition } from './moves.js';

const ARENA_MIN_X = 90;
const ARENA_MAX_X = 1190;
const START_X: readonly [number, number] = [330, 950];
const ROUND_TIME_FRAMES = 60 * 60;
const ROUND_OVER_FRAMES = 90;
const INTRO_FRAMES = 55;
const PUSH_DISTANCE = 62;

const MAX_GUARD = 100;
const GUARD_REGEN_DELAY_FRAMES = 45;
const GUARD_REGEN_PER_FRAME = 0.9;
const GUARD_BREAK_FRAMES = 42;
const GUARD_AFTER_BREAK = 55;
const PUSH_GUARD_COST = 34;
const PUSH_GUARD_SEPARATION = 122;
const COMMAND_BUFFER_FRAMES = 6;
const DOWN_GRACE_SAMPLES = 4;

const MAX_SUPER = 100;
const SUPER_GAIN_NORMAL_DEALT = 0.15;
const SUPER_GAIN_SPECIAL_DEALT = 0.10;
const SUPER_GAIN_RECEIVED = 0.055;
const PUSH_GUARD_RECOVERY_FRAMES = 6;

const BACKWARD_WALK_SCALE = 0.78;
const FORWARD_DASH_FRAMES = 12;
const BACK_DASH_FRAMES = 16;
const FORWARD_DASH_SPEED = 9.4;
const BACK_DASH_SPEED = 7.2;
const BACK_DASH_INVULN_START = 2;
const BACK_DASH_INVULN_END = 7;

interface PendingCommand {
  intent: CommandIntent;
  remainingFrames: number;
}

interface PendingUltimateRelease {
  attacker: FighterIndex;
  defender: FighterIndex;
  definition: UltimateDefinition;
}

interface FighterState extends FighterSnapshot {
  prevInput: InputFrame;
  currentMove: MoveDefinition | null;
  moveHasHit: boolean;
  moveEffectTriggered: boolean;
  ultimateFacing: Facing;
  pendingCommand: PendingCommand | null;
  downGraceSamples: number;
  ultimateReleaseSource: FighterIndex | null;
}

interface ProjectileState extends ProjectileSnapshot {
  ttl: number;
}

export interface CombatSimulationOptions {
  skipIntro?: boolean;
  /** Deterministic scenario setup for tests/harnesses. Omit in normal play. */
  initialSuper?: number | readonly [number, number];
  /** Optional bounded content registry for tests/future fighter packs. */
  registry?: CombatRegistry;
}

function copyInput(input: InputFrame): InputFrame {
  if (input.commands === undefined) return { ...input };
  return {
    ...input,
    commands: input.commands.map((command) => ({
      action: command.action,
      direction: { ...command.direction },
    })),
  };
}

function directionFromInput(input: InputFrame): CommandIntent['direction'] {
  return { left: input.left, right: input.right, up: input.up, down: input.down };
}

function commandPriority(action: CombatAction): number {
  if (action === 'ultimate') return 5;
  if (action === 'pushGuard') return 4;
  if (action === 'special') return 3;
  if (action === 'attack') return 2;
  return 1;
}


function initialSuperFor(options: CombatSimulationOptions, index: FighterIndex): number {
  const configured = options.initialSuper;
  if (typeof configured === 'number') return Math.max(0, Math.min(MAX_SUPER, configured));
  if (configured) return Math.max(0, Math.min(MAX_SUPER, configured[index] ?? 0));
  return 0;
}

function projectileCooldownMaxFor(registry: CombatRegistry, id: RegisteredFighterId): number {
  const kit = registry.getKit(id);
  const ranged = registry.getMove(id, kit.rangedSpecial);
  return ranged.projectileKey ? registry.getProjectile(ranged.projectileKey).cooldown : 0;
}

function makeFighter(registry: CombatRegistry, id: RegisteredFighterId, index: FighterIndex, superMeter = 0): FighterState {
  const def = registry.getFighter(id);
  return {
    id,
    x: START_X[index],
    y: 0,
    vx: 0,
    vy: 0,
    facing: index === 0 ? 1 : -1,
    health: def.maxHealth,
    maxHealth: def.maxHealth,
    guard: MAX_GUARD,
    maxGuard: MAX_GUARD,
    guardRegenDelay: 0,
    guardBreakFrames: 0,
    grounded: true,
    crouching: false,
    blocking: false,
    stunFrames: 0,
    blockstunFrames: 0,
    moveId: null,
    moveFrame: 0,
    comboCount: 0,
    moveContact: 'none',
    chilledFrames: 0,
    projectileCooldown: 0,
    projectileCooldownMax: projectileCooldownMaxFor(registry, id),
    superMeter,
    maxSuper: MAX_SUPER,
    superReady: superMeter >= MAX_SUPER,
    ultimatePhase: 'idle',
    ultimatePhaseFrame: 0,
    ultimateConnected: false,
    ultimateTarget: null,
    dashKind: null,
    dashFrame: 0,
    landingRecoveryFrames: 0,
    pushGuardRecoveryFrames: 0,
    roundWins: 0,
    prevInput: copyInput(EMPTY_INPUT),
    currentMove: null,
    moveHasHit: false,
    moveEffectTriggered: false,
    ultimateFacing: index === 0 ? 1 : -1,
    capturedBy: null,
    pendingCommand: null,
    downGraceSamples: 0,
    ultimateReleaseSource: null,
  };
}

function cloneFighter(f: FighterState): FighterSnapshot {
  return {
    id: f.id,
    x: f.x,
    y: f.y,
    vx: f.vx,
    vy: f.vy,
    facing: f.facing,
    health: f.health,
    maxHealth: f.maxHealth,
    guard: f.guard,
    maxGuard: f.maxGuard,
    guardRegenDelay: f.guardRegenDelay,
    guardBreakFrames: f.guardBreakFrames,
    grounded: f.grounded,
    crouching: f.crouching,
    blocking: f.blocking,
    stunFrames: f.stunFrames,
    blockstunFrames: f.blockstunFrames,
    moveId: f.moveId,
    moveFrame: f.moveFrame,
    comboCount: f.comboCount,
    moveContact: f.moveContact,
    chilledFrames: f.chilledFrames,
    projectileCooldown: f.projectileCooldown,
    projectileCooldownMax: f.projectileCooldownMax,
    superMeter: f.superMeter,
    maxSuper: f.maxSuper,
    superReady: f.superReady,
    ultimatePhase: f.ultimatePhase,
    ultimatePhaseFrame: f.ultimatePhaseFrame,
    ultimateConnected: f.ultimateConnected,
    ultimateTarget: f.ultimateTarget,
    capturedBy: f.capturedBy,
    dashKind: f.dashKind,
    dashFrame: f.dashFrame,
    landingRecoveryFrames: f.landingRecoveryFrames,
    pushGuardRecoveryFrames: f.pushGuardRecoveryFrames,
    roundWins: f.roundWins,
  };
}

function isAwayHeld(input: InputFrame, facing: Facing): boolean {
  return facing === 1 ? input.left : input.right;
}

function intervalsOverlap(aMin: number, aMax: number, bMin: number, bMax: number): boolean {
  return aMin <= bMax && bMin <= aMax;
}

export class CombatSimulation {
  private readonly registry: CombatRegistry;
  private fighters: [FighterState, FighterState];
  private frame = 0;
  private combatTick = 0;
  private phase: MatchPhase;
  private introFrames: number;
  private round = 1;
  private roundTimerFrames = ROUND_TIME_FRAMES;
  private roundOverFrames = 0;
  private hitstopFrames = 0;
  private winner: FighterIndex | null = null;
  private roundWinner: FighterIndex | null = null;
  private events: CombatEvent[] = [];
  private projectiles: ProjectileState[] = [];
  private nextProjectileId = 1;
  private pendingUltimateReleases: PendingUltimateRelease[] = [];

  constructor(p1: RegisteredFighterId, p2: RegisteredFighterId, options: CombatSimulationOptions = {}) {
    this.registry = options.registry ?? DEFAULT_COMBAT_REGISTRY;
    this.fighters = [
      makeFighter(this.registry, p1, 0, initialSuperFor(options, 0)),
      makeFighter(this.registry, p2, 1, initialSuperFor(options, 1)),
    ];
    this.phase = options.skipIntro ? 'fight' : 'intro';
    this.introFrames = options.skipIntro ? 0 : INTRO_FRAMES;
  }

  getSnapshot(): MatchSnapshot {
    return {
      frame: this.frame,
      combatTick: this.combatTick,
      phase: this.phase,
      round: this.round,
      roundTimerFrames: this.roundTimerFrames,
      hitstopFrames: this.hitstopFrames,
      winner: this.winner,
      roundWinner: this.roundWinner,
      fighters: [cloneFighter(this.fighters[0]), cloneFighter(this.fighters[1])],
      projectiles: this.projectiles.filter((p) => p.active).map(({ ttl: _ttl, ...p }) => ({ ...p })),
      events: this.events.map((event) => ({ ...event })),
    };
  }

  resetInputState(): void {
    for (const fighter of this.fighters) {
      fighter.prevInput = copyInput(EMPTY_INPUT);
      fighter.pendingCommand = null;
      fighter.downGraceSamples = 0;
    }
  }

  step(p1Input: InputFrame, p2Input: InputFrame): MatchSnapshot {
    this.events = [];
    this.pendingUltimateReleases = [];
    this.frame += 1;
    const inputs: readonly [InputFrame, InputFrame] = [p1Input, p2Input];

    if (this.phase === 'intro') {
      this.introFrames -= 1;
      this.updateFacing();
      this.saveInputs(inputs);
      if (this.introFrames <= 0) {
        this.phase = 'fight';
        this.events.push({ type: 'round-start', round: this.round });
      }
      return this.getSnapshot();
    }

    if (this.phase === 'round-over') {
      this.roundOverFrames -= 1;
      this.saveInputs(inputs);
      if (this.roundOverFrames <= 0) this.advanceAfterRound();
      return this.getSnapshot();
    }

    if (this.phase === 'match-over') {
      this.saveInputs(inputs);
      return this.getSnapshot();
    }

    this.captureCommands(inputs);

    if (this.hitstopFrames > 0) {
      this.hitstopFrames -= 1;
      this.saveInputs(inputs);
      return this.getSnapshot();
    }

    this.combatTick += 1;
    this.updateFacing();

    for (const index of [0, 1] as const) {
      this.updateFighter(index, inputs[index]);
    }

    this.applyPendingUltimateReleases();
    this.resolvePushboxes();
    this.updateFacing();
    this.resolveMoveHits(0, 1, inputs[1]);
    this.resolveMoveHits(1, 0, inputs[0]);
    this.updateProjectiles(inputs);
    this.cancelInterruptedMoves();

    if (this.phase === 'fight') {
      this.roundTimerFrames = Math.max(0, this.roundTimerFrames - 1);
      const roundShouldEnd = this.fighters[0].health <= 0
        || this.fighters[1].health <= 0
        || this.roundTimerFrames <= 0;
      if (roundShouldEnd && !this.hasActiveUltimateSequence()) this.finishRound();
    }

    this.agePendingCommands();
    this.saveInputs(inputs);
    return this.getSnapshot();
  }

  private tryExecutePendingNeutral(index: FighterIndex): boolean {
    const fighter = this.fighters[index];
    const pending = fighter.pendingCommand;
    if (!pending) return false;
    const command = pending.intent;
    const kit = this.registry.getKit(fighter.id);
    const def = this.registry.getFighter(fighter.id);

    if (command.action === 'pushGuard') {
      fighter.pendingCommand = null;
      return false;
    }

    if (command.action === 'ultimate') {
      if (!fighter.superReady) {
        fighter.pendingCommand = null;
        return false;
      }
      if (!fighter.grounded) return false;
      fighter.pendingCommand = null;
      this.startUltimate(index);
      return true;
    }

    if (command.action === 'special') {
      if (!fighter.grounded) return false;
      const moveId = command.direction.down ? kit.closeSpecial : kit.rangedSpecial;
      const move = this.registry.getMove(fighter.id, moveId);
      if (move.projectileKey && fighter.projectileCooldown > 0) {
        fighter.pendingCommand = null;
        return false;
      }
      fighter.pendingCommand = null;
      this.startMove(fighter, move);
      return true;
    }

    if (command.action === 'attack') {
      if (!fighter.grounded) {
        fighter.pendingCommand = null;
        this.startMove(fighter, this.registry.getMove(fighter.id, kit.air), 1);
        fighter.x += fighter.vx;
        this.integrateVertical(fighter, def.gravity);
        this.clampFighter(fighter);
        return true;
      }
      fighter.pendingCommand = null;
      const moveId = command.direction.down && kit.low ? kit.low : kit.standing;
      this.startMove(fighter, this.registry.getMove(fighter.id, moveId), 1);
      return true;
    }

    if (command.action === 'jump') {
      if (!fighter.grounded) return false;
      fighter.pendingCommand = null;
      fighter.vy = def.jumpSpeed;
      fighter.grounded = false;
      fighter.crouching = false;
      fighter.blocking = false;
      return false;
    }

    return false;
  }

  private updateFighter(index: FighterIndex, input: InputFrame): void {
    const fighter = this.fighters[index];
    const def = this.registry.getFighter(fighter.id);

    if (fighter.projectileCooldown > 0) fighter.projectileCooldown -= 1;
    if (fighter.chilledFrames > 0) fighter.chilledFrames -= 1;
    this.updateGuard(fighter);

    if (fighter.capturedBy !== null) {
      fighter.blocking = false;
      fighter.crouching = false;
      fighter.vx = 0;
      fighter.vy = 0;
      return;
    }

    if (fighter.health <= 0 && fighter.ultimatePhase !== 'sequence') {
      fighter.blocking = false;
      fighter.vx = 0;
      return;
    }

    if (fighter.ultimatePhase === 'sequence') {
      this.updateUltimate(index);
      return;
    }

    if (fighter.guardBreakFrames > 0) {
      fighter.guardBreakFrames -= 1;
      fighter.blocking = false;
      fighter.crouching = false;
      fighter.dashKind = null;
      fighter.dashFrame = 0;
      fighter.x += fighter.vx;
      fighter.vx *= 0.82;
      this.integrateVertical(fighter, def.gravity);
      this.clampFighter(fighter);
      if (fighter.guardBreakFrames === 0) fighter.guard = Math.max(fighter.guard, GUARD_AFTER_BREAK);
      return;
    }

    if (fighter.stunFrames > 0) {
      fighter.stunFrames -= 1;
      fighter.blocking = false;
      fighter.crouching = false;
      fighter.dashKind = null;
      fighter.dashFrame = 0;
      const desiredX = fighter.x + fighter.vx;
      fighter.x = desiredX;
      this.clampFighter(fighter);
      const wallOverflow = desiredX - fighter.x;
      if (fighter.ultimateReleaseSource !== null && wallOverflow !== 0) {
        const source = this.fighters[fighter.ultimateReleaseSource];
        source.x -= wallOverflow;
        this.clampFighter(source);
      }
      fighter.vx *= 0.86;
      this.integrateVertical(fighter, def.gravity);
      if (fighter.stunFrames === 0) fighter.ultimateReleaseSource = null;
      return;
    }

    if (fighter.blockstunFrames > 0) {
      if (fighter.pendingCommand?.intent.action === 'pushGuard') {
        fighter.pendingCommand = null;
        if (this.tryPushGuard(index)) return;
      }
      fighter.blockstunFrames -= 1;
      fighter.blocking = true;
      fighter.crouching = input.down;
      fighter.dashKind = null;
      fighter.dashFrame = 0;
      fighter.x += fighter.vx;
      fighter.vx *= 0.78;
      this.integrateVertical(fighter, def.gravity);
      this.clampFighter(fighter);
      if (fighter.blockstunFrames === 0) fighter.blocking = false;
      return;
    }

    if (fighter.pushGuardRecoveryFrames > 0) {
      fighter.pushGuardRecoveryFrames -= 1;
      fighter.blocking = false;
      fighter.crouching = false;
      fighter.dashKind = null;
      fighter.dashFrame = 0;
      fighter.vx *= 0.82;
      this.integrateVertical(fighter, def.gravity);
      this.clampFighter(fighter);
      return;
    }

    if (fighter.landingRecoveryFrames > 0 && fighter.grounded) {
      fighter.landingRecoveryFrames -= 1;
      if (fighter.currentMove === null) {
        fighter.blocking = false;
        fighter.crouching = input.down;
        fighter.vx = 0;
        return;
      }
    }

    if (fighter.ultimatePhase !== 'idle') {
      this.updateUltimate(index);
      return;
    }

    if (fighter.pendingCommand?.intent.action === 'ultimate' && !fighter.superReady) {
      fighter.pendingCommand = null;
    }

    if (fighter.dashKind) {
      this.updateDash(fighter);
      this.integrateVertical(fighter, def.gravity);
      this.clampFighter(fighter);
      return;
    }

    if (fighter.currentMove) {
      fighter.blocking = false;
      fighter.crouching = false;
      const current = fighter.currentMove;
      const pendingAttack = fighter.pendingCommand?.intent.action === 'attack'
        ? fighter.pendingCommand.intent
        : null;
      const canChain = fighter.moveContact === 'hit'
        && pendingAttack !== null
        && !pendingAttack.direction.down
        && current.nextAttack
        && current.cancelStart !== undefined
        && current.cancelEnd !== undefined
        && fighter.moveFrame >= current.cancelStart
        && fighter.moveFrame <= current.cancelEnd;
      if (canChain && current.nextAttack) {
        fighter.pendingCommand = null;
        this.startMove(fighter, this.registry.getMove(fighter.id, current.nextAttack), fighter.comboCount + 1);
        this.integrateVertical(fighter, def.gravity);
        return;
      }

      fighter.moveFrame += 1;
      this.triggerMoveEffect(index, fighter);
      if (fighter.moveFrame >= current.totalFrames) {
        this.clearMove(fighter);
        if (fighter.landingRecoveryFrames === 0 && this.tryExecutePendingNeutral(index)) return;
      }
      if (!fighter.grounded) fighter.x += fighter.vx;
      this.integrateVertical(fighter, def.gravity);
      this.clampFighter(fighter);
      return;
    }

    if (fighter.grounded && (input.dashLeft || input.dashRight)) {
      const direction = input.dashLeft === input.dashRight ? 0 : input.dashLeft ? -1 : 1;
      if (direction !== 0) {
        this.startDash(fighter, direction as Facing);
        this.updateDash(fighter);
        this.clampFighter(fighter);
        return;
      }
    }

    if (this.tryExecutePendingNeutral(index)) return;

    fighter.crouching = fighter.grounded && input.down;
    fighter.blocking = false;

    let direction = 0;
    if (input.left !== input.right) direction = input.left ? -1 : 1;
    if (!fighter.crouching) {
      const chillScale = fighter.chilledFrames > 0 ? 0.7 : 1;
      const walkingBackward = fighter.grounded && direction === -fighter.facing;
      const walkScale = walkingBackward ? BACKWARD_WALK_SCALE : 1;
      fighter.vx = direction * def.walkSpeed * chillScale * walkScale;
      fighter.x += fighter.vx;
    } else {
      fighter.vx = 0;
    }

    this.integrateVertical(fighter, def.gravity);
    this.clampFighter(fighter);
  }

  private captureCommands(inputs: readonly [InputFrame, InputFrame]): void {
    for (const index of [0, 1] as const) {
      const fighter = this.fighters[index];
      const input = inputs[index];

      if (input.up) fighter.downGraceSamples = 0;
      else if (input.down) fighter.downGraceSamples = DOWN_GRACE_SAMPLES;
      else if (fighter.downGraceSamples > 0) fighter.downGraceSamples -= 1;

      const candidates: CommandIntent[] = input.commands !== undefined
        ? input.commands.slice(0, 4).map((command) => ({
          action: command.action,
          direction: { ...command.direction },
        }))
        : this.legacyCommands(input, fighter.prevInput);

      if (candidates.length === 0) continue;

      let selected = candidates[0]!;
      for (const candidate of candidates.slice(1)) {
        if (commandPriority(candidate.action) >= commandPriority(selected.action)) selected = candidate;
      }

      const direction = { ...selected.direction };
      if (
        selected.action === 'special'
        && !direction.down
        && !direction.up
        && fighter.downGraceSamples > 0
      ) {
        direction.down = true;
      }

      fighter.pendingCommand = {
        intent: { action: selected.action, direction },
        remainingFrames: COMMAND_BUFFER_FRAMES,
      };
    }
  }

  private legacyCommands(input: InputFrame, previous: InputFrame): CommandIntent[] {
    const direction = directionFromInput(input);
    const commands: CommandIntent[] = [];
    if (Boolean(input.jump) && !Boolean(previous.jump)) commands.push({ action: 'jump', direction: { ...direction } });
    if (Boolean(input.attack) && !Boolean(previous.attack)) commands.push({ action: 'attack', direction: { ...direction } });
    if (Boolean(input.special) && !Boolean(previous.special)) commands.push({ action: 'special', direction: { ...direction } });
    if (Boolean(input.pushGuard) && !Boolean(previous.pushGuard)) commands.push({ action: 'pushGuard', direction: { ...direction } });
    if (Boolean(input.ultimate) && !Boolean(previous.ultimate)) commands.push({ action: 'ultimate', direction: { ...direction } });
    return commands;
  }

  private agePendingCommands(): void {
    for (const fighter of this.fighters) {
      if (!fighter.pendingCommand) continue;
      fighter.pendingCommand.remainingFrames -= 1;
      if (fighter.pendingCommand.remainingFrames <= 0) fighter.pendingCommand = null;
    }
  }


  private tryPushGuard(defenderIndex: FighterIndex): boolean {
    const defender = this.fighters[defenderIndex];
    if (defender.guardBreakFrames > 0 || defender.guard < PUSH_GUARD_COST) return false;
    if (!(defender.blocking || defender.blockstunFrames > 0)) return false;
    if (defender.capturedBy !== null || defender.ultimatePhase === 'sequence') return false;

    const attackerIndex: FighterIndex = defenderIndex === 0 ? 1 : 0;
    const attacker = this.fighters[attackerIndex];

    defender.guard = Math.max(0, defender.guard - PUSH_GUARD_COST);
    defender.guardRegenDelay = GUARD_REGEN_DELAY_FRAMES;
    defender.blockstunFrames = 0;
    defender.blocking = false;
    defender.vx = 0;

    const direction = attacker.x < defender.x ? -1 : 1;
    const attackerBefore = attacker.x;
    attacker.x += direction * PUSH_GUARD_SEPARATION;
    this.clampFighter(attacker);
    const attackerTravel = Math.abs(attacker.x - attackerBefore);
    const overflow = Math.max(0, PUSH_GUARD_SEPARATION - attackerTravel);
    if (overflow > 0) {
      defender.x -= direction * overflow;
      this.clampFighter(defender);
    }
    attacker.vx = direction * 4.5;
    defender.pushGuardRecoveryFrames = PUSH_GUARD_RECOVERY_FRAMES;
    this.events.push({ type: 'push-guard', defender: defenderIndex, attacker: attackerIndex });
    return true;
  }

  private updateGuard(fighter: FighterState): void {
    if (fighter.guardBreakFrames > 0) return;
    if (fighter.guardRegenDelay > 0) {
      fighter.guardRegenDelay -= 1;
      return;
    }
    if (fighter.guard < fighter.maxGuard) fighter.guard = Math.min(fighter.maxGuard, fighter.guard + GUARD_REGEN_PER_FRAME);
  }

  private addSuper(index: FighterIndex, amount: number): void {
    if (amount <= 0) return;
    const fighter = this.fighters[index];
    const before = fighter.superMeter;
    fighter.superMeter = Math.min(fighter.maxSuper, fighter.superMeter + amount);
    fighter.superReady = fighter.superMeter >= fighter.maxSuper;
    if (before < fighter.maxSuper && fighter.superReady) {
      this.events.push({ type: 'super-ready', fighter: index });
    }
  }

  private applyDamage(
    attackerIndex: FighterIndex,
    defenderIndex: FighterIndex,
    requestedDamage: number,
    source: HitSource,
    blocked = false,
  ): number {
    const defender = this.fighters[defenderIndex];
    const actualDamage = Math.max(0, Math.min(defender.health, requestedDamage));
    defender.health = Math.max(0, defender.health - requestedDamage);

    // V0.5 rewards clean interaction, not chip or guaranteed Ultimate damage.
    if (actualDamage > 0 && !blocked && source !== 'ultimate') {
      const dealtRate = source === 'normal' ? SUPER_GAIN_NORMAL_DEALT : SUPER_GAIN_SPECIAL_DEALT;
      this.addSuper(attackerIndex, actualDamage * dealtRate);
      this.addSuper(defenderIndex, actualDamage * SUPER_GAIN_RECEIVED);
    }
    return actualDamage;
  }

  private startDash(fighter: FighterState, direction: Facing): void {
    const forward = direction === fighter.facing;
    fighter.dashKind = forward ? 'forward' : 'back';
    fighter.dashFrame = 0;
    fighter.blocking = false;
    fighter.crouching = false;
    fighter.vx = direction * (forward ? FORWARD_DASH_SPEED : BACK_DASH_SPEED);
  }

  private updateDash(fighter: FighterState): void {
    if (!fighter.dashKind) return;
    fighter.dashFrame += 1;
    const duration = fighter.dashKind === 'forward' ? FORWARD_DASH_FRAMES : BACK_DASH_FRAMES;
    fighter.x += fighter.vx;
    if (fighter.dashFrame >= duration) {
      fighter.dashKind = null;
      fighter.dashFrame = 0;
      fighter.vx = 0;
    }
  }

  private integrateVertical(fighter: FighterState, gravity: number): void {
    if (fighter.grounded && fighter.y === 0 && fighter.vy === 0) return;
    const wasGrounded = fighter.grounded;
    fighter.y += fighter.vy;
    fighter.vy -= gravity;
    if (fighter.y <= 0) {
      fighter.y = 0;
      fighter.vy = 0;
      fighter.grounded = true;
      if (!wasGrounded) {
        fighter.vx = 0;
        fighter.landingRecoveryFrames = 4;
        const index = this.fighters.indexOf(fighter) as FighterIndex;
        this.events.push({ type: 'land', fighter: index });
      }
    } else {
      fighter.grounded = false;
    }
  }

  private resolveMoveHits(attackerIndex: FighterIndex, defenderIndex: FighterIndex, defenderInput: InputFrame): void {
    const attacker = this.fighters[attackerIndex];
    const defender = this.fighters[defenderIndex];
    if (attacker.ultimatePhase !== 'idle' || defender.capturedBy !== null) return;
    const move = attacker.currentMove;
    if (!move || attacker.moveHasHit) return;
    const hitbox = move.hitbox;
    if (!hitbox) return;
    if (attacker.moveFrame < hitbox.start || attacker.moveFrame > hitbox.end) return;

    const attackMinX = attacker.facing === 1
      ? attacker.x + hitbox.offsetX
      : attacker.x - hitbox.offsetX - hitbox.width;
    const attackMaxX = attackMinX + hitbox.width;
    const defenderDef = this.registry.getFighter(defender.id);
    const hurtHalfWidth = defenderDef.width * 0.5;
    const hurtMinX = defender.x - hurtHalfWidth;
    const hurtMaxX = defender.x + hurtHalfWidth;
    const hurtTop = defender.crouching ? defenderDef.height * 0.66 : defenderDef.height;
    const hurtBottom = defender.y;
    const attackBottom = attacker.y + hitbox.bottom;
    const attackTop = attacker.y + hitbox.top;

    if (!intervalsOverlap(attackMinX, attackMaxX, hurtMinX, hurtMaxX)) return;
    if (!intervalsOverlap(attackBottom, attackTop, hurtBottom, defender.y + hurtTop)) return;
    if (this.isBackdashStrikeInvulnerable(defender)) return;

    const blocked = this.canBlock(defender, defenderInput, hitbox.level);
    const source: HitSource = move.category === 'normal'
      ? 'normal'
      : move.category === 'ultimate'
        ? 'ultimate'
        : 'special';

    attacker.moveHasHit = true;
    attacker.moveContact = blocked ? 'block' : 'hit';
    let actualDamage = 0;
    if (blocked) {
      actualDamage = this.applyDamage(attackerIndex, defenderIndex, hitbox.chipDamage, source, true);
      defender.blockstunFrames = hitbox.blockstun;
      defender.blocking = true;
      defender.vx = attacker.facing * hitbox.knockback * 0.35;
      this.applyCornerBlockTransfer(attackerIndex, defenderIndex, hitbox.knockback);
      this.damageGuard(defenderIndex, hitbox.guardDamage);
    } else {
      actualDamage = this.applyDamage(attackerIndex, defenderIndex, hitbox.damage, source, false);
      defender.stunFrames = hitbox.hitstun;
      defender.blocking = false;
      defender.vx = attacker.facing * hitbox.knockback;
    }
    if (move.chillFrames && !blocked) defender.chilledFrames = Math.max(defender.chilledFrames, move.chillFrames);
    this.hitstopFrames = Math.max(this.hitstopFrames, hitbox.hitstop);
    this.events.push({
      type: 'hit',
      attacker: attackerIndex,
      defender: defenderIndex,
      blocked,
      damage: actualDamage,
      strong: hitbox.strong,
      source,
      finisher: defender.health <= 0,
    });
  }

  private canBlock(
    defender: FighterState,
    input: InputFrame,
    level: 'mid' | 'low' | 'overhead' = 'mid',
  ): boolean {
    const levelAllowsBlock = level === 'mid'
      || (level === 'low' && input.down)
      || (level === 'overhead' && !input.down);

    return defender.grounded
      && isAwayHeld(input, defender.facing)
      && levelAllowsBlock
      && defender.currentMove === null
      && defender.ultimatePhase === 'idle'
      && defender.dashKind === null
      && defender.stunFrames === 0
      && defender.guardBreakFrames === 0
      && defender.pushGuardRecoveryFrames === 0
      && defender.capturedBy === null
      && defender.guard > 0;
  }

  private applyCornerBlockTransfer(attackerIndex: FighterIndex, defenderIndex: FighterIndex, knockback: number): void {
    const attacker = this.fighters[attackerIndex];
    const defender = this.fighters[defenderIndex];
    const pinnedLeft = attacker.facing === -1 && defender.x <= ARENA_MIN_X + 1;
    const pinnedRight = attacker.facing === 1 && defender.x >= ARENA_MAX_X - 1;
    if (!pinnedLeft && !pinnedRight) return;
    const transfer = Math.max(9, knockback * 1.8);
    attacker.x -= attacker.facing * transfer;
    this.clampFighter(attacker);
  }

  private isBackdashStrikeInvulnerable(fighter: FighterState): boolean {
    return fighter.dashKind === 'back'
      && fighter.dashFrame >= BACK_DASH_INVULN_START
      && fighter.dashFrame <= BACK_DASH_INVULN_END;
  }

  private damageGuard(defenderIndex: FighterIndex, amount: number): void {
    const defender = this.fighters[defenderIndex];
    defender.guard = Math.max(0, defender.guard - amount);
    defender.guardRegenDelay = GUARD_REGEN_DELAY_FRAMES;
    if (defender.guard > 0) return;
    defender.blockstunFrames = 0;
    defender.blocking = false;
    if (defender.pendingCommand?.intent.action === 'pushGuard') defender.pendingCommand = null;
    defender.guardBreakFrames = GUARD_BREAK_FRAMES;
    defender.vx *= 0.5;
    this.events.push({ type: 'guard-break', defender: defenderIndex });
  }

  private startMove(fighter: FighterState, move: MoveDefinition, comboCount = 0): void {
    fighter.currentMove = move;
    fighter.moveId = move.id;
    fighter.moveFrame = 0;
    fighter.moveHasHit = false;
    fighter.moveContact = 'none';
    fighter.moveEffectTriggered = false;
    fighter.comboCount = comboCount;
    if (fighter.grounded) fighter.vx = 0;
  }

  private clearMove(fighter: FighterState): void {
    fighter.currentMove = null;
    fighter.moveId = null;
    fighter.moveFrame = 0;
    fighter.moveHasHit = false;
    fighter.moveContact = 'none';
    fighter.moveEffectTriggered = false;
    fighter.comboCount = 0;
  }

  private clearTransientCombatState(fighter: FighterState): void {
    fighter.vx = 0;
    fighter.vy = 0;
    fighter.crouching = false;
    fighter.blocking = false;
    fighter.stunFrames = 0;
    fighter.blockstunFrames = 0;
    fighter.guardBreakFrames = 0;
    fighter.dashKind = null;
    fighter.dashFrame = 0;
    fighter.landingRecoveryFrames = 0;
    fighter.pushGuardRecoveryFrames = 0;
    fighter.pendingCommand = null;
    fighter.downGraceSamples = 0;
    fighter.ultimateReleaseSource = null;
    fighter.ultimatePhase = 'idle';
    fighter.ultimatePhaseFrame = 0;
    fighter.ultimateConnected = false;
    fighter.ultimateTarget = null;
    fighter.capturedBy = null;
    this.clearMove(fighter);
  }

  private triggerMoveEffect(index: FighterIndex, fighter: FighterState): void {
    const move = fighter.currentMove;
    if (!move || fighter.moveEffectTriggered || move.spawnProjectileFrame === undefined || !move.projectileKey) return;
    if (fighter.moveFrame < move.spawnProjectileFrame) return;

    const definition = this.registry.getProjectile(move.projectileKey);
    if (this.projectiles.some((projectile) => projectile.active && projectile.owner === index && projectile.kind === definition.key)) {
      fighter.moveEffectTriggered = true;
      fighter.projectileCooldown = Math.max(fighter.projectileCooldown, definition.cooldown);
      return;
    }
    const projectile: ProjectileState = {
      id: this.nextProjectileId++,
      owner: index,
      kind: definition.key,
      x: fighter.x + fighter.facing * definition.spawnOffsetX,
      y: fighter.y + definition.spawnOffsetY,
      vx: fighter.facing * definition.speed,
      active: true,
      ttl: definition.ttl,
    };
    this.projectiles.push(projectile);
    fighter.projectileCooldown = definition.cooldown;
    fighter.moveEffectTriggered = true;
    this.events.push({ type: 'projectile', owner: index, projectileId: projectile.id });
  }

  private updateProjectiles(inputs: readonly [InputFrame, InputFrame]): void {
    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;
      const definition = this.registry.getProjectile(projectile.kind);
      projectile.x += projectile.vx;
      projectile.ttl -= 1;
      if (projectile.ttl <= 0 || projectile.x < ARENA_MIN_X - 80 || projectile.x > ARENA_MAX_X + 80) {
        projectile.active = false;
        continue;
      }

      const defenderIndex: FighterIndex = projectile.owner === 0 ? 1 : 0;
      const defender = this.fighters[defenderIndex];
      if (defender.capturedBy !== null) continue;
      const defenderDef = this.registry.getFighter(defender.id);
      const half = defenderDef.width * 0.5;
      const projectileMinX = projectile.x - definition.collisionHalfWidth;
      const projectileMaxX = projectile.x + definition.collisionHalfWidth;
      const projectileMinY = projectile.y - definition.collisionHalfHeight;
      const projectileMaxY = projectile.y + definition.collisionHalfHeight;
      const hurtTop = defender.y + (defender.crouching ? defenderDef.height * 0.66 : defenderDef.height);
      if (!intervalsOverlap(projectileMinX, projectileMaxX, defender.x - half, defender.x + half)) continue;
      if (!intervalsOverlap(projectileMinY, projectileMaxY, defender.y + 18, hurtTop + 10)) continue;

      const defenderInput = inputs[defenderIndex];
      const blocked = this.canBlock(defender, defenderInput);
      const requestedDamage = blocked ? definition.chipDamage : definition.damage;
      const actualDamage = this.applyDamage(projectile.owner, defenderIndex, requestedDamage, 'projectile', blocked);
      if (blocked) {
        defender.blockstunFrames = definition.blockstun;
        defender.blocking = true;
        defender.vx = Math.sign(projectile.vx) * definition.blockKnockback;
        this.applyCornerBlockTransfer(projectile.owner, defenderIndex, definition.cornerTransferKnockback);
        this.damageGuard(defenderIndex, definition.guardDamage);
      } else {
        defender.stunFrames = definition.hitstun;
        defender.blocking = false;
        defender.vx = Math.sign(projectile.vx) * definition.knockback;
      }
      projectile.active = false;
      this.hitstopFrames = Math.max(this.hitstopFrames, definition.hitstop);
      this.events.push({
        type: 'hit',
        attacker: projectile.owner,
        defender: defenderIndex,
        blocked,
        damage: actualDamage,
        strong: definition.strong,
        source: 'projectile',
        finisher: defender.health <= 0,
      });
    }
    this.projectiles = this.projectiles.filter((p) => p.active);
  }

  private startUltimate(index: FighterIndex): void {
    const fighter = this.fighters[index];
    const kit = this.registry.getKit(fighter.id);
    fighter.currentMove = this.registry.getMove(fighter.id, kit.ultimate);
    fighter.moveId = fighter.currentMove.id;
    fighter.moveFrame = 0;
    fighter.moveHasHit = false;
    fighter.moveContact = 'none';
    fighter.moveEffectTriggered = false;
    fighter.comboCount = 0;
    fighter.ultimatePhase = 'startup';
    fighter.ultimatePhaseFrame = 0;
    fighter.ultimateConnected = false;
    fighter.ultimateTarget = null;
    fighter.ultimateFacing = fighter.facing;
    fighter.vx = 0;
    fighter.blocking = false;
    fighter.crouching = false;
    this.events.push({ type: 'ultimate-start', attacker: index });
  }

  private activeUltimateDefinition(fighter: FighterState): UltimateDefinition {
    const move = fighter.currentMove;
    if (!move?.ultimateKey) throw new Error(`Missing ultimate definition for ${fighter.id}:${fighter.moveId ?? 'none'}`);
    return this.registry.getUltimate(move.ultimateKey);
  }

  private updateUltimate(index: FighterIndex): void {
    const fighter = this.fighters[index];
    const definition = this.activeUltimateDefinition(fighter);
    fighter.blocking = false;
    fighter.crouching = false;
    fighter.dashKind = null;
    fighter.dashFrame = 0;
    fighter.facing = fighter.ultimateFacing;
    fighter.moveFrame += 1;
    fighter.ultimatePhaseFrame += 1;

    if (fighter.ultimatePhase === 'startup') {
      if (fighter.ultimatePhaseFrame >= definition.startupFrames) {
        fighter.superMeter = 0;
        fighter.superReady = false;
        fighter.ultimatePhase = 'capture';
        fighter.ultimatePhaseFrame = 0;
      }
      return;
    }

    if (fighter.ultimatePhase === 'capture') {
      if (definition.kind === 'dashCapture') this.updateDashCapture(index, definition);
      else this.updateSuctionCapture(index, definition);
      return;
    }

    if (fighter.ultimatePhase === 'sequence') {
      this.updateUltimateSequence(index, definition);
      return;
    }

    if (fighter.ultimatePhase === 'recovery') {
      const recoveryFrames = fighter.ultimateConnected
        ? (definition.successRecoveryFrames ?? definition.recoveryFrames)
        : definition.recoveryFrames;
      if (fighter.ultimatePhaseFrame >= recoveryFrames) this.finishUltimate(fighter);
    }
  }

  private updateDashCapture(index: FighterIndex, definition: UltimateDefinition): void {
    const attacker = this.fighters[index];
    const defenderIndex: FighterIndex = index === 0 ? 1 : 0;
    const defender = this.fighters[defenderIndex];
    const dashSpeed = definition.dashSpeed ?? 0;

    attacker.x += attacker.ultimateFacing * dashSpeed;
    this.clampFighter(attacker);

    const signedDistance = (defender.x - attacker.x) * attacker.ultimateFacing;
    const verticalDistance = Math.abs(defender.y - attacker.y);
    const inRegion = signedDistance >= 0
      && signedDistance <= definition.captureReach
      && verticalDistance <= definition.captureVertical;

    if (inRegion) {
      this.beginUltimateSequence(index, defenderIndex);
      return;
    }

    if (attacker.ultimatePhaseFrame >= definition.captureFrames) {
      this.enterUltimateWhiffRecovery(index);
    }
  }

  private updateSuctionCapture(index: FighterIndex, definition: UltimateDefinition): void {
    const attacker = this.fighters[index];
    const defenderIndex: FighterIndex = index === 0 ? 1 : 0;
    const defender = this.fighters[defenderIndex];
    const suctionRange = definition.suctionRange ?? 0;
    const suctionSpeed = definition.suctionSpeed ?? 0;
    const captureDistance = definition.captureDistance ?? definition.captureReach;

    const signedDistance = (defender.x - attacker.x) * attacker.ultimateFacing;
    const verticalDistance = Math.abs(defender.y - attacker.y);
    const inField = signedDistance > 0
      && signedDistance <= suctionRange
      && verticalDistance <= definition.captureVertical;

    if (inField) {
      const pullDirection = Math.sign(attacker.x - defender.x);
      defender.x += pullDirection * suctionSpeed;
      this.clampFighter(defender);
      const remaining = Math.abs(defender.x - attacker.x);
      if (remaining <= captureDistance) {
        this.beginUltimateSequence(index, defenderIndex);
        return;
      }
    }

    if (attacker.ultimatePhaseFrame >= definition.captureFrames) {
      this.enterUltimateWhiffRecovery(index);
    }
  }

  private beginUltimateSequence(attackerIndex: FighterIndex, defenderIndex: FighterIndex): void {
    const attacker = this.fighters[attackerIndex];
    const defender = this.fighters[defenderIndex];

    attacker.ultimatePhase = 'sequence';
    attacker.ultimatePhaseFrame = 0;
    attacker.ultimateConnected = true;
    attacker.ultimateTarget = defenderIndex;

    this.cancelDefenderForCapture(defender);
    defender.capturedBy = attackerIndex;
    defender.vx = 0;
    defender.vy = 0;
    defender.blocking = false;
    defender.crouching = false;
    this.events.push({ type: 'ultimate-capture', attacker: attackerIndex, defender: defenderIndex });
  }

  private cancelDefenderForCapture(defender: FighterState): void {
    defender.currentMove = null;
    defender.moveId = null;
    defender.moveFrame = 0;
    defender.moveHasHit = false;
    defender.moveContact = 'none';
    defender.moveEffectTriggered = false;
    defender.comboCount = 0;
    defender.dashKind = null;
    defender.dashFrame = 0;
    defender.landingRecoveryFrames = 0;
    defender.pushGuardRecoveryFrames = 0;
    defender.stunFrames = 0;
    defender.blockstunFrames = 0;
    defender.pendingCommand = null;
    defender.downGraceSamples = 0;
    defender.ultimateReleaseSource = null;
    defender.ultimatePhase = 'idle';
    defender.ultimatePhaseFrame = 0;
    defender.ultimateConnected = false;
    defender.ultimateTarget = null;
  }

  private updateUltimateSequence(attackerIndex: FighterIndex, definition: UltimateDefinition): void {
    const attacker = this.fighters[attackerIndex];
    const defenderIndex = attacker.ultimateTarget;
    if (defenderIndex === null) {
      this.enterUltimateWhiffRecovery(attackerIndex);
      return;
    }
    const defender = this.fighters[defenderIndex];

    attacker.stunFrames = 0;
    attacker.blockstunFrames = 0;
    attacker.guardBreakFrames = 0;
    defender.capturedBy = attackerIndex;
    defender.vx = 0;
    defender.vy = 0;
    defender.x = attacker.x + attacker.ultimateFacing * definition.sequenceOffsetX;
    this.clampFighter(defender);

    const hit = definition.sequenceHits.find((beat) => beat.frame === attacker.ultimatePhaseFrame);
    if (hit) {
      const finalBeat = definition.sequenceHits[definition.sequenceHits.length - 1] === hit;
      this.applyUltimateHit(
        attackerIndex,
        defenderIndex,
        hit.damage,
        hit.knockback,
        finalBeat ? (definition.finalHitstop ?? 7) : 7,
      );
    }

    if (attacker.ultimatePhaseFrame >= definition.sequenceFrames) {
      this.pendingUltimateReleases.push({
        attacker: attackerIndex,
        defender: defenderIndex,
        definition,
      });
      attacker.ultimateTarget = null;
      attacker.ultimatePhase = 'recovery';
      attacker.ultimatePhaseFrame = 0;
    }
  }

  private applyPendingUltimateReleases(): void {
    if (this.pendingUltimateReleases.length === 0) return;
    for (const release of this.pendingUltimateReleases) {
      const attacker = this.fighters[release.attacker];
      const defender = this.fighters[release.defender];
      const definition = release.definition;
      const facing = attacker.ultimateFacing;

      defender.capturedBy = null;
      defender.pendingCommand = null;
      defender.blocking = false;
      defender.crouching = false;
      defender.blockstunFrames = 0;
      defender.guardBreakFrames = 0;
      defender.landingRecoveryFrames = 0;
      defender.pushGuardRecoveryFrames = 0;
      const releaseHitstun = definition.releaseHitstun ?? 30;
      const releaseVx = definition.releaseVx ?? definition.releaseKnockback;
      const releaseVy = definition.releaseVy ?? 0;
      const releaseSeparation = definition.releaseSeparation ?? Math.abs(definition.sequenceOffsetX);

      defender.stunFrames = Math.max(defender.stunFrames, releaseHitstun);
      defender.grounded = false;
      defender.vx = facing * releaseVx;
      defender.vy = releaseVy;
      defender.ultimateReleaseSource = release.attacker;

      const targetX = attacker.x + facing * releaseSeparation;
      defender.x = targetX;
      this.clampFighter(defender);
      const achieved = (defender.x - attacker.x) * facing;
      const missing = Math.max(0, releaseSeparation - achieved);
      if (missing > 0) {
        attacker.x -= facing * missing;
        this.clampFighter(attacker);
      }

      this.events.push({
        type: 'ultimate-release',
        attacker: release.attacker,
        defender: release.defender,
      });
    }
    this.pendingUltimateReleases = [];
  }

  private applyUltimateHit(
    attackerIndex: FighterIndex,
    defenderIndex: FighterIndex,
    damage: number,
    knockback: number,
    hitstop = 7,
  ): void {
    const actualDamage = this.applyDamage(attackerIndex, defenderIndex, damage, 'ultimate', false);
    const attacker = this.fighters[attackerIndex];
    const defender = this.fighters[defenderIndex];
    defender.vx = attacker.ultimateFacing * knockback;
    this.hitstopFrames = Math.max(this.hitstopFrames, hitstop);
    this.events.push({ type: 'hit', attacker: attackerIndex, defender: defenderIndex, blocked: false, damage: actualDamage, strong: true, source: 'ultimate', finisher: defender.health <= 0 });
  }

  private enterUltimateWhiffRecovery(index: FighterIndex): void {
    const fighter = this.fighters[index];
    if (fighter.ultimatePhase === 'recovery') return;
    fighter.ultimatePhase = 'recovery';
    fighter.ultimatePhaseFrame = 0;
    fighter.ultimateConnected = false;
    fighter.ultimateTarget = null;
    this.events.push({ type: 'ultimate-whiff', attacker: index });
  }

  private cancelUltimateBeforeCommit(fighter: FighterState): void {
    fighter.ultimatePhase = 'idle';
    fighter.ultimatePhaseFrame = 0;
    fighter.ultimateConnected = false;
    fighter.ultimateTarget = null;
    this.clearMove(fighter);
  }

  private finishUltimate(fighter: FighterState): void {
    fighter.ultimatePhase = 'idle';
    fighter.ultimatePhaseFrame = 0;
    fighter.ultimateConnected = false;
    fighter.ultimateTarget = null;
    this.clearMove(fighter);
  }

  private hasActiveUltimateSequence(): boolean {
    return this.fighters.some((fighter) => fighter.ultimatePhase === 'sequence');
  }

  private cancelInterruptedMoves(): void {
    for (const index of [0, 1] as const) {
      const fighter = this.fighters[index];
      if (fighter.stunFrames <= 0 || !fighter.currentMove) continue;

      if (fighter.ultimatePhase === 'startup') {
        this.cancelUltimateBeforeCommit(fighter);
        continue;
      }
      if (fighter.ultimatePhase === 'capture') {
        this.enterUltimateWhiffRecovery(index);
        continue;
      }
      if (fighter.ultimatePhase === 'sequence') continue;
      if (fighter.ultimatePhase === 'recovery') {
        this.finishUltimate(fighter);
        continue;
      }
      this.clearMove(fighter);
    }
  }

  private updateFacing(): void {
    const canReorient = (fighter: FighterState): boolean => fighter.grounded
      && fighter.currentMove === null
      && fighter.ultimatePhase === 'idle'
      && fighter.stunFrames === 0
      && fighter.blockstunFrames === 0
      && fighter.guardBreakFrames === 0
      && fighter.landingRecoveryFrames === 0
      && fighter.pushGuardRecoveryFrames === 0
      && fighter.capturedBy === null;

    if (this.fighters[0].x < this.fighters[1].x) {
      if (canReorient(this.fighters[0])) this.fighters[0].facing = 1;
      if (canReorient(this.fighters[1])) this.fighters[1].facing = -1;
    } else if (this.fighters[0].x > this.fighters[1].x) {
      if (canReorient(this.fighters[0])) this.fighters[0].facing = -1;
      if (canReorient(this.fighters[1])) this.fighters[1].facing = 1;
    }
  }

  private resolvePushboxes(): void {
    if (this.fighters.some((fighter) => fighter.capturedBy !== null || fighter.ultimatePhase === 'sequence')) return;
    const left = this.fighters[0].x <= this.fighters[1].x ? this.fighters[0] : this.fighters[1];
    const right = left === this.fighters[0] ? this.fighters[1] : this.fighters[0];
    const overlap = PUSH_DISTANCE - (right.x - left.x);
    if (overlap <= 0 || left.y > 45 || right.y > 45) return;
    left.x -= overlap * 0.5;
    right.x += overlap * 0.5;
    this.clampFighter(left);
    this.clampFighter(right);
  }

  private clampFighter(fighter: FighterState): void {
    fighter.x = Math.max(ARENA_MIN_X, Math.min(ARENA_MAX_X, fighter.x));
  }

  private finishRound(): void {
    if (this.phase !== 'fight') return;
    let roundWinner: FighterIndex | null = null;
    if (this.fighters[0].health !== this.fighters[1].health) {
      roundWinner = this.fighters[0].health > this.fighters[1].health ? 0 : 1;
    }
    this.roundWinner = roundWinner;
    if (roundWinner !== null) this.fighters[roundWinner].roundWins += 1;

    // Result phases do not advance fighter state, so clear every transient combat
    // lock/timeline before entering round-over. This prevents Ultimate recovery,
    // capture locks or target state from freezing into round-over/match-over.
    this.pendingUltimateReleases = [];
    this.clearTransientCombatState(this.fighters[0]);
    this.clearTransientCombatState(this.fighters[1]);

    this.phase = 'round-over';
    this.roundOverFrames = ROUND_OVER_FRAMES;
    this.events.push({ type: 'round-end', winner: roundWinner });
  }

  private advanceAfterRound(): void {
    const matchWinner = this.fighters[0].roundWins >= 2 ? 0 : this.fighters[1].roundWins >= 2 ? 1 : null;
    if (matchWinner !== null) {
      this.phase = 'match-over';
      this.winner = matchWinner;
      this.events.push({ type: 'match-end', winner: matchWinner });
      return;
    }

    this.round += 1;
    this.roundWinner = null;
    this.projectiles = [];
    this.pendingUltimateReleases = [];
    this.roundTimerFrames = ROUND_TIME_FRAMES;
    for (const index of [0, 1] as const) {
      const fighter = this.fighters[index];
      fighter.x = START_X[index];
      fighter.y = 0;
      fighter.vx = 0;
      fighter.vy = 0;
      fighter.health = fighter.maxHealth;
      fighter.guard = fighter.maxGuard;
      fighter.guardRegenDelay = 0;
      fighter.guardBreakFrames = 0;
      fighter.grounded = true;
      fighter.crouching = false;
      fighter.blocking = false;
      fighter.chilledFrames = 0;
      fighter.projectileCooldown = 0;
      fighter.prevInput = copyInput(EMPTY_INPUT);
      fighter.superReady = fighter.superMeter >= fighter.maxSuper;
      this.clearTransientCombatState(fighter);
    }
    this.updateFacing();
    this.phase = 'fight';
    this.events.push({ type: 'round-start', round: this.round });
  }

  private saveInputs(inputs: readonly [InputFrame, InputFrame]): void {
    this.fighters[0].prevInput = copyInput(inputs[0]);
    this.fighters[1].prevInput = copyInput(inputs[1]);
  }
}
