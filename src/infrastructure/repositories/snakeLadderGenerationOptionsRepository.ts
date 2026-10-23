import type { IGameSettingsRepository } from "@domain/games/shared/IGameSettingsRepository";
import {
  normalizeGenerationOptions,
  type BoardGenerationOptions,
} from "@domain/games/snakeLadder/SnakeLadderBoardGenerator";
import { LocalStorageJsonRepository } from "./LocalStorageJsonRepository";

const STORAGE_KEY = "period-tracker:games:snake-ladder:generation-options";

/** Remembers how many snakes, ladders and challenges the user wants on a generated board. */
export function createSnakeLadderGenerationOptionsRepository(): IGameSettingsRepository<BoardGenerationOptions> {
  return new LocalStorageJsonRepository<BoardGenerationOptions>(
    STORAGE_KEY,
    (raw) => normalizeGenerationOptions((raw ?? {}) as Partial<Record<keyof BoardGenerationOptions, unknown>>),
    (options) => options,
  );
}
