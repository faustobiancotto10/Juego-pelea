export type StageId = 'tramontana-dusk' | 'cancha-56';

export interface StageDefinition {
  id: StageId;
  displayName: string;
  rendererKey: StageId;
}

const STAGES: readonly StageDefinition[] = Object.freeze([
  Object.freeze({
    id: 'tramontana-dusk',
    displayName: 'TRAMONTANA DUSK',
    rendererKey: 'tramontana-dusk',
  }),
  Object.freeze({
    id: 'cancha-56',
    displayName: 'CANCHA 56',
    rendererKey: 'cancha-56',
  }),
]);

export class StageRegistry {
  private readonly byId = new Map<StageId, StageDefinition>(
    STAGES.map((stage) => [stage.id, stage]),
  );

  readonly ids: readonly StageId[] = STAGES.map((stage) => stage.id);

  get(id: StageId | string): StageDefinition {
    const stage = this.byId.get(id as StageId);
    if (!stage) throw new Error(`Unknown stage: ${id}`);
    return stage;
  }
}

export const DEFAULT_STAGE_REGISTRY = new StageRegistry();
