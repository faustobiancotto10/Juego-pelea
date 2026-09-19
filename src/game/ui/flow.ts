import type { FighterId, FighterIndex } from '../types.js';

export type GameFlowPhase = 'select-player' | 'select-cpu' | 'vs' | 'fight' | 'result';

export interface GameFlowState {
  phase: GameFlowPhase;
  player: FighterId | null;
  cpu: FighterId | null;
  winner: FighterIndex | null;
}

export function initialFlowState(): GameFlowState {
  return { phase: 'select-player', player: null, cpu: null, winner: null };
}

export function chooseFighter(state: GameFlowState, fighter: FighterId): GameFlowState {
  if (state.phase === 'select-player') return { phase: 'select-cpu', player: fighter, cpu: null, winner: null };
  if (state.phase === 'select-cpu' && state.player) return { phase: 'vs', player: state.player, cpu: fighter, winner: null };
  return state;
}

export function startFight(state: GameFlowState): GameFlowState {
  if (state.phase !== 'vs' || !state.player || !state.cpu) return state;
  return { ...state, phase: 'fight', winner: null };
}

export function finishFight(state: GameFlowState, winner: FighterIndex): GameFlowState {
  if (state.phase !== 'fight') return state;
  return { ...state, phase: 'result', winner };
}

export function rematch(state: GameFlowState): GameFlowState {
  if (state.phase !== 'result' || !state.player || !state.cpu) return state;
  return { ...state, phase: 'vs', winner: null };
}

export function backToSelect(_state: GameFlowState): GameFlowState {
  return initialFlowState();
}
