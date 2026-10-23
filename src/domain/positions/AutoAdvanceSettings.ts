export const AUTO_ADVANCE_MIN_SECONDS = 5;
export const AUTO_ADVANCE_MAX_SECONDS = 600;
export const DEFAULT_AUTO_ADVANCE_SECONDS = 30;

export interface AutoAdvanceSnapshot {
  enabled: boolean;
  seconds: number;
}

/**
 * AutoAdvanceSettings - immutable value object: should the random-position
 * dialog jump to the next random position by itself, and after how many seconds.
 * The interval is always clamped to a sane range, so a corrupted value can
 * never create a timer that fires every few milliseconds.
 */
export class AutoAdvanceSettings {
  private constructor(
    public readonly enabled: boolean,
    public readonly seconds: number,
  ) {}

  public static disabled(): AutoAdvanceSettings {
    return new AutoAdvanceSettings(false, DEFAULT_AUTO_ADVANCE_SECONDS);
  }

  public static fromSnapshot(raw: unknown): AutoAdvanceSettings {
    const stored = (typeof raw === "object" && raw !== null ? raw : {}) as Partial<Record<keyof AutoAdvanceSnapshot, unknown>>;
    return new AutoAdvanceSettings(stored.enabled === true, AutoAdvanceSettings.clamp(stored.seconds));
  }

  public withEnabled(enabled: boolean): AutoAdvanceSettings {
    return new AutoAdvanceSettings(enabled, this.seconds);
  }

  public withSeconds(seconds: number): AutoAdvanceSettings {
    return new AutoAdvanceSettings(this.enabled, AutoAdvanceSettings.clamp(seconds));
  }

  public toSnapshot(): AutoAdvanceSnapshot {
    return { enabled: this.enabled, seconds: this.seconds };
  }

  private static clamp(value: unknown): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return DEFAULT_AUTO_ADVANCE_SECONDS;
    }
    return Math.min(AUTO_ADVANCE_MAX_SECONDS, Math.max(AUTO_ADVANCE_MIN_SECONDS, Math.round(value)));
  }
}
