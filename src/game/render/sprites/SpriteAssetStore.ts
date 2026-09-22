import { validateSpriteAnimationSet, type SpriteAnimationSetDefinition } from './SpriteManifest.js';
import { SpritePackageRegistry } from './SpritePackageRegistry.js';

export interface LoadedSpritePackage {
  manifest: SpriteAnimationSetDefinition;
  image: CanvasImageSource;
}

export type SpritePackageLoader = (packageKey: string) => Promise<LoadedSpritePackage>;

export interface SpriteAssetStore {
  preload(packageKeys: readonly string[]): Promise<void>;
  get(packageKey: string): LoadedSpritePackage;
  releaseExcept(packageKeys: readonly string[]): void;
  clear(): void;
}

export class FightSpriteAssetStore implements SpriteAssetStore {
  private readonly cache = new Map<string, LoadedSpritePackage>();
  private readonly pending = new Map<string, Promise<LoadedSpritePackage>>();

  constructor(private readonly loader: SpritePackageLoader) {}

  async preload(packageKeys: readonly string[]): Promise<void> {
    const uniqueKeys = [...new Set(packageKeys)];
    await Promise.all(uniqueKeys.map((packageKey) => this.loadOne(packageKey)));
  }

  get(packageKey: string): LoadedSpritePackage {
    const loaded = this.cache.get(packageKey);
    if (!loaded) {
      throw new Error(`Sprite package "${packageKey}" is not loaded for this fight`);
    }
    return loaded;
  }

  releaseExcept(packageKeys: readonly string[]): void {
    const keep = new Set(packageKeys);
    for (const key of this.cache.keys()) {
      if (!keep.has(key)) this.cache.delete(key);
    }
    for (const key of this.pending.keys()) {
      if (!keep.has(key)) this.pending.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.pending.clear();
  }

  private async loadOne(packageKey: string): Promise<LoadedSpritePackage> {
    const loaded = this.cache.get(packageKey);
    if (loaded) return loaded;

    const inFlight = this.pending.get(packageKey);
    if (inFlight) return inFlight;

    const promise = this.loader(packageKey)
      .then((result) => {
        this.cache.set(packageKey, result);
        this.pending.delete(packageKey);
        return result;
      })
      .catch((error: unknown) => {
        this.pending.delete(packageKey);
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to load sprite package "${packageKey}": ${message}`);
      });

    this.pending.set(packageKey, promise);
    return promise;
  }
}

export interface BrowserSpriteLoaderDependencies {
  baseUrl?: string;
  fetchJson?: (url: string) => Promise<unknown>;
  loadImage?: (url: string) => Promise<CanvasImageSource>;
}

async function defaultFetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`manifest request failed (${response.status})`);
  return response.json();
}

async function defaultLoadImage(url: string): Promise<CanvasImageSource> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

function defaultBaseUrl(): string {
  if (typeof document !== 'undefined' && document.baseURI) return document.baseURI;
  if (typeof location !== 'undefined' && location.href) return location.href;
  return 'http://localhost/';
}

export function createBrowserSpritePackageLoader(
  registry: SpritePackageRegistry,
  dependencies: BrowserSpriteLoaderDependencies = {},
): SpritePackageLoader {
  const fetchJson = dependencies.fetchJson ?? defaultFetchJson;
  const loadImage = dependencies.loadImage ?? defaultLoadImage;
  const baseUrl = dependencies.baseUrl ?? defaultBaseUrl();

  return async (packageKey: string): Promise<LoadedSpritePackage> => {
    const registration = registry.get(packageKey);
    const manifestUrl = new URL(registration.manifestUrl, baseUrl).toString();
    const rawManifest = await fetchJson(manifestUrl);
    const manifest = validateSpriteAnimationSet(rawManifest, `spritePackage.${packageKey}`);
    const atlasUrl = new URL(manifest.atlas, manifestUrl).toString();
    const image = await loadImage(atlasUrl);
    return { manifest, image };
  };
}
