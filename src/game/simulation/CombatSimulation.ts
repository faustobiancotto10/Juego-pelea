import { FIGHTERS } from '../data/fighters.js';
import { EMPTY_INPUT, type CombatEvent, type Facing, type FighterId, type FighterIndex, type FighterSnapshot, type InputFrame, type MatchSnapshot, type MatchPhase, type ProjectileSnapshot } from '../types.js';
import { getAirAttack, getAttackStart, getMoveDefinition, getSpecialMove, type HitboxSpec, type MoveDefinition } from './moves.js';

const ARENA_MIN_X = 90;
const ARENA_MAX_X = 1190;
const START_X: readonly [number, number] = [330, 950];
const ROUND_TIME_FRAMES = 60 * 60;
const ROUND_OVER_FRAMES = 90;
const INTRO_FRAMES = 55;
const PUSH_DISTANCE = 62;

interface FighterState extends FighterSnapshot {
  prevInput: InputFrame;
  currentMove: MoveDefinition | null;
  moveHasHit: boolean;
  moveEffectTriggered: boolean;
}

interface ProjectileState extends ProjectileSnapshot {
  ttl: number;
}

export interface CombatSimulationOptions {
  skipIntro?: boolean;
}

function copyInput(input: InputFrame): InputFrame {
  return { ...input };
}

function pressed(now: InputFrame, before: InputFrame, key: 'jump' | 'attack' | 'special'): boolean {
  return now[key] && !before[key];
}

function makeFighter(id: FighterId, index: FighterIndex): FighterState {
  const def = FIGHTERS[id];
  return {
    id,
    x: START_X[index],
    y: 0,
    vx: 0,
    vy: 0,
    facing: index === 0 ? 1 : -1,
    health: def.maxHealth,
    maxHealth: def.maxHealth,
    grounded: true,
    crouching: false,
    blocking: false,
    stunFrames: 0,
    blockstunFrames: 0,
    moveId: null,
    moveFrame: 0,
    comboCount: 0,
    chilledFrames: 0,
    projectileCooldown: 0,
    roundWins: 0,
    prevInput: copyInput(EMPTY_INPUT),
    currentMove: null,
    moveHasHit: false,
    moveEffectTriggered: false,
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
    grounded: f.grounded,
    crouching: f.crouching,
    blocking: f.blocking,
    stunFrames: f.stunFrames,
    blockstunFrames: f.blockstunFrames,
    moveId: f.moveId,
    moveFrame: f.moveFrame,
    comboCount: f.comboCount,
    chilledFrames: f.chilledFrames,
    projectileCooldown: f.projectileCooldown,
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
  private fighters: [FighterState, FighterState];
  private frame = 0;
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

  constructor(p1: FighterId, p2: FighterId, options: CombatSimulationOptions = {}) {
    this.fighters = [makeFighter(p1, 0), makeFighter(p2, 1)];
    this.phase = options.skipIntro ? 'fight' : 'intro';
    this.introFrames = options.skipIntro ? 0 : INTRO_FRAMES;
  }

  getSnapshot(): MatchSnapshot {
    return {
      frame: this.frame,
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

  step(p1Input: InputFrame, p2Input: InputFrame): MatchSnapshot {
    this.events = [];
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

    if (this.hitstopFrames > 0) {
      this.hitstopFrames -= 1;
      this.saveInputs(inputs);
      return this.getSnapshot();
    }

    this.updateFacing();

    for (const index of [0, 1] as const) {
      this.updateFighter(index, inputs[index]);
    }

    this.resolvePushboxes();
    this.updateFacing();
    this.resolveMoveHits(0, 1, inputs[1]);
    this.resolveMoveHits(1, 0, inputs[0]);
    this.updateProjectiles(inputs);
    this.cancelInterruptedMoves();

    if (this.phase === 'fight') {
      this.roundTimerFrames = Math.max(0, this.roundTimerFrames - 1);
      if (this.fighters[0].health <= 0 || this.fighters[1].health <= 0 || this.roundTimerFrames <= 0) {
        this.finishRound();
      }
    }

    this.saveInputs(inputs);
    return this.getSnapshot();
  }

  private updateFighter(index: FighterIndex, input: InputFrame): void {
    const fighter = this.fighters[index];
    const def = FIGHTERS[fighter.id];

    if (fighter.projectileCooldown > 0) fighter.projectileCooldown -= 1;
    if (fighter.chilledFrames > 0) fighter.chilledFrames -= 1;

    if (fighter.stunFrames > 0) {
      fighter.stunFrames -= 1;
      fighter.blocking = false;
      fighter.crouching = false;
      fighter.x += fighter.vx;
      fighter.vx *= 0.86;
      this.integrateVertical(fighter, def.gravity);
      this.clampFighter(fighter);
      return;
    }

    if (fighter.blockstunFrames > 0) {
      fighter.blockstunFrames -= 1;
      fighter.blocking = true;
      fighter.x += fighter.vx;
      fighter.vx *= 0.78;
      this.integrateVertical(fighter, def.gravity);
      this.clampFighter(fighter);
      return;
    }

    if (fighter.currentMove) {
      fighter.blocking = false;
      fighter.crouching = false;
      const current = fighter.currentMove;
      const canChain = current.nextAttack
        && current.cancelStart !== undefined
        && current.cancelEnd !== undefined
        && fighter.moveFrame >= current.cancelStart
        && fighter.moveFrame <= current.cancelEnd
        && pressed(input, fighter.prevInput, 'attack');
      if (canChain && current.nextAttack) {
        this.startMove(fighter, getMoveDefinition(fighter.id, current.nextAttack), fighter.comboCount + 1);
        this.integrateVertical(fighter, def.gravity);
        return;
      }

      fighter.moveFrame += 1;
      this.triggerMoveEffect(index, fighter);
      if (fighter.moveFrame >= current.totalFrames) this.clearMove(fighter);
      this.integrateVertical(fighter, def.gravity);
      this.clampFighter(fighter);
      return;
    }

    if (!fighter.grounded && pressed(input, fighter.prevInput, 'attack')) {
      this.startMove(fighter, getAirAttack(fighter.id), 1);
      return;
    }

    if (fighter.grounded && pressed(input, fighter.prevInput, 'special')) {
      if (fighter.id !== 'supernariz' || input.down || fighter.projectileCooldown <= 0) {
        this.startMove(fighter, getSpecialMove(fighter.id, input.down));
      }
      return;
    }

    if (fighter.grounded && pressed(input, fighter.prevInput, 'attack')) {
      this.startMove(fighter, getAttackStart(fighter.id), 1);
      return;
    }

    if (fighter.grounded && pressed(input, fighter.prevInput, 'jump')) {
      fighter.vy = def.jumpSpeed;
      fighter.grounded = false;
      fighter.crouching = false;
      fighter.blocking = false;
    }

    const canBlock = fighter.grounded && isAwayHeld(input, fighter.facing);
    fighter.blocking = canBlock;
    fighter.crouching = fighter.grounded && input.down;

    let direction = 0;
    if (input.left !== input.right) direction = input.left ? -1 : 1;
    if (!fighter.crouching && !fighter.blocking) {
      const chillScale = fighter.chilledFrames > 0 ? 0.7 : 1;
      fighter.vx = direction * def.walkSpeed * chillScale;
      fighter.x += fighter.vx;
    } else {
      fighter.vx = 0;
    }

    this.integrateVertical(fighter, def.gravity);
    this.clampFighter(fighter);
  }

  private integrateVertical(fighter: FighterState, gravity: number): void {
    if (fighter.grounded && fighter.y === 0 && fighter.vy === 0) return;
    fighter.y += fighter.vy;
    fighter.vy -= gravity;
    if (fighter.y <= 0) {
      fighter.y = 0;
      fighter.vy = 0;
      fighter.grounded = true;
    } else {
      fighter.grounded = false;
    }
  }

  private resolveMoveHits(attackerIndex: FighterIndex, defenderIndex: FighterIndex, defenderInput: InputFrame): void {
    const attacker = this.fighters[attackerIndex];
    const defender = this.fighters[defenderIndex];
    const move = attacker.currentMove;
    if (!move || attacker.moveHasHit) return;
    const hitbox = move.hitbox;
    if (!hitbox) return;
    if (attacker.moveFrame < hitbox.start || attacker.moveFrame > hitbox.end) return;

    const attackMinX = attacker.facing === 1
      ? attacker.x + hitbox.offsetX
      : attacker.x - hitbox.offsetX - hitbox.width;
    const attackMaxX = attackMinX + hitbox.width;
    const hurtHalfWidth = FIGHTERS[defender.id].width * 0.5;
    const hurtMinX = defender.x - hurtHalfWidth;
    const hurtMaxX = defender.x + hurtHalfWidth;
    const hurtTop = defender.crouching ? FIGHTERS[defender.id].height * 0.66 : FIGHTERS[defender.id].height;
    const hurtBottom = defender.y;
    const attackBottom = attacker.y + hitbox.bottom;
    const attackTop = attacker.y + hitbox.top;

    if (!intervalsOverlap(attackMinX, attackMaxX, hurtMinX, hurtMaxX)) return;
    if (!intervalsOverlap(attackBottom, attackTop, hurtBottom, defender.y + hurtTop)) return;

    const holdingAway = isAwayHeld(defenderInput, defender.facing);
    const levelAllowsBlock = hitbox.level === 'mid'
      || (hitbox.level === 'low' && defenderInput.down)
      || (hitbox.level === 'overhead' && !defenderInput.down);
    const blocked = defender.grounded && holdingAway && levelAllowsBlock && defender.stunFrames === 0;

    attacker.moveHasHit = true;
    if (blocked) {
      defender.health = Math.max(0, defender.health - hitbox.chipDamage);
      defender.blockstunFrames = hitbox.blockstun;
      defender.blocking = true;
      defender.vx = attacker.facing * hitbox.knockback * 0.35;
    } else {
      defender.health = Math.max(0, defender.health - hitbox.damage);
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
      damage: blocked ? hitbox.chipDamage : hitbox.damage,
      strong: hitbox.strong,
    });
  }

  private startMove(fighter: FighterState, move: MoveDefinition, comboCount = 0): void {
    fighter.currentMove = move;
    fighter.moveId = move.id;
    fighter.moveFrame = 0;
    fighter.moveHasHit = false;
    fighter.moveEffectTriggered = false;
    fighter.comboCount = comboCount;
    fighter.vx = 0;
  }

  private clearMove(fighter: FighterState): void {
    fighter.currentMove = null;
    fighter.moveId = null;
    fighter.moveFrame = 0;
    fighter.moveHasHit = false;
    fighter.moveEffectTriggered = false;
    fighter.comboCount = 0;
  }

  private triggerMoveEffect(index: FighterIndex, fighter: FighterState): void {
    const move = fighter.currentMove;
    if (!move || fighter.moveEffectTriggered || move.spawnProjectileFrame === undefined) return;
    if (fighter.moveFrame < move.spawnProjectileFrame) return;
    if (fighter.id === 'supernariz' && move.id === 'chorizoThrow') {
      const projectile: ProjectileState = {
        id: this.nextProjectileId++,
        owner: index,
        kind: 'chorizo',
        x: fighter.x + fighter.facing * 68,
        y: fighter.y + 68,
        vx: fighter.facing * 9.2,
        active: true,
        ttl: 150,
      };
      this.projectiles.push(projectile);
      fighter.projectileCooldown = 120;
      fighter.moveEffectTriggered = true;
      this.events.push({ type: 'projectile', owner: index, projectileId: projectile.id });
    }
  }

  private updateProjectiles(inputs: readonly [InputFrame, InputFrame]): void {
    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;
      projectile.x += projectile.vx;
      projectile.ttl -= 1;
      if (projectile.ttl <= 0 || projectile.x < ARENA_MIN_X - 80 || projectile.x > ARENA_MAX_X + 80) {
        projectile.active = false;
        continue;
      }

      const defenderIndex: FighterIndex = projectile.owner === 0 ? 1 : 0;
      const defender = this.fighters[defenderIndex];
      const half = FIGHTERS[defender.id].width * 0.5;
      const projectileMinX = projectile.x - 22;
      const projectileMaxX = projectile.x + 22;
      const hurtTop = defender.y + (defender.crouching ? FIGHTERS[defender.id].height * 0.66 : FIGHTERS[defender.id].height);
      if (!intervalsOverlap(projectileMinX, projectileMaxX, defender.x - half, defender.x + half)) continue;
      if (projectile.y < defender.y + 18 || projectile.y > hurtTop + 10) continue;

      const defenderInput = inputs[defenderIndex];
      const blocked = defender.grounded && isAwayHeld(defenderInput, defender.facing) && defender.stunFrames === 0;
      const damage = blocked ? 5 : 58;
      defender.health = Math.max(0, defender.health - damage);
      if (blocked) {
        defender.blockstunFrames = 10;
        defender.blocking = true;
        defender.vx = Math.sign(projectile.vx) * 2.1;
      } else {
        defender.stunFrames = 14;
        defender.blocking = false;
        defender.vx = Math.sign(projectile.vx) * 5.0;
      }
      projectile.active = false;
      this.hitstopFrames = Math.max(this.hitstopFrames, 4);
      this.events.push({ type: 'hit', attacker: projectile.owner, defender: defenderIndex, blocked, damage, strong: false });
    }
    this.projectiles = this.projectiles.filter((p) => p.active);
  }

  private cancelInterruptedMoves(): void {
    for (const fighter of this.fighters) {
      if (fighter.stunFrames > 0 && fighter.currentMove) this.clearMove(fighter);
    }
  }

  private updateFacing(): void {
    if (this.fighters[0].x < this.fighters[1].x) {
      this.fighters[0].facing = 1;
      this.fighters[1].facing = -1;
    } else if (this.fighters[0].x > this.fighters[1].x) {
      this.fighters[0].facing = -1;
      this.fighters[1].facing = 1;
    }
  }

  private resolvePushboxes(): void {
    const left = this.fighters[0].x <= this.fighters[1].x ? this.fighters[0] : this.fighters[1];
    const right = left === this.fighters[0] ? this.fighters[1] : this.fighters[0];
    const overlap = PUSH_DISTANCE - (right.x - left.x);
    if (overlap <= 0 || left.y > 70 || right.y > 70) return;
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
    this.roundTimerFrames = ROUND_TIME_FRAMES;
    for (const index of [0, 1] as const) {
      const fighter = this.fighters[index];
      fighter.x = START_X[index];
      fighter.y = 0;
      fighter.vx = 0;
      fighter.vy = 0;
      fighter.health = fighter.maxHealth;
      fighter.grounded = true;
      fighter.crouching = false;
      fighter.blocking = false;
      fighter.stunFrames = 0;
      fighter.blockstunFrames = 0;
      fighter.chilledFrames = 0;
      fighter.projectileCooldown = 0;
      fighter.prevInput = copyInput(EMPTY_INPUT);
      this.clearMove(fighter);
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
