import type { FighterPresentationRegistry } from '../../data/presentationRegistry.js';
import { DEFAULT_FIGHTER_PRESENTATION_REGISTRY } from '../../data/presentationRegistry.js';
import type { RegisteredFighterId } from '../../types.js';
import type { SpriteAssetStore } from './SpriteAssetStore.js';

type PresentationLookup = Pick<FighterPresentationRegistry, 'getPresentation'>;

export class SpriteFightAssetLifecycle {
  constructor(
    private readonly store: SpriteAssetStore,
    private readonly presentations: PresentationLookup = DEFAULT_FIGHTER_PRESENTATION_REGISTRY,
  ) {}

  requiredPackageKeys(fighterIds: readonly RegisteredFighterId[]): string[] {
    const keys: string[] = [];
    const seen = new Set<string>();

    for (const fighterId of fighterIds) {
      const presentation = this.presentations.getPresentation(fighterId);
      if ((presentation.bodyBackend ?? 'procedural') !== 'sprite') continue;

      const packageKey = presentation.spritePackageKey;
      if (!packageKey) {
        throw new Error(`Sprite fighter "${fighterId}" has no spritePackageKey`);
      }
      if (seen.has(packageKey)) continue;
      seen.add(packageKey);
      keys.push(packageKey);
    }

    return keys;
  }

  async prepare(fighterIds: readonly RegisteredFighterId[]): Promise<readonly string[]> {
    const packageKeys = this.requiredPackageKeys(fighterIds);
    await this.store.preload(packageKeys);
    this.store.releaseExcept(packageKeys);
    return packageKeys;
  }
}
