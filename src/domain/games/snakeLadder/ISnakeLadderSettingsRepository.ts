import type { SnakeLadderBoard } from "./SnakeLadderBoard";

export interface SnakeLadderSettings {
  board: SnakeLadderBoard;
  womanName: string;
  manName: string;
}

/** Port: persists the user's preferred board layout and player names between sessions. */
export interface ISnakeLadderSettingsRepository {
  load(): SnakeLadderSettings | null;
  save(settings: SnakeLadderSettings): void;
  clear(): void;
}
