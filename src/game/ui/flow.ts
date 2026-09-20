import type { FighterId, FighterIndex } from '../types.js';

export type StageSelectionId = 'tramontana-dusk' | 'cancha-56';
export type RosterDensity = 'standard' | 'compact' | 'dense';
export type GameFlowPhase =
  | 'title'
  | 'select-player'
  | 'select-cpu'
  | 'select-stage'
  | 'vs'
  | 'fight'
  | 'result';

export interface GameFlowState {
  phase: GameFlowPhase;
  player: FighterId | null;
  cpu: FighterId | null;
  stage: StageSelectionId;
  winner: FighterIndex | null;
}

export const DEFAULT_STAGE: StageSelectionId = 'tramontana-dusk';

export function initialFlowState(stage: StageSelectionId = DEFAULT_STAGE): GameFlowState {
  return { phase: 'title', player: null, cpu: null, stage, winner: null };
}

export function beginSelection(state: GameFlowState): GameFlowState {
  if (state.phase !== 'title') return state;
  return { ...state, phase: 'select-player', winner: null };
}

export function chooseFighter(state: GameFlowState, fighter: FighterId): GameFlowState {
  if (state.phase === 'select-player') {
    return { ...state, phase: 'select-cpu', player: fighter, cpu: null, winner: null };
  }
  if (state.phase === 'select-cpu' && state.player) {
    return { ...state, phase: 'select-stage', cpu: fighter, winner: null };
  }
  return state;
}

export function chooseStage(state: GameFlowState, stage: StageSelectionId): GameFlowState {
  if (state.phase !== 'select-stage' || !state.player || !state.cpu) return state;
  return { ...state, phase: 'vs', stage, winner: null };
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

export function changeFighters(state: GameFlowState): GameFlowState {
  return {
    phase: 'select-player',
    player: null,
    cpu: null,
    stage: state.stage,
    winner: null,
  };
}

export function changeStage(state: GameFlowState): GameFlowState {
  if (!state.player || !state.cpu) return changeFighters(state);
  return { ...state, phase: 'select-stage', winner: null };
}

export function backFlow(state: GameFlowState): GameFlowState {
  switch (state.phase) {
    case 'title':
      return state;
    case 'select-player':
      return initialFlowState(state.stage);
    case 'select-cpu':
      return { ...state, phase: 'select-player', cpu: null, winner: null };
    case 'select-stage':
      return { ...state, phase: 'select-cpu', winner: null };
    case 'vs':
      return { ...state, phase: 'select-stage', winner: null };
    case 'result':
      return changeStage(state);
    case 'fight':
      return state;
  }
}

export function backToSelect(state: GameFlowState): GameFlowState {
  return changeFighters(state);
}

export function rosterDensity(count: number): RosterDensity {
  if (count <= 3) return 'standard';
  if (count <= 5) return 'compact';
  return 'dense';
}
