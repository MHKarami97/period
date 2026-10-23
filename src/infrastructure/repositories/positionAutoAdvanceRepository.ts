import type { IGameSettingsRepository } from "@domain/games/shared/IGameSettingsRepository";
import { AutoAdvanceSettings } from "@domain/positions/AutoAdvanceSettings";
import { LocalStorageJsonRepository } from "./LocalStorageJsonRepository";

const STORAGE_KEY = "period-tracker:positions:auto-advance";

export function createPositionAutoAdvanceRepository(): IGameSettingsRepository<AutoAdvanceSettings> {
  return new LocalStorageJsonRepository<AutoAdvanceSettings>(
    STORAGE_KEY,
    (raw) => AutoAdvanceSettings.fromSnapshot(raw),
    (settings) => settings.toSnapshot(),
  );
}
