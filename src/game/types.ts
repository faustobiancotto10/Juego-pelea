export type FighterId = 'chameleon' | 'supernariz';
export type FighterIndex = 0 | 1;
export type Facing = -1 | 1;
export type MatchPhase = 'intro' | 'fight' | 'round-over' | 'match-over';
export type DashKind = 'forward' | 'back' | null;

export interface InputFrame {
  left: boolean;
  right: boolean;
  down: boolean;
  up: boolean;
  jump: boolean;
  attack: boolean;
  special: boolean;
  dashLeft: boolean;
  dashRight: boolean;
}

export interface FighterSnapshot {
  id: FighterId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: Facing;
  health: number;
  maxHealth: number;
  guard: number;
  maxGuard: number;
  guardRegenDelay: number;
  guardBreakFrames: number;
  grounded: boolean;
  crouching: boolean;
  blocking: boolean;
  stunFrames: number;
  blockstunFrames: number;
  moveId: string | null;
  moveFrame: number;
  comboCount: number;
  chilledFrames: number;
  projectileCooldown: number;
  dashKind: DashKind;
  dashFrame: number;
  roundWins: number;
}

export interface ProjectileSnapshot {
  id: number;
  owner: FighterIndex;
  kind: 'chorizo';
  x: number;
  y: number;
  vx: number;
  active: boolean;
}

export interface MatchSnapshot {
  frame: number;
  phase: MatchPhase;
  round: number;
  roundTimerFrames: number;
  hitstopFrames: number;
  winner: FighterIndex | null;
  roundWinner: FighterIndex | null;
  fighters: readonly [FighterSnapshot, FighterSnapshot];
  projectiles: readonly ProjectileSnapshot[];
  events: readonly CombatEvent[];
}

export type CombatEvent =
  | { type: 'hit'; attacker: FighterIndex; defender: FighterIndex; blocked: boolean; damage: number; strong: boolean }
  | { type: 'guard-break'; defender: FighterIndex }
  | { type: 'projectile'; owner: FighterIndex; projectileId: number }
  | { type: 'round-start'; round: number }
  | { type: 'round-end'; winner: FighterIndex | null }
  | { type: 'match-end'; winner: FighterIndex };

export const EMPTY_INPUT: InputFrame = {
  left: false,
  right: false,
  down: false,
  up: false,
  jump: false,
  attack: false,
  special: false,
  dashLeft: false,
  dashRight: false,
};
