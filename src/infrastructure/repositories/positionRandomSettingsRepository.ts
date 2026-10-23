import type { IGameSettingsRepository } from "@domain/games/shared/IGameSettingsRepository";
import { RandomExclusions } from "@domain/positions/RandomExclusions";
import { LocalStorageJsonRepository } from "./LocalStorageJsonRepository";

const STORAGE_KEY = "period-tracker:positions:random-exclusions";

export function createPositionRandomSettingsRepository(): IGameSettingsRepository<RandomExclusions> {
  return new LocalStorageJsonRepository<RandomExclusions>(
    STORAGE_KEY,
    (raw) => RandomExclusions.fromSnapshot(raw),
    (settings) => settings.toSnapshot(),
  );
}
