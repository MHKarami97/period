import type { HamdelEntry } from "../hamdel/HamdelEntry";

export interface DoseSlot {
  readonly key: string;
  readonly entryId: string;
  readonly name: string;
  readonly dose: string;
  readonly time: string;
  readonly minutes: number;
}

const TIME_PATTERN = /(\d{1,2})[:٫.](\d{2})/g;
const MINUTES_PER_HOUR = 60;
const MAX_HOUR = 23;
const MAX_MINUTE = 59;
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function toLatinDigits(text: string): string {
  return [...text]
    .map((char) => {
      const persian = PERSIAN_DIGITS.indexOf(char);
      if (persian >= 0) return String(persian);
      const arabic = ARABIC_DIGITS.indexOf(char);
      return arabic >= 0 ? String(arabic) : char;
    })
    .join("");
}

/** Domain Service: turns medication notebook entries into today's dose slots and decides which are due. */
export class MedicationSchedule {
  /** "۸:۰۰، 20:30" -> ["08:00", "20:30"] (sorted, unique, invalid parts ignored). */
  public static parseTimes(text: string): string[] {
    const times = new Set<string>();
    for (const match of toLatinDigits(text).matchAll(TIME_PATTERN)) {
      const hour = Number(match[1]);
      const minute = Number(match[2]);
      if (hour <= MAX_HOUR && minute <= MAX_MINUTE) {
        times.add(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
      }
    }
    return [...times].sort();
  }

  public static slotsForToday(entries: readonly HamdelEntry[]): DoseSlot[] {
    return entries
      .filter((entry) => entry.section === "medications" && entry.valueOf("status") !== "stopped")
      .flatMap((entry) =>
        MedicationSchedule.parseTimes(entry.valueOf("times")).map((time) => ({
          key: `${entry.id}@${time}`,
          entryId: entry.id,
          name: entry.valueOf("name"),
          dose: entry.valueOf("dose"),
          time,
          minutes: Number(time.slice(0, 2)) * MINUTES_PER_HOUR + Number(time.slice(3)),
        })),
      )
      .sort((left, right) => left.minutes - right.minutes);
  }

  public static due(slots: readonly DoseSlot[], nowMinutes: number, isTaken: (key: string) => boolean): DoseSlot[] {
    return slots.filter((slot) => slot.minutes <= nowMinutes && !isTaken(slot.key));
  }
}
