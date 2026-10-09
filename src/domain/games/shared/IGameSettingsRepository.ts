/** Port: persists one game's settings document between sessions. */
export interface IGameSettingsRepository<T> {
  load(): T | null;
  save(settings: T): void;
  clear(): void;
}
