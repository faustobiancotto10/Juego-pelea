import { DEFAULT_COMBAT_REGISTRY, type CombatRegistry } from '../data/combatRegistry.js';
import type { ProjectileContactDefinition, ProjectileDefinition } from '../data/projectiles.js';
import type { UltimateDefinition } from '../data/ultimates.js';
import { EMPTY_INPUT, type ClashSnapshot, type CombatAction, type CombatEvent, type CommandIntent, type Facing, type HitSource, type RegisteredFighterId, type FighterIndex, type FighterSnapshot, type InputFrame, type MatchSnapshot, type MatchPhase, type ProjectileSnapshot } from '../types.js';
import { getMoveHitWindows, type MoveDefinition } from './moves.js';
import { buildUltimateConfrontationVolume, findUltimateClashIntersection, type UltimateConfrontationProposal, type UltimateClashIntersection } from './ultimateArbitration.js';

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

interface ClashState extends ClashSnapshot {
  left: FighterIndex;
  right: FighterIndex;
}

interface FighterState extends FighterSnapshot {
  prevInput: InputFrame;
  currentMove: MoveDefinition | null;
  moveHasHit: boolean;
  moveEffectTriggered: boolean;
  moveHitLedger: Set<string>;
  ultimateFacing: Facing;
  pendingCommand: PendingCommand | null;
  downGraceSamples: number;
  ultimateReleaseSource: FighterIndex | null;
  ultimateSequenceStartX: number | null;
  jumpTakeoffDirection: -1 | 0 | 1;
}

interface ProjectileState extends ProjectileSnapshot {
  ttl: number;
  previousX: number;
  previousY: number;
  outboundContacts: Set<FighterIndex>;
  returnContacts: Set<FighterIndex>;
  lastContactTick: [number | null, number | null];
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
    jumpStartupFrames: 0,
    airborneTicks: 0,
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
    rangedAvailability: 'ready',
    rangedRecoveryFrames: 0,
    superMeter,
    maxSuper: MAX_SUPER,
    superReady: superMeter >= MAX_SUPER,
    ultimatePhase: 'idle',
    ultimatePhaseFrame: 0,
    ultimateConnected: false,
    ultimateTarget: null,
    ultimateEffectiveTick: null,
    ultimateProbe: null,
    captureAnchorX: null,
    clashRecoveryFrames: 0,
    dashKind: null,
    dashFrame: 0,
    landingRecoveryFrames: 0,
    pushGuardRecoveryFrames: 0,
    roundWins: 0,
    prevInput: copyInput(EMPTY_INPUT),
    currentMove: null,
    moveHasHit: false,
    moveEffectTriggered: false,
    moveHitLedger: new Set<string>(),
    ultimateFacing: index === 0 ? 1 : -1,
    capturedBy: null,
    pendingCommand: null,
    downGraceSamples: 0,
    ultimateReleaseSource: null,
    ultimateSequenceStartX: null,
    jumpTakeoffDirection: 0,
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
    jumpStartupFrames: f.jumpStartupFrames,
    airborneTicks: f.airborneTicks,
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
    rangedAvailability: f.rangedAvailability,
    rangedRecoveryFrames: f.rangedRecoveryFrames,
    superMeter: f.superMeter,
    maxSuper: f.maxSuper,
    superReady: f.superReady,
    ultimatePhase: f.ultimatePhase,
    ultimatePhaseFrame: f.ultimatePhaseFrame,
    ultimateConnected: f.ultimateConnected,
    ultimateTarget: f.ultimateTarget,
    ultimateEffectiveTick: f.ultimateEffectiveTick,
    ultimateProbe: f.ultimateProbe ? { ...f.ultimateProbe } : null,
    captureAnchorX: f.captureAnchorX,
    clashRecoveryFrames: f.clashRecoveryFrames,
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
  private clash: ClashState | null = null;
  private nextClashId = 1;

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
      clash: this.clash ? {
        id: this.clash.id,
        phase: this.clash.phase,
        launchTick: this.clash.launchTick,
        remainingLaunchTicks: this.clash.remainingLaunchTicks,
      } : null,
      winner: this.winner,
      roundWinner: this.roundWinner,
      fighters: [cloneFighter(this.fighters[0]), cloneFighter(this.fighters[1])],
      projectiles: this.projectiles.filter((p) => p.active).map((p) => ({
        id: p.id,
        owner: p.owner,
        kind: p.kind,
        visualKey: p.visualKey,
        x: p.x,
        y: p.y,
        vx: p.vx,
        vy: p.vy,
        active: p.active,
        phase: p.phase,
        phaseTick: p.phaseTick,
        age: p.age,
      })),
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

    const clashBufferOpen = this.clash?.phase === 'launch'
      && this.clash.remainingLaunchTicks <= COMMAND_BUFFER_FRAMES;
    if (this.clash === null || clashBufferOpen) this.captureCommands(inputs);
    else this.clearPendingActionCommands();

    if (this.hitstopFrames > 0) {
      this.hitstopFrames -= 1;
      this.saveInputs(inputs);
      return this.getSnapshot();
    }

    this.combatTick += 1;

    if (this.clash !== null) {
      this.advanceClashLaunch();
      this.roundTimerFrames = Math.max(0, this.roundTimerFrames - 1);
      const clashEnded = this.clash === null;
      const roundShouldEnd = this.fighters[0].health <= 0
        || this.fighters[1].health <= 0
        || this.roundTimerFrames <= 0;
      if (clashEnded && roundShouldEnd) this.finishRound();
      this.agePendingCommands();
      this.saveInputs(inputs);
      return this.getSnapshot();
    }

    this.updateFacing();

    for (const index of [0, 1] as const) {
      this.updateFighter(index, inputs[index]);
    }

    this.applyPendingUltimateReleases();
    this.resolvePushboxes();
    this.updateFacing();

    // Ordinary attacks/projectiles always get their shared-tick interruption
    // opportunity before an unconfirmed Ultimate proposal can Clash/capture.
    this.resolveMoveHits(0, 1, inputs[1]);
    this.resolveMoveHits(1, 0, inputs[0]);
    this.updateProjectiles(inputs);
    this.cancelInterruptedMoves();

    this.resolveUltimateArbitration();

    if (this.phase === 'fight') {
      this.roundTimerFrames = Math.max(0, this.roundTimerFrames - 1);
      const roundShouldEnd = this.fighters[0].health <= 0
        || this.fighters[1].health <= 0
        || this.roundTimerFrames <= 0;
      if (roundShouldEnd && this.clash === null && !this.hasActiveUltimateSequence()) this.finishRound();
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
      if (move.projectileKey) {
        const projectile = this.registry.getProjectile(move.projectileKey);
        const kind = projectile.kind ?? 'linear';
        const unavailable = kind === 'returnToOwner'
          ? fighter.rangedAvailability !== 'ready'
          : fighter.projectileCooldown > 0;
        if (unavailable) {
          fighter.pendingCommand = null;
          return false;
        }
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
      if (!fighter.grounded || fighter.jumpStartupFrames > 0) return false;
      fighter.pendingCommand = null;
      fighter.jumpStartupFrames = 2;
      fighter.airborneTicks = 0;
      fighter.jumpTakeoffDirection = command.direction.left === command.direction.right
        ? 0
        : command.direction.left ? -1 : 1;
      fighter.vx = 0;
      fighter.vy = 0;
      fighter.crouching = false;
      fighter.blocking = false;
      this.events.push({ type: 'jump-start', fighter: index });
      return true;
    }

    return false;
  }

  private updateFighter(index: FighterIndex, input: InputFrame): void {
    const fighter = this.fighters[index];
    const def = this.registry.getFighter(fighter.id);

    if (fighter.projectileCooldown > 0) fighter.projectileCooldown -= 1;
    if (fighter.rangedRecoveryFrames > 0) fighter.rangedRecoveryFrames -= 1;
    if (
      fighter.rangedAvailability === 'cooldown'
      && fighter.projectileCooldown <= 0
      && fighter.rangedRecoveryFrames <= 0
    ) {
      fighter.rangedAvailability = 'ready';
    }
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

    if (fighter.jumpStartupFrames > 0) {
      fighter.jumpStartupFrames -= 1;
      fighter.blocking = false;
      fighter.crouching = false;
      fighter.dashKind = null;
      fighter.dashFrame = 0;
      fighter.vx = 0;
      fighter.vy = 0;

      if (fighter.jumpStartupFrames === 0) {
        fighter.vx = fighter.jumpTakeoffDirection * def.walkSpeed;
        fighter.vy = def.jumpSpeed;
        fighter.grounded = false;
        fighter.jumpTakeoffDirection = 0;
        fighter.x += fighter.vx;
        this.integrateVertical(fighter, def.gravity);
        this.clampFighter(fighter);
        this.events.push({ type: 'takeoff', fighter: index });
      }
      return;
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

  private clearPendingActionCommands(): void {
    for (const fighter of this.fighters) {
      fighter.pendingCommand = null;
      fighter.downGraceSamples = 0;
    }
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

  private cancelJumpPreparation(fighter: FighterState): void {
    fighter.jumpStartupFrames = 0;
    fighter.jumpTakeoffDirection = 0;
    if (fighter.grounded) {
      fighter.vy = 0;
      fighter.airborneTicks = 0;
    }
  }

  private integrateVertical(fighter: FighterState, gravity: number): void {
    if (fighter.grounded && fighter.y === 0 && fighter.vy === 0) {
      fighter.airborneTicks = 0;
      return;
    }
    const wasGrounded = fighter.grounded;
    fighter.y += fighter.vy;
    fighter.vy -= gravity;
    if (fighter.y <= 0) {
      fighter.y = 0;
      fighter.vy = 0;
      fighter.grounded = true;
      fighter.airborneTicks = 0;
      if (!wasGrounded) {
        fighter.vx = 0;
        fighter.landingRecoveryFrames = fighter.clashRecoveryFrames > 0 ? 0 : 4;
        const index = this.fighters.indexOf(fighter) as FighterIndex;
        this.events.push({ type: 'land', fighter: index });
      }
    } else {
      fighter.grounded = false;
      fighter.airborneTicks += 1;
    }
  }

  private resolveMoveHits(attackerIndex: FighterIndex, defenderIndex: FighterIndex, defenderInput: InputFrame): void {
    const attacker = this.fighters[attackerIndex];
    const defender = this.fighters[defenderIndex];
    if (attacker.ultimatePhase !== 'idle' || defender.capturedBy !== null) return;
    const move = attacker.currentMove;
    if (!move) return;

    const windows = getMoveHitWindows(move);
    if (windows.length === 0) return;

    const defenderDef = this.registry.getFighter(defender.id);
    const hurtHalfWidth = defenderDef.width * 0.5;
    const hurtMinX = defender.x - hurtHalfWidth;
    const hurtMaxX = defender.x + hurtHalfWidth;
    const hurtTop = defender.crouching ? defenderDef.height * 0.66 : defenderDef.height;
    const hurtBottom = defender.y;

    for (const hitbox of windows) {
      const ledgerKey = `${hitbox.hitId}:${defenderIndex}`;
      if (attacker.moveHitLedger.has(ledgerKey)) continue;
      if (attacker.moveFrame < hitbox.start || attacker.moveFrame > hitbox.end) continue;

      const attackMinX = attacker.facing === 1
        ? attacker.x + hitbox.offsetX
        : attacker.x - hitbox.offsetX - hitbox.width;
      const attackMaxX = attackMinX + hitbox.width;
      const attackBottom = attacker.y + hitbox.bottom;
      const attackTop = attacker.y + hitbox.top;

      if (!intervalsOverlap(attackMinX, attackMaxX, hurtMinX, hurtMaxX)) continue;
      if (!intervalsOverlap(attackBottom, attackTop, hurtBottom, defender.y + hurtTop)) continue;
      if (this.isBackdashStrikeInvulnerable(defender)) continue;

      const blocked = this.canBlock(defender, defenderInput, hitbox.level);
      const source: HitSource = move.category === 'normal'
        ? 'normal'
        : move.category === 'ultimate'
          ? 'ultimate'
          : 'special';

      attacker.moveHitLedger.add(ledgerKey);
      attacker.moveHasHit = true;
      if (!blocked) attacker.moveContact = 'hit';
      else if (attacker.moveContact === 'none') attacker.moveContact = 'block';

      let actualDamage = 0;
      if (blocked) {
        actualDamage = this.applyDamage(attackerIndex, defenderIndex, hitbox.chipDamage, source, true);
        defender.blockstunFrames = hitbox.blockstun;
        defender.blocking = true;
        const blockKnockback = hitbox.blockKnockback ?? hitbox.knockback * 0.35;
        defender.vx = attacker.facing * blockKnockback;
        this.applyCornerBlockTransfer(attackerIndex, defenderIndex, hitbox.knockback);
        this.damageGuard(defenderIndex, hitbox.guardDamage);
      } else {
        actualDamage = this.applyDamage(attackerIndex, defenderIndex, hitbox.damage, source, false);
        this.cancelJumpPreparation(defender);
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
        moveId: move.id,
        hitId: hitbox.hitId,
      });
      return;
    }
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
      && defender.jumpStartupFrames === 0
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
    this.cancelJumpPreparation(defender);
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
    fighter.moveHitLedger.clear();
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
    fighter.moveHitLedger.clear();
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
    fighter.jumpStartupFrames = 0;
    fighter.jumpTakeoffDirection = 0;
    fighter.airborneTicks = 0;
    fighter.landingRecoveryFrames = 0;
    fighter.pushGuardRecoveryFrames = 0;
    fighter.pendingCommand = null;
    fighter.downGraceSamples = 0;
    fighter.ultimateReleaseSource = null;
    fighter.ultimatePhase = 'idle';
    fighter.ultimatePhaseFrame = 0;
    fighter.ultimateConnected = false;
    fighter.ultimateTarget = null;
    fighter.ultimateEffectiveTick = null;
    fighter.ultimateProbe = null;
    fighter.captureAnchorX = null;
    fighter.ultimateSequenceStartX = null;
    fighter.clashRecoveryFrames = 0;
    fighter.capturedBy = null;
    this.clearMove(fighter);
  }

  private triggerMoveEffect(index: FighterIndex, fighter: FighterState): void {
    const move = fighter.currentMove;
    if (!move || fighter.moveEffectTriggered || move.spawnProjectileFrame === undefined || !move.projectileKey) return;
    if (fighter.moveFrame < move.spawnProjectileFrame) return;

    const definition = this.registry.getProjectile(move.projectileKey);
    const kind = definition.kind ?? 'linear';
    if (this.projectiles.some((projectile) => projectile.active && projectile.owner === index && projectile.kind === definition.key)) {
      fighter.moveEffectTriggered = true;
      if (kind === 'linear') {
        fighter.projectileCooldown = Math.max(fighter.projectileCooldown, definition.cooldown);
        fighter.rangedRecoveryFrames = Math.max(fighter.rangedRecoveryFrames, definition.cooldown);
        fighter.rangedAvailability = 'cooldown';
      }
      return;
    }

    const x = fighter.x + fighter.facing * definition.spawnOffsetX;
    const y = fighter.y + definition.spawnOffsetY;
    const projectile: ProjectileState = {
      id: this.nextProjectileId++,
      owner: index,
      kind: definition.key,
      visualKey: definition.visualKey ?? definition.key,
      x,
      y,
      vx: fighter.facing * definition.speed,
      vy: 0,
      active: true,
      phase: 'outbound',
      phaseTick: 0,
      age: 0,
      ttl: definition.ttl,
      previousX: x,
      previousY: y,
      outboundContacts: new Set<FighterIndex>(),
      returnContacts: new Set<FighterIndex>(),
      lastContactTick: [null, null],
    };
    this.projectiles.push(projectile);

    if (kind === 'returnToOwner') {
      fighter.projectileCooldown = 0;
      fighter.rangedRecoveryFrames = 0;
      fighter.rangedAvailability = 'inFlight';
    } else {
      fighter.projectileCooldown = definition.cooldown;
      fighter.rangedRecoveryFrames = definition.cooldown;
      fighter.rangedAvailability = definition.cooldown > 0 ? 'cooldown' : 'ready';
    }

    fighter.moveEffectTriggered = true;
    this.events.push({ type: 'projectile', owner: index, projectileId: projectile.id });
  }

  private projectileKind(definition: ProjectileDefinition): 'linear' | 'returnToOwner' {
    return definition.kind ?? 'linear';
  }

  private startReturningRearm(owner: FighterIndex, definition: ProjectileDefinition): void {
    const fighter = this.fighters[owner];
    const rearm = definition.returnConfig?.rearmTicks ?? definition.cooldown;
    fighter.projectileCooldown = rearm;
    fighter.rangedRecoveryFrames = rearm;
    fighter.rangedAvailability = rearm > 0 ? 'cooldown' : 'ready';
  }

  private cancelOwnedReturningProjectile(owner: FighterIndex, startRearm = true): void {
    for (const projectile of this.projectiles) {
      if (!projectile.active || projectile.owner !== owner) continue;
      const definition = this.registry.getProjectile(projectile.kind);
      if (this.projectileKind(definition) !== 'returnToOwner') continue;
      projectile.active = false;
      if (startRearm) this.startReturningRearm(owner, definition);
      else {
        const fighter = this.fighters[owner];
        fighter.projectileCooldown = 0;
        fighter.rangedRecoveryFrames = 0;
        fighter.rangedAvailability = 'ready';
      }
    }
  }

  private clearEncounterProjectiles(startReturningRearm: boolean): void {
    const returningOwners = new Set<FighterIndex>();
    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;
      const definition = this.registry.getProjectile(projectile.kind);
      if (this.projectileKind(definition) === 'returnToOwner') returningOwners.add(projectile.owner);
      projectile.active = false;
    }
    if (startReturningRearm) {
      for (const owner of returningOwners) {
        const projectile = this.projectiles.find((candidate) => candidate.owner === owner);
        if (!projectile) continue;
        this.startReturningRearm(owner, this.registry.getProjectile(projectile.kind));
      }
    } else {
      for (const owner of [0, 1] as const) {
        const fighter = this.fighters[owner];
        fighter.projectileCooldown = 0;
        fighter.rangedRecoveryFrames = 0;
        fighter.rangedAvailability = 'ready';
      }
    }
    this.projectiles = [];
  }

  private clearReturningProjectilesForRoundEnd(): void {
    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;
      const definition = this.registry.getProjectile(projectile.kind);
      if (this.projectileKind(definition) !== 'returnToOwner') continue;
      projectile.active = false;
      const owner = this.fighters[projectile.owner];
      owner.projectileCooldown = 0;
      owner.rangedRecoveryFrames = 0;
      owner.rangedAvailability = 'ready';
    }
    this.projectiles = this.projectiles.filter((projectile) => projectile.active);
  }

  private cancelReturningProjectilesFromCurrentEvents(): void {
    for (const event of this.events) {
      if (event.type === 'hit' && !event.blocked) {
        this.cancelOwnedReturningProjectile(event.defender, true);
      } else if (event.type === 'guard-break') {
        this.cancelOwnedReturningProjectile(event.defender, true);
      }
    }
  }

  private segmentAabbEntryT(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
  ): number | null {
    let tMin = 0;
    let tMax = 1;
    const axes: readonly [number, number, number, number][] = [
      [x0, x1 - x0, minX, maxX],
      [y0, y1 - y0, minY, maxY],
    ];
    for (const [origin, delta, min, max] of axes) {
      if (Math.abs(delta) < 1e-9) {
        if (origin < min || origin > max) return null;
        continue;
      }
      const t1 = (min - origin) / delta;
      const t2 = (max - origin) / delta;
      const entry = Math.min(t1, t2);
      const exit = Math.max(t1, t2);
      tMin = Math.max(tMin, entry);
      tMax = Math.min(tMax, exit);
      if (tMax < tMin) return null;
    }
    return tMax >= 0 && tMin <= 1 ? Math.max(0, tMin) : null;
  }

  private segmentCircleEntryT(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    cx: number,
    cy: number,
    radius: number,
  ): number | null {
    const fx = x0 - cx;
    const fy = y0 - cy;
    if (fx * fx + fy * fy <= radius * radius) return 0;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const a = dx * dx + dy * dy;
    if (a <= 1e-9) return null;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - radius * radius;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return null;
    const root = Math.sqrt(discriminant);
    const first = (-b - root) / (2 * a);
    const second = (-b + root) / (2 * a);
    if (first >= 0 && first <= 1) return first;
    if (second >= 0 && second <= 1) return second;
    return null;
  }

  private projectileContactT(
    projectile: ProjectileState,
    defenderIndex: FighterIndex,
    definition: ProjectileDefinition,
  ): number | null {
    const defender = this.fighters[defenderIndex];
    if (
      defender.capturedBy !== null
      || defender.ultimatePhase === 'sequence'
      || this.fighters[projectile.owner].ultimatePhase === 'sequence'
    ) return null;

    const defenderDef = this.registry.getFighter(defender.id);
    const half = defenderDef.width * 0.5;
    const hurtTop = defender.y + (defender.crouching ? defenderDef.height * 0.66 : defenderDef.height);
    return this.segmentAabbEntryT(
      projectile.previousX,
      projectile.previousY,
      projectile.x,
      projectile.y,
      defender.x - half - definition.collisionHalfWidth,
      defender.x + half + definition.collisionHalfWidth,
      defender.y + 18 - definition.collisionHalfHeight,
      hurtTop + 10 + definition.collisionHalfHeight,
    );
  }

  private normalizeProjectileRuntimeState(
    projectile: ProjectileState,
    definition: ProjectileDefinition,
  ): void {
    // V0.5 tests/harnesses injected the old minimal ProjectileState directly.
    // Keep that bounded harness contract while all authored V0.6 spawns publish
    // the richer state immediately.
    projectile.visualKey ??= definition.visualKey ?? definition.key;
    projectile.vy ??= 0;
    projectile.phase ??= 'outbound';
    projectile.phaseTick ??= 0;
    projectile.age ??= 0;
    projectile.previousX ??= projectile.x;
    projectile.previousY ??= projectile.y;
    projectile.outboundContacts ??= new Set<FighterIndex>();
    projectile.returnContacts ??= new Set<FighterIndex>();
    projectile.lastContactTick ??= [null, null];
  }

  private advanceLinearProjectile(projectile: ProjectileState): void {
    projectile.previousX = projectile.x;
    projectile.previousY = projectile.y;
    projectile.x += projectile.vx;
    projectile.y += projectile.vy;
    projectile.phase = 'outbound';
    projectile.phaseTick += 1;
    projectile.age += 1;
    projectile.ttl -= 1;
    if (
      projectile.ttl <= 0
      || projectile.x < ARENA_MIN_X - 80
      || projectile.x > ARENA_MAX_X + 80
    ) projectile.active = false;
  }

  private advanceReturningProjectile(
    projectile: ProjectileState,
    definition: ProjectileDefinition,
  ): { movementLeg: 'outbound' | 'return' | null; catchT: number | null; expireAfterContact: boolean } {
    const config = definition.returnConfig!;
    projectile.previousX = projectile.x;
    projectile.previousY = projectile.y;
    projectile.age += 1;

    if (projectile.phase === 'turn') {
      projectile.vx = 0;
      projectile.vy = 0;
      projectile.phaseTick += 1;
      if (projectile.phaseTick >= config.turnTicks) {
        projectile.phase = 'return';
        projectile.phaseTick = 0;
      }
      return { movementLeg: null, catchT: null, expireAfterContact: false };
    }

    if (projectile.phase === 'outbound') {
      const nextX = projectile.x + projectile.vx;
      const minX = ARENA_MIN_X - definition.collisionHalfWidth;
      const maxX = ARENA_MAX_X + definition.collisionHalfWidth;
      projectile.x = Math.max(minX, Math.min(maxX, nextX));
      projectile.phaseTick += 1;
      const hitWall = projectile.x !== nextX;
      if (hitWall || projectile.phaseTick >= config.outboundTicks) {
        projectile.phase = 'turn';
        projectile.phaseTick = 0;
        projectile.vx = 0;
        this.events.push({ type: 'projectile-turn', owner: projectile.owner, projectileId: projectile.id });
      }
      return { movementLeg: 'outbound', catchT: null, expireAfterContact: false };
    }

    const owner = this.fighters[projectile.owner];
    const anchorX = owner.x + owner.facing * 20;
    const anchorY = owner.y + 68;
    const startDistance = Math.hypot(anchorX - projectile.x, anchorY - projectile.y);
    if (startDistance <= config.catchRadius) {
      return { movementLeg: null, catchT: 0, expireAfterContact: false };
    }

    const dx = anchorX - projectile.x;
    const dy = anchorY - projectile.y;
    const distance = Math.hypot(dx, dy);
    const travel = Math.min(config.returnSpeed, distance);
    const ux = distance > 0 ? dx / distance : 0;
    const uy = distance > 0 ? dy / distance : 0;
    projectile.x += ux * travel;
    projectile.y += uy * travel;
    projectile.vx = ux * config.returnSpeed;
    projectile.vy = uy * config.returnSpeed;
    projectile.phaseTick += 1;

    const catchT = this.segmentCircleEntryT(
      projectile.previousX,
      projectile.previousY,
      projectile.x,
      projectile.y,
      anchorX,
      anchorY,
      config.catchRadius,
    );
    return {
      movementLeg: 'return',
      catchT,
      expireAfterContact: projectile.phaseTick >= config.maxReturnTicks,
    };
  }

  private applyProjectileContact(
    projectile: ProjectileState,
    defenderIndex: FighterIndex,
    definition: ProjectileDefinition,
    contact: ProjectileContactDefinition,
    defenderInput: InputFrame,
    leg: 'outbound' | 'return',
  ): void {
    const defender = this.fighters[defenderIndex];
    const blocked = this.canBlock(defender, defenderInput);
    const requestedDamage = blocked ? contact.chipDamage : contact.damage;
    const actualDamage = this.applyDamage(projectile.owner, defenderIndex, requestedDamage, 'projectile', blocked);
    const travelDirection = Math.sign(projectile.x - projectile.previousX) || Math.sign(projectile.vx) || 1;

    if (blocked) {
      defender.blockstunFrames = contact.blockstun;
      defender.blocking = true;
      defender.vx = travelDirection * contact.blockKnockback;
      this.applyCornerBlockTransfer(projectile.owner, defenderIndex, definition.cornerTransferKnockback);
      this.damageGuard(defenderIndex, contact.guardDamage);
    } else {
      this.cancelJumpPreparation(defender);
      defender.stunFrames = contact.hitstun;
      defender.blocking = false;
      defender.vx = travelDirection * contact.knockback;
    }

    projectile.lastContactTick[defenderIndex] = this.combatTick;
    if (leg === 'outbound') projectile.outboundContacts.add(defenderIndex);
    else projectile.returnContacts.add(defenderIndex);

    this.hitstopFrames = Math.max(this.hitstopFrames, contact.hitstop);
    this.events.push({
      type: 'hit',
      attacker: projectile.owner,
      defender: defenderIndex,
      blocked,
      damage: actualDamage,
      strong: contact.strong,
      source: 'projectile',
      finisher: defender.health <= 0,
      projectileId: projectile.id,
      leg,
    });
  }

  private finishReturningProjectile(
    projectile: ProjectileState,
    definition: ProjectileDefinition,
    caught: boolean,
  ): void {
    projectile.active = false;
    this.startReturningRearm(projectile.owner, definition);
    if (caught) {
      this.events.push({ type: 'projectile-catch', owner: projectile.owner, projectileId: projectile.id });
    }
  }

  private updateProjectiles(inputs: readonly [InputFrame, InputFrame]): void {
    this.cancelReturningProjectilesFromCurrentEvents();

    const movement = new Map<number, {
      leg: 'outbound' | 'return' | null;
      catchT: number | null;
      expireAfterContact: boolean;
    }>();

    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;
      const definition = this.registry.getProjectile(projectile.kind);
      this.normalizeProjectileRuntimeState(projectile, definition);
      if (this.projectileKind(definition) === 'returnToOwner') {
        const result = this.advanceReturningProjectile(projectile, definition);
        movement.set(projectile.id, { leg: result.movementLeg, catchT: result.catchT, expireAfterContact: result.expireAfterContact });
      } else {
        this.advanceLinearProjectile(projectile);
        movement.set(projectile.id, { leg: 'outbound', catchT: null, expireAfterContact: false });
      }
    }

    // Resolve all linear contacts first from the common post-movement view.
    const linearContacts: Array<{ projectile: ProjectileState; defender: FighterIndex; t: number }> = [];
    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;
      const definition = this.registry.getProjectile(projectile.kind);
      if (this.projectileKind(definition) !== 'linear') continue;
      const defender: FighterIndex = projectile.owner === 0 ? 1 : 0;
      const t = this.projectileContactT(projectile, defender, definition);
      if (t !== null) linearContacts.push({ projectile, defender, t });
    }

    for (const proposal of linearContacts) {
      if (!proposal.projectile.active) continue;
      const definition = this.registry.getProjectile(proposal.projectile.kind);
      this.applyProjectileContact(
        proposal.projectile,
        proposal.defender,
        definition,
        definition,
        inputs[proposal.defender],
        'outbound',
      );
      proposal.projectile.active = false;
    }

    // A clean linear-projectile consequence cancels an owner's returning ball
    // before that ball can rescue them later in the same tick.
    this.cancelReturningProjectilesFromCurrentEvents();

    // Collect returning contacts before applying any of them. This preserves
    // the explicit two-returning-ball trade exception.
    const returningContacts: Array<{
      projectile: ProjectileState;
      defender: FighterIndex;
      leg: 'outbound' | 'return';
      t: number;
      catchT: number | null;
    }> = [];

    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;
      const definition = this.registry.getProjectile(projectile.kind);
      if (this.projectileKind(definition) !== 'returnToOwner') continue;
      const motion = movement.get(projectile.id);
      const leg = motion?.leg;
      if (leg !== 'outbound' && leg !== 'return') continue;

      const defender: FighterIndex = projectile.owner === 0 ? 1 : 0;
      const ledger = leg === 'outbound' ? projectile.outboundContacts : projectile.returnContacts;
      if (ledger.has(defender)) continue;

      const config = definition.returnConfig!;
      const lastContactTick = projectile.lastContactTick[defender];
      if (
        leg === 'return'
        && lastContactTick !== null
        && this.combatTick - lastContactTick < config.minimumTicksBetweenLegHits
      ) continue;

      const t = this.projectileContactT(projectile, defender, definition);
      if (t === null) continue;
      const catchT = motion?.catchT ?? null;
      if (leg === 'return' && catchT !== null && catchT <= t) continue;
      returningContacts.push({ projectile, defender, leg, t, catchT });
    }

    for (const proposal of returningContacts) {
      if (!proposal.projectile.active) continue;
      const definition = this.registry.getProjectile(proposal.projectile.kind);
      const contact = proposal.leg === 'return' ? definition.returnConfig!.returnHit : definition;
      this.applyProjectileContact(
        proposal.projectile,
        proposal.defender,
        definition,
        contact,
        inputs[proposal.defender],
        proposal.leg,
      );
    }

    // Returning contacts can clean-hit both opposing owners on the same tick;
    // both contacts above land first, then cancellation/rearm is symmetric.
    this.cancelReturningProjectilesFromCurrentEvents();

    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;
      const definition = this.registry.getProjectile(projectile.kind);
      if (this.projectileKind(definition) !== 'returnToOwner') continue;
      const motion = movement.get(projectile.id);
      if (!motion) continue;
      if (motion.catchT !== null || motion.expireAfterContact) {
        this.finishReturningProjectile(projectile, definition, motion.catchT !== null);
      }
    }

    this.projectiles = this.projectiles.filter((projectile) => projectile.active);
  }

  private startUltimate(index: FighterIndex): void {
    this.cancelOwnedReturningProjectile(index, true);
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
    fighter.ultimateEffectiveTick = null;
    fighter.ultimateProbe = null;
    fighter.captureAnchorX = null;
    fighter.ultimateSequenceStartX = null;
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
        if (definition.kind === 'capCapture') this.initializeCapProbe(index, definition);
      }
      return;
    }

    if (fighter.ultimatePhase === 'capture') {
      // Capture movement/pull is only proposed here. Common arbitration runs
      // after ordinary strike/projectile contacts for both slots.
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

  private initializeCapProbe(index: FighterIndex, definition: UltimateDefinition): void {
    const fighter = this.fighters[index];
    const targetIndex: FighterIndex = index === 0 ? 1 : 0;
    const targetDefinition = this.registry.getFighter(this.fighters[targetIndex].id);
    const head = targetDefinition.captureHead;
    if (!head) throw new Error(`Missing captureHead for ${targetDefinition.id}`);
    const spawnOffset = definition.probeSpawnOffsetX ?? 0;
    const x = fighter.x + fighter.ultimateFacing * spawnOffset;
    fighter.ultimateProbe = {
      x,
      y: head.standY,
      previousX: x,
      previousY: head.standY,
      halfWidth: definition.probeHalfWidth ?? 0,
      halfHeight: definition.probeHalfHeight ?? 0,
      visualKey: definition.probeVisualKey ?? definition.visualKey,
    };
  }

  private capProbePlan(
    fighter: FighterState,
    definition: UltimateDefinition,
  ): {
    previousX: number;
    nextX: number;
    y: number;
    halfWidth: number;
    halfHeight: number;
    terminatesAtWall: boolean;
  } {
    const probe = fighter.ultimateProbe;
    if (!probe) throw new Error(`Missing cap probe for ${fighter.id}`);
    const speed = definition.probeSpeed ?? 0;
    const rawNextX = probe.x + fighter.ultimateFacing * speed;
    const minX = ARENA_MIN_X - probe.halfWidth;
    const maxX = ARENA_MAX_X + probe.halfWidth;
    const nextX = Math.max(minX, Math.min(maxX, rawNextX));
    return {
      previousX: probe.x,
      nextX,
      y: probe.y,
      halfWidth: probe.halfWidth,
      halfHeight: probe.halfHeight,
      terminatesAtWall: nextX !== rawNextX,
    };
  }

  private boundedX(x: number): number {
    return Math.max(ARENA_MIN_X, Math.min(ARENA_MAX_X, x));
  }

  private collectUltimateProposals(): readonly [UltimateConfrontationProposal | null, UltimateConfrontationProposal | null] {
    const plannedCenters: [number, number] = [this.fighters[0].x, this.fighters[1].x];

    for (const index of [0, 1] as const) {
      const fighter = this.fighters[index];
      if (fighter.ultimatePhase !== 'capture' || fighter.currentMove === null) continue;
      if (fighter.ultimateEffectiveTick === null) fighter.ultimateEffectiveTick = this.combatTick;
      const definition = this.activeUltimateDefinition(fighter);
      if (definition.kind === 'dashCapture') {
        plannedCenters[index] = this.boundedX(
          fighter.x + fighter.ultimateFacing * (definition.dashSpeed ?? 0),
        );
      } else if (definition.kind !== 'suctionCapture' && definition.kind !== 'capCapture') {
        const exhaustive: never = definition.kind;
        throw new Error(`Unsupported Ultimate proposal kind ${String(exhaustive)}`);
      }
    }

    const build = (index: FighterIndex): UltimateConfrontationProposal | null => {
      const fighter = this.fighters[index];
      if (
        fighter.ultimatePhase !== 'capture'
        || fighter.currentMove === null
        || fighter.ultimateEffectiveTick === null
        || fighter.health <= 0
        || fighter.stunFrames > 0
        || fighter.guardBreakFrames > 0
        || fighter.capturedBy !== null
        || !fighter.grounded
        || fighter.superMeter > 0
      ) return null;

      const targetIndex: FighterIndex = index === 0 ? 1 : 0;
      const target = this.fighters[targetIndex];
      const definition = this.activeUltimateDefinition(fighter);
      const plannedX = plannedCenters[index];
      const targetPlannedX = plannedCenters[targetIndex];
      const capProbe = definition.kind === 'capCapture'
        ? this.capProbePlan(fighter, definition)
        : null;
      const confrontation = buildUltimateConfrontationVolume(
        definition,
        fighter.x,
        plannedX,
        fighter.y,
        fighter.ultimateFacing,
        capProbe,
      );

      let wouldCapture = false;
      let proposedTargetX: number | null = null;
      const verticalDistance = Math.abs(target.y - fighter.y);

      if (definition.kind === 'dashCapture') {
        const targetPathMin = Math.min(target.x, targetPlannedX);
        const targetPathMax = Math.max(target.x, targetPlannedX);
        const targetStartedForward = (target.x - fighter.x) * fighter.ultimateFacing >= 0;
        const sweptHorizontal = intervalsOverlap(
          confrontation.minX,
          confrontation.maxX,
          targetPathMin,
          targetPathMax,
        );
        wouldCapture = targetStartedForward
          && sweptHorizontal
          && verticalDistance <= definition.captureVertical;
      } else if (definition.kind === 'suctionCapture') {
        const suctionRange = definition.suctionRange ?? 0;
        const suctionSpeed = definition.suctionSpeed ?? 0;
        const captureDistance = definition.captureDistance ?? definition.captureReach;
        const signedDistance = (targetPlannedX - fighter.x) * fighter.ultimateFacing;
        const inField = signedDistance > 0
          && signedDistance <= suctionRange
          && verticalDistance <= definition.captureVertical;
        if (inField) {
          const delta = fighter.x - targetPlannedX;
          const pull = Math.sign(delta) * Math.min(Math.abs(delta), suctionSpeed);
          proposedTargetX = this.boundedX(targetPlannedX + pull);
          wouldCapture = Math.abs(proposedTargetX - fighter.x) <= captureDistance;
        }
      } else if (definition.kind === 'capCapture') {
        const targetDefinition = this.registry.getFighter(target.id);
        const head = targetDefinition.captureHead;
        if (!head) throw new Error(`Missing captureHead for ${targetDefinition.id}`);
        const front = (target.x - fighter.x) * fighter.ultimateFacing >= 0;
        const headY = target.y + (target.crouching ? head.crouchY : head.standY);
        const contactT = this.segmentAabbEntryT(
          capProbe!.previousX,
          capProbe!.y,
          capProbe!.nextX,
          capProbe!.y,
          target.x - head.halfWidth - capProbe!.halfWidth,
          target.x + head.halfWidth + capProbe!.halfWidth,
          headY - head.halfHeight - capProbe!.halfHeight,
          headY + head.halfHeight + capProbe!.halfHeight,
        );
        wouldCapture = front && contactT !== null;
      } else {
        const exhaustive: never = definition.kind;
        throw new Error(`Unsupported Ultimate proposal kind ${String(exhaustive)}`);
      }

      return {
        owner: index,
        target: targetIndex,
        definition,
        effectiveTick: fighter.ultimateEffectiveTick,
        phaseFrame: fighter.ultimatePhaseFrame,
        currentX: fighter.x,
        currentY: fighter.y,
        plannedX,
        targetCurrentX: target.x,
        targetPlannedX,
        facing: fighter.ultimateFacing,
        confrontation,
        wouldCapture,
        proposedTargetX,
        capProbe,
      };
    };

    return [build(0), build(1)];
  }

  private resolveUltimateArbitration(): void {
    const proposals = this.collectUltimateProposals();
    const first = proposals[0];
    const second = proposals[1];

    if (first && second) {
      const clashPoint = findUltimateClashIntersection(first, second, this.combatTick);
      if (clashPoint) {
        this.acceptUltimateClash(clashPoint);
        return;
      }
    }

    const captures = proposals.filter(
      (proposal): proposal is UltimateConfrontationProposal => proposal !== null && proposal.wouldCapture,
    );

    if (captures.length === 2) {
      const a = captures[0]!;
      const b = captures[1]!;
      if (a.effectiveTick === b.effectiveTick) {
        // Exact mutual late tie: symmetric committed whiff, never slot priority.
        this.commitUltimateCasterPlans(proposals);
        this.enterUltimateWhiffRecovery(a.owner);
        this.enterUltimateWhiffRecovery(b.owner);
        return;
      }
      const winner = a.effectiveTick < b.effectiveTick ? a : b;
      this.acceptUltimateCapture(winner);
      return;
    }

    if (captures.length === 1) {
      this.acceptUltimateCapture(captures[0]!);
      return;
    }

    this.commitUltimateMotions(proposals);

    for (const proposal of proposals) {
      if (!proposal) continue;
      const fighter = this.fighters[proposal.owner];
      if (
        fighter.ultimatePhase === 'capture'
        && (
          fighter.ultimatePhaseFrame >= proposal.definition.captureFrames
          || proposal.capProbe?.terminatesAtWall === true
        )
      ) {
        this.enterUltimateWhiffRecovery(proposal.owner);
      }
    }
  }

  private commitUltimateCasterPlans(
    proposals: readonly [UltimateConfrontationProposal | null, UltimateConfrontationProposal | null],
  ): void {
    const finalX: [number, number] = [this.fighters[0].x, this.fighters[1].x];
    for (const proposal of proposals) {
      if (proposal) finalX[proposal.owner] = proposal.plannedX;
    }
    this.fighters[0].x = this.boundedX(finalX[0]);
    this.fighters[1].x = this.boundedX(finalX[1]);
  }

  private commitUltimateMotions(
    proposals: readonly [UltimateConfrontationProposal | null, UltimateConfrontationProposal | null],
  ): void {
    const finalX: [number, number] = [this.fighters[0].x, this.fighters[1].x];

    for (const proposal of proposals) {
      if (proposal) finalX[proposal.owner] = proposal.plannedX;
    }
    for (const proposal of proposals) {
      if (proposal?.proposedTargetX !== null && proposal?.proposedTargetX !== undefined) {
        finalX[proposal.target] = proposal.proposedTargetX;
      }
    }

    this.fighters[0].x = this.boundedX(finalX[0]);
    this.fighters[1].x = this.boundedX(finalX[1]);

    for (const proposal of proposals) {
      if (!proposal?.capProbe) continue;
      const probe = this.fighters[proposal.owner].ultimateProbe;
      if (!probe) continue;
      probe.previousX = probe.x;
      probe.previousY = probe.y;
      probe.x = proposal.capProbe.nextX;
    }
  }

  private acceptUltimateCapture(proposal: UltimateConfrontationProposal): void {
    const attacker = this.fighters[proposal.owner];
    const defender = this.fighters[proposal.target];

    attacker.x = this.boundedX(proposal.plannedX);
    defender.x = this.boundedX(proposal.proposedTargetX ?? proposal.targetPlannedX);
    if (proposal.capProbe && attacker.ultimateProbe) {
      attacker.ultimateProbe.previousX = attacker.ultimateProbe.x;
      attacker.ultimateProbe.previousY = attacker.ultimateProbe.y;
      attacker.ultimateProbe.x = proposal.capProbe.nextX;
    }
    this.beginUltimateSequence(proposal.owner, proposal.target);
  }

  private acceptUltimateClash(point: UltimateClashIntersection): void {
    const fighter0 = this.fighters[0];
    const fighter1 = this.fighters[1];
    const left: FighterIndex = fighter0.x < fighter1.x
      ? 0
      : fighter1.x < fighter0.x
        ? 1
        : fighter0.ultimateFacing === 1 ? 0 : 1;
    const right: FighterIndex = left === 0 ? 1 : 0;

    this.clearEncounterProjectiles(true);
    this.pendingUltimateReleases = [];

    for (const index of [0, 1] as const) {
      const fighter = this.fighters[index];
      fighter.blocking = false;
      fighter.crouching = false;
      fighter.stunFrames = 0;
      fighter.blockstunFrames = 0;
      fighter.guardBreakFrames = 0;
      fighter.dashKind = null;
      fighter.dashFrame = 0;
      fighter.jumpStartupFrames = 0;
      fighter.jumpTakeoffDirection = 0;
      fighter.airborneTicks = 0;
      fighter.landingRecoveryFrames = 0;
      fighter.pushGuardRecoveryFrames = 0;
      fighter.pendingCommand = null;
      fighter.downGraceSamples = 0;
      fighter.ultimateReleaseSource = null;
      fighter.ultimatePhase = 'idle';
      fighter.ultimatePhaseFrame = 0;
      fighter.ultimateConnected = false;
      fighter.ultimateTarget = null;
      fighter.ultimateEffectiveTick = null;
      fighter.ultimateProbe = null;
      fighter.captureAnchorX = null;
      fighter.ultimateSequenceStartX = null;
      fighter.capturedBy = null;
      fighter.superMeter = 0;
      fighter.superReady = false;
      fighter.clashRecoveryFrames = 30;
      this.clearMove(fighter);
    }

    this.establishClashBaseSeparation(left, right, point.x);

    const leftFighter = this.fighters[left];
    const rightFighter = this.fighters[right];
    leftFighter.vx = -16;
    rightFighter.vx = 16;
    leftFighter.vy = 8;
    rightFighter.vy = 8;
    leftFighter.grounded = false;
    rightFighter.grounded = false;

    const clashId = this.nextClashId++;
    this.clash = {
      id: clashId,
      phase: 'freeze',
      launchTick: null,
      remainingLaunchTicks: 30,
      left,
      right,
    };
    this.hitstopFrames = 12;
    this.events.push({
      type: 'ultimate-clash',
      clashId,
      fighters: [0, 1],
      x: point.x,
      y: point.y,
    });
  }

  private establishClashBaseSeparation(
    leftIndex: FighterIndex,
    rightIndex: FighterIndex,
    midpoint: number,
  ): void {
    const left = this.fighters[leftIndex];
    const right = this.fighters[rightIndex];
    if (right.x - left.x >= 160) return;

    let leftX = this.boundedX(midpoint - 80);
    let rightX = this.boundedX(midpoint + 80);

    if (rightX - leftX < 160) {
      if (leftX <= ARENA_MIN_X) rightX = this.boundedX(leftX + 160);
      if (rightX >= ARENA_MAX_X) leftX = this.boundedX(rightX - 160);
    }

    left.x = leftX;
    right.x = rightX;
  }

  private advanceClashLaunch(): void {
    const clash = this.clash;
    if (!clash) return;

    if (clash.phase === 'freeze') {
      clash.phase = 'launch';
      clash.launchTick = this.combatTick;
    }

    for (const index of [0, 1] as const) {
      const fighter = this.fighters[index];
      const definition = this.registry.getFighter(fighter.id);

      if (fighter.projectileCooldown > 0) fighter.projectileCooldown -= 1;
      if (fighter.rangedRecoveryFrames > 0) fighter.rangedRecoveryFrames -= 1;
      if (
        fighter.rangedAvailability === 'cooldown'
        && fighter.projectileCooldown <= 0
        && fighter.rangedRecoveryFrames <= 0
      ) {
        fighter.rangedAvailability = 'ready';
      }
      if (fighter.chilledFrames > 0) fighter.chilledFrames -= 1;
      this.updateGuard(fighter);

      fighter.x = this.boundedX(fighter.x + fighter.vx);
      fighter.vx *= 0.90;

      const wasGrounded = fighter.grounded;
      if (!fighter.grounded || fighter.y !== 0 || fighter.vy !== 0) {
        fighter.y += fighter.vy;
        fighter.vy -= definition.gravity;
        if (fighter.y <= 0) {
          fighter.y = 0;
          fighter.vy = 0;
          fighter.grounded = true;
          if (!wasGrounded) this.events.push({ type: 'land', fighter: index });
        } else {
          fighter.grounded = false;
        }
      }
    }

    clash.remainingLaunchTicks -= 1;
    const remaining = Math.max(0, clash.remainingLaunchTicks);
    this.fighters[0].clashRecoveryFrames = remaining;
    this.fighters[1].clashRecoveryFrames = remaining;

    if (remaining > 0) return;

    for (const fighter of this.fighters) {
      fighter.vx = 0;
      fighter.vy = 0;
      fighter.landingRecoveryFrames = 0;
      fighter.clashRecoveryFrames = 0;
      if (fighter.y <= 0) {
        fighter.y = 0;
        fighter.grounded = true;
      }
    }
    this.clash = null;
  }


  private beginUltimateSequence(attackerIndex: FighterIndex, defenderIndex: FighterIndex): void {
    const attacker = this.fighters[attackerIndex];
    const defender = this.fighters[defenderIndex];
    const definition = this.activeUltimateDefinition(attacker);

    attacker.ultimatePhase = 'sequence';
    attacker.ultimatePhaseFrame = 0;
    attacker.ultimateConnected = true;
    attacker.ultimateTarget = defenderIndex;
    attacker.ultimateSequenceStartX = attacker.x;
    if (definition.kind === 'capCapture') {
      attacker.captureAnchorX = defender.x;
      attacker.ultimateProbe = null;
    }

    // Confirmed sequence owns the encounter. Remove ordinary projectiles so
    // neither participant receives ambiguous off-screen assistance.
    this.clearEncounterProjectiles(true);
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
    defender.moveHitLedger.clear();
    defender.comboCount = 0;
    defender.dashKind = null;
    defender.dashFrame = 0;
    defender.jumpStartupFrames = 0;
    defender.jumpTakeoffDirection = 0;
    defender.airborneTicks = 0;
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
    defender.ultimateEffectiveTick = null;
    defender.ultimateProbe = null;
    defender.captureAnchorX = null;
    defender.ultimateSequenceStartX = null;
    defender.clashRecoveryFrames = 0;
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

    if (definition.kind === 'capCapture') {
      const anchorX = attacker.captureAnchorX ?? defender.x;
      defender.x = this.boundedX(anchorX);
      const approach = definition.sequenceApproach;
      if (approach && attacker.ultimatePhaseFrame >= approach.startFrame) {
        const startX = attacker.ultimateSequenceStartX ?? attacker.x;
        const signedDistance = (anchorX - startX) * attacker.ultimateFacing;
        const endX = signedDistance <= approach.standOff
          ? startX
          : this.boundedX(anchorX - attacker.ultimateFacing * approach.standOff);
        const span = Math.max(1, approach.endFrame - approach.startFrame);
        const t = Math.max(0, Math.min(1, (attacker.ultimatePhaseFrame - approach.startFrame) / span));
        attacker.x = startX + (endX - startX) * t;
      }
    } else {
      defender.x = attacker.x + attacker.ultimateFacing * definition.sequenceOffsetX;
      this.clampFighter(defender);
    }

    const hit = definition.sequenceHits.find((beat) => beat.frame === attacker.ultimatePhaseFrame);
    if (hit) {
      const finalBeat = definition.sequenceHits[definition.sequenceHits.length - 1] === hit;
      this.applyUltimateHit(
        attackerIndex,
        defenderIndex,
        hit.damage,
        hit.knockback,
        finalBeat ? (definition.finalHitstop ?? 7) : 7,
        finalBeat,
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

      attacker.ultimateProbe = null;
      attacker.captureAnchorX = null;
      attacker.ultimateSequenceStartX = null;
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
    majorImpact = false,
  ): void {
    const actualDamage = this.applyDamage(attackerIndex, defenderIndex, damage, 'ultimate', false);
    const attacker = this.fighters[attackerIndex];
    const defender = this.fighters[defenderIndex];
    defender.vx = attacker.ultimateFacing * knockback;
    this.hitstopFrames = Math.max(this.hitstopFrames, hitstop);
    this.events.push({ type: 'hit', attacker: attackerIndex, defender: defenderIndex, blocked: false, damage: actualDamage, strong: true, source: 'ultimate', finisher: defender.health <= 0, majorImpact });
  }

  private enterUltimateWhiffRecovery(index: FighterIndex): void {
    const fighter = this.fighters[index];
    if (fighter.ultimatePhase === 'recovery') return;
    fighter.ultimatePhase = 'recovery';
    fighter.ultimatePhaseFrame = 0;
    fighter.ultimateConnected = false;
    fighter.ultimateTarget = null;
    fighter.ultimateEffectiveTick = null;
    fighter.ultimateProbe = null;
    fighter.captureAnchorX = null;
    fighter.ultimateSequenceStartX = null;
    this.events.push({ type: 'ultimate-whiff', attacker: index });
  }

  private cancelUltimateBeforeCommit(fighter: FighterState): void {
    fighter.ultimatePhase = 'idle';
    fighter.ultimatePhaseFrame = 0;
    fighter.ultimateConnected = false;
    fighter.ultimateTarget = null;
    fighter.ultimateEffectiveTick = null;
    fighter.ultimateProbe = null;
    fighter.captureAnchorX = null;
    fighter.ultimateSequenceStartX = null;
    this.clearMove(fighter);
  }

  private finishUltimate(fighter: FighterState): void {
    fighter.ultimatePhase = 'idle';
    fighter.ultimatePhaseFrame = 0;
    fighter.ultimateConnected = false;
    fighter.ultimateTarget = null;
    fighter.ultimateEffectiveTick = null;
    fighter.ultimateProbe = null;
    fighter.captureAnchorX = null;
    fighter.ultimateSequenceStartX = null;
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
      && fighter.jumpStartupFrames === 0
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
    this.clash = null;
    this.hitstopFrames = 0;
    // Returning balls cannot survive terminal state; legacy linear projectiles
    // remain frozen through round-over and are cleared on the next-round reset.
    this.clearReturningProjectilesForRoundEnd();
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
    this.clearEncounterProjectiles(false);
    this.pendingUltimateReleases = [];
    this.clash = null;
    this.hitstopFrames = 0;
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
      fighter.jumpStartupFrames = 0;
      fighter.jumpTakeoffDirection = 0;
      fighter.airborneTicks = 0;
      fighter.crouching = false;
      fighter.blocking = false;
      fighter.chilledFrames = 0;
      fighter.projectileCooldown = 0;
      fighter.rangedAvailability = 'ready';
      fighter.rangedRecoveryFrames = 0;
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
