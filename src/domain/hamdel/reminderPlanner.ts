import { DateOnly } from "../valueObjects/DateOnly";
import type { HamdelEntry } from "./HamdelEntry";
import { nextOccurrence, type RepeatMode, type YearlyCalendar } from "./importantDates";

export type HamdelReminderKind = "HAMDEL_DATE" | "HAMDEL_CALL";

export interface PlannedHamdelEvent {
  readonly kind: HamdelReminderKind;
  /** ISO date of the occasion itself; the server subtracts `leadDays` to find the sending day. */
  readonly targetDate: string;
  readonly leadDays: number;
  readonly label: string;
}

const STANDARD_LEADS: readonly number[] = [30, 7, 1];
const MAX_LABEL_LENGTH = 80;
/** The server accepts 300 events per sync; 3 are reserved for the period reminders. */
export const MAX_HAMDEL_EVENTS = 290;

function leadsForDate(remind: string): readonly number[] {
  if (remind === "standard") return STANDARD_LEADS;
  if (remind === "standardDay") return [...STANDARD_LEADS, 0];
  return [];
}

function leadsForCall(when: string): readonly number[] {
  if (when === "dayBefore") return [1];
  if (when === "both") return [1, 0];
  return [0];
}

function label(entry: HamdelEntry): string {
  return entry.valueOf("title").slice(0, MAX_LABEL_LENGTH);
}

/**
 * Turns the notebook into reminder events for the Telegram worker: important dates
 * (next occurrence, 1 month / 1 week / 1 day before, optionally the day itself) and
 * call reminders. Reminders whose sending day is already in the past are dropped.
 */
export function planHamdelReminders(entries: readonly HamdelEntry[], today: DateOnly, calendar: YearlyCalendar): PlannedHamdelEvent[] {
  const events: PlannedHamdelEvent[] = [];
  const add = (kind: HamdelReminderKind, target: DateOnly, leads: readonly number[], text: string): void => {
    for (const leadDays of leads) {
      if (!target.addDays(-leadDays).isBefore(today)) {
        events.push({ kind, targetDate: target.toIsoString(), leadDays, label: text });
      }
    }
  };

  for (const entry of entries) {
    if (entry.section === "dates") {
      const repeat: RepeatMode = entry.valueOf("repeat") === "once" ? "once" : "yearly";
      const target = nextOccurrence(DateOnly.fromIsoString(entry.valueOf("date")), today, repeat, calendar);
      if (target) add("HAMDEL_DATE", target, leadsForDate(entry.valueOf("remind")), label(entry));
    } else if (entry.section === "calls" && entry.valueOf("status") !== "done") {
      const target = DateOnly.fromIsoString(entry.valueOf("date"));
      add("HAMDEL_CALL", target, leadsForCall(entry.valueOf("when")), label(entry));
    }
  }

  return events
    .sort((left, right) => (left.targetDate < right.targetDate ? -1 : left.targetDate > right.targetDate ? 1 : right.leadDays - left.leadDays))
    .slice(0, MAX_HAMDEL_EVENTS);
}
