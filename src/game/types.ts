export type RegisteredFighterId = string;
export type FighterId = RegisteredFighterId;
export type FighterIndex = 0 | 1;
export type Facing = -1 | 1;
export type MatchPhase = 'intro' | 'fight' | 'round-over' | 'match-over';
export type DashKind = 'forward' | 'back' | null;
export type UltimatePhase = 'idle' | 'startup' | 'capture' | 'sequence' | 'recovery';
export type ClashPhase = 'freeze' | 'launch';
export type MoveContact = 'none' | 'hit' | 'block';
export type HitSource = 'normal' | 'special' | 'projectile' | 'ultimate';
export type CombatAction = 'attack' | 'special' | 'jump' | 'ultimate' | 'pushGuard';

export interface CommandDirection {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export interface CommandIntent {
  action: CombatAction;
  direction: CommandDirection;
}

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
  /** Gameplay intent emitted by the input layer for the ATTACK+SPECIAL chord. */
  ultimate?: boolean;
  /** Gameplay intent emitted by the input layer for SPECIAL during a blocking context. */
  pushGuard?: boolean;
  /**
   * Lossless action edges for this sample. When defined (including []), these
   * are the only action edges; held booleans never synthesize duplicates.
   */
  commands?: readonly CommandIntent[];
}

export interface FighterSnapshot {
  id: RegisteredFighterId;
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
  moveContact: MoveContact;
  chilledFrames: number;
  projectileCooldown: number;
  projectileCooldownMax: number;
  dashKind: DashKind;
  dashFrame: number;
  landingRecoveryFrames: number;
  pushGuardRecoveryFrames: number;
  superMeter: number;
  maxSuper: number;
  superReady: boolean;
  ultimatePhase: UltimatePhase;
  ultimatePhaseFrame: number;
  ultimateConnected: boolean;
  ultimateTarget: FighterIndex | null;
  /** First advancing tick on which this committed Ultimate can affect the opponent. */
  ultimateEffectiveTick: number | null;
  /** Shared bilateral lock after an accepted Universal Ultimate Clash. */
  clashRecoveryFrames: number;
  /** Simulation-owned defender capture lock. Renderer may consume but never infer it. */
  capturedBy: FighterIndex | null;
  roundWins: number;
}

export interface ProjectileSnapshot {
  id: number;
  owner: FighterIndex;
  kind: string;
  x: number;
  y: number;
  vx: number;
  active: boolean;
}

export interface ClashSnapshot {
  id: number;
  phase: ClashPhase;
  launchTick: number | null;
  remainingLaunchTicks: number;
}

export interface MatchSnapshot {
  frame: number;
  /** Advancing fight-step clock: frozen by hitstop and outside active fighting. */
  combatTick: number;
  phase: MatchPhase;
  round: number;
  roundTimerFrames: number;
  hitstopFrames: number;
  clash: ClashSnapshot | null;
  winner: FighterIndex | null;
  roundWinner: FighterIndex | null;
  fighters: readonly [FighterSnapshot, FighterSnapshot];
  projectiles: readonly ProjectileSnapshot[];
  events: readonly CombatEvent[];
}

export type CombatEvent =
  | { type: 'hit'; attacker: FighterIndex; defender: FighterIndex; blocked: boolean; damage: number; strong: boolean; source: HitSource; finisher: boolean }
  | { type: 'guard-break'; defender: FighterIndex }
  | { type: 'projectile'; owner: FighterIndex; projectileId: number }
  | { type: 'super-ready'; fighter: FighterIndex }
  | { type: 'ultimate-start'; attacker: FighterIndex }
  | { type: 'ultimate-capture'; attacker: FighterIndex; defender: FighterIndex }
  | { type: 'ultimate-whiff'; attacker: FighterIndex }
  | { type: 'push-guard'; defender: FighterIndex; attacker: FighterIndex }
  | { type: 'land'; fighter: FighterIndex }
  | { type: 'ultimate-release'; attacker: FighterIndex; defender: FighterIndex }
  | { type: 'ultimate-clash'; clashId: number; fighters: readonly [FighterIndex, FighterIndex]; x: number; y: number }
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
  ultimate: false,
  pushGuard: false,
};
