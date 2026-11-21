import type { HamdelEntry } from "../hamdel/HamdelEntry";
import type { YearlyCalendar } from "../hamdel/importantDates";
import type { DateOnly } from "../valueObjects/DateOnly";
import type { DailySuggestion } from "./DailySuggestion";
import { PartnerDailySuggestionBuilder } from "./PartnerDailySuggestions";

export interface PlannedDay {
  readonly date: DateOnly;
  readonly suggestion: DailySuggestion;
}

const DAYS_IN_PLAN = 7;

/** One small, concrete action per day for the next 7 days, built from the Hamdel notebook. */
export class HamdelWeeklyPlan {
  public static build(entries: readonly HamdelEntry[], start: DateOnly, calendar: YearlyCalendar): PlannedDay[] {
    const used = new Set<string>();
    return Array.from({ length: DAYS_IN_PLAN }, (_, index) => {
      const date = start.addDays(index);
      const options = PartnerDailySuggestionBuilder.build(entries, date, calendar, null, DAYS_IN_PLAN);
      const suggestion = options.find((item) => !used.has(item.id)) ?? options[0];
      used.add(suggestion.id);
      return { date, suggestion };
    });
  }
}
