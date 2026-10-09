import type { IGameSettingsRepository } from "@domain/games/shared/IGameSettingsRepository";

/**
 * LocalStorageJsonRepository - generic adapter for IGameSettingsRepository.
 * Each game supplies its storage key plus (de)serialisers; corrupted data is
 * treated as "nothing saved" so a bad entry can never break the page.
 */
export class LocalStorageJsonRepository<T> implements IGameSettingsRepository<T> {
  public constructor(
    private readonly storageKey: string,
    private readonly deserialize: (raw: unknown) => T | null,
    private readonly serialize: (settings: T) => unknown,
  ) {}

  public load(): T | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }
    try {
      return this.deserialize(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  public save(settings: T): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.serialize(settings)));
  }

  public clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}
