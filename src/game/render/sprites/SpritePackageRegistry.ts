export interface SpritePackageRegistration {
  manifestUrl: string;
}

function nonEmpty(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Sprite package registry: ${label} must be a non-empty string`);
  }
  return value;
}

export class SpritePackageRegistry {
  private readonly entries: Readonly<Record<string, SpritePackageRegistration>>;

  constructor(entries: Readonly<Record<string, SpritePackageRegistration>> = {}) {
    const owned: Record<string, SpritePackageRegistration> = {};
    for (const [key, registration] of Object.entries(entries)) {
      nonEmpty(key, 'package key');
      if (!registration || typeof registration !== 'object') {
        throw new Error(`Sprite package registry: registration for "${key}" must be an object`);
      }
      owned[key] = Object.freeze({
        manifestUrl: nonEmpty(registration.manifestUrl, `${key}.manifestUrl`),
      });
    }
    this.entries = Object.freeze(owned);
  }

  get(packageKey: string): SpritePackageRegistration {
    const registration = this.entries[packageKey];
    if (!registration) throw new Error(`Unknown sprite package "${packageKey}"`);
    return registration;
  }

  has(packageKey: string): boolean {
    return this.entries[packageKey] !== undefined;
  }

  get keys(): readonly string[] {
    return Object.freeze(Object.keys(this.entries));
  }
}

export const DEFAULT_SPRITE_PACKAGE_REGISTRY = new SpritePackageRegistry();
