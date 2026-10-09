import type {
  ISnakeLadderSettingsRepository,
  SnakeLadderSettings,
} from "@domain/games/snakeLadder/ISnakeLadderSettingsRepository";
import { SnakeLadderBoard, type BoardSnapshot } from "@domain/games/snakeLadder/SnakeLadderBoard";

const STORAGE_KEY = "period-tracker:games:snake-ladder:settings";
const SCHEMA_VERSION = 1;

interface StoredSettings {
  schemaVersion: number;
  board: BoardSnapshot;
  womanName: string;
  manName: string;
}

/**
 * LocalStorageSnakeLadderSettingsRepository - Adapter for the settings port.
 * localStorage (not Dexie) is used because the payload is a single small
 * document, read synchronously at page open - same trade-off as the existing
 * theme/role stores. Corrupted or outdated data is treated as "nothing saved"
 * instead of crashing the page.
 */
export class LocalStorageSnakeLadderSettingsRepository implements ISnakeLadderSettingsRepository {
  public load(): SnakeLadderSettings | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const stored = JSON.parse(raw) as Partial<StoredSettings>;
      if (stored.schemaVersion !== SCHEMA_VERSION || !stored.board) {
        return null;
      }
      return {
        board: SnakeLadderBoard.fromSnapshot(stored.board),
        womanName: typeof stored.womanName === "string" ? stored.womanName : "",
        manName: typeof stored.manName === "string" ? stored.manName : "",
      };
    } catch {
      return null;
    }
  }

  public save(settings: SnakeLadderSettings): void {
    const payload: StoredSettings = {
      schemaVersion: SCHEMA_VERSION,
      board: settings.board.toSnapshot(),
      womanName: settings.womanName,
      manName: settings.manName,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  public clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
